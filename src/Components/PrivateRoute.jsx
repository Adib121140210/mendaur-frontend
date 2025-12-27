/**
 * PrivateRoute / Protected Route Component
 * Restricts access to authenticated users and specific roles
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService.js';

/**
 * PrivateRoute - Protects routes that require authentication
 * @param {object} props
 * @param {React.Component} props.component - Component to render
 * @param {string} props.requiredRole - Required role ('nasabah', 'admin', 'superadmin')
 * @returns {React.Component}
 */
const PrivateRoute = ({ component, requiredRole = null }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole) {
    const roleHierarchy = {
      'nasabah': 1,
      'admin': 2,
      'superadmin': 3,
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    // User doesn't have required role level
    if (userLevel < requiredLevel) {
      return (
        <div className="access-denied-container">
          <div className="access-denied-card">
            <h1>Access Denied</h1>
            <p>You do not have permission to access this page.</p>
            <p>Required role: <strong>{requiredRole}</strong></p>
            <p>Your role: <strong>{userRole}</strong></p>
            <a href="/dashboard">← Back to Dashboard</a>
          </div>
        </div>
      );
    }
  }

  // Authenticated and authorized - render component
  return React.createElement(component);
};

export default PrivateRoute;
