const express = require('express');
const {
  createBooking,
  getBookings,
  getMyBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { admin, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/', protect, admin, getBookings);
router.patch('/:id/status', protect, admin, updateBookingStatus);

module.exports = router;
