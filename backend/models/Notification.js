const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['booking_request', 'booking_accepted', 'booking_rejected', 'job_completed', 'new_review'],
    required: true
  },
  title: String,
  message: String,
  data: mongoose.Schema.Types.Mixed,
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);