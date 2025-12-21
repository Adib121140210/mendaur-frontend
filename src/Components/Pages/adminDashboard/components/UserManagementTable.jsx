import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Loader, AlertCircle, Edit2, Trash2 } from 'lucide-react'
import api from '../../../../services/apiClient.js'
import authService from '../../../../services/authService.js'
import { useAuth } from '../../context/AuthContext'
import { PermissionGuard } from '../../../PermissionGuard'
import UserEditModal from './UserEditModal'
import ConfirmDialog from './ConfirmDialog'

const ITEMS_PER_PAGE = 10

function UserManagementTable() {
  // ✅ Get permission checker
  const { hasPermission } = useAuth()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Filter users berdasarkan search term
  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        throw new Error('Not authenticated. Please login again.')
      }

      try {
        // Call real API endpoint - load with pagination (backend accepts page & limit)
        const response = await api.get(`/admin/users?page=1&limit=100`)
        
        // Handle different response formats from backend
        const usersData = response.data?.users || response.data?.data || response.data || []
        
        // If data is array, use it; if nested in pagination, flatten it
        const allUsers = Array.isArray(usersData) ? usersData : []
        
        // For scroll table, we want to load multiple pages if available
        // Store all users we received
        setUsers(allUsers)
        setError(null)
      } catch (apiError) {
        // Handle API errors
        if (apiError.status === 401) {
          // Unauthorized - token expired
          authService.logout()
          window.location.href = '/login'
          return
        } else if (apiError.status === 403) {
          // Forbidden - user doesn't have permission
          setError('Access Denied. You do not have permission to view users.')
          setUsers([])
          return
        }

        // API error - clear users and show error
        console.error('Backend error:', apiError.message)
        setUsers([])
        setError(`Failed to load users: ${apiError.message}`)
      }
    } catch (err) {
      console.error('Error fetching users:', err.message)
      setError(err.message)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleRetry = () => {
    setSearchTerm('')
    setError(null)
  }

  const handleEdit = (user) => {
    // ✅ Permission check
    if (!hasPermission('edit_user')) {
      alert('❌ You do not have permission to edit users')
      return
    }
    // TODO: Implement edit for user - backend endpoint missing (need PUT /api/admin/users/{user_id})
    const userId = user?.user_id
    alert(`⚠️ Edit functionality is not yet available for user ${userId}.\n\nThe backend does not have an update endpoint.\n\nBackend supports: GET, HEAD, DELETE\n\nPlease ask backend team to add:\nPUT /api/admin/users/{user_id}`)
    return
  }

  const handleDelete = (user) => {
    // ✅ Permission check
    if (!hasPermission('delete_user')) {
      alert('❌ You do not have permission to delete users')
      return
    }
    setSelectedUser(user)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    // ✅ Re-check permission (defense in depth)
    if (!hasPermission('delete_user')) {
      alert('❌ You do not have permission to delete users')
      return
    }

    try {
      setIsDeleting(true)

      // Call real API endpoint
      await api.delete(`/admin/users/${selectedUser.user_id}`)

      // Success - remove from list and refresh
      setUsers(users.filter(u => u.user_id !== selectedUser.user_id))
      setShowDeleteConfirm(false)
      setSelectedUser(null)
      alert(`User "${selectedUser.nama}" deleted successfully`)
    } catch (err) {
      console.error('Error deleting user:', err)
      
      if (err.status === 403) {
        alert('Cannot delete user. You may not have permission or cannot delete your own account.')
      } else if (err.status === 404) {
        alert('User not found.')
      } else {
        alert(`Error deleting user: ${err.message}`)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveEdit = () => {
    fetchUsers()
    setShowEditModal(false)
  }

  const getStatusBadge = (status) => {
    // Handle both tipe_nasabah and status field names
    const statusValue = status?.toLowerCase() || 'unknown'
    let statusClass = 'badge-unknown'
    
    if (statusValue === 'active' || statusValue === 'modern') {
      statusClass = 'badge-active'
    } else if (statusValue === 'inactive') {
      statusClass = 'badge-inactive'
    } else if (statusValue === 'suspended' || statusValue === 'konvensional') {
      statusClass = 'badge-suspended'
    }
    
    return <span className={`status-badge ${statusClass}`}>{statusValue.toUpperCase()}</span>
  }

  const getActiveBadge = (isActive) => {
    // Convert string values to boolean if needed
    // Backend might send: "true"/"false", 1/0, true/false
    let isActiveBoolean = isActive
    
    if (typeof isActive === 'string') {
      isActiveBoolean = isActive.toLowerCase() === 'true' || isActive === '1' || isActive === 1
    } else if (typeof isActive === 'number') {
      isActiveBoolean = isActive !== 0
    } else {
      // Default: treat as boolean
      isActiveBoolean = !!isActive
    }
    
    return (
      <span className={`active-badge ${isActiveBoolean ? 'badge-aktif' : 'badge-deaktif'}`}>
        {isActiveBoolean ? 'Aktif' : 'Deaktif'}
      </span>
    )
  }

  const getRoleBadge = (role) => {
    const roleValue = role?.toLowerCase() || 'unknown'
    const roleClass = `badge-role-${roleValue}`
    return <span className={`role-badge ${roleClass}`}>{roleValue.toUpperCase()}</span>
  }

  if (error) {
    return (
      <div className="users-table-error">
        <AlertCircle className="error-icon" />
        <p>Error: {error}</p>
        <button onClick={handleRetry} className="btn-retry">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="users-management">
      <div className="users-header">
        <h2>User Management</h2>
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="users-loading">
          <Loader className="spinner" />
          <p>Loading users...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Tipe</th>
                  <th>Status</th>
                  <th>Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={user.user_id}>
                      <td>{index + 1}</td>
                      <td className="user-name">{user.nama}</td>
                      <td>{user.email}</td>
                      <td>{user.no_hp}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>{getStatusBadge(user.tipe_nasabah)}</td>
                      <td>{getActiveBadge(user.is_active)}</td>
                      <td className="points">{user.total_poin}</td>
                      <td className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(user)}
                          title="Edit not yet available - backend endpoint missing"
                          disabled
                          style={{ opacity: 0.5, cursor: 'not-allowed' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <PermissionGuard
                          permission="delete_user"
                          fallback={
                            <button
                              className="btn-delete"
                              disabled
                              title="You do not have permission to delete users"
                              style={{ opacity: 0.5, cursor: 'not-allowed' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          }
                        >
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(user)}
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </PermissionGuard>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="empty-message">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="users-mobile-cards">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.user_id} className="user-card">
                  <div className="user-card-row">
                    <span className="label">Name:</span>
                    <span className="value">{user.nama}</span>
                  </div>
                  <div className="user-card-row">
                    <span className="label">Email:</span>
                    <span className="value">{user.email}</span>
                  </div>
                  <div className="user-card-row">
                    <span className="label">Phone:</span>
                    <span className="value">{user.no_hp}</span>
                  </div>
                  <div className="user-card-row">
                    <span className="label">Points:</span>
                    <span className="value">{user.total_poin}</span>
                  </div>
                  <div className="user-card-row">
                    <span className="label">Level:</span>
                    <span className={`level-badge level-${user.level}`}>
                      {user.level}
                    </span>
                  </div>
                  <div className="user-card-row">
                    <span className="label">Deposits:</span>
                    <span className="value">{user.total_setor_sampah || 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No users found</p>
            )}
          </div>

          {/* Info - Show total users */}
          <div className="table-info">
            <p>Total: <strong>{filteredUsers.length}</strong> users found (scroll to view more)</p>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && selectedUser && (
        <ConfirmDialog
          title="Delete User"
          message={`Are you sure you want to delete "${selectedUser.nama}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}

export default UserManagementTable;
