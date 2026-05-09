const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true  // FR-19.6: one review per booking
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  recommended: {
    type: Boolean,
    default: true
  },
  editableUntil: {
    type: Date  // FR-19.5: 48h window, set on create
  }
}, {
  timestamps: true  // auto createdAt + updatedAt
});

// Virtual: is this review still editable?
reviewSchema.virtual('isEditable').get(function () {
  return this.editableUntil && new Date() < this.editableUntil;
});

reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema);