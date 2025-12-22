/**
 * Redemption Service
 * Handles product redemption requests and processing
 */

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/admin/redemptions`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const redemptionService = {
  /**
   * Get all redemption requests with optional filters
   * @param {number} page - Page number for pagination
   * @param {number} per_page - Items per page
   * @param {string} status - Filter by status (pending, approved, rejected, picked_up)
   * @returns {Promise<Object>} Redemption list
   */
  getAll: async (page = 1, per_page = 20, status = null) => {
    try {
      let url = `${BASE_URL}?page=${page}&per_page=${per_page}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination || { current_page: page, per_page, total: 0 },
        message: 'Redemptions fetched successfully',
      };
    } catch (error) {
      console.error('Redemption fetch error:', error);
      return {
        success: false,
        data: [],
        message: `Error fetching redemptions: ${error.message}`,
      };
    }
  },

  /**
   * Get redemption request by ID
   * @param {number} id - Redemption request ID
   * @returns {Promise<Object>} Redemption details
   */
  getById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || null,
        message: 'Redemption fetched successfully',
      };
    } catch (error) {
      console.error('Redemption detail fetch error:', error);
      return {
        success: false,
        data: null,
        message: `Error fetching redemption: ${error.message}`,
      };
    }
  },

  /**
   * Approve redemption request
   * @param {number} id - Redemption request ID
   * @param {Object} data - Approval data {catatan_admin, tanggal_target_ambil}
   * @returns {Promise<Object>} Updated redemption
   */
  approve: async (id, data = {}) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/approve`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          catatan_admin: data.catatan_admin || '',
          tanggal_target_ambil: data.tanggal_target_ambil || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data || null,
        message: result.message || 'Redemption approved successfully',
      };
    } catch (error) {
      console.error('Redemption approval error:', error);
      return {
        success: false,
        data: null,
        message: `Error approving redemption: ${error.message}`,
      };
    }
  },

  /**
   * Reject redemption request
   * @param {number} id - Redemption request ID
   * @param {Object} data - Rejection data {alasan, catatan_admin}
   * @returns {Promise<Object>} Updated redemption
   */
  reject: async (id, data = {}) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/reject`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          alasan: data.alasan || data.reason || 'No reason provided',
          catatan_admin: data.catatan_admin || data.notes || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data || null,
        message: result.message || 'Redemption rejected successfully',
      };
    } catch (error) {
      console.error('Redemption rejection error:', error);
      return {
        success: false,
        data: null,
        message: `Error rejecting redemption: ${error.message}`,
      };
    }
  },

  /**
   * Mark redemption as picked up
   * @param {number} id - Redemption request ID
   * @param {Object} data - Pickup data {tanggal_ambil}
   * @returns {Promise<Object>} Updated redemption
   */
  markAsPickedUp: async (id, data = {}) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/pickup`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          tanggal_ambil: data.tanggal_ambil || new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data || null,
        message: result.message || 'Redemption marked as picked up',
      };
    } catch (error) {
      console.error('Pickup marking error:', error);
      return {
        success: false,
        data: null,
        message: `Error marking as picked up: ${error.message}`,
      };
    }
  },

  /**
   * Get redemptions for a specific user
   * @param {number} user_id - User ID
   * @param {number} page - Page number
   * @param {number} per_page - Items per page
   * @returns {Promise<Object>} User's redemptions
   */
  getUserRedemptions: async (user_id, page = 1, per_page = 20) => {
    try {
      const response = await fetch(
        `${BASE_URL}?user_id=${user_id}&page=${page}&per_page=${per_page}`,
        {
          method: 'GET',
          headers: getAuthHeader(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination || { current_page: page, per_page, total: 0 },
        message: 'User redemptions fetched successfully',
      };
    } catch (error) {
      console.error('User redemptions fetch error:', error);
      return {
        success: false,
        data: [],
        message: `Error fetching user redemptions: ${error.message}`,
      };
    }
  },

  /**
   * Get redemptions by date range
   * @param {string} start_date - Start date (YYYY-MM-DD)
   * @param {string} end_date - End date (YYYY-MM-DD)
   * @param {number} page - Page number
   * @param {number} per_page - Items per page
   * @returns {Promise<Object>} Redemptions in date range
   */
  getByDateRange: async (start_date, end_date, page = 1, per_page = 20) => {
    try {
      const response = await fetch(
        `${BASE_URL}?start_date=${start_date}&end_date=${end_date}&page=${page}&per_page=${per_page}`,
        {
          method: 'GET',
          headers: getAuthHeader(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination || { current_page: page, per_page, total: 0 },
        message: 'Redemptions fetched successfully',
      };
    } catch (error) {
      console.error('Date range redemptions fetch error:', error);
      return {
        success: false,
        data: [],
        message: `Error fetching redemptions: ${error.message}`,
      };
    }
  },

  /**
   * Export redemptions to CSV
   * @param {Object} filters - Filter options {status, start_date, end_date}
   * @returns {Promise<Blob>} CSV file blob
   */
  exportToCSV: async (filters = {}) => {
    try {
      const params = new URLSearchParams({
        export: 'csv',
        ...filters,
      });

      const response = await fetch(`${BASE_URL}?${params}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },
};

export default redemptionService;
