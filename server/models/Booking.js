const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['awaiting_payment', 'payment_review', 'confirmed', 'cancelled'],
      default: 'awaiting_payment',
    },
    paymentExpiresAt: Date,
    cancelledAt: Date,
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
  },
  { timestamps: true }
);

bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ paymentExpiresAt: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
