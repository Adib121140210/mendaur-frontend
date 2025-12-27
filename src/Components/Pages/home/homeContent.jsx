import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, Trophy, Star, TrendingUp, Award, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ArtikelCard from "../../lib/artikel";
import Banner from "../../lib/banner";
import "./homeContent.css";

const HomeContent = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.user_id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Get user ID from user object (backend uses user_id)
      const userId = user?.user_id || localStorage.getItem('id_user');

      if (!token) {
        setLoading(false);
        return;
      }

      if (!userId) {
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Fetch user stats
      const statsRes = await fetch(`http://127.0.0.1:8000/api/dashboard/stats/${userId}`, {
        headers,
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setUserStats(statsData.data);
      }

      // Fetch leaderboard
      const leaderRes = await fetch('http://127.0.0.1:8000/api/dashboard/leaderboard', {
        headers,
      });
      if (leaderRes.ok) {
        const leaderData = await leaderRes.json();
        setLeaderboard(leaderData.data || []);
      }

      // Fetch user badges
      const badgesRes = await fetch(`http://127.0.0.1:8000/api/users/${userId}/badges`, {
        headers,
      });
      if (badgesRes.ok) {
        const badgesData = await badgesRes.json();
        setUserBadges(badgesData.data || []);
      }

      // Fetch recent activities from multiple sources (Tabung Sampah, Penukaran Poin, Penarikan Tunai)
      const allActivities = [];

      // 1. Fetch Tabung Sampah activities
      // Backend endpoint: GET /api/setor-sampah/user/{userId}
      try {
        const tabungRes = await fetch(`http://127.0.0.1:8000/api/setor-sampah/user/${userId}`, { headers });
        
        if (tabungRes.ok) {
          const tabungData = await tabungRes.json();
          const tabungItems = tabungData.data || [];
          
          const tabungActivities = tabungItems.slice(0, 10).map((item, index) => ({
            id: `tabung-${item.setor_id || item.id || index}`,
            tipe_aktivitas: 'tabung_sampah',
            deskripsi: `Menabung ${item.berat_sampah || item.total_berat || 0} kg ${item.jenis_sampah?.nama_jenis || item.nama_jenis || 'sampah'}`,
            tanggal: item.tanggal_setor || item.created_at,
            poin_perubahan: item.poin_diperoleh || item.total_poin || 0,
          }));
          allActivities.push(...tabungActivities);
        }
      } catch {
        // Silently skip if fetch fails
      }

      // 2. Fetch Penukaran Produk activities
      // Backend endpoint: GET /api/penukaran-produk/user/{userId}
      try {
        const redeemRes = await fetch(`http://127.0.0.1:8000/api/penukaran-produk/user/${userId}`, { headers });
        
        if (redeemRes.ok) {
          const redeemData = await redeemRes.json();
          const redeemItems = redeemData.data || [];
          
          const redeemActivities = redeemItems.slice(0, 10).map((item, index) => ({
            id: `redeem-${item.penukaran_id || item.id || index}`,
            tipe_aktivitas: 'tukar_poin',
            deskripsi: `Menukar poin untuk ${item.produk?.nama_produk || item.nama_produk || 'produk'}`,
            tanggal: item.tanggal_penukaran || item.created_at,
            poin_perubahan: -(item.total_poin || item.poin_digunakan || 0),
          }));
          allActivities.push(...redeemActivities);
        }
      } catch {
        // Silently skip if fetch fails
      }

      // 3. Fetch Penarikan Tunai activities
      // Backend endpoint: GET /api/penarikan-tunai/user/{userId}
      try {
        const withdrawRes = await fetch(`http://127.0.0.1:8000/api/penarikan-tunai/user/${userId}`, { headers });
        
        if (withdrawRes.ok) {
          const withdrawData = await withdrawRes.json();
          const withdrawItems = withdrawData.data || [];
          
          const withdrawActivities = withdrawItems.slice(0, 10).map((item, index) => ({
            id: `withdraw-${item.penarikan_id || item.id || index}`,
            tipe_aktivitas: 'penarikan_tunai',
            deskripsi: `Penarikan tunai Rp ${(item.jumlah_rupiah || item.nominal || 0).toLocaleString('id-ID')}`,
            tanggal: item.tanggal_penarikan || item.created_at,
            poin_perubahan: -(item.poin_digunakan || 0),
          }));
          allActivities.push(...withdrawActivities);
        }
      } catch {
        // Silently skip if fetch fails
      }

      // 4. Fallback: Try user activity log endpoint if available
      if (allActivities.length === 0) {
        try {
          const activitiesRes = await fetch(`http://127.0.0.1:8000/api/users/${userId}/aktivitas`, { headers });
          if (activitiesRes.ok) {
            const activitiesData = await activitiesRes.json();
            const logActivities = (activitiesData.data || []).slice(0, 5).map((item, index) => ({
              id: `log-${item.log_user_activity_id || index}`,
              tipe_aktivitas: item.tipe_aktivitas || 'aktivitas',
              deskripsi: item.deskripsi || 'Aktivitas',
              tanggal: item.tanggal || item.created_at,
              poin_perubahan: item.poin_perubahan || 0,
            }));
            allActivities.push(...logActivities);
          }
        } catch {
          // Silently skip if fetch fails
        }
      }

      // Sort all activities by date (newest first) and take top 5
      allActivities.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      setRecentActivities(allActivities.slice(0, 5));
    } catch {
      // Dashboard data fetch failed silently
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="homeContentWrapper">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Selamat Datang di Mendaur!</h2>
          <p style={{ margin: '20px 0', color: '#666' }}>
            Login untuk melihat statistik dan mengumpulkan poin
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '12px 32px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Login Sekarang
          </button>
        </div>

        <section className="bannerSection">
          <Banner />
        </section>

        <section className="artikelSection">
          <h2 className="artikelTitle">
            <Recycle size={20} style={{ marginRight: "8px" }} />
            Artikel Terbaru
          </h2>
          <div className="artikelGrid">
            <ArtikelCard fetchFromAPI={true} perPage={6} />
          </div>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="homeContentWrapper">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p>Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homeContentWrapper">
      {/* Welcome Section */}
      <section className="welcomeSection">
        <h1 className="welcomeTitle">Selamat Datang, {user.nama}!</h1>
        <p className="welcomeSubtitle">Mari kita kelola sampah dan kumpulkan poin hari ini</p>
      </section>

      <section className="bannerSection">
        <Banner />
      </section>
      {/* Stats Grid */}
      <section className="statsSection">
        <div className="statsGrid">
          <StatCard
            key="stat-poin"
            icon={<Star />}
            title="Total Poin"
            value={userStats?.actual_poin || user.actual_poin || 0}
            color="#FFB800"
          />
          <StatCard
            key="stat-sampah"
            icon={<Recycle />}
            title="Sampah Ditabung"
            value={`${userStats?.total_setor_sampah || user.total_setor_sampah || 0} Kg`}
            color="#4CAF50"
          />
          <StatCard
            key="stat-badge"
            icon={<Award />}
            title="Badge"
            value={userBadges.length}
            color="#9C27B0"
          />
          <StatCard
            key="stat-rank"
            icon={<TrendingUp />}
            title="Peringkat"
            value={`#${userStats?.rank || userStats?.peringkat || (leaderboard.findIndex(l => l.user_id == user?.user_id) + 1) || '-'}`}
            color="#2196F3"
          />
        </div>
      </section>

      {/* Leaderboard & Badges Row */}
      <div className="dashboardRow">
        {/* Leaderboard */}
        <section className="leaderboardSection">
          <h2 className="sectionTitle">
            <Trophy size={20} />
            Leaderboard
          </h2>
          <div className="leaderboardList">
            {leaderboard.slice(0, 10).map((leader, index) => {
              const currentUserId = user?.user_id || localStorage.getItem('id_user');
              return (
                <div
                  key={leader.user_id}
                  className={`leaderboardItem ${leader.user_id == currentUserId ? 'currentUser' : ''}`}
                >
                  <span className="leaderRank">#{index + 1}</span>
                  <span className="leaderName">{leader.nama}</span>
                  <span className="leaderPoints">{leader.total_poin} pts</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* User Badges */}
        <section className="badgesSection">
          <h2 className="sectionTitle">
            <Award size={20} />
            Badges Anda ({userBadges.length})
          </h2>
          {userBadges.length > 0 ? (
            <div className="badgesList">
              {userBadges.map((badge) => {
                // Get badge icon URL from API
                const getBadgeIconUrl = (icon) => {
                  if (!icon) return null;
                  if (icon.startsWith('http')) return icon;
                  const cleanPath = icon.startsWith('storage/') ? icon : `storage/${icon}`;
                  return `http://127.0.0.1:8000/${cleanPath}`;
                };
                const iconUrl = getBadgeIconUrl(badge.icon || badge.gambar || badge.icon_url);
                
                return (
                  <div key={badge.badge_id || badge.id} className="badgeItem">
                    <span className="badgeIcon">
                      {iconUrl ? (
                        <img 
                          src={iconUrl} 
                          alt={badge.nama_badge || 'Badge'} 
                          className="badgeIconImg"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                        />
                      ) : null}
                      <span style={{ display: iconUrl ? 'none' : 'block' }}>🏅</span>
                    </span>
                    <div className="badgeInfo">
                      <p className="badgeName">{badge.nama_badge || badge.nama || 'Badge'}</p>
                      <p className="badgeReward">+{badge.reward_poin || badge.poin || 0} poin</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="emptyState">Belum ada badge. Tabung sampah untuk mendapatkan badge!</p>
          )}
        </section>
      </div>

      {/* Recent Activity */}
      <section className="activitySection">
        <h2 className="sectionTitle">
          <Activity size={20} />
          Aktivitas Terbaru
        </h2>
        {recentActivities.length > 0 ? (
          <div className="activityList">
            {recentActivities.map((activity, index) => (
              <div key={activity.id || `activity-${index}`} className="activityItem">
                <div className="activityIcon">
                  {activity.tipe_aktivitas === 'tabung_sampah' || activity.tipe_aktivitas === 'setor_sampah' ? '♻️' :
                   activity.tipe_aktivitas === 'tukar_poin' || activity.tipe_aktivitas === 'penukaran_produk' ? '🛍️' :
                   activity.tipe_aktivitas === 'penarikan_tunai' || activity.tipe_aktivitas === 'tarik_tunai' ? '💰' : ''}
                </div>
                <div className="activityContent">
                  <p className="activityDesc">{activity.deskripsi}</p>
                  <p className="activityDate">
                    {new Date(activity.tanggal || activity.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {activity.poin_perubahan !== 0 && activity.poin_perubahan !== undefined && (
                  <span className={`activityPoints ${activity.poin_perubahan > 0 ? 'positive' : 'negative'}`}>
                    {activity.poin_perubahan > 0 ? '+' : ''}{activity.poin_perubahan} poin
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="emptyState">Belum ada aktivitas</p>
        )}
      </section>

      {/* Banner & Articles */}

      <section className="artikelSection">
        <h2 className="artikelTitle">
          <Recycle size={20} style={{ marginRight: "8px" }} />
          Artikel Terbaru
        </h2>
        <div className="artikelGrid">
          <ArtikelCard fetchFromAPI={true} perPage={6} />
        </div>
      </section>
    </div>
  );
};

function StatCard({ icon, title, value, color }) {
  return (
    <div className="statCard">
      <div className="statIcon" style={{ color }}>
        {icon}
      </div>
      <div className="statInfo">
        <p className="statTitle">{title}</p>
        <p className="statValue">{value}</p>
      </div>
    </div>
  );
}

export default HomeContent;
