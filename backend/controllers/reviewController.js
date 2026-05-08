const Review = require('../models/Review');
const Booking = require('../models/Booking');

// POST /api/reviews — customer submits review
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, recommended } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this booking' });
    }

    const review = await Review.create({
      booking: bookingId,
      customer: req.user.id,
      provider: booking.provider,
      rating,
      comment,
      recommended
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reviews/provider/:providerId
exports.getProviderReviews = async (req, res) => {
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

    res.status(200).json({ success: true, data: reviews, avgRating, total, breakdown });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reviews/my-review/:bookingId
exports.getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({ booking: req.params.bookingId });
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};