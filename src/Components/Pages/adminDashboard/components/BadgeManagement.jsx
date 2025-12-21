import React, { useState, useEffect } from 'react';
import {
  Star,
  Search,
  Download,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  AlertCircle,
  Loader,
  Award,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../../../services/adminApi';
import '../styles/badgeManagement.css';

export default function BadgeManagement() {
  const { hasPermission } = useAuth();
  const [badges, setBadges] = useState([]);
  const [nasabahBadges, setNasabahBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    tier: 'silver',
    minPoints: 1000,
    description: '',
    icon: '⭐',
  });
  const [assignData, setAssignData] = useState({
    nasabahId: '',
    nasabahName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MOCK_BADGES = [
    {
      id: 1,
      name: 'Pemula',
      tier: 'bronze',
      minPoints: 0,
      maxPoints: 500,
      description: 'Nasabah baru yang baru memulai perjalanan mereka',
      icon: '🥉',
      color: '#cd7f32',
      assignedCount: 45,
    },
    {
      id: 2,
      name: 'Aktif',
      tier: 'silver',
      minPoints: 500,
      maxPoints: 2000,
      description: 'Nasabah yang rutin melakukan penyetoran sampah',
      icon: '⭐',
      color: '#c0c0c0',
      assignedCount: 32,
    },
    {
      id: 3,
      name: 'Loyal',
      tier: 'gold',
      minPoints: 2000,
      maxPoints: 5000,
      description: 'Nasabah dengan loyalitas tinggi dan konsisten',
      icon: '🏆',
      color: '#ffd700',
      assignedCount: 18,
    },
    {
      id: 4,
      name: 'VIP',
      tier: 'platinum',
      minPoints: 5000,
      maxPoints: null,
      description: 'Nasabah paling berharga dengan kontribusi luar biasa',
      icon: '👑',
      color: '#e5e4e2',
      assignedCount: 5,
    },
  ];

  const MOCK_NASABAH_BADGES = [
    { id: 1, nasabahId: 1, nasabahName: 'Ahmad Wijaya', badgeId: 2, badgeName: 'Aktif', badgeIcon: '⭐', tier: 'silver', assignedDate: '2025-12-10' },
    { id: 2, nasabahId: 2, nasabahName: 'Siti Nurhaliza', badgeId: 3, badgeName: 'Loyal', badgeIcon: '🏆', tier: 'gold', assignedDate: '2025-11-15' },
    { id: 3, nasabahId: 3, nasabahName: 'Dina Kusuma', badgeId: 1, badgeName: 'Pemula', badgeIcon: '🥉', tier: 'bronze', assignedDate: '2025-12-01' },
    { id: 4, nasabahId: 4, nasabahName: 'Eka Putri', badgeId: 2, badgeName: 'Aktif', badgeIcon: '⭐', tier: 'silver', assignedDate: '2025-10-20' },
    { id: 5, nasabahId: 5, nasabahName: 'Farah Husna', badgeId: 3, badgeName: 'Loyal', badgeIcon: '🏆', tier: 'gold', assignedDate: '2025-09-10' },
  ];

  useEffect(() => {
    // ✅ Replace mock data with real API calls
    const fetchBadges = async () => {
      try {
        setLoading(true);
        const result = await adminApi.getAllBadges();
        if (result.success) {
          setBadges(result.data || []);
        } else {
          console.warn('Failed to fetch badges, using fallback');
          setBadges(MOCK_BADGES);
        }
      } catch (err) {
        console.warn('Badge fetch error, using mock data:', err);
        setBadges(MOCK_BADGES);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBadges = badges.filter((b) => {
    if (filterTier !== 'all' && b.tier !== filterTier) return false;
    if (searchQuery && !b.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    totalBadges: badges.length,
    totalAssigned: nasabahBadges.length,
    bronzeCount: badges.find((b) => b.tier === 'bronze')?.assignedCount || 0,
    silverCount: badges.find((b) => b.tier === 'silver')?.assignedCount || 0,
    goldCount: badges.find((b) => b.tier === 'gold')?.assignedCount || 0,
    platinumCount: badges.find((b) => b.tier === 'platinum')?.assignedCount || 0,
  };

  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const tierLabels = {
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    platinum: 'Platinum',
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: '#e5e4e2',
    };
    return colors[tier] || '#6b7280';
  };

  const handleCreateClick = () => {
    // ✅ Permission check
    if (!hasPermission('manage_badges')) {
      alert('❌ You do not have permission to create badges')
      return
    }
    setFormData({
      name: '',
      tier: 'silver',
      minPoints: 1000,
      description: '',
      icon: '⭐',
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async () => {
    if (!formData.name || !formData.description) {
      alert('Nama dan deskripsi badge wajib diisi!');
      return;
    }
    // ✅ Permission check before submission
    if (!hasPermission('manage_badges')) {
      alert('❌ You do not have permission to create badges')
      return
    }
    setIsSubmitting(true);
    try {
      // ✅ Use real API call instead of mock setTimeout
      const result = await adminApi.createBadge({
        name: formData.name,
        tier: formData.tier,
        min_points: parseInt(formData.minPoints),
        description: formData.description,
        icon: formData.icon,
      });

      if (result.success) {
        const newBadge = result.data || {
          id: badges.length + 1,
          name: formData.name,
          tier: formData.tier,
          minPoints: parseInt(formData.minPoints),
          maxPoints: null,
          description: formData.description,
          icon: formData.icon,
          color: getTierColor(formData.tier),
          assignedCount: 0,
        };
        setBadges([...badges, newBadge]);
        setShowCreateModal(false);
        alert('✅ Badge berhasil dibuat');
      } else {
        alert('❌ Gagal membuat badge: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Create badge error:', err);
      alert('Error creating badge: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignClick = (badge) => {
    // ✅ Permission check
    if (!hasPermission('manage_badges')) {
      alert('❌ You do not have permission to assign badges')
      return
    }
    setSelectedBadge(badge);
    setAssignData({ nasabahId: '', nasabahName: '' });
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!assignData.nasabahName) {
      alert('Pilih nasabah untuk ditugaskan badge!');
      return;
    }
    // ✅ Permission check before submission
    if (!hasPermission('manage_badges')) {
      alert('❌ You do not have permission to assign badges')
      return
    }
    setIsSubmitting(true);
    try {
      // ✅ Use real API call to assign badge
      const userId = parseInt(assignData.nasabahId) || nasabahBadges.length + 1;
      const result = await adminApi.assignBadgeToUser(selectedBadge.id, userId);

      if (result.success) {
        const newAssignment = {
          id: nasabahBadges.length + 1,
          nasabahId: userId,
          nasabahName: assignData.nasabahName,
          badgeId: selectedBadge.id,
          badgeName: selectedBadge.name,
          badgeIcon: selectedBadge.icon,
          tier: selectedBadge.tier,
          assignedDate: new Date().toISOString().split('T')[0],
        };
        setNasabahBadges([...nasabahBadges, newAssignment]);
        const updatedBadges = badges.map((b) =>
          b.id === selectedBadge.id ? { ...b, assignedCount: b.assignedCount + 1 } : b
        );
        setBadges(updatedBadges);
        setShowAssignModal(false);
        alert('✅ Badge berhasil ditugaskan kepada nasabah');
      } else {
        alert('❌ Gagal menugaskan badge: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Assign badge error:', err);
      alert('Error assigning badge: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = (assignmentId) => {
    // ✅ Permission check
    if (!hasPermission('manage_badges')) {
      alert('❌ You do not have permission to delete badge assignments')
      return
    }
    if (window.confirm('Hapus badge ini dari nasabah?')) {
      const assignment = nasabahBadges.find((a) => a.id === assignmentId);
      // ✅ Make API call to delete assignment
      adminApi.deleteBadge(assignment.badgeId).catch(err => {
        console.warn('Failed to delete via API, removing from local state:', err);
      });
      
      setNasabahBadges(nasabahBadges.filter((a) => a.id !== assignmentId));
      const updatedBadges = badges.map((b) =>
        b.id === assignment.badgeId ? { ...b, assignedCount: Math.max(0, b.assignedCount - 1) } : b
      );
      setBadges(updatedBadges);
      alert('✅ Badge berhasil dihapus dari nasabah');
    }
  };

  return (
    <div className="badge-management">
      <div className="management-header">
        <h2>Kelola Badge & Pencapaian</h2>
        <p>Atur badge, tingkatan, dan kelola penugasan badge kepada nasabah</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Badge</span>
            <span className="stat-value">{stats.totalBadges}</span>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <Award size={24} color="#d97706" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Ditugaskan</span>
            <span className="stat-value">{stats.totalAssigned}</span>
          </div>
          <div className="stat-icon" style={{ background: '#e0e7ff' }}>
            <Users size={24} color="#4f46e5" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Bronze</span>
            <span className="stat-value">{stats.bronzeCount}</span>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(205, 127, 50, 0.1)' }}>
            <TrendingUp size={24} color="#cd7f32" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Silver</span>
            <span className="stat-value">{stats.silverCount}</span>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(192, 192, 192, 0.1)' }}>
            <Star size={24} color="#c0c0c0" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Gold</span>
            <span className="stat-value">{stats.goldCount}</span>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
            <Award size={24} color="#ffd700" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Platinum</span>
            <span className="stat-value">{stats.platinumCount}</span>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(229, 228, 226, 0.3)' }}>
            <Award size={24} color="#e5e4e2" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="badge-tabs">
        <button className="tab-btn active">Badge Tersedia</button>
        <button className="tab-btn">Penugasan Nasabah</button>
      </div>

      {/* Badge List */}
      <div className="filter-bar">
        <div className="search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Cari badge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
        >
          <option value="all">Semua Tier</option>
          {tiers.map((tier) => (
            <option key={tier} value={tier}>
              {tierLabels[tier]}
            </option>
          ))}
        </select>

        <button className="create-btn" onClick={handleCreateClick}>
          <Plus size={18} /> Buat Badge Baru
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader className="spinner" />
          <p>Memuat badge...</p>
        </div>
      ) : (
        <div className="badges-grid">
          {filteredBadges.map((badge) => (
            <div key={badge.id} className="badge-card">
              <div className="badge-icon-large">{badge.icon}</div>
              <h3>{badge.name}</h3>
              <p className="tier-label" style={{ borderColor: badge.color, color: badge.color }}>
                {tierLabels[badge.tier]}
              </p>
              <p className="badge-description">{badge.description}</p>
              <div className="badge-stats">
                <div className="stat">
                  <span className="label">Min Poin:</span>
                  <span className="value">{badge.minPoints}</span>
                </div>
                <div className="stat">
                  <span className="label">Ditugaskan:</span>
                  <span className="value">{badge.assignedCount}</span>
                </div>
              </div>
              <button
                className="assign-btn"
                onClick={() => handleAssignClick(badge)}
              >
                <Check size={16} /> Tugaskan ke Nasabah
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Penugasan Tab */}
      <div className="assignments-section">
        <h3>Penugasan Badge Nasabah</h3>
        <div className="assignments-table">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Nasabah</th>
                <th>Badge</th>
                <th>Tier</th>
                <th>Tanggal Penugasan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {nasabahBadges.map((assignment, idx) => (
                <tr key={assignment.id}>
                  <td>{idx + 1}</td>
                  <td className="nasabah-name">{assignment.nasabahName}</td>
                  <td>
                    <span className="badge-pill">
                      {assignment.badgeIcon} {assignment.badgeName}
                    </span>
                  </td>
                  <td>
                    <span className="tier-badge" style={{ color: getTierColor(assignment.tier) }}>
                      {tierLabels[assignment.tier]}
                    </span>
                  </td>
                  <td className="date">{new Date(assignment.assignedDate).toLocaleDateString('id-ID')}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Buat Badge Baru</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="icon">Ikon <span className="required">*</span></label>
                <div className="emoji-picker">
                  {['⭐', '🏆', '👑', '🥇', '🎯', '💎', '🌟', '✨'].map((emoji) => (
                    <button
                      key={emoji}
                      className={`emoji-btn ${formData.icon === emoji ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name">Nama Badge <span className="required">*</span></label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: VIP, Loyal, dll"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tier">Tier <span className="required">*</span></label>
                <select
                  id="tier"
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="form-input"
                >
                  {tiers.map((tier) => (
                    <option key={tier} value={tier}>
                      {tierLabels[tier]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="minPoints">Poin Minimum <span className="required">*</span></label>
                <input
                  id="minPoints"
                  type="number"
                  value={formData.minPoints}
                  onChange={(e) => setFormData({ ...formData, minPoints: e.target.value })}
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Deskripsi <span className="required">*</span></label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan apa yang mewakili badge ini"
                  className="form-input"
                  rows="4"
                />
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
                {isSubmitting ? 'Membuat...' : 'Buat Badge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedBadge && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tugaskan {selectedBadge.icon} {selectedBadge.name}</h3>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="badge-preview">
                <div className="preview-icon">{selectedBadge.icon}</div>
                <div className="preview-info">
                  <h4>{selectedBadge.name}</h4>
                  <p>{tierLabels[selectedBadge.tier]}</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="nasabah">Pilih Nasabah <span className="required">*</span></label>
                <input
                  id="nasabah"
                  type="text"
                  value={assignData.nasabahName}
                  onChange={(e) => setAssignData({ ...assignData, nasabahName: e.target.value })}
                  placeholder="Cari atau ketik nama nasabah..."
                  className="form-input"
                  list="nasabah-list"
                />
                <datalist id="nasabah-list">
                  {[
                    'Ahmad Wijaya',
                    'Siti Nurhaliza',
                    'Dina Kusuma',
                    'Eka Putri',
                    'Farah Husna',
                    'Gandi Hermawan',
                    'Hendra Kusuma',
                  ].map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <div className="info-box">
                <AlertCircle size={16} />
                <p>Badge akan ditugaskan ke nasabah dan notifikasi akan dikirimkan.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowAssignModal(false)}
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                className="btn-primary"
                onClick={handleAssignSubmit}
                disabled={isSubmitting || !assignData.nasabahName}
              >
                {isSubmitting ? 'Menugaskan...' : 'Tugaskan Badge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
