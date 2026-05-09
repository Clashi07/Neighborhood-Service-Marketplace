const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ServiceRequest = require('../models/ServiceRequest');
const ServiceProvider = require('../models/ServiceProvider');

const EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;

// ─── Helper: recalculate and save provider's average rating ───
const updateProviderRating = async (providerId) => {
  const reviews = await Review.find({ provider: providerId });
  const total = reviews.length;
  const avgRating = total > 0
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
    : 0;

  await ServiceProvider.findOneAndUpdate(
    { user: providerId },
    { averageRating: avgRating, totalReviews: total },
    { new: true }
  );
};

// POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, recommended } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.customer.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorised to review this booking' });

    if (booking.status !== 'completed')
      return res.status(400).json({ success: false, message: 'You can only review a completed booking' });

    const existing = await Review.findOne({ booking: bookingId });
    if (existing)
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });

    const review = await Review.create({
      booking: bookingId,
      customer: req.user.id,
      provider: booking.provider,
      rating,
      comment,
      recommended,
      editableUntil: new Date(Date.now() + EDIT_WINDOW_MS),
    });

    // ← UPDATE PROVIDER RATING
    await updateProviderRating(booking.provider);

    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/reviews/from-request
exports.createReviewFromRequest = async (req, res) => {
  try {
    const { serviceRequestId, rating, comment, recommended } = req.body;

    if (!serviceRequestId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'serviceRequestId, rating, and comment are required',
      });
    }

    const serviceRequest = await ServiceRequest.findById(serviceRequestId)
      .populate('acceptedBid');
    if (!serviceRequest)
      return res.status(404).json({ success: false, message: 'Service request not found' });

    if (serviceRequest.customer.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorised to review this request' });

    if (serviceRequest.status !== 'completed')
      return res.status(400).json({ success: false, message: 'You can only review a completed request' });

    if (!serviceRequest.acceptedBid)
      return res.status(400).json({ success: false, message: 'No accepted bid found for this request' });

    const providerId = serviceRequest.acceptedBid.provider;

    const existing = await Review.findOne({ serviceRequest: serviceRequestId });
    if (existing)
      return res.status(400).json({ success: false, message: 'You have already reviewed this request' });

    const review = await Review.create({
      serviceRequest: serviceRequestId,
      customer: req.user.id,
      provider: providerId,
      rating,
      comment,
      recommended: recommended ?? true,
      editableUntil: new Date(Date.now() + EDIT_WINDOW_MS),
    });

    // ← UPDATE PROVIDER RATING
    await updateProviderRating(providerId);

    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/reviews/:reviewId
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment, recommended } = req.body;

    const review = await Review.findById(req.params.reviewId);
    if (!review)
      return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.customer.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorised to edit this review' });

    if (!review.isEditable)
      return res.status(400).json({ success: false, message: 'Edit window (48 hours) has expired' });

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (recommended !== undefined) review.recommended = recommended;

    await review.save();

    // ← UPDATE PROVIDER RATING after edit too
    await updateProviderRating(review.provider);

    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

    return res.status(200).json({ success: true, data: reviews, avgRating, total, breakdown });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reviews/my-review/:bookingId
exports.getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      booking: req.params.bookingId,
      customer: req.user.id,
    });
    return res.status(200).json({ success: true, data: review || null });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reviews/my-review-request/:serviceRequestId
exports.getMyReviewByRequest = async (req, res) => {
  try {
    const review = await Review.findOne({
      serviceRequest: req.params.serviceRequestId,
      customer: req.user.id,
    });
    return res.status(200).json({ success: true, data: review || null });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reviews/pending
exports.getPendingReviews = async (req, res) => {
  try {
    const completedBookings = await Booking.find({
      customer: req.user.id,
      status: 'completed',
    }).populate('provider', 'name profilePhoto').lean();

    if (!completedBookings.length)
      return res.status(200).json({ success: true, data: [] });

    const bookingIds = completedBookings.map(b => b._id);
    const reviewed = await Review.find({ booking: { $in: bookingIds } }).select('booking').lean();
    const reviewedSet = new Set(reviewed.map(r => r.booking.toString()));
    const pending = completedBookings.filter(b => !reviewedSet.has(b._id.toString()));

    return res.status(200).json({ success: true, data: pending });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};