const eventBroker = require('../services/eventBroker');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const logger = require('../config/logger');

const initStockWorker = () => {
  eventBroker.subscribe('order.created', async (eventPacket) => {
    const { orderId, items, idempotencyKey } = eventPacket.payload;
    logger.info(`[STOCK WORKER] Processing stock reservation for Order ID: ${orderId}`);

    try {
      let allStockAvailable = true;
      let missingItem = '';

      // Check stock availability
      for (const item of items) {
        const product = await Product.findById(item.productId || item._id);
        if (!product || product.stockQuantity < item.quantity) {
          allStockAvailable = false;
          missingItem = product ? product.name : item.name || 'Unknown item';
          break;
        }
      }

      if (!allStockAvailable) {
        logger.warn(`[STOCK WORKER] Insufficient stock for order ${orderId}. Missing item: ${missingItem}`);
        await eventBroker.publish('stock.failed', {
          orderId,
          reason: `Insufficient stock for product '${missingItem}'`,
          idempotencyKey,
        });
        return;
      }

      // Deduct physical inventory & create logs
      for (const item of items) {
        const product = await Product.findById(item.productId || item._id);
        const prevQty = product.stockQuantity;
        const newQty = prevQty - item.quantity;

        product.stockQuantity = newQty;
        await product.save();

        // Create Inventory Movement Record
        await InventoryLog.create({
          productId: product._id,
          sku: product.sku,
          type: 'SALE',
          quantity: item.quantity,
          previousQuantity: prevQty,
          newQuantity: newQty,
          reason: `Sales Order #${orderId} deduction`,
          performedBy: 'Stock Worker (Async Event Loop)',
        });

        logger.info(`[STOCK DEDUCTION] Product ${product.sku} stock updated: ${prevQty} -> ${newQty}`);

        // Evaluate Low Stock Trigger Threshold
        if (newQty <= product.reorderThreshold && !product.isLowStockAlerted) {
          product.isLowStockAlerted = true;
          await product.save();

          await eventBroker.publish('low_stock.alert', {
            productId: product._id,
            sku: product.sku,
            name: product.name,
            currentStock: newQty,
            threshold: product.reorderThreshold,
          });
        }
      }

      // Stock successfully reserved! Emits event to Order Worker
      await eventBroker.publish('stock.reserved', {
        orderId,
        items,
        idempotencyKey,
      });
    } catch (error) {
      logger.error(`[STOCK WORKER ERROR] Failed to process stock reservation: ${error.message}`);
      throw error; // Re-throw to trigger DLQ / retry loop
    }
  });
};

module.exports = initStockWorker;
