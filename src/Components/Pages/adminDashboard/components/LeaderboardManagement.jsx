import { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, RefreshCw, Calendar, Clock, AlertTriangle, CheckCircle, 
  Users, Award, Settings, TrendingUp, RotateCcw, History, Zap
} from 'lucide-react';
import { API_BASE_URL } from '../../../../config/api';
import DangerConfirmDialog from './DangerConfirmDialog';
import '../styles/leaderboardManagement.css';

// Broadcast cache clear to other components listening for leaderboard updates
const broadcastLeaderboardReset = () => {
  window.dispatchEvent(new CustomEvent('leaderboard-reset', { 
    detail: { timestamp: Date.now() } 
  }));
  localStorage.setItem('leaderboard_last_reset', Date.now().toString());
};

const LeaderboardManagement = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [resetHistory, setResetHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [seasonSettings, setSeasonSettings] = useState({
    resetPeriod: 'quarterly',
    autoReset: true,
    nextResetDate: null,
  });

  // Fetch leaderboard data
  const fetchLeaderboardData = useCallback(async () => {
    try {
      setLoading(true);
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
  }, []);

  // Fetch leaderboard settings
  const fetchLeaderboardSettings = useCallback(async () => {
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
  }, []);

  // Fetch reset history
  const fetchResetHistory = useCallback(async () => {
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
  }, []);

  // Initial data load
  useEffect(() => {
    fetchLeaderboardData();
    fetchLeaderboardSettings();
    fetchResetHistory();
  }, [fetchLeaderboardData, fetchLeaderboardSettings, fetchResetHistory]);

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle leaderboard reset
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
        body: JSON.stringify({ confirm: true }),
      });

      if (response.status === 401) {
        setMessage({ type: 'error', text: 'Autentikasi gagal. Silakan refresh halaman.' });
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Endpoint belum tersedia di backend.');
      }

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '🎉 Leaderboard berhasil direset! Season baru dimulai.' });
        // Broadcast to other components to clear their cache
        broadcastLeaderboardReset();
        // Refresh all data
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

  // Handle settings update
  const handleUpdateSettings = async () => {
    setSavingSettings(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/leaderboard/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          reset_period: seasonSettings.resetPeriod,
          auto_reset: seasonSettings.autoReset,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Endpoint belum tersedia di backend.');
      }

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Pengaturan berhasil disimpan!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal menyimpan pengaturan' });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Calculate next reset date
  const getNextResetDate = () => {
    if (seasonSettings.nextResetDate) {
      return new Date(seasonSettings.nextResetDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }

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

  // Get days until next reset
  const getDaysUntilReset = () => {
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

    const diffTime = nextReset - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPeriodLabel = (period) => {
    const labels = {
      weekly: 'Mingguan',
      monthly: 'Bulanan',
      quarterly: 'Per Kuartal',
      yearly: 'Tahunan',
    };
    return labels[period] || period;
  };

  /* Calculate stats */
  const totalPoints = leaderboardData.reduce((sum, user) => 
    sum + (user.display_poin ?? user.poin_season ?? user.actual_poin ?? user.poin ?? 0), 0
  );
  const totalSampah = leaderboardData.reduce((sum, user) =>
    sum + (user.total_sampah ?? user.total_setor_sampah ?? user.sampah_terkumpul ?? 0), 0
  );

  return (
    <div className="leaderboard-management">
      {/* Header */}
      <div className="lm-header">
        <div className="lm-header-content">
          <div className="lm-title-section">
            <Trophy size={28} className="lm-title-icon" />
            <div>
              <h1>Manajemen Leaderboard</h1>
              <p>Kelola season dan reset poin leaderboard</p>
            </div>
          </div>
          <button 
            className="lm-refresh-btn" 
            onClick={() => { fetchLeaderboardData(); fetchResetHistory(); }}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`lm-alert ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
          <button className="lm-alert-close" onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="lm-stats-grid">
        <div className="lm-stat-card">
          <div className="lm-stat-icon users">
            <Users size={24} />
          </div>
          <div className="lm-stat-info">
            <span className="lm-stat-value">{leaderboardData.length}</span>
            <span className="lm-stat-label">Total Peserta</span>
          </div>
        </div>

        <div className="lm-stat-card">
          <div className="lm-stat-icon points">
            <Zap size={24} />
          </div>
          <div className="lm-stat-info">
            <span className="lm-stat-value">{totalPoints.toLocaleString('id-ID')}</span>
            <span className="lm-stat-label">Total Poin</span>
          </div>
        </div>

        <div className="lm-stat-card">
          <div className="lm-stat-icon average">
            <TrendingUp size={24} />
          </div>
          <div className="lm-stat-info">
            <span className="lm-stat-value">{totalSampah.toLocaleString('id-ID')} Kg</span>
            <span className="lm-stat-label">Total Sampah</span>
          </div>
        </div>

        <div className="lm-stat-card">
          <div className="lm-stat-icon countdown">
            <Clock size={24} />
          </div>
          <div className="lm-stat-info">
            <span className="lm-stat-value">{getDaysUntilReset()}</span>
            <span className="lm-stat-label">Hari Menuju Reset</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="lm-content-grid">
        {/* Season Info Card */}
        <div className="lm-card season-info">
          <div className="lm-card-header">
            <Calendar size={20} />
            <h3>Informasi Season</h3>
          </div>
          <div className="lm-card-body">
            <div className="lm-info-row">
              <span className="lm-info-label">Periode Reset</span>
              <span className="lm-info-value">{getPeriodLabel(seasonSettings.resetPeriod)}</span>
            </div>
            <div className="lm-info-row">
              <span className="lm-info-label">Reset Otomatis</span>
              <span className={`lm-badge ${seasonSettings.autoReset ? 'active' : 'inactive'}`}>
                {seasonSettings.autoReset ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <div className="lm-info-row">
              <span className="lm-info-label">Reset Selanjutnya</span>
              <span className="lm-info-value highlight">{getNextResetDate()}</span>
            </div>
            <div className="lm-info-row">
              <span className="lm-info-label">Riwayat Reset</span>
              <span className="lm-info-value">{resetHistory.length} kali</span>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="lm-card settings">
          <div className="lm-card-header">
            <Settings size={20} />
            <h3>Pengaturan Reset</h3>
          </div>
          <div className="lm-card-body">
            <div className="lm-form-group">
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

            <div className="lm-form-group">
              <label className="lm-checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={seasonSettings.autoReset}
                  onChange={(e) => setSeasonSettings(prev => ({ ...prev, autoReset: e.target.checked }))}
                />
                <span className="lm-checkbox-label">Aktifkan Reset Otomatis</span>
              </label>
              <p className="lm-help-text">
                Leaderboard akan otomatis direset sesuai periode yang dipilih
              </p>
            </div>

            <button 
              className="lm-btn primary" 
              onClick={handleUpdateSettings}
              disabled={savingSettings}
            >
              {savingSettings ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reset Section */}
      <div className="lm-card danger-zone">
        <div className="lm-card-header danger">
          <RotateCcw size={20} />
          <h3>Reset Manual Leaderboard</h3>
        </div>
        <div className="lm-card-body">
          <div className="lm-warning-box">
            <AlertTriangle size={24} />
            <div>
              <strong>Perhatian! Aksi ini tidak dapat dibatalkan.</strong>
              <p>
                Reset leaderboard akan mengubah <code>display_poin</code> menjadi 0 untuk semua pengguna,
                memulai season baru. Poin yang sudah ditukarkan (<code>actual_poin</code>) tidak terpengaruh.
              </p>
            </div>
          </div>

          <button
            className="lm-btn danger"
            onClick={() => setShowResetConfirm(true)}
            disabled={resetting}
          >
            {resetting ? (
              <>
                <RefreshCw size={18} className="spinning" />
                Mereset Leaderboard...
              </>
            ) : (
              <>
                <RotateCcw size={18} />
                Reset Leaderboard Sekarang
              </>
            )}
          </button>
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="lm-card preview">
        <div className="lm-card-header">
          <Award size={20} />
          <h3>Top 10 Leaderboard</h3>
        </div>
        <div className="lm-card-body no-padding">
          {loading ? (
            <div className="lm-loading">
              <RefreshCw size={32} className="spinning" />
              <p>Memuat leaderboard...</p>
            </div>
          ) : leaderboardData.length > 0 ? (
            <div className="lm-table-wrapper">
              <table className="lm-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Nama</th>
                    <th>Poin</th>
                    <th>Sampah (Kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.slice(0, 10).map((user, index) => {
                    const points = user.display_poin ?? user.poin_season ?? user.actual_poin ?? user.poin ?? 0;
                    const sampah = user.total_sampah ?? user.total_setor_sampah ?? user.sampah_terkumpul ?? 0;
                    return (
                      <tr key={user.user_id || index} className={index < 3 ? `rank-${index + 1}` : ''}>
                        <td className="rank-cell">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </td>
                        <td className="name-cell">{user.nama || user.nama_user || 'Unknown'}</td>
                        <td className="points-cell">{points.toLocaleString('id-ID')} pts</td>
                        <td className="waste-cell">{sampah.toLocaleString('id-ID')} Kg</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="lm-empty">
              <Trophy size={48} />
              <p>Belum ada data leaderboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Reset History */}
      {resetHistory.length > 0 && (
        <div className="lm-card history">
          <div className="lm-card-header">
            <History size={20} />
            <h3>Riwayat Reset</h3>
          </div>
          <div className="lm-card-body no-padding">
            <div className="lm-history-list">
              {resetHistory.slice(0, 5).map((item, index) => (
                <div key={index} className="lm-history-item">
                  <div className="lm-history-icon">
                    <RotateCcw size={16} />
                  </div>
                  <div className="lm-history-content">
                    <span className="lm-history-date">
                      {new Date(item.reset_date || item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="lm-history-meta">
                      {item.reset_type === 'full' ? 'Reset Penuh' : 'Reset Season'} • oleh {item.admin_name || 'Admin'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showResetConfirm && (
        <DangerConfirmDialog
          title="Reset Leaderboard"
          message="Apakah Anda yakin ingin mereset leaderboard? Semua display_poin akan direset ke 0 dan season baru akan dimulai. Aksi ini tidak dapat dibatalkan."
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
