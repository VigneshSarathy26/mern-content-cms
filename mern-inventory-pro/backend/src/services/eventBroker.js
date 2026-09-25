const EventEmitter = require('events');
const crypto = require('crypto');
const { getRedisClient, getIsRedisAvailable } = require('../config/redis');
const logger = require('../config/logger');
const EventLog = require('../models/EventLog');

class EventBrokerService extends EventEmitter {
  constructor() {
    super();
    this.inMemoryQueue = [];
    this.subscribers = new Map();
    this.inMemoryEventsStore = [];
    this.inMemoryDLQ = [];
  }

  /**
   * Publish an event payload into Redis Streams or In-Memory Loop
   */
  async publish(eventType, payload, idempotencyKey = null) {
    const eventId = `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const key = idempotencyKey || payload.idempotencyKey || `idemp_${crypto.randomBytes(6).toString('hex')}`;

    const eventPacket = {
      eventId,
      eventType,
      payload,
      idempotencyKey: key,
      status: 'PUBLISHED',
      retryCount: 0,
      timestamp: new Date().toISOString(),
    };

    logger.info(`[EVENT BROKER] Publishing event '${eventType}' (${eventId}) - IdempotencyKey: ${key}`);

    // Audit event in database / in-memory store
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection && mongoose.connection.readyState === 1 && EventLog && EventLog.create) {
        await EventLog.create({
          eventId,
          stream: 'inventory_events',
          eventType,
          payload,
          status: 'PUBLISHED',
          idempotencyKey: key,
        });
      } else {
        this.inMemoryEventsStore.push(eventPacket);
      }
    } catch (err) {
      this.inMemoryEventsStore.push(eventPacket);
    }

    const redis = getRedisClient();
    const isRedisReady = getIsRedisAvailable();

    if (isRedisReady && redis) {
      try {
        await redis.xadd(
          'inventory_events',
          '*',
          'eventId', eventId,
          'eventType', eventType,
          'payload', JSON.stringify(payload),
          'idempotencyKey', key
        );
        logger.info(`[REDIS BROKER] Event '${eventType}' successfully added to Redis Stream 'inventory_events'`);
      } catch (err) {
        logger.warn(`[REDIS BROKER ERROR] ${err.message}. Routing to In-Memory Event Loop.`);
        this.emitInMemory(eventType, eventPacket);
      }
    } else {
      // In-Memory Asynchronous Loop Emulator
      setImmediate(() => {
        this.emitInMemory(eventType, eventPacket);
      });
    }

    return { eventId, idempotencyKey: key };
  }

  /**
   * Internal worker dispatcher for In-Memory Fallback
   */
  async emitInMemory(eventType, eventPacket) {
    const handlers = this.subscribers.get(eventType) || [];
    for (const handler of handlers) {
      try {
        logger.info(`[IN-MEMORY BROKER] Executing background worker handler for '${eventType}'`);
        await handler(eventPacket);
        
        // Update status to PROCESSED
        if (EventLog && EventLog.updateOne) {
          await EventLog.updateOne({ eventId: eventPacket.eventId }, { status: 'PROCESSED' }).catch(() => {});
        }
      } catch (error) {
        logger.error(`[WORKER ERROR] Handler for '${eventType}' failed: ${error.message}`);
        await this.handleWorkerError(eventPacket, error);
      }
    }
  }

  /**
   * Subscribe worker functions to specific event types
   */
  subscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push(handler);
    logger.info(`[EVENT BROKER] Registered subscriber for '${eventType}'`);
  }

  /**
   * Retry logic & Dead Letter Queue (DLQ) handler
   */
  async handleWorkerError(eventPacket, error) {
    eventPacket.retryCount = (eventPacket.retryCount || 0) + 1;
    logger.warn(`[RETRY HANDLER] Event '${eventPacket.eventType}' failed (${eventPacket.retryCount}/3 retries)`);

    if (eventPacket.retryCount >= 3) {
      logger.error(`[DLQ TRIGGER] Event '${eventPacket.eventId}' exceeded 3 retries. Moving to Dead Letter Queue (DLQ).`);
      eventPacket.status = 'DLQ';
      eventPacket.errorDetails = error.message;

      try {
        if (EventLog && EventLog.updateOne) {
          await EventLog.updateOne(
            { eventId: eventPacket.eventId },
            { status: 'DLQ', errorDetails: error.message, retryCount: eventPacket.retryCount }
          );
        }
      } catch (err) {
        this.inMemoryDLQ.push(eventPacket);
      }
    } else {
      // Retry after exponential backoff delay
      setTimeout(() => {
        this.emitInMemory(eventPacket.eventType, eventPacket);
      }, eventPacket.retryCount * 500);
    }
  }

  /**
   * Get all DLQ events for Admin dashboard review
   */
  async getDLQEvents() {
    try {
      if (EventLog && EventLog.find) {
        const dlqEvents = await EventLog.find({ status: 'DLQ' }).sort({ createdAt: -1 });
        return dlqEvents;
      }
    } catch (err) {
      // Fallback
    }
    return this.inMemoryDLQ;
  }

  /**
   * Retry a DLQ event manually from operational dashboard
   */
  async retryDLQEvent(eventId) {
    logger.info(`[ADMIN OVERRIDE] Triggering manual retry for DLQ Event ID: ${eventId}`);
    let eventPacket = null;

    try {
      if (EventLog && EventLog.findOne) {
        const doc = await EventLog.findOne({ eventId });
        if (doc) {
          doc.status = 'PUBLISHED';
          doc.retryCount = 0;
          doc.errorDetails = null;
          await doc.save();
          eventPacket = doc.toObject();
        }
      }
    } catch (err) {}

    if (!eventPacket) {
      eventPacket = this.inMemoryDLQ.find((e) => e.eventId === eventId);
      if (eventPacket) {
        eventPacket.status = 'PUBLISHED';
        eventPacket.retryCount = 0;
      }
    }

    if (eventPacket) {
      this.publish(eventPacket.eventType, eventPacket.payload, eventPacket.idempotencyKey);
      return { success: true, message: `Event ${eventId} re-queued successfully` };
    }

    return { success: false, message: 'Event not found in DLQ' };
  }
}

const eventBroker = new EventBrokerService();
module.exports = eventBroker;
