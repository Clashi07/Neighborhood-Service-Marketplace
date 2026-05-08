const express = require('express');
const { createReview, getProviderReviews, getMyReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, authorize('customer'), createReview);
router.get('/provider/:providerId', protect, getProviderReviews);
router.get('/my-review/:bookingId', protect, getMyReview);

module.exports = router;