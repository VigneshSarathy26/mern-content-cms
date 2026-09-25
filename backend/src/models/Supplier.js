const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    contactEmail: { type: String, required: true },
    phone: { type: String, default: '' },
    leadTimeDays: { type: Number, default: 5 },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
