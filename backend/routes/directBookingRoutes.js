const express = require('express');
const {
  createDirectBooking, getProviderRequests,
  getCustomerDirectBookings, acceptBooking, rejectBooking
} = require('../controllers/directBookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, authorize('customer'), createDirectBooking);
router.get('/my-requests', protect, authorize('provider'), getProviderRequests);
router.get('/my-bookings', protect, authorize('customer'), getCustomerDirectBookings);
router.put('/:id/accept', protect, authorize('provider'), acceptBooking);
router.put('/:id/reject', protect, authorize('provider'), rejectBooking);

module.exports = router;