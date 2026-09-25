const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerName: { type: String, default: 'Internal Client / Retail' },
    idempotencyKey: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['PENDING_FULFILLMENT', 'PROCESSING', 'FULFILLED', 'CANCELLED'],
      default: 'PENDING_FULFILLMENT',
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true, default: 0 },
    cancellationReason: { type: String, default: '' },
    fulfilledAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
