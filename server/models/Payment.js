const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['XAF'],
      default: 'XAF',
      immutable: true,
    },
    method: {
      type: String,
      enum: ['mtn_momo', 'orange_money'],
      required: true,
    },
    payerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    transactionReference: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['awaiting_verification', 'paid', 'rejected', 'refund_review', 'cancelled'],
      default: 'awaiting_verification',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
  },
  { timestamps: true }
);

paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
