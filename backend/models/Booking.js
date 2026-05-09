const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    required: true
  },
  agreedPrice: {
    type: Number,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  rescheduleRequest: {                                    // ← ADD
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    newDate: Date,
    reason: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'] }
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);