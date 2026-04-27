const Booking = require('../models/Booking');
const ServiceRequest = require('../models/ServiceRequest');

// GET /api/bookings/my-bookings — Customer
exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('serviceRequest', 'title status')
      .populate('provider', 'name email')
      .populate('bid', 'proposedPrice estimatedDuration message')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bookings/my-jobs — Provider
exports.getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user.id })
      .populate('serviceRequest', 'title status')
      .populate('customer', 'name email')
      .populate('bid', 'proposedPrice estimatedDuration message')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/bookings/:id/complete — Customer marks job as complete
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Allow both customer AND provider to mark complete
    const isCustomer = booking.customer.toString() === req.user.id;
    const isProvider = booking.provider.toString() === req.user.id;

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Booking already completed' });
    }

    booking.status = 'completed';
    booking.completedAt = Date.now();
    await booking.save();

    await ServiceRequest.findByIdAndUpdate(booking.serviceRequest, { status: 'completed' });

    res.status(200).json({ success: true, message: 'Job marked as completed', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceRequest', 'title status description')
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('bid', 'proposedPrice estimatedDuration message');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isCustomer = booking.customer._id.toString() === req.user.id;
    const isProvider = booking.provider._id.toString() === req.user.id;

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};