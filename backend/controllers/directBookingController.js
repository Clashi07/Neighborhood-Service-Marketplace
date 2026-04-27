const DirectBooking = require('../models/DirectBooking');
const Notification = require('../models/Notification');

// POST /api/direct-bookings — customer books a provider directly
exports.createDirectBooking = async (req, res) => {
  try {
    const { providerId, providerServiceId, description, scheduledDate, address } = req.body;

    const booking = await DirectBooking.create({
      customer: req.user.id,
      provider: providerId,
      providerService: providerServiceId,
      description,
      scheduledDate,
      address
    });

    // Notify provider
    await Notification.create({
      recipient: providerId,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `You have a new direct booking request`,
      data: { bookingId: booking._id }
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/direct-bookings/my-requests — provider sees incoming requests
exports.getProviderRequests = async (req, res) => {
  try {
    const bookings = await DirectBooking.find({ provider: req.user.id })
      .populate('customer', 'name email phone')
      .populate('providerService', 'title price')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/direct-bookings/my-bookings — customer sees their bookings
exports.getCustomerDirectBookings = async (req, res) => {
  try {
    const bookings = await DirectBooking.find({ customer: req.user.id })
      .populate('provider', 'name email')
      .populate('providerService', 'title price')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/direct-bookings/:id/accept — provider accepts
exports.acceptBooking = async (req, res) => {
  try {
    const booking = await DirectBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.provider.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = 'accepted';
    booking.agreedPrice = req.body.agreedPrice;
    await booking.save();

    await Notification.create({
      recipient: booking.customer,
      type: 'booking_accepted',
      title: 'Booking Accepted',
      message: 'Your booking request has been accepted by the provider',
      data: { bookingId: booking._id }
    });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/direct-bookings/:id/reject — provider rejects
exports.rejectBooking = async (req, res) => {
  try {
    const booking = await DirectBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.provider.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = 'rejected';
    booking.rejectionReason = req.body.reason || 'Provider unavailable';
    await booking.save();

    await Notification.create({
      recipient: booking.customer,
      type: 'booking_rejected',
      title: 'Booking Rejected',
      message: 'Your booking request was rejected',
      data: { bookingId: booking._id }
    });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};