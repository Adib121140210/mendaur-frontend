// API Helper - Utility for making authenticated API calls
const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Make an authenticated API call with Bearer token
 * @param {string} endpoint - API endpoint path (e.g., '/users/1')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<object>} - Parsed JSON response
 */
export const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Response was not JSON
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error.message);
    throw error;
  }
};

// Helper functions
export const apiGet = (endpoint, options = {}) =>
  apiCall(endpoint, { method: 'GET', ...options });

export const apiPost = (endpoint, body, options = {}) =>
  apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options
  });

export const apiPut = (endpoint, body, options = {}) =>
  apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options
  });

export const apiDelete = (endpoint, options = {}) =>
  apiCall(endpoint, { method: 'DELETE', ...options });

// Specific API endpoints
export const getUser = (userId) => apiGet(`/users/${userId}`);
export const getUserBadges = (userId) => apiGet(`/users/${userId}/badges`);
export const getUserActivity = (userId, limit = 20) => apiGet(`/users/${userId}/aktivitas?limit=${limit}`);
export const getUserPoints = (userId) => apiGet(`/points/user/${userId}`);
export const getDashboardStats = (userId) => apiGet(`/dashboard/user-stats/${userId}`);
export const getLeaderboard = (type = 'poin', limit = 10) => apiGet(`/dashboard/leaderboard?type=${type}&limit=${limit}`);
export const getArticles = () => apiGet(`/articles`);
export const getArticle = (id) => apiGet(`/articles/${id}`);
export const login = (email, password) => apiPost('/login', { email, password }, { headers: {} });
export const register = (data) => apiPost('/register', data, { headers: {} });
export const updateUserProfile = (userId, data) => apiPut(`/users/${userId}`, data);

// Legacy function
export const fetchRiwayat = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/riwayat`);
  return res.json();
};
