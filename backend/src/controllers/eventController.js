const eventBroker = require('../services/eventBroker');
const EventLog = require('../models/EventLog');
const { getIsRedisAvailable } = require('../config/redis');
const logger = require('../config/logger');

// @desc    Get Dead Letter Queue (DLQ) failing events log
// @route   GET /api/events/dlq
const getDLQ = async (req, res) => {
  try {
    const dlqEvents = await eventBroker.getDLQEvents();
    return res.json(dlqEvents);
  } catch (error) {
    logger.error(`Get DLQ Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch DLQ records' });
  }
};

// @desc    Trigger manual retry for a DLQ event
// @route   POST /api/events/retry/:eventId
const retryEvent = async (req, res) => {
  try {
    const result = await eventBroker.retryDLQEvent(req.params.eventId);
    if (result.success) {
      return res.json(result);
    }
    return res.status(400).json(result);
  } catch (error) {
    logger.error(`Retry Event Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to trigger manual event retry' });
  }
};

// @desc    Get system event stream audit metrics
// @route   GET /api/events/metrics
const getMetrics = async (req, res) => {
  try {
    let publishedCount = 0;
    let processedCount = 0;
    let dlqCount = 0;

    if (EventLog && EventLog.countDocuments) {
      publishedCount = await EventLog.countDocuments({ status: 'PUBLISHED' });
      processedCount = await EventLog.countDocuments({ status: 'PROCESSED' });
      dlqCount = await EventLog.countDocuments({ status: 'DLQ' });
    }

    return res.json({
      brokerMode: getIsRedisAvailable() ? 'Redis Streams (Azure / Local)' : 'In-Memory Async Event Loop Emulator',
      isRedisConnected: getIsRedisAvailable(),
      metrics: {
        published: publishedCount,
        processed: processedCount,
        dlq: dlqCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch event metrics' });
  }
};

module.exports = { getDLQ, retryEvent, getMetrics };
