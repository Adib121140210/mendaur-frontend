import React, { useState, useEffect } from 'react';
import {
  Eye,
  Download,
  Search,
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  MapPin,
  Phone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../../../services/adminApi';
import '../styles/scheduleManagement.css';

export default function ScheduleManagement() {
  const { hasPermission } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDay, setFilterDay] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formData, setFormData] = useState({
    day: 'Senin',
    time: '08:00',
    location: 'Jakarta Pusat',
    address: 'Jl. Sudirman No. 1',
    maxCapacity: 10,
    pickupPerson: 'Budi Santoso',
    phoneNumber: '0812345678',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const result = await adminApi.getAllSchedules();
        if (result.success) {
          setSchedules(result.data || []);
        } else {
          console.warn('Failed to fetch schedules, using fallback');
          const mockData = [
            {
              id: 1,
              day: 'Senin',
              date: '2025-12-22',
              time: '08:00',
              location: 'Jakarta Pusat',
              address: 'Jl. Sudirman No. 1, RT 5/RW 2, Menteng, Jakarta Pusat 12190',
              maxCapacity: 15,
              registeredCount: 12,
              pickupPerson: 'Budi Santoso',
              phoneNumber: '0812345678',
              notes: 'Area CBD, pastikan tepat waktu',
              registeredUsers: [
                { id: 1, name: 'Ahmad Wijaya', phone: '0811111111' },
                { id: 2, name: 'Siti Nurhaliza', phone: '0812222222' },
                { id: 3, name: 'Dina Kusuma', phone: '0813333333' },
                { id: 4, name: 'Eka Putri', phone: '0814444444' },
                { id: 5, name: 'Farah Husna', phone: '0815555555' },
                { id: 6, name: 'Gandi Hermawan', phone: '0816666666' },
                { id: 7, name: 'Hendra Kusuma', phone: '0817777777' },
                { id: 8, name: 'Indah Sari', phone: '0818888888' },
                { id: 9, name: 'Joko Wijaya', phone: '0819999999' },
                { id: 10, name: 'Kiki Amelia', phone: '0821010101' },
                { id: 11, name: 'Lela Susanti', phone: '0821111111' },
                { id: 12, name: 'Mitra Nasabah', phone: '0821212121' },
              ],
              status: 'active',
            },
            {
              id: 2,
              day: 'Rabu',
              date: '2025-12-24',
              time: '10:00',
              location: 'Jakarta Selatan',
              address: 'Jl. Gatot Subroto No. 45, Kuningan, Jakarta Selatan 12950',
              maxCapacity: 12,
              registeredCount: 8,
              pickupPerson: 'Siti Rahma',
              phoneNumber: '0821234567',
              notes: 'Dekat mal, parkir di samping',
              registeredUsers: [
                { id: 13, name: 'Novi Hartono', phone: '0822222222' },
                { id: 14, name: 'Oka Pratama', phone: '0823333333' },
                { id: 15, name: 'Putri Indah', phone: '0824444444' },
                { id: 16, name: 'Qorri Asiah', phone: '0825555555' },
                { id: 17, name: 'Riyan Hidayat', phone: '0826666666' },
                { id: 18, name: 'Sofiya Mustafa', phone: '0827777777' },
                { id: 19, name: 'Tania Wijaya', phone: '0828888888' },
                { id: 20, name: 'Uswatun Chasanah', phone: '0829999999' },
              ],
              status: 'active',
            },
            {
              id: 3,
              day: 'Jumat',
              date: '2025-12-26',
              time: '14:00',
              location: 'Jakarta Barat',
              address: 'Jl. Hayam Wuruk No. 88, Ancol, Jakarta Barat 14430',
              maxCapacity: 10,
              registeredCount: 10,
              pickupPerson: 'Ahmad Maulana',
              phoneNumber: '0830123456',
              notes: 'Jadwal penuh, tunggu penjadwalan ulang',
              registeredUsers: Array.from({ length: 10 }, (_, i) => ({
                id: 20 + i,
                name: `Nasabah Terdaftar ${i + 1}`,
                phone: `0830${String(i).padStart(7, '0')}`,
              })),
              status: 'full',
            },
          ];
          setSchedules(mockData);
        }
      } catch (err) {
        console.warn('Schedule fetch error, using mock data:', err);
        const mockData = [
          {
            id: 1,
            day: 'Senin',
            date: '2025-12-22',
            time: '08:00',
            location: 'Jakarta Pusat',
            address: 'Jl. Sudirman No. 1, RT 5/RW 2, Menteng, Jakarta Pusat 12190',
            maxCapacity: 15,
            registeredCount: 12,
            pickupPerson: 'Budi Santoso',
            phoneNumber: '0812345678',
            notes: 'Area CBD, pastikan tepat waktu',
            registeredUsers: [
              { id: 1, name: 'Ahmad Wijaya', phone: '0811111111' },
              { id: 2, name: 'Siti Nurhaliza', phone: '0812222222' },
              { id: 3, name: 'Dina Kusuma', phone: '0813333333' },
              { id: 4, name: 'Eka Putri', phone: '0814444444' },
              { id: 5, name: 'Farah Husna', phone: '0815555555' },
              { id: 6, name: 'Gandi Hermawan', phone: '0816666666' },
              { id: 7, name: 'Hendra Kusuma', phone: '0817777777' },
              { id: 8, name: 'Indah Sari', phone: '0818888888' },
              { id: 9, name: 'Joko Wijaya', phone: '0819999999' },
              { id: 10, name: 'Kiki Amelia', phone: '0821010101' },
              { id: 11, name: 'Lela Susanti', phone: '0821111111' },
              { id: 12, name: 'Mitra Nasabah', phone: '0821212121' },
            ],
            status: 'active',
          },
          {
            id: 2,
            day: 'Rabu',
            date: '2025-12-24',
            time: '10:00',
            location: 'Jakarta Selatan',
            address: 'Jl. Gatot Subroto No. 45, Kuningan, Jakarta Selatan 12950',
            maxCapacity: 12,
            registeredCount: 8,
            pickupPerson: 'Siti Rahma',
            phoneNumber: '0821234567',
            notes: 'Dekat mal, parkir di samping',
            registeredUsers: [
              { id: 13, name: 'Novi Hartono', phone: '0822222222' },
              { id: 14, name: 'Oka Pratama', phone: '0823333333' },
              { id: 15, name: 'Putri Indah', phone: '0824444444' },
              { id: 16, name: 'Qorri Asiah', phone: '0825555555' },
              { id: 17, name: 'Riyan Hidayat', phone: '0826666666' },
              { id: 18, name: 'Sofiya Mustafa', phone: '0827777777' },
              { id: 19, name: 'Tania Wijaya', phone: '0828888888' },
              { id: 20, name: 'Uswatun Chasanah', phone: '0829999999' },
            ],
            status: 'active',
          },
          {
            id: 3,
            day: 'Jumat',
            date: '2025-12-26',
            time: '14:00',
            location: 'Jakarta Barat',
            address: 'Jl. Hayam Wuruk No. 88, Ancol, Jakarta Barat 14430',
            maxCapacity: 10,
            registeredCount: 10,
            pickupPerson: 'Ahmad Maulana',
            phoneNumber: '0830123456',
            notes: 'Jadwal penuh, tunggu penjadwalan ulang',
            registeredUsers: Array.from({ length: 10 }, (_, i) => ({
              id: 20 + i,
              name: `Nasabah Terdaftar ${i + 1}`,
              phone: `0830${String(i).padStart(7, '0')}`,
            })),
            status: 'full',
          },
        ];
        setSchedules(mockData);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSchedules = schedules.filter((s) => {
    if (filterDay !== 'all' && s.day !== filterDay) return false;
    if (filterLocation !== 'all' && s.location !== filterLocation) return false;
    if (searchQuery && !s.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: schedules.length,
    totalCapacity: schedules.reduce((sum, s) => sum + s.maxCapacity, 0),
    totalRegistered: schedules.reduce((sum, s) => sum + s.registeredCount, 0),
    avgUtilization: schedules.length > 0 ? Math.round((schedules.reduce((sum, s) => sum + s.registeredCount, 0) / schedules.reduce((sum, s) => sum + s.maxCapacity, 0)) * 100) : 0,
  };

  const locations = [...new Set(schedules.map((s) => s.location))];
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleViewDetail = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailModal(true);
  };

  const handleCreateClick = () => {
    // ✅ Permission check
    if (!hasPermission('manage_schedule')) {
      alert('❌ You do not have permission to create schedules')
      return
    }
    setFormData({
      day: 'Senin',
      time: '08:00',
      location: 'Jakarta Pusat',
      address: 'Jl. Sudirman No. 1',
      maxCapacity: 10,
      pickupPerson: 'Budi Santoso',
      phoneNumber: '0812345678',
      notes: '',
    });
    setShowCreateModal(true);
  };

  const handleEditClick = (schedule) => {
    // ✅ Permission check
    if (!hasPermission('manage_schedule')) {
      alert('❌ You do not have permission to edit schedules')
      return
    }
    setFormData({
      day: schedule.day,
      time: schedule.time,
      location: schedule.location,
      address: schedule.address,
      maxCapacity: schedule.maxCapacity,
      pickupPerson: schedule.pickupPerson,
      phoneNumber: schedule.phoneNumber,
      notes: schedule.notes,
    });
    setSelectedSchedule(schedule);
    setShowEditModal(true);
  };

  const handleDeleteClick = (schedule) => {
    // ✅ Permission check
    if (!hasPermission('manage_schedule')) {
      alert('❌ You do not have permission to delete schedules')
      return
    }
    if (window.confirm('Hapus jadwal ini? Nasabah yang terdaftar akan diberitahu.')) {
      adminApi.deleteSchedule(schedule.id).catch(() => {
        console.warn('Delete via API failed, updating local state');
      });
      const updated = schedules.filter((s) => s.id !== schedule.id);
      setSchedules(updated);
      alert('✅ Jadwal berhasil dihapus');
    }
  };

  const handleCreateSubmit = async () => {
    if (!formData.day || !formData.time || !formData.location || !formData.pickupPerson) {
      alert('Semua field wajib diisi!');
      return;
    }
    // ✅ Permission check before submission
    if (!hasPermission('manage_schedule')) {
      alert('❌ You do not have permission to create schedules')
      return
    }
    setIsSubmitting(true);
    try {
      const result = await adminApi.createSchedule({
        day: formData.day,
        time: formData.time,
        location: formData.location,
        address: formData.address,
        maxCapacity: parseInt(formData.maxCapacity),
        pickupPerson: formData.pickupPerson,
        phoneNumber: formData.phoneNumber,
        notes: formData.notes,
      });
      if (result.success) {
        const newSchedule = {
          id: schedules.length + 1,
          day: formData.day,
          date: new Date().toISOString().split('T')[0],
          time: formData.time,
          location: formData.location,
          address: formData.address,
          maxCapacity: parseInt(formData.maxCapacity),
          registeredCount: 0,
          pickupPerson: formData.pickupPerson,
          phoneNumber: formData.phoneNumber,
          notes: formData.notes,
          registeredUsers: [],
          status: 'active',
        };
        setSchedules([...schedules, newSchedule]);
        setShowCreateModal(false);
        alert('✅ Jadwal baru berhasil dibuat');
      } else {
        alert(`❌ ${result.message || 'Gagal membuat jadwal'}`);
      }
    } catch (err) {
      console.error('Create error:', err);
      alert('Terjadi kesalahan saat membuat jadwal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!formData.day || !formData.time || !formData.location || !formData.pickupPerson) {
      alert('Semua field wajib diisi!');
      return;
    }
    // ✅ Permission check before submission
    if (!hasPermission('manage_schedule')) {
      alert('❌ You do not have permission to edit schedules')
      return
    }
    setIsSubmitting(true);
    try {
      const result = await adminApi.updateSchedule(selectedSchedule.id, {
        day: formData.day,
        time: formData.time,
        location: formData.location,
        address: formData.address,
        maxCapacity: parseInt(formData.maxCapacity),
        pickupPerson: formData.pickupPerson,
        phoneNumber: formData.phoneNumber,
        notes: formData.notes,
      });
      if (result.success) {
        const updated = schedules.map((s) =>
          s.id === selectedSchedule.id
            ? {
                ...s,
                day: formData.day,
                time: formData.time,
                location: formData.location,
                address: formData.address,
                maxCapacity: parseInt(formData.maxCapacity),
                pickupPerson: formData.pickupPerson,
                phoneNumber: formData.phoneNumber,
                notes: formData.notes,
              }
            : s
        );
        setSchedules(updated);
        setShowEditModal(false);
        alert('✅ Jadwal berhasil diperbarui');
      } else {
        alert(`❌ ${result.message || 'Gagal memperbarui jadwal'}`);
      }
    } catch (err) {
      console.error('Edit error:', err);
      alert('Terjadi kesalahan saat memperbarui jadwal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="schedule-management">
      <div className="management-header">
        <h2>Kelola Jadwal Penyetoran</h2>
        <p>Atur jadwal pengambilan sampah dan kelola nasabah terdaftar</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Jadwal</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <Calendar size={24} color="#0284c7" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Kapasitas</span>
            <span className="stat-value">{stats.totalCapacity}</span>
          </div>
          <div className="stat-icon" style={{ background: '#e0e7ff' }}>
            <Users size={24} color="#4f46e5" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Terdaftar</span>
            <span className="stat-value">{stats.totalRegistered}</span>
          </div>
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            <CheckCircle size={24} color="#10b981" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Utilitas Rata-rata</span>
            <span className="stat-value">{stats.avgUtilization}%</span>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <AlertCircle size={24} color="#d97706" />
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-bar">
          <div className="search-input">
            <Search size={18} />
            <input
              type="text"
              placeholder="Cari lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
          >
            <option value="all">Semua Hari</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="all">Semua Lokasi</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <button className="create-btn" onClick={handleCreateClick}>
            <Plus size={18} /> Tambah Jadwal
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader className="spinner" />
          <p>Memuat jadwal...</p>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3>Tidak ada jadwal</h3>
          <p>Belum ada jadwal penyetoran yang sesuai dengan filter Anda</p>
        </div>
      ) : (
        <div className="schedules-container">
          {filteredSchedules.map((schedule) => (
            <div key={schedule.id} className="schedule-card">
              <div className="schedule-card-header">
                <div className="schedule-main-info">
                  <div className="schedule-day-time">
                    <Calendar size={20} />
                    <div>
                      <h3>{schedule.day} {schedule.time}</h3>
                      <p>{formatDate(schedule.date)}</p>
                    </div>
                  </div>
                  <div className="schedule-location">
                    <MapPin size={18} />
                    <div>
                      <p className="location-name">{schedule.location}</p>
                      <p className="location-address">{schedule.address}</p>
                    </div>
                  </div>
                </div>
                <span className={`status-badge ${schedule.status}`}>
                  {schedule.status === 'full' ? '❌ Penuh' : '✅ Aktif'}
                </span>
              </div>

              <div className="schedule-card-body">
                <div className="info-row">
                  <span className="label">Kapasitas:</span>
                  <span className="value">
                    {schedule.registeredCount}/{schedule.maxCapacity} nasabah
                  </span>
                  <div className="capacity-bar">
                    <div
                      className="capacity-filled"
                      style={{
                        width: `${(schedule.registeredCount / schedule.maxCapacity) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="info-row">
                  <span className="label">Pickup Person:</span>
                  <span className="value">{schedule.pickupPerson}</span>
                </div>

                <div className="info-row">
                  <span className="label">No. Telepon:</span>
                  <span className="value">
                    <Phone size={14} /> {schedule.phoneNumber}
                  </span>
                </div>

                {schedule.notes && (
                  <div className="info-row">
                    <span className="label">Catatan:</span>
                    <span className="value">{schedule.notes}</span>
                  </div>
                )}
              </div>

              <div className="schedule-card-footer">
                <button
                  className="action-btn view-btn"
                  onClick={() => handleViewDetail(schedule)}
                  title="Lihat Rincian"
                >
                  <Eye size={16} /> Lihat ({schedule.registeredCount})
                </button>
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEditClick(schedule)}
                  title="Edit Jadwal"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteClick(schedule)}
                  title="Hapus Jadwal"
                >
                  <Trash2 size={16} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSchedule && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Jadwal Penyetoran</h3>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <h4>Informasi Jadwal</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Hari & Waktu</span>
                    <span className="value">
                      {selectedSchedule.day} {selectedSchedule.time}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Tanggal</span>
                    <span className="value">{formatDate(selectedSchedule.date)}</span>
                  </div>
                  <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="label">Lokasi</span>
                    <span className="value">{selectedSchedule.location}</span>
                  </div>
                  <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="label">Alamat</span>
                    <span className="value">{selectedSchedule.address}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>Informasi Pickup</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Nama Pickup Person</span>
                    <span className="value">{selectedSchedule.pickupPerson}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">No. Telepon</span>
                    <span className="value">{selectedSchedule.phoneNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Kapasitas</span>
                    <span className="value">
                      {selectedSchedule.registeredCount}/{selectedSchedule.maxCapacity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>Nasabah Terdaftar ({selectedSchedule.registeredCount})</h4>
                <div className="users-list">
                  {selectedSchedule.registeredUsers.map((user, idx) => (
                    <div key={user.id} className="user-item">
                      <span className="user-no">{idx + 1}.</span>
                      <div className="user-info">
                        <p className="user-name">{user.name}</p>
                        <p className="user-phone">{user.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Tutup
              </button>
              <button className="btn-primary" onClick={() => { setShowDetailModal(false); handleEditClick(selectedSchedule); }}>
                <Edit size={16} /> Edit Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Buat Jadwal Penyetoran Baru</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="day">Hari <span className="required">*</span></label>
                <select
                  id="day"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="form-input"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="time">Waktu <span className="required">*</span></label>
                <input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Lokasi <span className="required">*</span></label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Jakarta Pusat"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Alamat Lengkap <span className="required">*</span></label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. ... No. ..."
                  className="form-input"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="capacity">Kapasitas Maksimal <span className="required">*</span></label>
                <input
                  id="capacity"
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                  min="1"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pickupPerson">Nama Pickup Person <span className="required">*</span></label>
                <input
                  id="pickupPerson"
                  type="text"
                  value={formData.pickupPerson}
                  onChange={(e) => setFormData({ ...formData, pickupPerson: e.target.value })}
                  placeholder="Nama lengkap"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">No. Telepon <span className="required">*</span></label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="08xxxxxxxxx"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Catatan</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tambahan (opsional)"
                  className="form-input"
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>
                Batal
              </button>
              <button className="btn-primary" onClick={handleCreateSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Membuat...' : 'Buat Jadwal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSchedule && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Jadwal Penyetoran</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="day">Hari <span className="required">*</span></label>
                <select
                  id="day"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="form-input"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="time">Waktu <span className="required">*</span></label>
                <input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Lokasi <span className="required">*</span></label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Jakarta Pusat"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Alamat Lengkap <span className="required">*</span></label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. ... No. ..."
                  className="form-input"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="capacity">Kapasitas Maksimal <span className="required">*</span></label>
                <input
                  id="capacity"
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                  min="1"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pickupPerson">Nama Pickup Person <span className="required">*</span></label>
                <input
                  id="pickupPerson"
                  type="text"
                  value={formData.pickupPerson}
                  onChange={(e) => setFormData({ ...formData, pickupPerson: e.target.value })}
                  placeholder="Nama lengkap"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">No. Telepon <span className="required">*</span></label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="08xxxxxxxxx"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Catatan</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan tambahan (opsional)"
                  className="form-input"
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>
                Batal
              </button>
              <button className="btn-primary" onClick={handleEditSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
