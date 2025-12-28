import React, { useState, useEffect } from "react";
import { Trophy, Target, Medal, TrendingUp } from "lucide-react";
import { API_BASE_URL } from "../../../config/api";
import "./leaderboardHeader.css";

const LeaderboardHeader = () => {
  const [stats, setStats] = useState({
    poin: 0,
    sampah: 0,
    peringkat: '—',
    totalPeserta: 0,
    poinRatio: 0,
    weeklyIncrease: 0,
    seasonPoin: 0,  // New: season-specific points
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('id_user');

        if (!token || !userId) {
          // Set some default stats for unauthenticated users
          setStats({
            poin: 0,
            sampah: 0,
            peringkat: '—',
            totalPeserta: 0,
            poinRatio: 0,
            weeklyIncrease: 0,
            seasonPoin: 0,
          });
          setLoading(false);
          return;
        }

        // Calculate current season dates
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const seasonNumber = Math.floor(month / 3) + 1;
        const seasonStartMonth = (seasonNumber - 1) * 3;
        const seasonEndMonth = seasonStartMonth + 2;
        const seasonStart = new Date(year, seasonStartMonth, 1).toISOString().split('T')[0];
        const seasonEnd = new Date(year, seasonEndMonth + 1, 0).toISOString().split('T')[0];

        // Build leaderboard URL with season filter
        const leaderboardUrl = `${API_BASE_URL}/dashboard/leaderboard?period=season&start_date=${seasonStart}&end_date=${seasonEnd}`;

        // Fetch with timeout helper for slow backend
        const fetchWithTimeout = async (url, options, timeout = 15000) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            return response;
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        };

        // Fetch user stats and leaderboard in parallel with timeout
        const [userStatsResponse, leaderboardResponse] = await Promise.allSettled([
          fetchWithTimeout(`${API_BASE_URL}/dashboard/stats/${userId}`, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetchWithTimeout(leaderboardUrl, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }),
        ]);

        // Continue even if one fails, use available data
        let userStatsData = null;
        let leaderboardData = null;

        if (userStatsResponse.status === 'fulfilled' && userStatsResponse.value.ok) {
          userStatsData = await userStatsResponse.value.json();
        }

        if (leaderboardResponse.status === 'fulfilled' && leaderboardResponse.value.ok) {
          leaderboardData = await leaderboardResponse.value.json();
        }

        // Extract user stats from the appropriate response
        let userPoints = 0;
        let userWaste = 0;
        let weeklyWaste = 0;
        let userRank = null;
        const currentUserId = parseInt(userId, 10);

        // Try to extract from userStatsData first (if it has user object)
        if (userStatsData?.user) {
          userPoints = userStatsData.user.display_poin || userStatsData.user.actual_poin || userStatsData.user.poin || 0;
          userWaste = userStatsData.user.total_setor_sampah || userStatsData.user.sampah || 0;
        } else if (userStatsData?.statistics) {
          userPoints = userStatsData.statistics.display_poin || userStatsData.statistics.actual_poin || userStatsData.statistics.poin || 0;
          userWaste = userStatsData.statistics.total_setor_sampah || userStatsData.statistics.sampah || 0;
        }

        // Get leaderboard array - try multiple possible structures
        let leaderboard = [];
        if (leaderboardData?.data && Array.isArray(leaderboardData.data)) {
          leaderboard = leaderboardData.data;
        } else if (Array.isArray(leaderboardData)) {
          leaderboard = leaderboardData;
        }

        const totalPeserta = Array.isArray(leaderboard) ? leaderboard.length : 0;

        // Find current user in leaderboard
        if (Array.isArray(leaderboard) && leaderboard.length > 0) {
          const currentUser = leaderboard.find(user => {
            const leaderboardUserId = parseInt(user.user_id || user.id, 10);
            return leaderboardUserId === currentUserId;
          });

          if (currentUser) {
            userRank = currentUser.rank || null;
            // If we didn't get points from user stats API, use leaderboard data
            if (userPoints === 0) {
              userPoints = currentUser.display_poin || currentUser.actual_poin || currentUser.poin || 0;
            }
            if (userWaste === 0) {
              userWaste = currentUser.total_setor_sampah || 0;
            }
          }
        }

        // Calculate user's rank position
        let peringkat = '—';
        if (userRank) {
          peringkat = `#${userRank}`;
        }

        // Calculate average points for ratio
        let poinRatio = 0;
        if (Array.isArray(leaderboard) && leaderboard.length > 0) {
          const totalPoints = leaderboard.reduce((sum, user) => {
            return sum + (user.display_poin || user.actual_poin || user.poin || 0);
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
          seasonPoin: userPoints, // For now, same as total (backend should return season-specific)
        });
      } catch {
        // Set default stats on error
        setStats({
          poin: 0,
          sampah: 0,
          peringkat: '—',
          totalPeserta: 0,
          poinRatio: 0,
          weeklyIncrease: 0,
          seasonPoin: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Get current season info for display
  const getSeasonInfo = () => {
    const now = new Date();
    const month = now.getMonth();
    const seasonNumber = Math.floor(month / 3) + 1;
    return `Season ${seasonNumber} ${now.getFullYear()}`;
  };

  const statsCards = [
    {
      title: "Poin Season Ini",
      value: loading ? "..." : `${stats.poin.toLocaleString('id-ID')}`,
      description: loading ? "Memuat..." : getSeasonInfo(),
      icon: <Trophy size={20} />,
    },
    {
      title: "Total Sampahmu",
      value: loading ? "..." : `${stats.sampah.toLocaleString('id-ID')} Kg`,
      description: loading ? "Memuat..." : stats.weeklyIncrease > 0 
        ? `+${stats.weeklyIncrease} Kg minggu ini` 
        : 'Terus tabung sampahmu!',
      icon: <Target size={20} />,
    },
    {
      title: "Peringkat Season",
      value: loading ? "..." : stats.peringkat,
      description: loading ? "Memuat..." : `dari ${Number.isFinite(stats.totalPeserta) ? stats.totalPeserta.toLocaleString('id-ID') : 0} peserta`,
      icon: <Medal size={20} />,
    },
    {
      title: "Performa",
      value: loading ? "..." : `${stats.poinRatio}x`,
      description: loading ? "Memuat..." : "dari rata-rata peserta",
      icon: <TrendingUp size={20} />,
    },
  ];

  return (
    <section className="leaderboard-header">
      <div className="user-info-header">
        <h2>Leaderboard</h2>
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