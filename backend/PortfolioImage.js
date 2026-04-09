const mongoose = require('mongoose');

const portfolioImageSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: [true, 'Please provide an image filename']
  },
  description: {
    type: String,
    default: '',
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PortfolioImage = mongoose.model('PortfolioImage', portfolioImageSchema);

module.exports = PortfolioImage;
