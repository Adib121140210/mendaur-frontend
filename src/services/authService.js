/**
 * Authentication Service
 * Handles login, logout, token management, and user role checking
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{success: boolean, data: object, message: string}>}
   */
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login failed',
          data: null,
        };
      }

      // Store token and user data
      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Determine and store user role based on level
        const userLevel = data.data.user?.level?.toLowerCase() || 'nasabah';
        let role = 'nasabah';
        if (userLevel.includes('superadmin')) role = 'superadmin';
        else if (userLevel.includes('admin')) role = 'admin';
        localStorage.setItem('userRole', role);
        localStorage.setItem('userId', data.data.user?.user_id || '');
      }

      return {
        success: true,
        message: 'Login successful',
        data: data.data,
      };
    } catch {
      return {
        success: false,
        message: 'Network error. Please try again.',
        data: null,
      };
    }
  },

  /**
   * Logout user - clear all stored data
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    return { success: true, message: 'Logged out successfully' };
  },

  /**
   * Get current authentication token
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Get current user data
   * @returns {object|null}
   */
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get current user ID
   * @returns {number|null}
   */
  getUserId: () => {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id) : null;
  },

  /**
   * Get current user role
   * @returns {string} - 'nasabah', 'admin', or 'superadmin'
   */
  getUserRole: () => {
    return localStorage.getItem('userRole') || 'nasabah';
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Check if user is Nasabah
   * @returns {boolean}
   */
  isNasabah: () => {
    return authService.getUserRole() === 'nasabah';
  },

  /**
   * Check if user is Admin (or higher)
   * @returns {boolean}
   */
  isAdmin: () => {
    const role = authService.getUserRole();
    return role === 'admin' || role === 'superadmin';
  },

  /**
   * Check if user is Superadmin
   * @returns {boolean}
   */
  isSuperAdmin: () => {
    return authService.getUserRole() === 'superadmin';
  },

  /**
   * Check if user can access admin panel
   * @returns {boolean}
   */
  canAccessAdmin: () => {
    return authService.isAdmin() || authService.isSuperAdmin();
  },

  /**
   * Refresh token (if backend supports it)
   * @returns {Promise<{success: boolean, token: string}>}
   */
  refreshToken: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, token: null };
      }

      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        return { success: true, token: data.data.token };
      }

      return { success: false, token: null };
    } catch {
      return { success: false, token: null };
    }
  },
};

export default authService;
