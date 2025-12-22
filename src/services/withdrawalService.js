/**
 * Cash Withdrawal Service
 * Handles cash withdrawal requests and processing
 */

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/admin/withdrawals`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const withdrawalService = {
  /**
   * Get all withdrawal requests with optional filters
   * @param {number} page - Page number for pagination
   * @param {number} per_page - Items per page
   * @param {string} status - Filter by status (pending, approved, rejected, completed)
   * @returns {Promise<Object>} Withdrawal list
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
        message: 'Withdrawals fetched successfully',
      };
    } catch (error) {
      console.error('Withdrawal fetch error:', error);
      return {
        success: false,
        data: [],
        message: `Error fetching withdrawals: ${error.message}`,
      };
    }
  },

  /**
   * Get withdrawal request by ID
   * @param {number} id - Withdrawal request ID
   * @returns {Promise<Object>} Withdrawal details
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
        message: 'Withdrawal fetched successfully',
      };
    } catch (error) {
      console.error('Withdrawal detail fetch error:', error);
      return {
        success: false,
        data: null,
        message: `Error fetching withdrawal: ${error.message}`,
      };
    }
  },

  /**
   * Approve withdrawal request
   * @param {number} id - Withdrawal request ID
   * @param {Object} data - Approval data {catatan_admin, tanggal_estimasi_transfer}
   * @returns {Promise<Object>} Updated withdrawal
   */
  approve: async (id, data = {}) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/approve`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          catatan_admin: data.catatan_admin || '',
          tanggal_estimasi_transfer: data.tanggal_estimasi_transfer || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data || null,
        message: result.message || 'Withdrawal approved successfully',
      };
    } catch (error) {
      console.error('Withdrawal approval error:', error);
      return {
        success: false,
        data: null,
        message: `Error approving withdrawal: ${error.message}`,
      };
    }
  },

  /**
   * Reject withdrawal request
   * @param {number} id - Withdrawal request ID
   * @param {Object} data - Rejection data {alasan, catatan_admin}
   * @returns {Promise<Object>} Updated withdrawal
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
        message: result.message || 'Withdrawal rejected successfully',
      };
    } catch (error) {
      console.error('Withdrawal rejection error:', error);
      return {
        success: false,
        data: null,
        message: `Error rejecting withdrawal: ${error.message}`,
      };
    }
  },

  /**
   * Mark withdrawal as completed/transferred
   * @param {number} id - Withdrawal request ID
   * @param {Object} data - Completion data {tanggal_transfer, no_referensi}
   * @returns {Promise<Object>} Updated withdrawal
   */
  markAsCompleted: async (id, data = {}) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/complete`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          tanggal_transfer: data.tanggal_transfer || new Date().toISOString(),
          no_referensi: data.no_referensi || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data || null,
        message: result.message || 'Withdrawal marked as completed',
      };
    } catch (error) {
      console.error('Completion marking error:', error);
      return {
        success: false,
        data: null,
        message: `Error marking as completed: ${error.message}`,
      };
    }
  },

  /**
   * Get withdrawals for a specific user
   * @param {number} user_id - User ID
   * @param {number} page - Page number
   * @param {number} per_page - Items per page
   * @returns {Promise<Object>} User's withdrawals
   */
  getUserWithdrawals: async (user_id, page = 1, per_page = 20) => {
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
        message: 'User withdrawals fetched successfully',
      };
    } catch (error) {
      console.error('User withdrawals fetch error:', error);
      return {
        success: false,
        data: [],
        message: `Error fetching user withdrawals: ${error.message}`,
      };
    }
  },

  /**
   * Get withdrawals by date range
   * @param {string} start_date - Start date (YYYY-MM-DD)
   * @param {string} end_date - End date (YYYY-MM-DD)
   * @param {number} page - Page number
   * @param {number} per_page - Items per page
   * @returns {Promise<Object>} Withdrawals in date range
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
        message: 'Withdrawals fetched successfully',
      };
    } catch (error) {
      console.error('Date range withdrawals fetch error:', error);
      return {
        success: false,
        data: [],
        message: `Error fetching withdrawals: ${error.message}`,
      };
    }
  },

  /**
   * Get withdrawal statistics
   * @returns {Promise<Object>} Statistics
   */
  getStatistics: async () => {
    try {
      const response = await fetch(`${BASE_URL}/statistics`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || {},
        message: 'Statistics fetched successfully',
      };
    } catch (error) {
      console.error('Statistics fetch error:', error);
      return {
        success: false,
        data: {},
        message: `Error fetching statistics: ${error.message}`,
      };
    }
  },

  /**
   * Export withdrawals to CSV
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

export default withdrawalService;
