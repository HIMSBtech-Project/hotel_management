const express = require('express');
const {
  cancelBooking,
  createBooking,
  getBookings,
  getMyBookings,
  getPaymentInstructions,
  reviewPayment,
  submitPayment,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { admin, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/payment-instructions', protect, getPaymentInstructions);
router.get('/my', protect, getMyBookings);
router.get('/', protect, admin, getBookings);
router.post('/:id/payment', protect, submitPayment);
router.patch('/:id/payment', protect, admin, reviewPayment);
router.post('/:id/cancel', protect, cancelBooking);
router.patch('/:id/status', protect, admin, updateBookingStatus);

module.exports = router;
