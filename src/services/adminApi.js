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
  
  if (!token) {
    console.warn('⚠️ No token found in localStorage')
    console.warn('Available localStorage keys:', Object.keys(localStorage))
  } else {
    console.log('🔐 Token found in localStorage:', {
      length: token.length,
      preview: token.substring(0, 30) + '...' + token.substring(token.length - 20),
      type: typeof token
    })
  }
  
  return {
    'Authorization': `Bearer ${token}`,
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
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('⚠️ No authentication token available')
        return {
          success: false,
          message: 'Not authenticated. Please login again.',
          data: null
        }
      }

      const response = await fetch(`${API_BASE_URL}/admin/dashboard/overview`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (response.status === 401) {
        console.warn('⚠️ Authentication failed (401). Token may be expired.')
        return {
          success: false,
          message: 'Authentication failed. Please login again.',
          data: null
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.info('✅ Overview data loaded successfully')
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
  },

  // ============================================
  // PHASE 1 ENDPOINTS - WASTE DEPOSIT MANAGEMENT
  // ============================================

  /**
   * List all waste deposits with filtering and pagination
   * GET /api/admin/penyetoran-sampah
   */
  listWasteDeposits: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      })

      const headers = getAuthHeader()
      console.log('📤 REQUEST DETAILS:', {
        url: `${API_BASE_URL}/admin/penyetoran-sampah?${params}`,
        method: 'GET',
        authHeader: headers.Authorization ? headers.Authorization.substring(0, 30) + '...' : 'MISSING',
        tokenInStorage: localStorage.getItem('token') ? 'YES' : 'NO'
      })

      const response = await fetch(`${API_BASE_URL}/admin/penyetoran-sampah?${params}`, {
        method: 'GET',
        headers: headers
      })

      console.log('📥 RESPONSE:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.info('✅ Waste deposits loaded successfully')
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch waste deposits')
    }
  },

  /**
   * Get details of a specific waste deposit
   * GET /api/admin/penyetoran-sampah/{id}
   */
  getWasteDepositDetail: async (depositId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/penyetoran-sampah/${depositId}`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.info(`✅ Deposit #${depositId} loaded successfully`)
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch deposit details')
    }
  },

  /**
   * Approve a waste deposit and assign poin
   * PATCH /api/admin/penyetoran-sampah/{id}/approve
   */
  approveWasteDeposit: async (depositId, poinDiberikan) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/penyetoran-sampah/${depositId}/approve`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({
          poin_diberikan: parseInt(poinDiberikan)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.info(`✅ Deposit #${depositId} approved with ${poinDiberikan} poin`)
      return {
        success: true,
        message: 'Deposit approved successfully',
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to approve waste deposit')
    }
  },

  /**
   * Reject a waste deposit with reason
   * PATCH /api/admin/penyetoran-sampah/{id}/reject
   */
  rejectWasteDeposit: async (depositId, alasanPenolakan) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/penyetoran-sampah/${depositId}/reject`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({
          alasan_penolakan: alasanPenolakan
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.info(`✅ Deposit #${depositId} rejected`)
      return {
        success: true,
        message: 'Deposit rejected successfully',
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to reject waste deposit')
    }
  },

  /**
   * Delete a waste deposit (Superadmin only)
   * DELETE /api/admin/penyetoran-sampah/{id}
   */
  deleteWasteDeposit: async (depositId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/penyetoran-sampah/${depositId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.info(`✅ Deposit #${depositId} deleted`)
      return {
        success: true,
        message: 'Deposit deleted successfully',
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to delete waste deposit')
    }
  },

  /**
   * Get waste deposit statistics
   * GET /api/admin/penyetoran-sampah/stats/overview
   */
  getWasteStats: async () => {
    try {
      const headers = getAuthHeader()
      console.log('📤 Sending stats request with headers:', {
        Authorization: headers.Authorization ? headers.Authorization.substring(0, 20) + '...' : 'MISSING',
        token: localStorage.getItem('token') ? 'Present' : 'MISSING'
      })

      const response = await fetch(`${API_BASE_URL}/admin/penyetoran-sampah/stats/overview`, {
        method: 'GET',
        headers: headers
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.info('✅ Waste statistics loaded successfully')
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch waste statistics')
    }
  },

  // ============================================
  // ISSUE 2: MISSING ENDPOINTS (19 total)
  // ============================================

  // ADMIN MANAGEMENT (6 endpoints)
  /**
   * Get all admin users
   * GET /api/admin/admins
   */
  getAllAdmins: async (page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({ page, limit })
      const response = await fetch(`${API_BASE_URL}/admin/admins?${params}`, {
        method: 'GET',
        headers: getAuthHeader()
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info('✅ All admins loaded')
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to fetch admins')
    }
  },

  /**
   * Get admin user by ID
   * GET /api/admin/admins/{adminId}
   */
  getAdminById: async (adminId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}`, {
        method: 'GET',
        headers: getAuthHeader()
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info(`✅ Admin #${adminId} loaded`)
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to fetch admin')
    }
  },

  /**
   * Create new admin user
   * POST /api/admin/admins
   */
  createAdmin: async (adminData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/admins`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(adminData)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info('✅ Admin created successfully')
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to create admin')
    }
  },

  /**
   * Update admin user
   * PUT /api/admin/admins/{adminId}
   */
  updateAdmin: async (adminId, adminData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(adminData)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info(`✅ Admin #${adminId} updated`)
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to update admin')
    }
  },

  /**
   * Delete admin user
   * DELETE /api/admin/admins/{adminId}
   */
  deleteAdmin: async (adminId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info(`✅ Admin #${adminId} deleted`)
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to delete admin')
    }
  },

  /**
   * Get admin activity logs
   * GET /api/admin/admins/{adminId}/activity-logs
   */
  getAdminActivityLogs: async (adminId, page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({ page, limit })
      const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}/activity-logs?${params}`, {
        method: 'GET',
        headers: getAuthHeader()
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info(`✅ Activity logs for admin #${adminId} loaded`)
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to fetch activity logs')
    }
  },

  // ROLE MANAGEMENT (5 endpoints)
  /**
   * Get all roles
   * GET /api/admin/roles
   */
  getAllRoles: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roles`, {
        method: 'GET',
        headers: getAuthHeader()
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info('✅ All roles loaded')
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to fetch roles')
    }
  },

  /**
   * Get role by ID
   * GET /api/admin/roles/{roleId}
   */
  getRoleById: async (roleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roles/${roleId}`, {
        method: 'GET',
        headers: getAuthHeader()
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info(`✅ Role #${roleId} loaded`)
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to fetch role')
    }
  },

  /**
   * Create new role
   * POST /api/admin/roles
   */
  createRole: async (roleData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roles`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(roleData)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info('✅ Role created successfully')
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to create role')
    }
  },

  /**
   * Update role
   * PUT /api/admin/roles/{roleId}
   */
  updateRole: async (roleId, roleData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roles/${roleId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(roleData)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info(`✅ Role #${roleId} updated`)
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to update role')
    }
  },

  /**
   * Delete role
   * DELETE /api/admin/roles/{roleId}
   */
  deleteRole: async (roleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roles/${roleId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info(`✅ Role #${roleId} deleted`)
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to delete role')
    }
  },

  // PERMISSION ASSIGNMENT (3 endpoints)
  /**
   * Assign permissions to role
   * POST /api/admin/roles/{roleId}/permissions
   */
  assignPermissionsToRole: async (roleId, permissionIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roles/${roleId}/permissions`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ permission_ids: permissionIds })
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info(`✅ Permissions assigned to role #${roleId}`)
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to assign permissions')
    }
  },

  /**
   * Get role permissions
   * GET /api/admin/roles/{roleId}/permissions
   */
  getRolePermissions: async (roleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roles/${roleId}/permissions`, {
        method: 'GET',
        headers: getAuthHeader()
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info(`✅ Permissions for role #${roleId} loaded`)
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to fetch role permissions')
    }
  },

  /**
   * Get all available permissions
   * GET /api/admin/permissions
   */
  getAllPermissions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/permissions`, {
        method: 'GET',
        headers: getAuthHeader()
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info('✅ All permissions loaded')
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to fetch permissions')
    }
  },

  // BADGE MANAGEMENT (5 endpoints)
  /**
   * Get all badges
   * GET /api/admin/badges
   */
  getAllBadges: async (page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({ page, limit })
      const response = await fetch(`${API_BASE_URL}/admin/badges?${params}`, {
        method: 'GET',
        headers: getAuthHeader()
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info('✅ All badges loaded')
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to fetch badges')
    }
  },

  /**
   * Create badge
   * POST /api/admin/badges
   */
  createBadge: async (badgeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/badges`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(badgeData)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info('✅ Badge created successfully')
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to create badge')
    }
  },

  /**
   * Update badge
   * PUT /api/admin/badges/{badgeId}
   */
  updateBadge: async (badgeId, badgeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/badges/${badgeId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(badgeData)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info(`✅ Badge #${badgeId} updated`)
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to update badge')
    }
  },

  /**
   * Delete badge
   * DELETE /api/admin/badges/{badgeId}
   */
  deleteBadge: async (badgeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/badges/${badgeId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info(`✅ Badge #${badgeId} deleted`)
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to delete badge')
    }
  },

  /**
   * Assign badge to user
   * POST /api/admin/badges/{badgeId}/assign
   */
  assignBadgeToUser: async (badgeId, userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/badges/${badgeId}/assign`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ user_id: userId })
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.info(`✅ Badge #${badgeId} assigned to user #${userId}`)
      return { success: true, data: data.data || data }
    } catch (error) {
      return handleError(error, 'Failed to assign badge')
    }
  }
}

export default adminApi
