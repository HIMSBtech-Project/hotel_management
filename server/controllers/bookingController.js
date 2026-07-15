const Booking = require('../models/Booking');
const Room = require('../models/Room');

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const activeBookingStatuses = ['pending', 'confirmed'];

const calculateNights = (checkIn, checkOut) => {
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / MS_PER_DAY);
};

const hasOverlap = async (roomId, checkIn, checkOut) => {
  const booking = await Booking.findOne({
    room: roomId,
    status: { $in: activeBookingStatuses },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });

  return Boolean(booking);
};

const createBooking = async (req, res) => {
  try {
    const { room: roomId, checkIn, checkOut, guests } = req.body;

    if (!roomId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ message: 'Room, dates, and guests are required' });
    }

    const parsedCheckIn = new Date(checkIn);
    const parsedCheckOut = new Date(checkOut);

    if (Number.isNaN(parsedCheckIn.getTime()) || Number.isNaN(parsedCheckOut.getTime())) {
      return res.status(400).json({ message: 'Valid check-in and check-out dates are required' });
    }

    if (parsedCheckOut <= parsedCheckIn) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }

    const room = await Room.findById(roomId);

    if (!room || !room.isAvailable) {
      return res.status(404).json({ message: 'Room is not available' });
    }

    if (Number(guests) > room.guests) {
      return res.status(400).json({ message: `This room allows up to ${room.guests} guests` });
    }

    if (await hasOverlap(roomId, parsedCheckIn, parsedCheckOut)) {
      return res.status(409).json({ message: 'Room is already booked for those dates' });
    }

    const nights = calculateNights(parsedCheckIn, parsedCheckOut);
    const booking = await Booking.create({
      user: req.user._id,
      room: room._id,
      checkIn: parsedCheckIn,
      checkOut: parsedCheckOut,
      guests: Number(guests),
      totalPrice: nights * room.price,
    });

    const populatedBooking = await booking.populate('room');
    res.status(201).json({ booking: populatedBooking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room')
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
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('room')
      .populate('user', 'name email role');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating booking' });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getMyBookings,
  updateBookingStatus,
};
