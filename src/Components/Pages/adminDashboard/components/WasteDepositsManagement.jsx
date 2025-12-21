import React, { useState, useEffect } from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  Download,
  Search,
  Filter,
  Check,
  X,
  Loader,
  Calendar,
  User,
  Weight,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { adminApi } from '../../../../services/adminApi';
import { PermissionGuard } from '../../../PermissionGuard';
import { useAuth } from '../../context/AuthContext';
import '../styles/wasteDepositsManagement.css';

export default function WasteDepositsManagement() {
  // Auth hook for permission checking
  const { hasPermission } = useAuth();

  // States
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalWeight: 0,
    totalPoints: 0,
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [wasteTypeFilter, setWasteTypeFilter] = useState('all');

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [selectedDepositId, setSelectedDepositId] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    points: '',
    notes: '',
  });
  const [rejectionData, setRejectionData] = useState({
    reason: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load deposits on component mount and when filters change
  useEffect(() => {
    const loadData = async () => {
      await loadDeposits();
    };
    loadData();
  }, [statusFilter, searchQuery, wasteTypeFilter]);

  // Load statistics
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const filters = {};

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      if (wasteTypeFilter !== 'all') {
        filters.jenis_sampah = wasteTypeFilter;
      }

      if (searchQuery) {
        filters.search = searchQuery;
      }

      const result = await adminApi.listWasteDeposits(1, 10, filters);

      if (result.success) {
        // Handle both direct array and paginated response
        const data = Array.isArray(result.data) ? result.data : result.data?.data || [];
        setDeposits(data);
      }
    } catch (err) {
      console.error('Error loading deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const result = await adminApi.getWasteStats();

      if (result.success) {
        const statsData = result.data;
        setStats({
          total: statsData.total_deposits || 0,
          pending: statsData.pending_deposits || 0,
          approved: statsData.approved_deposits || 0,
          rejected: statsData.rejected_deposits || 0,
          totalWeight: statsData.total_weight || 0,
          totalPoints: statsData.total_points_awarded || 0,
        });
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  // Filter and search deposits locally
  const filteredDeposits = deposits.filter((deposit) => {
    // Status filter
    if (statusFilter !== 'all' && deposit.status !== statusFilter) {
      return false;
    }

    // Search filter (name, email, atau ID)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const userName = deposit.user?.name?.toLowerCase() || deposit.user_name?.toLowerCase() || '';
      const userEmail = deposit.user?.email?.toLowerCase() || deposit.user_email?.toLowerCase() || '';

      if (
        !userName.includes(query) &&
        !userEmail.includes(query) &&
        !deposit.id?.toString().includes(query)
      ) {
        return false;
      }
    }

    // Waste type filter
    if (wasteTypeFilter !== 'all' && deposit.jenis_sampah !== wasteTypeFilter) {
      return false;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const depositDate = new Date(deposit.created_at);
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (depositDate < fromDate) return false;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (depositDate > toDate) return false;
      }
    }

    return true;
  });

  // Helper functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'approved':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  // Action handlers
  const handleViewDetail = (deposit) => {
    setSelectedDeposit(deposit);
    setShowDetailModal(true);
  };

  const handleApproveClick = (deposit) => {
    // ✅ Permission check
    if (!hasPermission('approve_deposit')) {
      alert('❌ Anda tidak memiliki izin untuk menyetujui penyetoran');
      return;
    }

    setSelectedDeposit(deposit);
    setSelectedDepositId(deposit.id);
    setApprovalData({ points: deposit.poin_pending, notes: '' });
    setShowApprovalModal(true);
  };

  const handleRejectClick = (deposit) => {
    // ✅ Permission check
    if (!hasPermission('reject_deposit')) {
      alert('❌ Anda tidak memiliki izin untuk menolak penyetoran');
      return;
    }

    setSelectedDeposit(deposit);
    setSelectedDepositId(deposit.id);
    setRejectionData({ reason: '', notes: '' });
    setShowRejectionModal(true);
  };

  const handleApprovalSubmit = async () => {
    // ✅ Re-check permission (defense in depth)
    if (!hasPermission('approve_deposit')) {
      alert('❌ Anda tidak memiliki izin untuk menyetujui penyetoran');
      return;
    }

    if (!approvalData.points || approvalData.points <= 0) {
      alert('Poin harus lebih dari 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await adminApi.approveWasteDeposit(selectedDepositId, approvalData.points);

      if (result.success) {
        // Update local state
        const updatedDeposits = deposits.map((d) =>
          d.id === selectedDepositId
            ? {
                ...d,
                status: 'approved',
                poin_didapat: parseFloat(approvalData.points),
                catatan_admin: approvalData.notes,
                tanggal_verifikasi: new Date().toISOString(),
              }
            : d
        );
        setDeposits(updatedDeposits);
        setShowApprovalModal(false);
        alert('✅ Penyetoran disetujui! Poin telah diberikan ke nasabah.');
        loadStatistics(); // Refresh statistics
      } else {
        alert(`Terjadi kesalahan: ${result.message}`);
      }
    } catch (err) {
      console.error('Approval error:', err);
      alert('Terjadi kesalahan saat menyetujui penyetoran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectionSubmit = async () => {
    // ✅ Re-check permission (defense in depth)
    if (!hasPermission('reject_deposit')) {
      alert('❌ Anda tidak memiliki izin untuk menolak penyetoran');
      return;
    }

    if (!rejectionData.reason.trim()) {
      alert('Alasan penolakan wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await adminApi.rejectWasteDeposit(selectedDepositId, rejectionData.reason);

      if (result.success) {
        // Update local state
        const updatedDeposits = deposits.map((d) =>
          d.id === selectedDepositId
            ? {
                ...d,
                status: 'rejected',
                catatan_admin: rejectionData.reason + (rejectionData.notes ? '\n' + rejectionData.notes : ''),
                tanggal_verifikasi: new Date().toISOString(),
              }
            : d
        );
        setDeposits(updatedDeposits);
        setShowRejectionModal(false);
        alert('❌ Penyetoran ditolak. Notifikasi telah dikirim ke nasabah.');
        loadStatistics(); // Refresh statistics
      } else {
        alert(`Terjadi kesalahan: ${result.message}`);
      }
    } catch (err) {
      console.error('Rejection error:', err);
      alert('Terjadi kesalahan saat menolak penyetoran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nasabah', 'Email', 'Jenis Sampah', 'Berat (kg)', 'Status', 'Poin', 'Tanggal'];
    const csvContent = [
      headers.join(','),
      ...filteredDeposits.map((d) =>
        [
          d.id,
          d.user_name,
          d.user_email,
          d.jenis_sampah,
          d.berat,
          d.status,
          d.poin_didapat || d.poin_pending,
          formatDate(d.created_at),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `penyetoran-sampah-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="waste-deposits-management">
      {/* Header */}
      <div className="management-header">
        <h2>Kelola Penyetoran Sampah</h2>
        <p>Kelola dan persetujui semua penyetoran sampah dari nasabah</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Penyetoran</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-icon" style={{ background: '#e5e7eb' }}>
            <Package size={24} color="#6b7280" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Menunggu Persetujuan</span>
            <span className="stat-value" style={{ color: '#f59e0b' }}>{stats.pending}</span>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <Clock size={24} color="#f59e0b" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Disetujui</span>
            <span className="stat-value" style={{ color: '#10b981' }}>{stats.approved}</span>
          </div>
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            <CheckCircle size={24} color="#10b981" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Ditolak</span>
            <span className="stat-value" style={{ color: '#ef4444' }}>{stats.rejected}</span>
          </div>
          <div className="stat-icon" style={{ background: '#fee2e2' }}>
            <XCircle size={24} color="#ef4444" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Berat (kg)</span>
            <span className="stat-value">{stats.totalWeight.toFixed(1)}</span>
          </div>
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <Weight size={24} color="#3b82f6" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Poin Diberikan</span>
            <span className="stat-value">{stats.totalPoints}</span>
          </div>
          <div className="stat-icon" style={{ background: '#fcd34d' }}>
            <AlertCircle size={24} color="#eab308" />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-bar">
          <div className="search-input">
            <Search size={18} />
            <input
              type="text"
              placeholder="Cari nama, email, atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>

          <select
            className="filter-select"
            value={wasteTypeFilter}
            onChange={(e) => setWasteTypeFilter(e.target.value)}
          >
            <option value="all">Semua Jenis Sampah</option>
            <option value="Plastik">Plastik</option>
            <option value="Kertas">Kertas</option>
            <option value="Logam">Logam</option>
            <option value="Organik">Organik</option>
            <option value="Kaca">Kaca</option>
          </select>

          <input
            type="date"
            className="filter-select"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="Dari tanggal"
          />

          <input
            type="date"
            className="filter-select"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="Sampai tanggal"
          />

          <button className="export-btn" onClick={handleExportCSV}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Deposits Table */}
      {loading ? (
        <div className="loading-state">
          <Loader className="spinner" />
          <p>Memuat data penyetoran...</p>
        </div>
      ) : filteredDeposits.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3>Tidak ada data penyetoran</h3>
          <p>Tidak ada penyetoran yang sesuai dengan filter Anda</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="deposits-table-wrapper">
            <table className="deposits-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nasabah</th>
                  <th>Jenis Sampah</th>
                  <th>Berat (kg)</th>
                  <th>Poin</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.map((deposit) => (
                  <tr key={deposit.id}>
                    <td className="deposit-id">#{deposit.id}</td>
                    <td>
                      <div className="deposit-user">
                        <User size={16} />
                        <div className="user-info">
                          <strong>{deposit.nama_lengkap || deposit.user_name || 'Unknown'}</strong>
                          <small>{deposit.user_email || 'Unknown'}</small>
                        </div>
                      </div>
                    </td>
                    <td>{deposit.jenis_sampah}</td>
                    <td className="text-center">{deposit.berat_kg || deposit.berat} kg</td>
                    <td className="text-center">
                      {deposit.status === 'approved' ? (
                        <span className="points-badge" style={{ color: '#10b981' }}>
                          +{deposit.poin_didapat}
                        </span>
                      ) : (
                        <span className="points-badge" style={{ color: '#6b7280' }}>
                          {deposit.poin_pending} (pending)
                        </span>
                      )}
                    </td>
                    <td className="text-sm">{formatDate(deposit.created_at)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(deposit.status) + '20', color: getStatusColor(deposit.status) }}
                      >
                        {getStatusIcon(deposit.status)}
                        {getStatusText(deposit.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetail(deposit)}
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </button>
                        {deposit.status === 'pending' && (
                          <>
                            <PermissionGuard
                              permission="approve_deposit"
                              fallback={
                                <button
                                  className="action-btn approve-btn"
                                  disabled
                                  title="No Permission"
                                >
                                  <Check size={16} />
                                </button>
                              }
                            >
                              <button
                                className="action-btn approve-btn"
                                onClick={() => handleApproveClick(deposit)}
                                title="Setujui"
                              >
                                <Check size={16} />
                              </button>
                            </PermissionGuard>

                            <PermissionGuard
                              permission="reject_deposit"
                              fallback={
                                <button
                                  className="action-btn reject-btn"
                                  disabled
                                  title="No Permission"
                                >
                                  <X size={16} />
                                </button>
                              }
                            >
                              <button
                                className="action-btn reject-btn"
                                onClick={() => handleRejectClick(deposit)}
                                title="Tolak"
                              >
                                <X size={16} />
                              </button>
                            </PermissionGuard>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="deposits-mobile-cards">
            {filteredDeposits.map((deposit) => (
              <div key={deposit.id} className="deposit-card">
                <div className="card-header">
                  <div className="card-title">
                    <strong>{deposit.nama_lengkap || deposit.user_name || 'Unknown'}</strong>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(deposit.status) + '20', color: getStatusColor(deposit.status) }}
                    >
                      {getStatusIcon(deposit.status)}
                      {getStatusText(deposit.status)}
                    </span>
                  </div>
                  <small>{deposit.user_email || 'Unknown'}</small>
                </div>
                <div className="card-body">
                  <div className="card-row">
                    <span className="label">Jenis Sampah:</span>
                    <span className="value">{deposit.jenis_sampah}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Berat:</span>
                    <span className="value">{deposit.berat_kg || deposit.berat} kg</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Poin:</span>
                    <span className="value">
                      {deposit.status === 'approved' ? `+${deposit.poin_didapat}` : `${deposit.poin_pending} (pending)`}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="label">Tanggal:</span>
                    <span className="value">{formatDate(deposit.created_at)}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="action-btn view-btn" onClick={() => handleViewDetail(deposit)}>
                    <Eye size={16} /> Detail
                  </button>
                  {deposit.status === 'pending' && (
                    <>
                      <PermissionGuard
                        permission="approve_deposit"
                        fallback={
                          <button className="action-btn approve-btn" disabled>
                            <Check size={16} /> Setujui
                          </button>
                        }
                      >
                        <button className="action-btn approve-btn" onClick={() => handleApproveClick(deposit)}>
                          <Check size={16} /> Setujui
                        </button>
                      </PermissionGuard>

                      <PermissionGuard
                        permission="reject_deposit"
                        fallback={
                          <button className="action-btn reject-btn" disabled>
                            <X size={16} /> Tolak
                          </button>
                        }
                      >
                        <button className="action-btn reject-btn" onClick={() => handleRejectClick(deposit)}>
                          <X size={16} /> Tolak
                        </button>
                      </PermissionGuard>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedDeposit && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Penyetoran Sampah</h3>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {/* Photo Evidence */}
              <div className="evidence-section">
                <h4>Foto Bukti</h4>
                <img src={selectedDeposit.foto_sampah || selectedDeposit.foto_bukti} alt="Bukti penyetoran" className="evidence-photo" />
              </div>

              {/* Deposit Info */}
              <div className="info-section">
                <h4>Informasi Penyetoran</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">ID Penyetoran</span>
                    <span className="value">#{selectedDeposit.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Nama Nasabah</span>
                    <span className="value">{selectedDeposit.nama_lengkap || selectedDeposit.user_name || 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email</span>
                    <span className="value">{selectedDeposit.user_email || 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Jenis Sampah</span>
                    <span className="value">{selectedDeposit.jenis_sampah}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Berat</span>
                    <span className="value">{selectedDeposit.berat_kg || selectedDeposit.berat} kg</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Poin (pending)</span>
                    <span className="value">{selectedDeposit.poin_pending}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Jadwal Penyetoran</span>
                    <span className="value">{selectedDeposit.jadwal}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Tanggal Setor</span>
                    <span className="value">{formatDate(selectedDeposit.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="status-section">
                <h4>Status Verifikasi</h4>
                <div className="status-info">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedDeposit.status) + '20', color: getStatusColor(selectedDeposit.status) }}
                  >
                    {getStatusIcon(selectedDeposit.status)}
                    {getStatusText(selectedDeposit.status)}
                  </span>
                  {selectedDeposit.catatan_admin && (
                    <div className="notes-box">
                      <strong>Catatan:</strong>
                      <p>{selectedDeposit.catatan_admin}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedDeposit.status === 'pending' && (
                <>
                  <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                    Tutup
                  </button>
                  <div className="modal-actions">
                    <button className="btn-reject" onClick={() => { setShowDetailModal(false); handleRejectClick(selectedDeposit); }}>
                      <X size={16} /> Tolak
                    </button>
                    <button className="btn-approve" onClick={() => { setShowDetailModal(false); handleApproveClick(selectedDeposit); }}>
                      <Check size={16} /> Setujui
                    </button>
                  </div>
                </>
              )}
              {selectedDeposit.status !== 'pending' && (
                <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedDeposit && (
        <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Setujui Penyetoran</h3>
              <button className="close-btn" onClick={() => setShowApprovalModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="approval-info">
                <div className="info-item">
                  <span className="label">Nasabah</span>
                  <span className="value">{selectedDeposit.nama_lengkap || selectedDeposit.user_name || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Jenis Sampah</span>
                  <span className="value">{selectedDeposit.jenis_sampah}</span>
                </div>
                <div className="info-item">
                  <span className="label">Berat</span>
                  <span className="value">{selectedDeposit.berat_kg || selectedDeposit.berat} kg</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="points">Poin yang Diberikan</label>
                <input
                  type="number"
                  id="points"
                  value={approvalData.points}
                  onChange={(e) => setApprovalData({ ...approvalData, points: e.target.value })}
                  placeholder="Masukkan jumlah poin"
                  step="0.1"
                  min="0"
                />
                <small>Rekomendasi: {selectedDeposit.poin_pending}</small>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Catatan (Opsional)</label>
                <textarea
                  id="notes"
                  value={approvalData.notes}
                  onChange={(e) => setApprovalData({ ...approvalData, notes: e.target.value })}
                  placeholder="Masukkan catatan admin"
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowApprovalModal(false)} disabled={isSubmitting}>
                Batal
              </button>
              <button className="btn-approve" onClick={handleApprovalSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Memproses...' : 'Setujui Penyetoran'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedDeposit && (
        <div className="modal-overlay" onClick={() => setShowRejectionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tolak Penyetoran</h3>
              <button className="close-btn" onClick={() => setShowRejectionModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="rejection-info">
                <div className="info-item">
                  <span className="label">Nasabah</span>
                  <span className="value">{selectedDeposit.nama_lengkap || selectedDeposit.user_name || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Jenis Sampah</span>
                  <span className="value">{selectedDeposit.jenis_sampah}</span>
                </div>
                <div className="info-item">
                  <span className="label">Berat</span>
                  <span className="value">{selectedDeposit.berat_kg || selectedDeposit.berat} kg</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reason">
                  Alasan Penolakan <span className="required">*</span>
                </label>
                <select
                  id="reason"
                  value={rejectionData.reason}
                  onChange={(e) => setRejectionData({ ...rejectionData, reason: e.target.value })}
                >
                  <option value="">Pilih alasan penolakan</option>
                  <option value="Foto tidak jelas">Foto tidak jelas</option>
                  <option value="Sampah tidak sesuai kategori">Sampah tidak sesuai kategori</option>
                  <option value="Berat tidak sesuai">Berat tidak sesuai</option>
                  <option value="Bukti tidak valid">Bukti tidak valid</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Keterangan Tambahan</label>
                <textarea
                  id="notes"
                  value={rejectionData.notes}
                  onChange={(e) => setRejectionData({ ...rejectionData, notes: e.target.value })}
                  placeholder="Jelaskan secara detail alasan penolakan..."
                  rows="4"
                />
              </div>

              <div className="rejection-note">
                <AlertCircle size={16} />
                <p>Nasabah akan menerima notifikasi tentang penolakan ini dan dapat melakukan submit ulang.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRejectionModal(false)} disabled={isSubmitting}>
                Batal
              </button>
              <button className="btn-reject" onClick={handleRejectionSubmit} disabled={isSubmitting || !rejectionData.reason}>
                {isSubmitting ? 'Memproses...' : 'Tolak Penyetoran'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon placeholder untuk stats (since Package tidak ada di lucide-react default)
const Package = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
