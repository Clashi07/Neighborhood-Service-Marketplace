const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config({ path: './config/config.env' });
connectDB();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceCategoryRoutes = require('./routes/serviceCategoryRoutes');
const providerRoutes = require('./routes/providerRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const bidRoutes = require('./routes/bidRoutes');
const providerServiceRoutes = require('./routes/providerServiceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use('/uploads', express.static('uploads'));

// All API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', serviceCategoryRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/provider-services', providerServiceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/direct-bookings', require('./routes/directBookingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// One-time fix route — remove after running once
// app.get('/api/fix-ratings', async (req, res) => {
//   try {
//     const Review = require('./models/Review');
//     const ServiceProvider = require('./models/ServiceProvider');

//     const providers = await ServiceProvider.find();
//     const results = [];

//     for (const provider of providers) {
//       const reviews = await Review.find({ provider: provider.user });
//       const total = reviews.length;
//       const avgRating = total > 0
//         ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
//         : 0;

//       await ServiceProvider.findByIdAndUpdate(provider._id, {
//         averageRating: avgRating,
//         totalReviews: total
//       });

//       results.push({ provider: provider.user, avgRating, total });
//     }

//     res.json({ success: true, updated: results.length, results });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// Error handler — always last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});