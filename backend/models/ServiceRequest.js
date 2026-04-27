const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  serviceCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: [true, 'Please select a service category']
  },
  budget: {
    min: {
      type: Number,
      required: [true, 'Please provide minimum budget']
    },
    max: {
      type: Number,
      required: [true, 'Please provide maximum budget']
    }
  },
  preferredDate: {
    type: Date,
    required: [true, 'Please provide preferred service date']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide service location']
    },
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  images: [{
    filename: String,
    url: String
  }],
  status: {
    type: String,
    enum: ['open', 'bidding', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  bidCount: {
    type: Number,
    default: 0
  },
  acceptedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search and filtering
serviceRequestSchema.index({ title: 'text', description: 'text' });
serviceRequestSchema.index({ serviceCategory: 1, status: 1 });
serviceRequestSchema.index({ 'location.city': 1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);