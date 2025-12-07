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

        if (!userStatsResponse.ok || !leaderboardResponse.ok) {
          throw new Error(`Failed to fetch stats: user(${userStatsResponse.status}), leaderboard(${leaderboardResponse.status})`);
        }

        const userStatsData = await userStatsResponse.json();
        const leaderboardData = await leaderboardResponse.json();

        console.log('User stats full response:', userStatsData);
        console.log('Leaderboard full response:', leaderboardData);

        // Extract user stats (handle different response structures)
        const userStats = userStatsData.data || userStatsData;
        const userPoints = userStats.total_poin || userStats.poin_terkumpul || userStats.poin || 0;
        const userWaste = userStats.total_sampah || userStats.sampah_terkumpul || userStats.sampah || 0;
        const weeklyWaste = userStats.sampah_minggu_ini || userStats.weekly_waste || 0;

        console.log('Extracted user points:', userPoints);
        console.log('Extracted user waste:', userWaste);
        console.log('Extracted weekly waste:', weeklyWaste);
        console.log('===== END DEBUG =====' );

        // Extract leaderboard data
        const leaderboard = leaderboardData.data || leaderboardData.leaderboard || leaderboardData;
        const totalPeserta = Array.isArray(leaderboard) ? leaderboard.length : 0;

        // Calculate user's rank
        let peringkat = '—';
        if (Array.isArray(leaderboard) && leaderboard.length > 0) {
          // Find user's position in leaderboard
          const userIndex = leaderboard.findIndex(user => {
            // Check all possible ID field names and compare as numbers
            const leaderboardUserId = user.user_id || user.id || user.id_user;
            const currentUserId = parseInt(userId, 10);
            const leaderboardUserIdNum = parseInt(leaderboardUserId, 10);
            
            return leaderboardUserIdNum === currentUserId;
          });
          
          if (userIndex !== -1) {
            peringkat = `#${userIndex + 1}`;
          }
        }

        // Calculate average points
        let poinRatio = 0;
        if (Array.isArray(leaderboard) && leaderboard.length > 0) {
          const totalPoints = leaderboard.reduce((sum, user) => {
            const points = user.total_poin || user.poin_terkumpul || user.points || 0;
            return sum + points;
          }, 0);
          const avgPoints = totalPoints / leaderboard.length;
          poinRatio = avgPoints > 0 ? (userPoints / avgPoints).toFixed(1) : 0;
        }

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