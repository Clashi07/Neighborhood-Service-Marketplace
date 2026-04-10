import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './views/components/common/ProtectedRoute';

import LoginPage from './views/pages/LoginPage';
import RegisterPage from './views/pages/RegisterPage';
import ForgotPasswordPage from './views/pages/ForgotPasswordPage';
import ResetPasswordPage from './views/pages/ResetPasswordPage';
import CustomerDashboard from './views/pages/CustomerDashboard';
import ProviderDashboard from './views/pages/ProviderDashboard';
import AdminDashboard from './views/pages/AdminDashboard';
import ManageCategoriesPage from './views/pages/ManageCategoriesPage';
import EditProviderProfile from './views/pages/EditProviderProfile';
import ProviderProfileView from './views/pages/ProviderProfileView';
import BrowseProviders from './views/pages/BrowseProviders';
import BrowseServices from './views/pages/BrowseServices';
import PortfolioPage from './views/pages/PortfolioPage';
import BrowseCategories from './views/components/provider/BrowseCategories';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>

            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Customer routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute roles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/providers"
              element={
                <ProtectedRoute roles={['customer', 'admin']}>
                  <BrowseProviders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute roles={['customer', 'admin']}>
                  <BrowseServices />
                </ProtectedRoute>
              }
            />

            {/* Provider routes */}
            <Route
              path="/provider/dashboard"
              element={
                <ProtectedRoute roles={['provider']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/categories"
              element={
                <ProtectedRoute roles={['provider']}>
                  <BrowseCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/portfolio"
              element={
                <ProtectedRoute roles={['provider']}>
                  <PortfolioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/edit-profile"
              element={
                <ProtectedRoute roles={['provider']}>
                  <EditProviderProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/profile"
              element={
                <ProtectedRoute roles={['provider']}>
                  <ProviderProfileView />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute roles={['admin']}>
                  <ManageCategoriesPage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;