const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const bookingRoutes = require('./routes/bookingRoutes');



const providerServiceRoutes = require('./routes/providerServiceRoutes');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceCategoryRoutes = require('./routes/serviceCategoryRoutes');
const providerRoutes = require('./routes/providerRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const bidRoutes = require('./routes/bidRoutes');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', serviceCategoryRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/provider-services', providerServiceRoutes);

// Error handler
app.use(errorHandler);
app.use('/api/bookings', bookingRoutes);

app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/direct-bookings', require('./routes/directBookingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});