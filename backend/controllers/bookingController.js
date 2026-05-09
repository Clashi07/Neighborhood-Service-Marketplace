const Booking = require('../models/Booking');
const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');

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

// PUT /api/bookings/:id/complete
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isCustomer = booking.customer.toString() === req.user.id;
    const isProvider = booking.provider.toString() === req.user.id;
    if (!isCustomer && !isProvider) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (booking.status === 'completed') return res.status(400).json({ success: false, message: 'Booking already completed' });

    booking.status = 'completed';
    booking.completedAt = Date.now();
    await booking.save();
    await ServiceRequest.findByIdAndUpdate(booking.serviceRequest, { status: 'completed' });

    res.status(200).json({ success: true, message: 'Job marked as completed', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/bookings/:id/cancel — Customer cancels
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }

    // 24 hour check
    const hoursUntil = (new Date(booking.scheduledDate) - new Date()) / (1000 * 60 * 60);
    if (hoursUntil < 24) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel within 24 hours of scheduled time'
      });
    }
    if (!req.body.reason) {
      return res.status(400).json({ success: false, message: 'Cancellation reason is required' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = Date.now();
    booking.cancellationReason = req.body.reason;
    await booking.save();

    await ServiceRequest.findByIdAndUpdate(booking.serviceRequest, { status: 'open' });

    await Notification.create({
      recipient: booking.provider,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Customer cancelled the booking. Reason: ${req.body.reason}`,
      data: { bookingId: booking._id }
    });

    res.status(200).json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/bookings/:id/reschedule — Request reschedule
exports.requestReschedule = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isCustomer = booking.customer.toString() === req.user.id;
    const isProvider = booking.provider.toString() === req.user.id;
    if (!isCustomer && !isProvider) return res.status(403).json({ success: false, message: 'Not authorized' });

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule this booking' });
    }
    if (!req.body.newDate) {
      return res.status(400).json({ success: false, message: 'New date is required' });
    }

    const newDate = new Date(req.body.newDate);
    if (newDate < new Date()) {
      return res.status(400).json({ success: false, message: 'New date must be in the future' });
    }

    booking.rescheduleRequest = {
      requestedBy: req.user.id,
      newDate,
      reason: req.body.reason || '',
      status: 'pending'
    };
    await booking.save();

    const recipient = isCustomer ? booking.provider : booking.customer;
    await Notification.create({
      recipient,
      type: 'reschedule_request',
      title: 'Reschedule Request',
      message: `${isCustomer ? 'Customer' : 'Provider'} requested reschedule to ${newDate.toLocaleDateString()}`,
      data: { bookingId: booking._id }
    });

    res.status(200).json({ success: true, message: 'Reschedule request sent', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/bookings/:id/reschedule-response — Approve or reject
exports.respondReschedule = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isCustomer = booking.customer.toString() === req.user.id;
    const isProvider = booking.provider.toString() === req.user.id;
    if (!isCustomer && !isProvider) return res.status(403).json({ success: false, message: 'Not authorized' });

    if (!booking.rescheduleRequest || booking.rescheduleRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'No pending reschedule request' });
    }

    const { action } = req.body;
    if (action === 'approve') {
      booking.scheduledDate = booking.rescheduleRequest.newDate;
      booking.rescheduleRequest.status = 'approved';
    } else {
      booking.rescheduleRequest.status = 'rejected';
    }
    await booking.save();

    await Notification.create({
      recipient: booking.rescheduleRequest.requestedBy,
      type: 'reschedule_response',
      title: `Reschedule ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your reschedule request was ${action === 'approve' ? 'approved' : 'rejected'}`,
      data: { bookingId: booking._id }
    });

    res.status(200).json({ success: true, message: `Reschedule ${action}d`, data: booking });
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

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isCustomer = booking.customer._id.toString() === req.user.id;
    const isProvider = booking.provider._id.toString() === req.user.id;
    if (!isCustomer && !isProvider) return res.status(403).json({ success: false, message: 'Not authorized' });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};