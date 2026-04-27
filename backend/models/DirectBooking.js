const mongoose = require('mongoose');

const directBookingSchema = new mongoose.Schema({
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
  providerService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProviderService'
  },
  description: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  address: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  agreedPrice: Number,
  rejectionReason: String
}, { timestamps: true });

module.exports = mongoose.model('DirectBooking', directBookingSchema);