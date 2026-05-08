const mongoose = require('mongoose');

const ProviderServiceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: true,
    },
    minPrice: {
      type: Number,
      required: [true, 'Please provide a minimum price'],
      min: [0, 'Price cannot be negative'],
    },
    maxPrice: {
      type: Number,
      required: [true, 'Please provide a maximum price'],
      validate: {
        validator: function (value) {
          return value >= this.minPrice;
        },
        message: 'Max price must be greater than or equal to min price',
      },
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// One provider can only have one entry per category
ProviderServiceSchema.index({ provider: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('ProviderService', ProviderServiceSchema);