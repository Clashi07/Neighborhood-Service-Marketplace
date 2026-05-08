import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  // Debug — remove after fixing
  console.log('ProtectedRoute:', { user, loading, roles, pathname: window.location.pathname });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!user) {
    console.warn('ProtectedRoute: no user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    console.warn('ProtectedRoute: role mismatch', user.role, 'not in', roles);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;