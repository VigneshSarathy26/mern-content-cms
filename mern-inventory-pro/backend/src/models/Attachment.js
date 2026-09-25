const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    relatedType: {
      type: String,
      enum: ['PRODUCT_SPEC', 'SUPPLIER_INVOICE', 'GENERAL'],
      default: 'GENERAL',
    },
    relatedId: { type: String, default: null },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attachment', attachmentSchema);
