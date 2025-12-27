/**
 * Auth validation utility
 * Helps determine if 401 errors are due to invalid token or endpoint issues
 */

import { API_BASE_URL } from '../config/api';

/**
 * Test if current token is valid by calling a simple endpoint
 * @returns {boolean} true if token is valid, false otherwise
 */
export const validateCurrentToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // Try a simple endpoint that should always work if token is valid
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Smart 401 handler that validates token before forcing logout
 * @param {string} failedEndpoint - endpoint that returned 401
 */
export const smart401Handler = async (failedEndpoint) => {
  // Check if token is actually invalid
  const isTokenValid = await validateCurrentToken();
  
  if (!isTokenValid) {
    forceLogout(`Invalid token detected on ${failedEndpoint}`);
  } else {
    // Don't logout, just return error for component to handle
    return {
      success: false,
      message: 'This feature is temporarily unavailable. Please try again later.',
      data: null,
      statusCode: 401
    };
  }
};

/**
 * Force logout - clear all auth data and redirect
 */
export const forceLogout = (reason = 'Session expired') => {
  console.warn('Force logout triggered:', reason);
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('roleData');
  localStorage.removeItem('permissions');
  localStorage.removeItem('permissionsCount');
  localStorage.removeItem('id_user');
  
  // Redirect to login page
  window.location.href = '/login';
};

export default {
  validateCurrentToken,
  smart401Handler,
  forceLogout
};
