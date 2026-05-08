const express = require('express');
const {
  getCustomerBookings,
  getProviderBookings,
  completeBooking,
  getBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-bookings', protect, authorize('customer'), getCustomerBookings);
router.get('/my-jobs', protect, authorize('provider'), getProviderBookings);
router.put('/:id/complete', protect, authorize('customer', 'provider'), completeBooking);
router.get('/:id', protect, getBooking);

module.exports = router;