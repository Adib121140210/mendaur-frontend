import React, { useState, useEffect } from "react";
import { Trophy, Target, Medal } from "lucide-react";
import "./leaderboardHeader.css";

const LeaderboardHeader = () => {
  const [stats, setStats] = useState({
    poin: 0,
    sampah: 0,
    peringkat: '—',
    totalPeserta: 0,
    poinRatio: 0,
    weeklyIncrease: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('id_user');

        // Add detailed logging
        console.log('===== LEADERBOARD STATS DEBUG =====');
        console.log('Fetching stats for user:', userId);
        console.log('Token available:', !!token);

        if (!token || !userId) {
          console.warn('No authentication token or user ID found');
          // Set some default stats for unauthenticated users
          setStats({
            poin: 0,
            sampah: 0,
            peringkat: '—',
            totalPeserta: 0,
            poinRatio: 0,
            weeklyIncrease: 0,
          });
          setLoading(false);
          return;
        }

        // Fetch user stats and leaderboard in parallel
        const [userStatsResponse, leaderboardResponse] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/dashboard/stats/${userId}`, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch('http://127.0.0.1:8000/api/dashboard/leaderboard', {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }),
        ]);

        console.log('User stats response status:', userStatsResponse.status);
        console.log('Leaderboard response status:', leaderboardResponse.status);

        // If either request fails, log the error and show default stats
        if (!userStatsResponse.ok) {
          console.error(`User stats API error: ${userStatsResponse.status} ${userStatsResponse.statusText}`);
          const errorBody = await userStatsResponse.text();
          console.error('Response body:', errorBody);
        }

        if (!leaderboardResponse.ok) {
          console.error(`Leaderboard API error: ${leaderboardResponse.status} ${leaderboardResponse.statusText}`);
          const errorBody = await leaderboardResponse.text();
          console.error('Response body:', errorBody);
        }

        // Continue even if one fails, use available data
        let userStatsData = null;
        let leaderboardData = null;

        if (userStatsResponse.ok) {
          userStatsData = await userStatsResponse.json();
          console.log('User stats response:', userStatsData);
        }

        if (leaderboardResponse.ok) {
          leaderboardData = await leaderboardResponse.json();
          console.log('Leaderboard response:', leaderboardData);
        }

        // Extract user stats from the appropriate response
        let userPoints = 0;
        let userWaste = 0;
        let weeklyWaste = 0;
        let userRank = null;
        const currentUserId = parseInt(userId, 10);

        // Try to extract from userStatsData first (if it has user object)
        if (userStatsData?.user) {
          console.log('Using user stats from /api/dashboard/stats/{userId}');
          userPoints = userStatsData.user.total_poin || userStatsData.user.poin || 0;
          userWaste = userStatsData.user.total_setor_sampah || userStatsData.user.sampah || 0;
        } else if (userStatsData?.statistics) {
          console.log('Using statistics from /api/dashboard/stats/{userId}');
          userPoints = userStatsData.statistics.total_poin || userStatsData.statistics.poin || 0;
          userWaste = userStatsData.statistics.total_setor_sampah || userStatsData.statistics.sampah || 0;
        }

        // Get leaderboard array - try multiple possible structures
        let leaderboard = [];
        if (leaderboardData?.data && Array.isArray(leaderboardData.data)) {
          leaderboard = leaderboardData.data;
          console.log('Got leaderboard from leaderboardData.data');
        } else if (Array.isArray(leaderboardData)) {
          leaderboard = leaderboardData;
          console.log('Got leaderboard directly');
        }

        const totalPeserta = Array.isArray(leaderboard) ? leaderboard.length : 0;

        console.log('Leaderboard array length:', totalPeserta);
        console.log('Looking for user ID:', currentUserId);

        // Find current user in leaderboard
        if (Array.isArray(leaderboard) && leaderboard.length > 0) {
          const currentUser = leaderboard.find(user => {
            const leaderboardUserId = parseInt(user.user_id || user.id, 10);
            console.log('Comparing:', leaderboardUserId, '===', currentUserId, '?', leaderboardUserId === currentUserId);
            return leaderboardUserId === currentUserId;
          });

          if (currentUser) {
            console.log('Found current user in leaderboard:', currentUser);
            userRank = currentUser.rank || null;
            // If we didn't get points from user stats API, use leaderboard data
            if (userPoints === 0) {
              userPoints = currentUser.total_poin || 0;
            }
            if (userWaste === 0) {
              userWaste = currentUser.total_setor_sampah || 0;
            }
          } else {
            console.warn('Current user not found in leaderboard');
          }
        }

        console.log('Extracted user points:', userPoints);
        console.log('Extracted user waste:', userWaste);
        console.log('Extracted user rank:', userRank);

        // Calculate user's rank position
        let peringkat = '—';
        if (userRank) {
          peringkat = `#${userRank}`;
        }

        // Calculate average points for ratio
        let poinRatio = 0;
        if (Array.isArray(leaderboard) && leaderboard.length > 0) {
          const totalPoints = leaderboard.reduce((sum, user) => {
            return sum + (user.total_poin || 0);
          }, 0);
          const avgPoints = totalPoints / leaderboard.length;
          poinRatio = avgPoints > 0 ? (userPoints / avgPoints).toFixed(1) : 0;
        }

        console.log('Final stats:', { userPoints, userWaste, peringkat, totalPeserta, poinRatio, weeklyWaste });
        console.log('===== END DEBUG =====');

        setStats({
          poin: userPoints,
          sampah: userWaste,
          peringkat,
          totalPeserta,
          poinRatio,
          weeklyIncrease: weeklyWaste,
        });
      } catch (err) {
        console.error('Error fetching leaderboard stats:', err);
        // Set default stats on error
        setStats({
          poin: 0,
          sampah: 0,
          peringkat: '—',
          totalPeserta: 0,
          poinRatio: 0,
          weeklyIncrease: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: "Poinmu",
      value: loading ? "..." : `${stats.poin.toLocaleString('id-ID')}`,
      description: loading ? "Memuat..." : `${stats.poinRatio}x dari rata-rata`,
      icon: <Trophy size={20} />,
    },
    {
      title: "Kapasitas Sampahmu",
      value: loading ? "..." : `${stats.sampah.toLocaleString('id-ID')} Kg`,
      description: loading ? "Memuat..." : stats.weeklyIncrease > 0 
        ? `+${stats.weeklyIncrease} Kg minggu ini` 
        : 'Belum ada data minggu ini',
      icon: <Target size={20} />,
    },
    {
      title: "Peringkatmu",
      value: loading ? "..." : stats.peringkat,
      description: loading ? "Memuat..." : `dari ${Number.isFinite(stats.totalPeserta) ? stats.totalPeserta.toLocaleString('id-ID') : 0} peserta`,
      icon: <Medal size={20} />,
    },
  ];

  return (
    <section className="leaderboard-header">
      <div className="user-info-header">
        <h2> Leaderboard</h2>
        <span>Lihat peringkat dan pencapaian Anda dibandingkan dengan anggota komunitas lainnya</span>
      </div>
      <div className="statsCardRow">
        {statsCards.map((stat, index) => (
          <div key={stat.title || index} className="infoCard">
            <div className="cardTop">
              <p className="cardTitle">{stat.title}</p>
              <div className="cardIcon">{stat.icon}</div>
            </div>
            <p className="cardValue">{stat.value}</p>
            <p className="cardDescription">{stat.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LeaderboardHeader;