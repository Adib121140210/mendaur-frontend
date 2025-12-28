import React, { useState, useEffect, useMemo } from "react";
import { Search, TrendingUp, Clock, Calendar, Loader2, Trophy, Timer, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "../../../config/api";
import "./leaderboardTable.css";
import Pagination from "../../ui/pagination";

export default function LeaderboardTable() {
  // State Management
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [timePeriod, setTimePeriod] = useState("season"); // season, monthly, weekly, all
  const [seasonInfo, setSeasonInfo] = useState(null);
  const itemsPerPage = 10;

  // Get current user ID
  const currentUserId = localStorage.getItem('id_user');

  // Calculate current season info (example: quarterly seasons)
  useEffect(() => {
    const calculateSeasonInfo = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // 0-11
      
      // Define seasons (quarterly - adjust as needed)
      // Season 1: Jan-Mar, Season 2: Apr-Jun, Season 3: Jul-Sep, Season 4: Oct-Dec
      const seasonNumber = Math.floor(month / 3) + 1;
      const seasonStartMonth = (seasonNumber - 1) * 3;
      const seasonEndMonth = seasonStartMonth + 2;
      
      const seasonStart = new Date(year, seasonStartMonth, 1);
      const seasonEnd = new Date(year, seasonEndMonth + 1, 0, 23, 59, 59); // Last day of end month
      
      // Calculate time remaining
      const timeRemaining = seasonEnd.getTime() - now.getTime();
      const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      const seasonNames = ['Musim Semi', 'Musim Panas', 'Musim Gugur', 'Musim Dingin'];
      
      setSeasonInfo({
        name: `Season ${seasonNumber} ${year}`,
        displayName: seasonNames[seasonNumber - 1],
        number: seasonNumber,
        year,
        startDate: seasonStart.toISOString().split('T')[0],
        endDate: seasonEnd.toISOString().split('T')[0],
        startFormatted: seasonStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        endFormatted: seasonEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        daysRemaining,
        hoursRemaining,
        isEnding: daysRemaining <= 7, // Flag if season ending soon
      });
    };
    
    calculateSeasonInfo();
    
    // Update every hour
    const interval = setInterval(calculateSeasonInfo, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  // Fetch leaderboard data from API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Anda harus login untuk melihat leaderboard');
        }

        // Build URL with period filter
        let url = `${API_BASE_URL}/dashboard/leaderboard`;
        const params = new URLSearchParams();
        
        // Add period filter to API call
        if (timePeriod !== 'all') {
          params.append('period', timePeriod);
        }
        
        // Add season dates if season filter is active
        if (timePeriod === 'season' && seasonInfo) {
          params.append('start_date', seasonInfo.startDate);
          params.append('end_date', seasonInfo.endDate);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        // Fetch with timeout for slow backend (15 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('Gagal mengambil data leaderboard');
        }

        const result = await response.json();

        // Handle different API response structures
        const data = result.data || result.leaderboard || result;

        if (Array.isArray(data)) {
          setLeaderboardData(data);
        } else {
          throw new Error('Format data leaderboard tidak valid');
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          setError('Request timeout - server lambat merespons');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timePeriod, seasonInfo]); // Re-fetch when time period or season changes

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    let filtered = [...leaderboardData];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(user =>
        (user.nama || user.nama_user || user.name || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // Sort by points (backend should do this, but ensure it's sorted)
    filtered.sort((a, b) => {
      const pointsA = a.total_poin || a.poin_terkumpul || a.points || 0;
      const pointsB = b.total_poin || b.poin_terkumpul || b.points || 0;
      return pointsB - pointsA;
    });

    return filtered;
  }, [leaderboardData, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Find current user's rank in full leaderboard
  const currentUserRank = useMemo(() => {
    if (!currentUserId) return null;
    const index = filteredUsers.findIndex(user =>
      String(user.user_id) === String(currentUserId)
    );
    return index >= 0 ? index + 1 : null;
  }, [filteredUsers, currentUserId]);

  // Time period filter buttons
  const timePeriods = [
    { value: 'season', label: 'Season', icon: <Trophy size={16} /> },
    { value: 'monthly', label: 'Bulan Ini', icon: <Calendar size={16} /> },
    { value: 'weekly', label: 'Minggu Ini', icon: <Clock size={16} /> },
    { value: 'all', label: 'Semua', icon: <TrendingUp size={16} /> },
  ];

  // Refresh handler
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    // Trigger re-fetch by updating a dependency
    const currentPeriod = timePeriod;
    setTimePeriod('');
    setTimeout(() => setTimePeriod(currentPeriod), 100);
  };

  return (
    <section className="leaderboardContainer">
      <div className="leaderboardHeader">
        <div className="titleRow">
          <h1 className="leaderboardTitle">Peringkat Pengguna</h1>
          <button className="refreshButton" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          </button>
        </div>
        <p className="leaderboardSubtitle">
          Kompetisi poin direset setiap 3 bulan. Raih peringkat tertinggi dan dapatkan hadiah!
        </p>

        {/* Season Banner */}
        {timePeriod === 'season' && seasonInfo && (
          <div className={`seasonBanner ${seasonInfo.isEnding ? 'ending' : ''}`}>
            <div className="seasonInfo">
              <Trophy className="seasonIcon" size={24} />
              <div className="seasonDetails">
                <span className="seasonName">{seasonInfo.name}</span>
                <span className="seasonDates">{seasonInfo.startFormatted} - {seasonInfo.endFormatted}</span>
              </div>
            </div>
            <div className="seasonCountdown">
              <Timer size={16} />
              <span>
                {seasonInfo.daysRemaining > 0 
                  ? `${seasonInfo.daysRemaining} hari ${seasonInfo.hoursRemaining} jam tersisa`
                  : 'Season berakhir hari ini!'
                }
              </span>
            </div>
            {seasonInfo.isEnding && (
              <div className="seasonWarning">
                ⚠️ Season akan segera berakhir! Raih poinmu sekarang!
              </div>
            )}
          </div>
        )}

        {/* Time Period Filters */}
        <div className="timePeriodFilters">
          {timePeriods.map(period => (
            <button
              key={period.value}
              className={`periodButton ${timePeriod === period.value ? 'active' : ''}`}
              onClick={() => setTimePeriod(period.value)}
            >
              {period.icon}
              <span>{period.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="searchBarContainer">
          <Search className="searchIcon" size={20} />
          <input
            type="text"
            className="searchInput"
            placeholder="Cari pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clearSearch"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Current User Position Badge */}
        {currentUserRank && (
          <div className="currentUserBadge">
            🏆 Peringkat Anda: <strong>#{currentUserRank}</strong> dari {filteredUsers.length} peserta
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loadingContainer">
          <Loader2 className="spinner" size={40} />
          <p>Memuat leaderboard...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="errorContainer">
          <p className="errorMessage">❌ {error}</p>
          <button
            className="retryButton"
            onClick={handleRefresh}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="emptyContainer">
          <p className="emptyMessage">
            {searchQuery
              ? `Tidak ada pengguna dengan nama "${searchQuery}"`
              : timePeriod === 'season' 
                ? 'Belum ada aktivitas di season ini. Jadilah yang pertama!'
                : 'Belum ada data leaderboard'}
          </p>
        </div>
      )}

      {/* Leaderboard Content - Data loaded once, rendered by page */}
      {!loading && !error && filteredUsers.length > 0 && (
        <>
          {/* Card View - Desktop & Mobile */}
          <div className="leaderboardCardList">
            {currentUsers.map((user, index) => {
              const globalIndex = startIndex + index;
              const isCurrentUser = String(user.user_id) === String(currentUserId);
              const userName = user.nama || user.nama_user || user.name || 'Unknown';
              const userWaste = user.total_sampah || user.sampah_terkumpul || user.waste_collected || 0;
              const userPoints = user.total_poin || user.poin_terkumpul || user.points || 0;

              const rankEmoji = globalIndex === 0 ? '🥇' : globalIndex === 1 ? '🥈' : globalIndex === 2 ? '🥉' : null;
              const rankClass = globalIndex === 0 ? 'gold' : globalIndex === 1 ? 'silver' : globalIndex === 2 ? 'bronze' : '';

              return (
                <div 
                  key={user.user_id || `user-${globalIndex}`} 
                  className={`leaderboardCard ${rankClass} ${isCurrentUser ? 'currentUser' : ''}`}
                >
                  <div className="cardRank">
                    {rankEmoji || <span className="rankNumber">#{globalIndex + 1}</span>}
                  </div>
                  <div className="cardContent">
                    <div className="cardName">
                      {userName}
                      {isCurrentUser && <span className="youBadge">Anda</span>}
                    </div>
                    <div className="cardStats">
                      <span className="cardWaste">🗑️ {userWaste.toLocaleString('id-ID')} Kg</span>
                      <span className="cardPoints">⭐ {userPoints.toLocaleString('id-ID')} Poin</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination - Total users info + navigation */}
          <div className="paginationInfo">
            Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} dari {filteredUsers.length} pengguna
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          />
        </>
      )}
    </section>
  );
}
