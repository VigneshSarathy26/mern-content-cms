const eventBroker = require('../services/eventBroker');
const Order = require('../models/Order');
const logger = require('../config/logger');

const initOrderWorker = () => {
  // Handle successful stock reservation
  eventBroker.subscribe('stock.reserved', async (eventPacket) => {
    const { orderId } = eventPacket.payload;
    logger.info(`[ORDER WORKER] Stock reserved. Transitioning Order ${orderId} -> PROCESSING -> FULFILLED`);

    try {
      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'PROCESSING';
        await order.save();

        // Simulate fast fulfillment pipeline transition
        setTimeout(async () => {
          order.status = 'FULFILLED';
          order.fulfilledAt = new Date();
          await order.save();
          logger.info(`[ORDER WORKER] Order ${orderId} status set to FULFILLED`);
        }, 1200);
      }
    } catch (error) {
      logger.error(`[ORDER WORKER ERROR] Failed to update order ${orderId}: ${error.message}`);
      throw error;
    }
  });

  // Handle stock reservation failure
  eventBroker.subscribe('stock.failed', async (eventPacket) => {
    const { orderId, reason } = eventPacket.payload;
    logger.warn(`[ORDER WORKER] Stock failed for order ${orderId}. Reason: ${reason}. Transitioning Order -> CANCELLED`);

    try {
      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'CANCELLED';
        order.cancellationReason = reason;
        await order.save();
      }
    } catch (error) {
      logger.error(`[ORDER WORKER ERROR] Failed to cancel order ${orderId}: ${error.message}`);
      throw error;
    }
  });
};

module.exports = initOrderWorker;
