// API Helper - Utility for m      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {nticated API calls
const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Make an authenticated API call with Bearer token
 * @param {string} endpoint - API endpoint path (e.g., '/users/1')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<object>} - Parsed JSON response
 */
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      let errorData = null;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Response was not JSON - silent fail
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    const responseData = await response.json();
    return responseData;
    
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error - Unable to connect to server');
    }
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
export const getUnlockedBadges = (userId) => apiGet(`/users/${userId}/unlocked-badges`);
export const getBadgeTitle = (userId) => apiGet(`/users/${userId}/badge-title`);
export const setBadgeTitle = (userId, badgeId) => apiPut(`/users/${userId}/badge-title`, { badge_id: badgeId });
export const getUserActivity = (userId, limit = 20) => apiGet(`/users/${userId}/aktivitas?limit=${limit}`);
export const getUserPoints = (userId) => apiGet(`/points/user/${userId}`);
export const getDashboardStats = (userId) => apiGet(`/dashboard/user-stats/${userId}`);
export const getLeaderboard = (type = 'poin', limit = 10) => apiGet(`/dashboard/leaderboard?type=${type}&limit=${limit}`);
export const getArticles = () => apiGet(`/articles`);
export const getArticle = (id) => apiGet(`/articles/${id}`);
export const login = (email, password) => apiPost('/login', { email, password }, { headers: {} });
export const register = (data) => apiPost('/register', data, { headers: {} });

/**
 * Update user profile - tries multiple endpoints
 * Backend endpoints (in priority order):
 * 1. PUT /api/profile (primary)
 * 2. POST /api/profile/update (alternative)
 * @param {number} userId - User ID
 * @param {object} data - Profile data to update
 */
export const updateUserProfile = async (userId, data) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  };

  // 1. Try primary PUT /api/profile endpoint first
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...data, user_id: userId }),
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // PUT failed, try POST endpoint
  }

  // 2. Try POST /api/profile/update endpoint
  const response = await fetch(`${API_BASE_URL}/profile/update`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...data, user_id: userId }),
  });
  
  if (response.ok) {
    return await response.json();
  }
  
  // If we get here, throw the error
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.message || 'Gagal memperbarui profil');
};

// Legacy function
export const fetchRiwayat = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/riwayat`);
  return res.json();
};

// ============================================
// AVATAR UPLOAD ENDPOINTS
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
    return {
      success: true,
      message: 'Avatar uploaded successfully',
      data: data.data || data,
      path: data.data?.path || data.path
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};
