import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userData, requiresVerification } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Redirect to verification page if email not verified
  if (requiresVerification) {
    return <Navigate to="/verify-email" />;
  }

  if (allowedRoles && !allowedRoles.includes(userData?.userType)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;