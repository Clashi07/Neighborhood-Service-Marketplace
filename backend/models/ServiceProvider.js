const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: { type: String, default: '' },
  experience: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 },
  serviceAreas: [{ type: String }],
  averageRating: { type: Number, default: 0 },  // ← ADD
  totalReviews: { type: Number, default: 0 },    // ← ADD
  specializations: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: true
    },
    priceMin: { type: Number, required: true },
    priceMax: { type: Number, required: true },
    description: { type: String, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);