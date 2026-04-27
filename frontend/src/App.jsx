import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './views/components/common/ProtectedRoute';

import LoginPage from './views/pages/LoginPage';
import RegisterPage from './views/pages/RegisterPage';
import ForgotPasswordPage from './views/pages/ForgotPasswordPage';
import ResetPasswordPage from './views/pages/ResetPasswordPage';

import CustomerDashboard from './views/pages/CustomerDashboard';
import CreateServiceRequestPage from './views/pages/CreateServiceRequestPage';
import MyRequestsPage from './views/pages/MyRequestsPage';
import ViewBidsPage from './views/pages/ViewBidsPage';
import BrowseProviders from './views/pages/BrowseProviders';
import BrowseServices from './views/pages/BrowseServices';

import ProviderDashboard from './views/pages/ProviderDashboard';
import ProviderCategoriesPage from './views/pages/ProviderCategoriesPage';
import PortfolioPage from './views/pages/PortfolioPage';
import EditProviderProfile from './views/pages/EditProviderProfile';
import ProviderProfileView from './views/pages/ProviderProfileView';
import BrowseRequestsPage from './views/pages/BrowseRequestsPage';
import MyBidsPage from './views/pages/MyBidsPage';       // ← NEW
import MyJobsPage from './views/pages/MyJobsPage';       // ← NEW

import AdminDashboard from './views/pages/AdminDashboard';
import ManageCategoriesPage from './views/pages/ManageCategoriesPage';
import MyBookingsPage from './views/pages/MyBookingsPage';


import ProviderBookingRequestsPage from './views/pages/ProviderBookingRequestsPage';
import NotificationsPage from './views/pages/NotificationsPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            <Route path="/customer/dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/customer/create-request" element={<ProtectedRoute roles={['customer']}><CreateServiceRequestPage /></ProtectedRoute>} />
            <Route path="/customer/my-requests" element={<ProtectedRoute roles={['customer']}><MyRequestsPage /></ProtectedRoute>} />
            <Route path="/customer/requests/:requestId/bids" element={<ProtectedRoute roles={['customer']}><ViewBidsPage /></ProtectedRoute>} />
            <Route path="/providers" element={<ProtectedRoute roles={['customer', 'admin']}><BrowseProviders /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute roles={['customer', 'admin']}><BrowseServices /></ProtectedRoute>} />

            <Route path="/provider/dashboard" element={<ProtectedRoute roles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
            <Route path="/provider/categories" element={<ProtectedRoute roles={['provider']}><ProviderCategoriesPage /></ProtectedRoute>} />
            <Route path="/provider/portfolio" element={<ProtectedRoute roles={['provider']}><PortfolioPage /></ProtectedRoute>} />
            <Route path="/provider/edit-profile" element={<ProtectedRoute roles={['provider']}><EditProviderProfile /></ProtectedRoute>} />
            <Route path="/provider/profile" element={<ProtectedRoute roles={['provider']}><ProviderProfileView /></ProtectedRoute>} />
            <Route path="/provider/browse-requests" element={<ProtectedRoute roles={['provider']}><BrowseRequestsPage /></ProtectedRoute>} />
            <Route path="/provider/my-bids" element={<ProtectedRoute roles={['provider']}><MyBidsPage /></ProtectedRoute>} />   {/* ← NEW */}
            <Route path="/provider/my-jobs" element={<ProtectedRoute roles={['provider']}><MyJobsPage /></ProtectedRoute>} />   {/* ← NEW */}

            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><ManageCategoriesPage /></ProtectedRoute>} />

            <Route path="/customer/my-bookings" element={<ProtectedRoute roles={['customer']}><MyBookingsPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/login" replace />} />

            // Customer
            <Route path="/customer/my-bookings" element={<ProtectedRoute roles={['customer']}><MyBookingsPage /></ProtectedRoute>} />
            <Route path="/customer/notifications" element={<ProtectedRoute roles={['customer']}><NotificationsPage /></ProtectedRoute>} />

             // Provider
             <Route path="/provider/booking-requests" element={<ProtectedRoute roles={['provider']}><ProviderBookingRequestsPage /></ProtectedRoute>} />
             <Route path="/provider/notifications" element={<ProtectedRoute roles={['provider']}><NotificationsPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;