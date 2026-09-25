const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Room = require('../models/Room');

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const PAYMENT_HOLD_MS = 30 * 60 * 1000;

const calculateNights = (checkIn, checkOut) =>
  Math.ceil((checkOut.getTime() - checkIn.getTime()) / MS_PER_DAY);

const populateBooking = (query) =>
  query.populate('room').populate('payment').populate('user', 'name email role');

const hasOverlap = async (roomId, checkIn, checkOut) => {
  const booking = await Booking.findOne({
    room: roomId,
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
    $or: [
      { status: { $in: ['payment_review', 'confirmed'] } },
      { status: 'awaiting_payment', paymentExpiresAt: { $gt: new Date() } },
    ],
  });

  return Boolean(booking);
};

const isFutureCheckIn = (checkIn) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkIn > today;
};

const getPaymentInstructions = (req, res) => {
  res.json({
    currency: 'XAF',
    methods: {
      mtn_momo: process.env.PAYMENT_MTN_RECIPIENT || 'Contact the hotel for MTN MoMo details.',
      orange_money: process.env.PAYMENT_ORANGE_RECIPIENT || 'Contact the hotel for Orange Money details.',
    },
  });
};

const createBooking = async (req, res) => {
  try {
    const { room: roomId, checkIn, checkOut, guests } = req.body;

    if (!roomId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ message: 'Room, dates, and guests are required' });
    }

    const parsedCheckIn = new Date(checkIn);
    const parsedCheckOut = new Date(checkOut);
    const guestCount = Number(guests);

    if (
      Number.isNaN(parsedCheckIn.getTime()) ||
      Number.isNaN(parsedCheckOut.getTime()) ||
      !Number.isInteger(guestCount) ||
      guestCount < 1
    ) {
      return res.status(400).json({ message: 'Provide valid dates and at least one guest' });
    }

    if (!isFutureCheckIn(parsedCheckIn) || parsedCheckOut <= parsedCheckIn) {
      return res.status(400).json({ message: 'Check-in must be in the future and check-out must be after it' });
    }

    const room = await Room.findById(roomId);
    if (!room || !room.isAvailable) {
      return res.status(404).json({ message: 'Room is not available' });
    }

    if (guestCount > room.guests) {
      return res.status(400).json({ message: `This room allows up to ${room.guests} guests` });
    }

    if (await hasOverlap(roomId, parsedCheckIn, parsedCheckOut)) {
      return res.status(409).json({ message: 'Room is already booked for those dates' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      room: room._id,
      checkIn: parsedCheckIn,
      checkOut: parsedCheckOut,
      guests: guestCount,
      totalPrice: calculateNights(parsedCheckIn, parsedCheckOut) * room.price,
      paymentExpiresAt: new Date(Date.now() + PAYMENT_HOLD_MS),
    });

    const populatedBooking = await populateBooking(Booking.findById(booking._id));
    res.status(201).json({ booking: populatedBooking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
};

const submitPayment = async (req, res) => {
  try {
    const { method, payerPhone, transactionReference } = req.body;
    if (!['mtn_momo', 'orange_money'].includes(method) || !payerPhone || !transactionReference) {
      return res.status(400).json({ message: 'Payment method, Cameroon phone number, and reference are required' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'awaiting_payment' || booking.paymentExpiresAt <= new Date()) {
      return res.status(409).json({ message: 'This payment hold has expired or cannot accept payment details' });
    }

    const payment = await Payment.create({
      booking: booking._id,
      amount: booking.totalPrice,
      method,
      payerPhone: payerPhone.trim(),
      transactionReference: transactionReference.trim(),
    });

    booking.status = 'payment_review';
    booking.paymentExpiresAt = undefined;
    booking.payment = payment._id;
    await booking.save();

    const populatedBooking = await populateBooking(Booking.findById(booking._id));
    res.status(201).json({ booking: populatedBooking });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Payment details have already been submitted for this booking' });
    }
    console.error('Submit payment error:', error);
    res.status(500).json({ message: 'Server error while submitting payment details' });
  }
};

const reviewPayment = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['paid', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Payment status must be paid or rejected' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking || !booking.payment) return res.status(404).json({ message: 'Payment not found' });

    const payment = await Payment.findById(booking.payment);
    if (!payment || payment.status !== 'awaiting_verification') {
      return res.status(409).json({ message: 'This payment has already been reviewed' });
    }

    payment.status = status;
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();
    await payment.save();

    booking.status = status === 'paid' ? 'confirmed' : 'cancelled';
    if (status === 'rejected') booking.cancelledAt = new Date();
    await booking.save();

    const populatedBooking = await populateBooking(Booking.findById(booking._id));
    res.json({ booking: populatedBooking });
  } catch (error) {
    console.error('Review payment error:', error);
    res.status(500).json({ message: 'Server error while reviewing payment' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(409).json({ message: 'Booking is already cancelled' });
    if (!isFutureCheckIn(booking.checkIn)) {
      return res.status(409).json({ message: 'Bookings can only be cancelled before check-in day' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.paymentExpiresAt = undefined;
    await booking.save();

    if (booking.payment) {
      const payment = await Payment.findById(booking.payment);
      if (payment) {
        payment.status = payment.status === 'paid' ? 'refund_review' : 'cancelled';
        await payment.save();
      }
    }

    const populatedBooking = await populateBooking(Booking.findById(booking._id));
    res.json({ booking: populatedBooking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error while cancelling booking' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room')
      .populate('payment')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room')
      .populate('payment')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    if (req.body.status !== 'cancelled') {
      return res.status(400).json({ message: 'Use payment review to confirm a booking' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.paymentExpiresAt = undefined;
    await booking.save();

    const populatedBooking = await populateBooking(Booking.findById(booking._id));
    res.json({ booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating booking status' });
  }
};

module.exports = {
  cancelBooking,
  createBooking,
  getBookings,
  getMyBookings,
  getPaymentInstructions,
  reviewPayment,
  submitPayment,
  updateBookingStatus,
};
