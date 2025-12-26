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

      console.log('Debug Info:', {
        userObject: user,
        userID: userId,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      });

      if (!token) {
        console.error('No token found. User must be authenticated.');
        setLoading(false);
        return;
      }

      if (!userId) {
        console.error('No user ID found. User data:', user, 'localStorage id_user:', localStorage.getItem('id_user'));
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
      } else {
        const errorBody = await statsRes.text();
        console.error('Stats API error:', {
          status: statsRes.status,
          statusText: statsRes.statusText,
          responseBody: errorBody.substring(0, 500),
        });
      }

      // Fetch leaderboard
      const leaderRes = await fetch('http://127.0.0.1:8000/api/dashboard/leaderboard', {
        headers,
      });
      if (leaderRes.ok) {
        const leaderData = await leaderRes.json();
        setLeaderboard(leaderData.data || []);
      } else {
        console.error('Leaderboard API error:', leaderRes.status, leaderRes.statusText);
      }

      // Fetch user badges
      const badgesRes = await fetch(`http://127.0.0.1:8000/api/users/${userId}/badges`, {
        headers,
      });
      if (badgesRes.ok) {
        const badgesData = await badgesRes.json();
        setUserBadges(badgesData.data || []);
      } else {
        console.error('Badges API error:', badgesRes.status, badgesRes.statusText);
      }

      // Fetch recent activities
      const activitiesRes = await fetch(`http://127.0.0.1:8000/api/users/${userId}/aktivitas`, {
        headers,
      });
      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setRecentActivities(activitiesData.data?.slice(0, 5) || []);
      } else {
        console.error('Activities API error:', activitiesRes.status, activitiesRes.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="homeContentWrapper">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Selamat Datang di Mendaur! 🌱</h2>
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
        <h1 className="welcomeTitle">Selamat Datang, {user.nama}! 👋</h1>
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
            value={userStats?.total_poin || user.total_poin || 0}
            color="#FFB800"
          />
          <StatCard
            key="stat-sampah"
            icon={<Recycle />}
            title="Sampah Disetor"
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
            <p className="emptyState">Belum ada badge. Setor sampah untuk mendapatkan badge!</p>
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
              <div key={activity.log_user_activity_id || `activity-${index}`} className="activityItem">
                <div className="activityIcon">
                  {activity.tipe_aktivitas === 'badge_unlock' ? '🏆' :
                   activity.tipe_aktivitas === 'setor_sampah' || activity.tipe_aktivitas === 'tabung_sampah' ? '♻️' :
                   activity.tipe_aktivitas === 'tukar_poin' || activity.tipe_aktivitas === 'penukaran_produk' ? '🛍️' :
                   activity.tipe_aktivitas === 'penarikan_tunai' || activity.tipe_aktivitas === 'tarik_tunai' ? '💰' :
                   activity.tipe_aktivitas === 'login' ? '🔑' :
                   activity.tipe_aktivitas === 'register' ? '👤' : '📊'}
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
                {activity.poin_perubahan !== 0 && (
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
