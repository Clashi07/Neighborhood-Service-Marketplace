const express = require('express');
const {
  getCustomerBookings,
  getProviderBookings,
  completeBooking,
  getBooking,
  cancelBooking,
  requestReschedule,
  respondReschedule
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-bookings', protect, authorize('customer'), getCustomerBookings);
router.get('/my-jobs', protect, authorize('provider'), getProviderBookings);
router.put('/:id/complete', protect, authorize('customer', 'provider'), completeBooking);
router.put('/:id/cancel', protect, authorize('customer'), cancelBooking);
router.put('/:id/reschedule', protect, authorize('customer', 'provider'), requestReschedule);
router.put('/:id/reschedule-response', protect, authorize('customer', 'provider'), respondReschedule);
router.get('/:id', protect, getBooking);

module.exports = router;