/**
 * Notification Service
 * Handles all notification API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

const handleError = (error, defaultMessage = 'An error occurred') => {
  
  return {
    success: false,
    message: error.message || defaultMessage,
    data: null
  }
}

export const notificationService = {
  /**
   * Get all notifications with pagination
   */
  getAll: async (perPage = 20, page = 1) => {
    try {
      const params = new URLSearchParams({ per_page: perPage, page })
      const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: data.data || [],
        pagination: data.meta || {}
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch notifications')
    }
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        unreadCount: data.unread_count || 0
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch unread count')
    }
  },

  /**
   * Get unread notifications only
   */
  getUnread: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: data.data || [],
        count: data.count || 0
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch unread notifications')
    }
  },

  /**
   * Get single notification by ID
   */
  getOne: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'GET',
        headers: getAuthHeader()
      })

      if (response.status === 404) {
        return {
          success: false,
          message: 'Notification not found',
          data: null
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch notification')
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({})
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
      return handleError(error, 'Failed to mark notification as read')
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({})
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        message: data.message || 'All notifications marked as read'
      }
    } catch (error) {
      return handleError(error, 'Failed to mark all notifications as read')
    }
  },

  /**
   * Delete notification
   */
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        message: data.message || 'Notification deleted'
      }
    } catch (error) {
      return handleError(error, 'Failed to delete notification')
    }
  },

  /**
   * Create notification (Admin only)
   */
  create: async (notificationData) => {
    try {
      const { user_id, judul, pesan, tipe, related_id, related_type } = notificationData

      if (!user_id || !judul || !pesan) {
        return {
          success: false,
          message: 'user_id, judul, and pesan are required'
        }
      }

      const response = await fetch(`${API_BASE_URL}/notifications/create`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          user_id,
          judul,
          pesan,
          tipe: tipe || null,
          related_id: related_id || null,
          related_type: related_type || null
        })
      })

      if (response.status === 403) {
        return {
          success: false,
          message: 'Only admins can create notifications'
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      return handleError(error, 'Failed to create notification')
    }
  }
}
