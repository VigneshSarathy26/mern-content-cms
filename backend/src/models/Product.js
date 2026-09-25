const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, default: 'General' },
    costPrice: { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true, default: 0 },
    stockQuantity: { type: Number, required: true, default: 0 },
    reorderThreshold: { type: Number, required: true, default: 10 },
    locationTag: { type: String, default: 'Aisle 1 - Shelf A' },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
    isLowStockAlerted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
