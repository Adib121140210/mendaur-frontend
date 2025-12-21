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
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
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

// ============================================
// PHASE 1 ENDPOINTS - AVATAR UPLOAD
// ============================================

/**
 * Upload user avatar with file validation
 * POST /api/users/{id}/avatar
 * @param {number} userId - User ID
 * @param {File} avatarFile - Avatar image file
 * @returns {Promise<object>} - Upload response with path and URL
 */
export const uploadUserAvatar = async (userId, avatarFile) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(avatarFile.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (avatarFile.size > maxSize) {
      throw new Error('File size must not exceed 2MB');
    }

    // Create FormData for multipart file upload
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...{} // Don't set Content-Type, let browser set it for FormData
      },
      body: formData
    });

    if (!response.ok) {
      let errorMessage = `Upload failed with status ${response.status}`;
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

    const data = await response.json();
    console.info('✅ Avatar uploaded successfully');
    return {
      success: true,
      message: 'Avatar uploaded successfully',
      data: data.data || data,
      path: data.data?.path || data.path
    };
  } catch (error) {
    console.error(`Avatar upload failed for user ${userId}:`, error.message);
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};
