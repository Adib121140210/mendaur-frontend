import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { badgeService } from '../../services/badgeService'
import './BadgeManager.css'

const BadgeManager = () => {
  const { hasPermission } = useAuth()
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [pagination, setPagination] = useState({ current_page: 1, per_page: 20, total: 0 })
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    icon: '',
    persyaratan: '',
    aktif: true
  })

  // Check permission
  const canManageBadges = hasPermission('manage_badges')

  // Load badges
  const loadBadges = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const response = await badgeService.getAll(20, page)
      if (response.success) {
        setBadges(response.data || [])
        setPagination((prev) => ({
          ...prev,
          ...response.pagination,
          current_page: page
        }))
      } else {
        setError(response.message || 'Failed to load badges')
      }
    } catch (err) {
      setError('Error loading badges: ' + err.message)
      console.error('Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    if (canManageBadges) {
      loadBadges(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!canManageBadges) {
    return (
      <div className="permission-denied">
        <p>You do not have permission to manage badges</p>
      </div>
    )
  }

  // Handle form input
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let response
      if (editingId) {
        response = await badgeService.update(editingId, formData)
      } else {
        response = await badgeService.create(formData)
      }

      if (response.success) {
        setSuccess(editingId ? 'Badge updated successfully!' : 'Badge created successfully!')
        setFormData({ nama: '', deskripsi: '', icon: '', persyaratan: '', aktif: true })
        setShowForm(false)
        setEditingId(null)
        loadBadges(1)
      } else {
        setError(response.message || 'Failed to save badge')
      }
    } catch (err) {
      setError('Error saving badge: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Edit badge
  const handleEdit = (badge) => {
    setEditingId(badge.id)
    setFormData({
      nama: badge.nama,
      deskripsi: badge.deskripsi,
      icon: badge.icon || '',
      persyaratan: badge.persyaratan || '',
      aktif: badge.aktif
    })
    setShowForm(true)
  }

  // Delete badge
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this badge?')) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await badgeService.delete(id)
      if (response.success) {
        setSuccess('Badge deleted successfully!')
        loadBadges(1)
      } else {
        setError(response.message || 'Failed to delete badge')
      }
    } catch (err) {
      setError('Error deleting badge: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Close form
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ nama: '', deskripsi: '', icon: '', persyaratan: '', aktif: true })
  }

  return (
    <div className="badge-manager-container">
      <div className="manager-header">
        <h2>Badge Management</h2>
        <button className="btn-create" onClick={() => setShowForm(true)}>
          + Add New Badge
        </button>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Form */}
      {showForm && (
        <form className="badge-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Badge Name *</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleFormChange}
              placeholder="e.g., Green Guardian"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleFormChange}
              placeholder="Badge description"
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Icon URL</label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleFormChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="aktif"
                  checked={formData.aktif}
                  onChange={handleFormChange}
                />
                Active
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Requirements</label>
            <textarea
              name="persyaratan"
              value={formData.persyaratan}
              onChange={handleFormChange}
              placeholder="Requirements for this badge"
              rows="2"
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Badge' : 'Create Badge'}
            </button>
            <button type="button" className="btn-cancel" onClick={handleCloseForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Badges List */}
      {loading && badges.length === 0 ? (
        <div className="loading-state">
          <p>Loading badges...</p>
        </div>
      ) : badges.length > 0 ? (
        <>
          <div className="badges-grid">
            {badges.map((badge) => (
              <div key={badge.id} className="badge-card">
                {badge.icon && <img src={badge.icon} alt={badge.nama} className="badge-icon" />}
                <h3>{badge.nama}</h3>
                <p className="description">{badge.deskripsi}</p>
                {badge.persyaratan && (
                  <p className="requirements">
                    <strong>Requirements:</strong> {badge.persyaratan}
                  </p>
                )}
                <span className={`status-badge ${badge.aktif ? 'active' : 'inactive'}`}>
                  {badge.aktif ? 'Active' : 'Inactive'}
                </span>
                <div className="badge-actions">
                  <button className="btn-edit" onClick={() => handleEdit(badge)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(badge.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="btn-pagination"
              disabled={pagination.current_page === 1 || loading}
              onClick={() => loadBadges(pagination.current_page - 1)}
            >
              ← Previous
            </button>
            <span className="page-info">
              Page {pagination.current_page} of {Math.ceil(pagination.total / pagination.per_page) || 1}
            </span>
            <button
              className="btn-pagination"
              disabled={
                pagination.current_page >=
                  Math.ceil(pagination.total / pagination.per_page) || loading
              }
              onClick={() => loadBadges(pagination.current_page + 1)}
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <div className="no-badges">
          <p>No badges found. Create one to get started!</p>
        </div>
      )}
    </div>
  )
}

export default BadgeManager
