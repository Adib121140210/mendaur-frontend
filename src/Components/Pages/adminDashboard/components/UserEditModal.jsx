import { useState } from 'react'
import { X, Loader } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../../../services/apiClient.js'
import '../styles/UserEditModal.css'

export default function UserEditModal({ user, onClose, onSave }) {
  const { hasPermission } = useAuth()
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    no_hp: user?.no_hp || '',
    alamat: user?.alamat || '',
    role: user?.role || 'nasabah',
    tipe_nasabah: user?.tipe_nasabah || 'konvensional',
    is_active: user?.is_active !== undefined ? user.is_active : true
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleSave = async () => {
    try {
      // ✅ Permission check
      if (!hasPermission('edit_user')) {
        alert('❌ You do not have permission to edit users')
        return
      }
      
      setSaving(true)
      setError(null)

      // Build update payload with only changed fields
      const updateData = {}
      
      if (formData.is_active !== user.is_active) {
        updateData.is_active = formData.is_active ? 1 : 0
      }
      
      if (formData.role !== user.role) {
        updateData.role = formData.role
      }
      
      if (formData.tipe_nasabah !== user.tipe_nasabah) {
        updateData.tipe_nasabah = formData.tipe_nasabah
      }

      // If nothing changed, just close
      if (Object.keys(updateData).length === 0) {
        alert('No changes made')
        onClose()
        return
      }

      // Send single update request
      try {
        await api.put(`/admin/users/${user.user_id}`, updateData)
      } catch (err) {
        throw new Error(`Failed to update user: ${err.message}`)
      }

      // Success message
      alert(`User "${formData.nama}" updated successfully!`)
      onSave()
      onClose()
    } catch (err) {
      console.error('Error saving user:', err)
      setError(err.message || 'Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title">
            <h3>Edit User: {user?.nama}</h3>
            <span className={`status-indicator status-${user?.is_active ? 'aktif' : 'deaktif'}`}>
              {user?.is_active ? 'AKTIF' : 'DEAKTIF'}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form className="edit-form">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              disabled
              className="form-input disabled"
            />
            <small>Name cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="form-input disabled"
            />
            <small>Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              name="no_hp"
              value={formData.no_hp}
              disabled
              className="form-input disabled"
            />
            <small>Phone cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Address:</label>
            <textarea
              name="alamat"
              value={formData.alamat}
              disabled
              className="form-input disabled form-textarea"
              rows="3"
            />
            <small>Address cannot be changed</small>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="is_active"
              value={formData.is_active ? 'aktif' : 'deaktif'}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  is_active: e.target.value === 'aktif'
                }))
                setError(null)
              }}
              className="form-input"
            >
              <option value="aktif">Aktif</option>
              <option value="deaktif">Deaktif</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input"
            >
              <option value="nasabah">Nasabah</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tipe">Tipe Nasabah:</label>
            <select
              id="tipe"
              name="tipe_nasabah"
              value={formData.tipe_nasabah}
              onChange={handleChange}
              className="form-input"
            >
              <option value="konvensional">Konvensional</option>
              <option value="modern">Modern</option>
            </select>
          </div>
        </form>

        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader size={16} className="spinner" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
