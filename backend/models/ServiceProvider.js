const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    bio: {
        type: String,
        required: [true, 'Please add a professional bio'],
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    experience: {
        type: String,
        required: [true, 'Please describe your work experience']
    },
    // Updated: Now an array of objects to store individual rates
    specializations: [
        {
            name: {
                type: String,
                required: true
            },
            rate: {
                type: Number,
                default: 0 // If 0, we can fall back to the main hourlyRate
            }
        }
    ],
    // This acts as the "Base" or "Default" rate
    hourlyRate: {
        type: Number,
        required: [true, 'Please set an hourly rate']
    },
    serviceAreas: [
        {
            type: String,
            required: true
        }
    ],
    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);