const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

const router = express.Router();

const EDIT_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours in ms

// ─────────────────────────────────────────────
// POST /api/reviews
// FR-19.1 – FR-19.4, FR-19.6
// Called right after a booking reaches "completed"
// ─────────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, recommended } = req.body;

    // 1. Booking must exist
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // 2. Only the customer who made the booking may review (FR-19 implicit)
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorised to review this booking' });
    }

    // 3. FR-19.4: booking must be completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review a completed booking' });
    }

    // 4. FR-19.6: one review per booking
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
    }

    // 5. Create review with 48-hour edit window (FR-19.5)
    const review = await Review.create({
      booking:      bookingId,
      customer:     req.user.id,
      provider:     booking.provider,
      rating,
      comment,
      recommended,
      editableUntil: new Date(Date.now() + EDIT_WINDOW_MS)
    });

    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// PUT /api/reviews/:reviewId
// FR-19.5: Edit within 48 hours
// ─────────────────────────────────────────────
const updateReview = async (req, res) => {
  try {
    const { rating, comment, recommended } = req.body;

    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Only the original customer may edit
    if (review.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorised to edit this review' });
    }

    // FR-19.5: enforce 48-hour window
    if (!review.isEditable) {
      return res.status(400).json({ success: false, message: 'Edit window (48 hours) has expired' });
    }

    if (rating     !== undefined) review.rating      = rating;
    if (comment    !== undefined) review.comment     = comment;
    if (recommended !== undefined) review.recommended = recommended;

    await review.save();

    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/reviews/provider/:providerId
// Public: list all reviews for a provider
// ─────────────────────────────────────────────
const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name profilePhoto')
      .sort('-createdAt');

    const total = reviews.length;
    const avgRating = total > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
      : 0;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => breakdown[r.rating]++);

    return res.status(200).json({ success: true, data: reviews, avgRating, total, breakdown });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/reviews/my-review/:bookingId
// Returns the review for this booking (if any)
// ─────────────────────────────────────────────
const getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      booking:  req.params.bookingId,
      customer: req.user.id   // scoped to logged-in customer only
    });

    return res.status(200).json({ success: true, data: review || null });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/reviews/pending
// Returns completed bookings the customer hasn't reviewed yet
// Used to surface the review prompt immediately after completion
// ─────────────────────────────────────────────
const getPendingReviews = async (req, res) => {
  try {
    // All bookings for this customer that are completed
    const completedBookings = await Booking.find({
      customer: req.user.id,
      status: 'completed'
    }).populate('provider', 'name profilePhoto').lean();

    if (!completedBookings.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    const bookingIds = completedBookings.map(b => b._id);

    // Find which ones already have a review
    const reviewed = await Review.find({ booking: { $in: bookingIds } }).select('booking').lean();
    const reviewedSet = new Set(reviewed.map(r => r.booking.toString()));

    // Return only the unreviewed ones
    const pending = completedBookings.filter(b => !reviewedSet.has(b._id.toString()));

    return res.status(200).json({ success: true, data: pending });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.post('/', protect, createReview);
router.put('/:reviewId', protect, updateReview);
router.get('/provider/:providerId', getProviderReviews);
router.get('/my-review/:bookingId', protect, getMyReview);
router.get('/pending', protect, getPendingReviews);

module.exports = router;