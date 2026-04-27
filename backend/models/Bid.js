const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proposedPrice: {
    type: Number,
    required: [true, 'Please provide proposed price'],
    min: [1, 'Price must be at least $1']
  },
  estimatedDuration: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks'],
      default: 'hours'
    }
  },
  message: {
    type: String,
    required: [true, 'Please provide a proposal message'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  isViewed: {
    type: Boolean,
    default: false
  },
  respondedAt: Date
}, {
  timestamps: true
});

// Prevent duplicate bids from same provider on same request
bidSchema.index({ serviceRequest: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);