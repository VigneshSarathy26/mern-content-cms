const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    type: {
      type: String,
      enum: ['INITIAL', 'ADJUSTMENT', 'SALE', 'DEDUCTION', 'REPLENISHMENT'],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    reason: { type: String, default: 'Inventory movement' },
    performedBy: { type: String, default: 'System Event Worker' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
