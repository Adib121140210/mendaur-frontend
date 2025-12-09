import React, { useState, useEffect, useMemo } from "react";
import { Search, TrendingUp, Clock, Calendar, Loader2 } from "lucide-react";
import "./leaderboardTable.css";
import Pagination from "../../ui/pagination";

export default function LeaderboardTable() {
  // State Management
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [timePeriod, setTimePeriod] = useState("all"); // all, monthly, weekly
  const itemsPerPage = 10;

  // Get current user ID
  const currentUserId = localStorage.getItem('id_user');

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

        const response = await fetch('http://127.0.0.1:8000/api/dashboard/leaderboard', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data leaderboard');
        }

        const result = await response.json();
        console.log('Leaderboard API response:', result);

        // Handle different API response structures
        const data = result.data || result.leaderboard || result;

        if (Array.isArray(data)) {
          setLeaderboardData(data);
        } else {
          throw new Error('Format data leaderboard tidak valid');
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timePeriod]); // Re-fetch when time period changes

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
    { value: 'all', label: 'Sepanjang Waktu', icon: <TrendingUp size={16} /> },
    { value: 'monthly', label: 'Bulan Ini', icon: <Calendar size={16} /> },
    { value: 'weekly', label: 'Minggu Ini', icon: <Clock size={16} /> },
  ];

  return (
    <section className="leaderboardContainer">
      <div className="leaderboardHeader">
        <h1 className="leaderboardTitle">Peringkat Pengguna</h1>

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
            onClick={() => window.location.reload()}
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
              : 'Belum ada data leaderboard'}
          </p>
        </div>
      )}

      {/* Leaderboard Table */}
      {!loading && !error && filteredUsers.length > 0 && (
        <>
          <div className="leaderboardTableWrapper">
            <table className="leaderboardTable" aria-label="Tabel peringkat pengguna berdasarkan poin">
              <thead>
                <tr>
                  <th className="rankColumn">Peringkat</th>
                  <th className="nameColumn">Nama</th>
                  <th className="sampahColumn">Sampah (Kg)</th>
                  <th className="poinColumn">Poin</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => {
                  const globalIndex = startIndex + index;
                  const rankClass =
                    globalIndex === 0
                      ? "rankingGold"
                      : globalIndex === 1
                      ? "rankingSilver"
                      : globalIndex === 2
                      ? "rankingBronze"
                      : "";

                  // Check if this is the current user
                  const isCurrentUser = String(user.user_id) === String(currentUserId);

                  // Get user data (handle different API field names)
                  const userName = user.nama || user.nama_user || user.name || 'Unknown';
                  const userWaste = user.total_sampah || user.sampah_terkumpul || user.waste_collected || 0;
                  const userPoints = user.total_poin || user.poin_terkumpul || user.points || 0;

                  return (
                    <tr
                      key={user.user_id || `user-${globalIndex}`}
                      className={isCurrentUser ? 'currentUserRow' : ''}
                    >
                      <td className={`rankColumn ranking ${rankClass}`}>
                        {globalIndex === 0 && '🥇'}
                        {globalIndex === 1 && '🥈'}
                        {globalIndex === 2 && '🥉'}
                        {globalIndex > 2 && `#${globalIndex + 1}`}
                      </td>
                      <td className="nameColumn">
                        {userName}
                        {isCurrentUser && <span className="youBadge">Anda</span>}
                      </td>
                      <td className="sampahColumn">{userWaste.toLocaleString('id-ID')} Kg</td>
                      <td className="poinColumn">
                        {userPoints.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
