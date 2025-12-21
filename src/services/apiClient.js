/**
 * API Client Service
 * Centralized API request handler with interceptors, error handling, and auth
 */

import authService from './authService.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Request interceptor - Add auth header and prepare request
 */
const requestInterceptor = (options = {}) => {
  const token = authService.getToken();

  return {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };
};

/**
 * Response interceptor - Handle errors and parse response
 */
const responseInterceptor = async (response) => {
  const data = await response.json();

  // Handle 401 Unauthorized - Token expired or invalid
  if (response.status === 401) {
    // Try to refresh token
    const refreshResult = await authService.refreshToken();
    if (!refreshResult.success) {
      // Token refresh failed, clear auth and redirect to login
      authService.logout();
      window.location.href = '/login';
    }
  }

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
};

/**
 * Main API call function
 * @param {string} endpoint - API endpoint (e.g., '/admin/users')
 * @param {object} options - Request options (method, body, headers, etc.)
 * @returns {Promise<object>} - API response
 */
export const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestOptions = requestInterceptor(options);

    const response = await fetch(url, requestOptions);
    const result = await responseInterceptor(response);

    // If not OK, throw error with details
    if (!result.ok) {
      const error = new Error(result.data?.message || `HTTP ${result.status}`);
      error.status = result.status;
      error.response = result.data;
      throw error;
    }

    return result.data;
  } catch (error) {
    console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
};

/**
 * API Helper Methods
 */

export const api = {
  /**
   * GET request
   * @param {string} endpoint
   * @param {object} options
   */
  get: (endpoint, options = {}) =>
    apiCall(endpoint, { method: 'GET', ...options }),

  /**
   * POST request
   * @param {string} endpoint
   * @param {object} body
   * @param {object} options
   */
  post: (endpoint, body = {}, options = {}) =>
    apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),

  /**
   * PATCH request
   * @param {string} endpoint
   * @param {object} body
   * @param {object} options
   */
  patch: (endpoint, body = {}, options = {}) =>
    apiCall(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    }),

  /**
   * PUT request
   * @param {string} endpoint
   * @param {object} body
   * @param {object} options
   */
  put: (endpoint, body = {}, options = {}) =>
    apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    }),

  /**
   * DELETE request
   * @param {string} endpoint
   * @param {object} options
   */
  delete: (endpoint, options = {}) =>
    apiCall(endpoint, { method: 'DELETE', ...options }),
};

export default api;
