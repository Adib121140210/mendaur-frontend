/**
 * Admin Dashboard API Service
 * Handles all API calls untuk admin dashboard features
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

/**
 * Get authorization header dengan token
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

/**
 * Handle API response error
 */
const handleError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error)
  return {
    success: false,
    message: error.message || defaultMessage,
    data: null
  }
}

/**
 * Dashboard Overview - GET /api/admin/dashboard/overview
 */
export const adminApi = {
  // Dashboard
  getOverview: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/overview`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch overview stats')
    }
  },

  // Users
  getAllUsers: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      })

      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch users')
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to update user status')
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return {
        success: true,
        message: 'User deleted successfully'
      }
    } catch (error) {
      return handleError(error, 'Failed to delete user')
    }
  },

  // Analytics - Waste
  getWasteAnalytics: async (period = 'monthly', filters = {}) => {
    try {
      const params = new URLSearchParams({
        period,
        ...filters
      })

      const response = await fetch(`${API_BASE_URL}/admin/analytics/waste?${params}`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch waste analytics')
    }
  },

  getWasteByUser: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      })

      const response = await fetch(`${API_BASE_URL}/admin/analytics/waste-by-user?${params}`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch waste by user')
    }
  },

  // Analytics - Points
  getPointsAnalytics: async (period = 'monthly', filters = {}) => {
    try {
      const params = new URLSearchParams({
        period,
        ...filters
      })

      const response = await fetch(`${API_BASE_URL}/admin/analytics/points?${params}`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch points analytics')
    }
  },

  awardPoints: async (userId, points, reason = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/points/award`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          user_id: userId,
          points,
          reason
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to award points')
    }
  },

  getPointsHistory: async (page = 1, limit = 20, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      })

      const response = await fetch(`${API_BASE_URL}/admin/points/history?${params}`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch points history')
    }
  },

  // Leaderboard
  getLeaderboard: async (period = 'monthly', limit = 100) => {
    try {
      const params = new URLSearchParams({ period, limit })

      const response = await fetch(`${API_BASE_URL}/admin/leaderboard?${params}`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch leaderboard')
    }
  },

  // Reports
  generateReport: async (type, period, startDate, endDate, format = 'pdf') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/generate`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          type,
          period,
          startDate,
          endDate,
          format
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to generate report')
    }
  },

  exportData: async (type = 'users', format = 'csv') => {
    try {
      const params = new URLSearchParams({ type, format })

      const response = await fetch(`${API_BASE_URL}/admin/export?${params}`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // For file downloads, return the response directly
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return handleError(error, 'Failed to export data')
    }
  }
}

export default adminApi
