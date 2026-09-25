const mongoose = require('mongoose');

const eventLogSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    stream: { type: String, required: true, default: 'inventory_events' },
    eventType: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['PUBLISHED', 'PROCESSED', 'FAILED', 'DLQ'],
      default: 'PUBLISHED',
    },
    retryCount: { type: Number, default: 0 },
    idempotencyKey: { type: String, default: null },
    errorDetails: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventLog', eventLogSchema);
