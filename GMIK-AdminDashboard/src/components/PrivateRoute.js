import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const rawLastActivity = localStorage.getItem('lastActivity');
  const lastActivity = rawLastActivity ? parseInt(rawLastActivity, 10) : null;
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;

  const isIdleExpired = lastActivity !== null && (now - lastActivity) > thirtyMinutes;

  if (!token || isIdleExpired) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('lastActivity');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
