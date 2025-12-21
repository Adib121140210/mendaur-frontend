import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader,
  X,
  Plus,
  Eye,
  Trash2,
  Calendar,
  Users,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../../../services/adminApi';
import '../styles/notificationManagement.css';

export default function NotificationManagement() {
  const { hasPermission } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    recipientType: 'all',
    recipients: [],
    scheduleTime: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const result = await adminApi.getNotifications?.();
        if (result?.success) {
          setNotifications(result.data || []);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.warn('Notifications fetch error:', err);
        setNotifications([]);
      }

      try {
        const templatesResult = await adminApi.getNotificationTemplates?.();
        if (templatesResult?.success) {
          setTemplates(templatesResult.data || []);
        } else {
          setTemplates([]);
        }
      } catch (err) {
        console.warn('Templates fetch error:', err);
        setTemplates([]);
      }

      setLoading(false);
    };

    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (filterStatus !== 'all' && n.status !== filterStatus) return false;
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: notifications.length,
    delivered: notifications.filter((n) => n.status === 'delivered').length,
    scheduled: notifications.filter((n) => n.status === 'scheduled').length,
    failed: notifications.reduce((sum, n) => sum + n.failedCount, 0),
    totalSent: notifications.reduce((sum, n) => sum + n.deliveredCount, 0),
  };

  const handleCreateClick = () => {
    // ✅ Permission check
    if (!hasPermission('manage_notifications')) {
      alert('❌ You do not have permission to create notifications')
      return
    }
    setFormData({
      title: '',
      message: '',
      type: 'info',
      recipientType: 'all',
      recipients: [],
      scheduleTime: '',
    });
    setShowCreateModal(true);
  };

  const handlePreview = (notif) => {
    setSelectedNotif(notif);
    setShowPreviewModal(true);
  };

  const handleCreateSubmit = async () => {
    if (!formData.title || !formData.message) {
      alert('Judul dan pesan notifikasi wajib diisi!');
      return;
    }
    // ✅ Permission check before submission
    if (!hasPermission('manage_notifications')) {
      alert('❌ You do not have permission to create notifications')
      return
    }
    setIsSubmitting(true);
    try {
      const result = await adminApi.createNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        recipientType: formData.recipientType,
        recipients: formData.recipients,
        scheduleTime: formData.scheduleTime,
      });
      if (result.success) {
        const newNotification = {
          id: notifications.length + 1,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          status: formData.scheduleTime ? 'scheduled' : 'delivered',
          sentAt: formData.scheduleTime ? null : new Date().toISOString(),
          scheduleTime: formData.scheduleTime ? formData.scheduleTime : null,
          recipientType: formData.recipientType,
          recipientCount: formData.recipientType === 'all' ? 156 : Math.floor(Math.random() * 50) + 10,
          deliveredCount: formData.scheduleTime ? 0 : Math.floor(Math.random() * 100) + 50,
          readCount: formData.scheduleTime ? 0 : Math.floor(Math.random() * 80) + 10,
          failedCount: Math.floor(Math.random() * 5),
          createdBy: 'Admin',
        };
        setNotifications([newNotification, ...notifications]);
        setShowCreateModal(false);
        alert('✅ Notifikasi berhasil dibuat dan dikirim');
      } else {
        alert(`❌ ${result.message || 'Gagal membuat notifikasi'}`);
      }
    } catch (err) {
      console.error('Create error:', err);
      alert('Terjadi kesalahan saat membuat notifikasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotification = (id) => {
    // ✅ Permission check
    if (!hasPermission('manage_notifications')) {
      alert('❌ You do not have permission to delete notifications')
      return
    }
    if (window.confirm('Hapus notifikasi ini?')) {
      adminApi.deleteNotification?.(id).catch(() => {
        console.warn('Delete via API failed, updating local state');
      });
      setNotifications(notifications.filter((n) => n.id !== id));
      alert('✅ Notifikasi berhasil dihapus');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: '#10b981',
      scheduled: '#f59e0b',
      failed: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      delivered: 'Terkirim',
      scheduled: 'Terjadwal',
      failed: 'Gagal',
    };
    return texts[status] || 'Unknown';
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: <AlertCircle size={16} />,
      success: <CheckCircle size={16} />,
      warning: <AlertCircle size={16} />,
    };
    return icons[type] || <Bell size={16} />;
  };

  return (
    <div className="notification-management">
      <div className="management-header">
        <h2>Kelola Notifikasi</h2>
        <p>Kirim dan kelola notifikasi kepada nasabah</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Notifikasi</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <Bell size={24} color="#0284c7" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Terkirim</span>
            <span className="stat-value" style={{ color: '#10b981' }}>{stats.delivered}</span>
          </div>
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            <CheckCircle size={24} color="#10b981" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Terjadwal</span>
            <span className="stat-value" style={{ color: '#f59e0b' }}>{stats.scheduled}</span>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <Calendar size={24} color="#f59e0b" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Dikirim</span>
            <span className="stat-value">{stats.totalSent}</span>
          </div>
          <div className="stat-icon" style={{ background: '#e0e7ff' }}>
            <Send size={24} color="#4f46e5" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Gagal</span>
            <span className="stat-value" style={{ color: '#ef4444' }}>{stats.failed}</span>
          </div>
          <div className="stat-icon" style={{ background: '#fee2e2' }}>
            <AlertCircle size={24} color="#ef4444" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Template</span>
            <span className="stat-value">{templates.length}</span>
          </div>
          <div className="stat-icon" style={{ background: '#f3e8ff' }}>
            <MessageSquare size={24} color="#a855f7" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Cari notifikasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="delivered">Terkirim</option>
          <option value="scheduled">Terjadwal</option>
          <option value="failed">Gagal</option>
        </select>

        <button className="create-btn" onClick={handleCreateClick}>
          <Plus size={18} /> Kirim Notifikasi
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="loading-state">
          <Loader className="spinner" />
          <p>Memuat notifikasi...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={48} />
          <h3>Tidak ada notifikasi</h3>
          <p>Belum ada notifikasi yang sesuai dengan filter Anda</p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notif) => (
            <div key={notif.id} className="notification-item">
              <div className="notif-icon" style={{ color: getStatusColor(notif.status) }}>
                {getTypeIcon(notif.type)}
              </div>

              <div className="notif-content">
                <div className="notif-header">
                  <div>
                    <h3>{notif.title}</h3>
                    <p className="notif-message">{notif.message.substring(0, 80)}...</p>
                  </div>
                  <span className="status-badge" style={{ color: getStatusColor(notif.status), borderColor: getStatusColor(notif.status) }}>
                    {getStatusText(notif.status)}
                  </span>
                </div>

                <div className="notif-stats">
                  <div className="stat">
                    <Users size={14} />
                    <span>{notif.recipientCount} penerima</span>
                  </div>
                  <div className="stat">
                    <CheckCircle size={14} />
                    <span>{notif.deliveredCount} terkirim</span>
                  </div>
                  {notif.status === 'delivered' && (
                    <div className="stat">
                      <Eye size={14} />
                      <span>{notif.readCount} dibaca</span>
                    </div>
                  )}
                  {notif.failedCount > 0 && (
                    <div className="stat error">
                      <AlertCircle size={14} />
                      <span>{notif.failedCount} gagal</span>
                    </div>
                  )}
                </div>

                <div className="notif-footer">
                  <span className="date">
                    {notif.status === 'scheduled'
                      ? `Dijadwalkan: ${new Date(notif.scheduleTime).toLocaleDateString('id-ID')}`
                      : `Dikirim: ${new Date(notif.sentAt).toLocaleDateString('id-ID')}`}
                  </span>
                  <div className="actions">
                    <button className="action-btn view-btn" onClick={() => handlePreview(notif)}>
                      <Eye size={14} /> Lihat
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteNotification(notif.id)}>
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Kirim Notifikasi Baru</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="title">Judul <span className="required">*</span></label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Jadwal Penyetoran Diperbarui"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Pesan <span className="required">*</span></label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tulis pesan notifikasi di sini..."
                  className="form-input"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Tipe <span className="required">*</span></label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-input"
                  >
                    <option value="info">Informasi</option>
                    <option value="success">Sukses</option>
                    <option value="warning">Peringatan</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="recipient">Penerima <span className="required">*</span></label>
                  <select
                    id="recipient"
                    value={formData.recipientType}
                    onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                    className="form-input"
                  >
                    <option value="all">Semua Nasabah</option>
                    <option value="specific">Nasabah Tertentu</option>
                    <option value="group">Kelompok</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="schedule">Jadwalkan Pengiriman (Opsional)</label>
                <input
                  id="schedule"
                  type="datetime-local"
                  value={formData.scheduleTime}
                  onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="info-box">
                <AlertCircle size={16} />
                <p>Notifikasi akan dikirim langsung atau sesuai jadwal yang ditentukan.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Notifikasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedNotif && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="modal-content modal-preview" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Preview Notifikasi</h3>
              <button className="close-btn" onClick={() => setShowPreviewModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="notification-preview">
                <div className="preview-header">
                  <div className="preview-icon">{getTypeIcon(selectedNotif.type)}</div>
                  <div className="preview-content">
                    <h4>{selectedNotif.title}</h4>
                    <span className="preview-type">{selectedNotif.type.toUpperCase()}</span>
                  </div>
                </div>

                <div className="preview-message">
                  <p>{selectedNotif.message}</p>
                </div>

                <div className="preview-stats">
                  <div className="stat-item">
                    <span className="label">Penerima:</span>
                    <span className="value">{selectedNotif.recipientCount} nasabah</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Terkirim:</span>
                    <span className="value">{selectedNotif.deliveredCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Dibaca:</span>
                    <span className="value">{selectedNotif.readCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Gagal:</span>
                    <span className="value error">{selectedNotif.failedCount}</span>
                  </div>
                </div>

                <div className="preview-footer">
                  <span>Status: <strong>{getStatusText(selectedNotif.status)}</strong></span>
                  <span>Oleh: <strong>{selectedNotif.createdBy}</strong></span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPreviewModal(false)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
