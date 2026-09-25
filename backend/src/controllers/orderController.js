const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const eventBroker = require('../services/eventBroker');
const logger = require('../config/logger');

// @desc    Get sales orders list
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    logger.error(`Get Orders Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch sales orders' });
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch order details' });
  }
};

// @desc    Create new sales order (Asynchronous Event-Driven API Gateway -> 202 Accepted)
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, customerName, idempotencyKey: providedKey } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order payload must include an array of items' });
    }

    const idempotencyKey = providedKey || `idemp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Idempotency Safeguard Check
    const existingOrder = await Order.findOne({ idempotencyKey });
    if (existingOrder) {
      logger.info(`[IDEMPOTENCY SAFEGUARD] Duplicate order request intercepted for key: ${idempotencyKey}`);
      return res.status(200).json({
        message: 'Order already created (Idempotent response)',
        order: existingOrder,
      });
    }

    // Prepare items array with current pricing
    let totalAmount = 0;
    const preparedItems = [];

    for (const item of items) {
      let product = null;
      if (item.productId || item._id) {
        product = await Product.findById(item.productId || item._id);
      }
      
      const price = product ? product.sellingPrice : Number(item.unitPrice || 100);
      const qty = Number(item.quantity || 1);
      const itemTotal = price * qty;
      totalAmount += itemTotal;

      preparedItems.push({
        productId: product ? product._id : (item.productId || item._id || '60f7b0000000000000000001'),
        sku: product ? product.sku : item.sku || 'SKU-TEMP',
        name: product ? product.name : item.name || 'Sample Product',
        quantity: qty,
        unitPrice: price,
      });
    }

    const orderNumber = `ORD-${Date.now().toString().substring(6)}`;

    // Save Order Document with status PENDING_FULFILLMENT
    const newOrder = await Order.create({
      orderNumber,
      customerName: customerName || 'Enterprise Retail Client',
      idempotencyKey,
      status: 'PENDING_FULFILLMENT',
      items: preparedItems,
      totalAmount,
    });

    logger.info(`[GATEWAY RECEPTION] Created Order ${orderNumber} (ID: ${newOrder._id}). Emitting 'order.created' event.`);

    // Publish event into Event Stream (Redis / In-Memory Loop)
    const eventResult = await eventBroker.publish(
      'order.created',
      {
        orderId: newOrder._id.toString(),
        orderNumber,
        items: preparedItems,
        customerName: newOrder.customerName,
        totalAmount,
      },
      idempotencyKey
    );

    // ASYNCHRONOUS HANDSHAKE: Instantly return HTTP 202 Accepted
    return res.status(202).json({
      message: 'Order received and queued for asynchronous inventory fulfillment processing',
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber,
      status: newOrder.status,
      idempotencyKey: eventResult.idempotencyKey,
      eventId: eventResult.eventId,
      acceptedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Create Order Gateway Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to accept order' });
  }
};

module.exports = { getOrders, getOrderById, createOrder };
