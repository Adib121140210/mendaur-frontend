import { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Calendar, Clock, AlertTriangle, CheckCircle, Users, Award, Settings } from 'lucide-react';
import { API_BASE_URL } from '../../../../config/api';
import DangerConfirmDialog from './DangerConfirmDialog';
import '../styles/leaderboardManagement.css';

const LeaderboardManagement = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [resetHistory, setResetHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [seasonSettings, setSeasonSettings] = useState({
    resetPeriod: 'monthly', // 'weekly', 'monthly', 'quarterly', 'yearly'
    autoReset: false,
    nextResetDate: null,
  });

  useEffect(() => {
    fetchLeaderboardData();
    fetchLeaderboardSettings();
    fetchResetHistory();
  }, []);

  // Handle 401 Unauthorized - graceful fallback
  const handle401 = (endpoint = 'unknown') => {
    console.warn(`401 Unauthorized detected on ${endpoint} - using fallback behavior`);
    setMessage({ 
      type: 'warning', 
      text: 'Some admin features may not be available. Please contact support if this persists.' 
    });
    // Don't logout immediately - might be temporary backend issue
  };

  const fetchLeaderboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/dashboard/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // GET /api/admin/leaderboard/settings - Fetch leaderboard settings
  const fetchLeaderboardSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/leaderboard/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setSeasonSettings(prev => ({
            ...prev,
            resetPeriod: data.data.reset_period || data.data.resetPeriod || prev.resetPeriod,
            autoReset: data.data.auto_reset ?? data.data.autoReset ?? prev.autoReset,
            nextResetDate: data.data.next_reset_date || data.data.nextResetDate || null,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard settings:', error);
    }
  };

  // GET /api/admin/leaderboard/history - Fetch reset history
  const fetchResetHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/leaderboard/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResetHistory(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching reset history:', error);
    }
  };

  const handleResetLeaderboard = async () => {
    setResetting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/leaderboard/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          confirm: true, // Backend requires confirm: true to reset
        }),
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        handle401('admin/leaderboard/reset');
        setMessage({ type: 'error', text: 'Authentication failed. Please try refreshing the page.' });
        return;
      }

      // Check if response is JSON (not a redirect to frontend)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Endpoint belum tersedia di backend. Hubungi tim backend untuk mengimplementasikan /api/admin/leaderboard/reset');
      }

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Leaderboard berhasil direset!' });
        fetchLeaderboardData();
        fetchLeaderboardSettings();
        fetchResetHistory();
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal mereset leaderboard' });
      }
    } catch (error) {
      console.error('Error resetting leaderboard:', error);
      setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan saat mereset leaderboard' });
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/leaderboard/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Backend expects snake_case: reset_period, auto_reset
        body: JSON.stringify({
          reset_period: seasonSettings.resetPeriod,
          auto_reset: seasonSettings.autoReset,
        }),
      });

      // Check if response is JSON (not a redirect to frontend)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Endpoint belum tersedia di backend. Hubungi tim backend untuk mengimplementasikan /api/admin/leaderboard/settings');
      }

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal menyimpan pengaturan' });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan saat menyimpan pengaturan' });
    }
  };

  const getNextResetDate = () => {
    const now = new Date();
    let nextReset = new Date();

    switch (seasonSettings.resetPeriod) {
      case 'weekly':
        nextReset.setDate(now.getDate() + (7 - now.getDay()));
        break;
      case 'monthly':
        nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'quarterly': {
        const quarter = Math.floor(now.getMonth() / 3);
        nextReset = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
        break;
      }
      case 'yearly':
        nextReset = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    return nextReset.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getPeriodLabel = (period) => {
    const labels = {
      weekly: 'Mingguan',
      monthly: 'Bulanan',
      quarterly: 'Per Kuartal (3 Bulan)',
      yearly: 'Tahunan',
    };
    return labels[period] || period;
  };

  return (
    <div className="leaderboard-management">
      <div className="management-header">
        <div className="header-info">
          <h2>
            <Trophy size={24} />
            Manajemen Leaderboard
          </h2>
          <p>Kelola leaderboard dan atur waktu reset poin musiman</p>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {message.text}
        </div>
      )}

      {/* Season Info & Settings */}
      <div className="management-grid">
        {/* Current Season Info */}
        <div className="info-card">
          <div className="card-header">
            <Calendar size={20} />
            <h3>Informasi Musim</h3>
          </div>
          <div className="card-content">
            <div className="info-item">
              <span className="label">Periode Reset:</span>
              <span className="value">{getPeriodLabel(seasonSettings.resetPeriod)}</span>
            </div>
            <div className="info-item">
              <span className="label">Reset Otomatis:</span>
              <span className={`value badge ${seasonSettings.autoReset ? 'active' : 'inactive'}`}>
                {seasonSettings.autoReset ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Reset Selanjutnya:</span>
              <span className="value highlight">{getNextResetDate()}</span>
            </div>
            <div className="info-item">
              <span className="label">Total Peserta:</span>
              <span className="value">
                <Users size={16} /> {leaderboardData.length} Nasabah
              </span>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="settings-card">
          <div className="card-header">
            <Settings size={20} />
            <h3>Pengaturan Reset</h3>
          </div>
          <div className="card-content">
            <div className="form-group">
              <label>Periode Reset</label>
              <select
                value={seasonSettings.resetPeriod}
                onChange={(e) => setSeasonSettings(prev => ({ ...prev, resetPeriod: e.target.value }))}
              >
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <option value="quarterly">Per Kuartal (3 Bulan)</option>
                <option value="yearly">Tahunan</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={seasonSettings.autoReset}
                  onChange={(e) => setSeasonSettings(prev => ({ ...prev, autoReset: e.target.checked }))}
                />
                <span>Aktifkan Reset Otomatis</span>
              </label>
              <p className="help-text">
                Jika aktif, leaderboard akan otomatis direset sesuai periode yang dipilih
              </p>
            </div>

            <button className="btn-save" onClick={handleUpdateSettings}>
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>

      {/* Reset Action */}
      <div className="reset-section">
        <div className="reset-card danger">
          <div className="card-header">
            <RefreshCw size={20} />
            <h3>Reset Manual Leaderboard</h3>
          </div>
          <div className="card-content">
            <div className="warning-box">
              <AlertTriangle size={24} />
              <div>
                <strong>Perhatian!</strong>
                <p>
                  Reset leaderboard akan menghapus semua poin musiman dan memulai musim baru.
                  Data leaderboard lama akan diarsipkan. Aksi ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <button
              className="btn-reset"
              onClick={() => setShowResetConfirm(true)}
              disabled={resetting}
            >
              {resetting ? (
                <>
                  <RefreshCw size={18} className="spinning" />
                  Mereset...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Reset Leaderboard Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Current Leaderboard Preview */}
      <div className="leaderboard-preview">
        <div className="card-header">
          <Award size={20} />
          <h3>Leaderboard Saat Ini (Top 10)</h3>
        </div>
        <div className="leaderboard-table">
          {loading ? (
            <div className="loading-state">
              <RefreshCw size={24} className="spinning" />
              <p>Memuat data...</p>
            </div>
          ) : leaderboardData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Nama</th>
                  <th>Total Poin</th>
                  <th>Badge</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.slice(0, 10).map((user, index) => (
                  <tr key={user.user_id} className={index < 3 ? `top-${index + 1}` : ''}>
                    <td className="rank-cell">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </td>
                    <td className="name-cell">{user.nama}</td>
                    <td className="points-cell">{user.total_poin?.toLocaleString('id-ID')} pts</td>
                    <td className="badge-cell">{user.badge_title || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <Trophy size={48} />
              <p>Belum ada data leaderboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Reset History */}
      {resetHistory.length > 0 && (
        <div className="reset-history">
          <div className="card-header">
            <Clock size={20} />
            <h3>Riwayat Reset Leaderboard</h3>
          </div>
          <div className="history-list">
            {resetHistory.slice(0, 5).map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-date">
                  {new Date(item.reset_date || item.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="history-info">
                  <span className="reset-type">{item.reset_type === 'full' ? 'Reset Penuh' : 'Reset Musiman'}</span>
                  <span className="reset-by">oleh {item.admin_name || 'Admin'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showResetConfirm && (
        <DangerConfirmDialog
          title="Reset Leaderboard"
          message="Apakah Anda yakin ingin mereset leaderboard? Semua poin musiman akan dihapus dan musim baru akan dimulai. Data lama akan diarsipkan."
          confirmText="Ya, Reset Sekarang"
          cancelText="Batal"
          onConfirm={handleResetLeaderboard}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
};

export default LeaderboardManagement;
