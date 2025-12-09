import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../../../services/api";
import "./achievementList.css";
import {
  Medal,
  Star,
  Users,
  CheckCircle,
  Lock,
  Recycle,
  Trophy,
  Target,
  Zap,
} from "lucide-react";

// Icon mapping by badge type
const iconMapByType = {
  "setor_sampah": <Recycle size={48} className="badgeIcon" />,
  "poin": <Star size={48} className="badgeIcon" />,
  "leaderboard": <Trophy size={48} className="badgeIcon" />,
  "konsistensi": <Target size={48} className="badgeIcon" />,
  "general": <Medal size={48} className="badgeIcon" />,
};

// Icon mapping by badge ID (fallback)
const iconMap = {
  "badge-001": <Medal size={48} className="badgeIcon" />,
  "badge-002": <Star size={48} className="badgeIcon" />,
  "badge-003": <Users size={48} className="badgeIcon" />,
};

// Badge card
function BadgeCard({ badge }) {
  const isUnlocked = badge.isUnlocked;
  // Use progressPercent from API if available, otherwise calculate it
  const progressPercent = badge.progressPercent !== undefined
    ? badge.progressPercent
    : (badge.target > 0 ? Math.min((badge.progress / badge.target) * 100, 100) : 0);

  // Choose icon based on badge type, ID, or default
  const getIcon = () => {
    if (isUnlocked) {
      return <CheckCircle size={48} className="badgeIcon complete" />;
    }
    // Try badge type first
    if (badge.tipe && iconMapByType[badge.tipe]) {
      return iconMapByType[badge.tipe];
    }
    // Try badge ID
    if (badge.id_badge && iconMap[badge.id_badge]) {
      return iconMap[badge.id_badge];
    }
    // Default locked icon
    return <Lock size={48} className="badgeIcon" />;
  };

  const icon = getIcon();

  return (
    <div className={`achievementCard ${isUnlocked ? "unlocked" : "locked"}`}>
      <div className="achievementThumbnail">
        {badge.icon ? (
          <img src={badge.icon} alt={badge.nama_badge} style={{ width: '48px', height: '48px' }} />
        ) : (
          <div className="thumbnailIcon">{icon}</div>
        )}
      </div>

      <div className="achievementContent">
        <h3 className="achievementTitle">{badge.nama_badge}</h3>
        <p className="achievementDesc">{badge.deskripsi || 'Raih badge ini!'}</p>

        {/* Reward Points Display */}
        <div className="badgeRewardSection">
          <span className="rewardLabel">
            <Star size={14} style={{ marginRight: '4px' }} />
            Reward:
          </span>
          <span className="rewardPoints">+{badge.reward_poin || 0} Poin</span>
        </div>

        <div className="achievementTags">
          <span className="badgeTag">{badge.kategori?.toUpperCase() || 'BADGE'}</span>
          <span className="badgeTag">• {isUnlocked ? "UNLOCKED" : "LOCKED"}</span>
        </div>

        {!isUnlocked && badge.target > 0 && (
          <>
            <div className="progressBar">
              <div className="progressFill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="progressText">
              {badge.progress} / {badge.target} {badge.requirement_type === 'poin' ? 'poin' : 'penyetoran'}
            </p>
          </>
        )}

        {isUnlocked && badge.unlocked_at && (
          <p className="unlockedDate">
            Didapat: {new Date(badge.unlocked_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        )}
      </div>
    </div>
  );
}

// Main component
export default function AchievementList() {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [userBadges, setUserBadges] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ all: 0, unlocked: 0, locked: 0 });
  const [message, setMessage] = useState("");
  const [totalRewardsEarned, setTotalRewardsEarned] = useState(0);
  const [totalPossibleRewards, setTotalPossibleRewards] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchBadges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, filter]);

  // Fetch total rewards separately on mount (independent of filter)
  useEffect(() => {
    if (user?.id) {
      fetchTotalRewards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchTotalRewards = async () => {
    try {
      // Fetch ALL badges to calculate total rewards
      const result = await apiGet(`/users/${user.id}/badges-list?filter=all`);

      if (result.status === 'success') {
        const badges = result.data || [];

        // Calculate total rewards earned (only unlocked badges)
        const earned = badges
          .filter(b => b.is_unlocked)
          .reduce((sum, badge) => sum + (badge.reward_poin || 0), 0);

        // Calculate total possible rewards (all badges)
        const possible = badges
          .reduce((sum, badge) => sum + (badge.reward_poin || 0), 0);

        setTotalRewardsEarned(earned);
        setTotalPossibleRewards(possible);
      }
    } catch (error) {
      console.error('Error fetching total rewards:', error.message);
    }
  };

  const fetchBadges = async () => {
    try {
      setLoading(true);

      // Fetch badges with progress using the new optimized endpoint
      const result = await apiGet(`/users/${user.id}/badges-list?filter=${filter}`);

      if (result.status === 'success') {
        const badges = result.data || [];

        // Update counts from API response
        if (result.counts) {
          setCounts(result.counts);
        }

        // Update message from API response
        if (result.message) {
          setMessage(result.message);
        }

        // Map the new API structure to our component structure
        const badgesWithStatus = badges.map(badge => ({
          ...badge,
          badge_id: badge.badge_id || badge.id,
          nama_badge: badge.nama,
          isUnlocked: badge.is_unlocked,
          unlocked_at: badge.unlocked_at,
          progress: badge.current_value || 0,
          target: badge.target_value || 0,
          progressPercent: badge.progress_percentage || 0,
          requirement_type: badge.syarat_poin > 0 ? 'poin' : 'setor',
          kategori: badge.tipe || 'general',
          reward_poin: badge.reward_poin || 0
        }));

        setAllBadges(badgesWithStatus);
        setUserBadges(badges.filter(b => b.is_unlocked));
      }
    } catch (error) {
      console.error('Error fetching badges:', error.message);
      setAllBadges([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading badges...</div>;
  }

  return (
    <>
      {/* Badge Rewards Summary */}
      {counts.unlocked > 0 && (
        <div className="badgeRewardsSummary">
          <div className="rewardsSummaryCard">
            <div className="summaryIcon">🏆</div>
            <div className="summaryContent">
              <h3 className="summaryTitle">Total Badge Rewards</h3>
              <p className="summaryValue">
                <span className="earnedPoints">{totalRewardsEarned}</span>
                <span className="totalPoints"> / {totalPossibleRewards} Poin</span>
              </p>
              <div className="summaryProgressBar">
                <div
                  className="summaryProgressFill"
                  style={{ width: `${totalPossibleRewards > 0 ? (totalRewardsEarned / totalPossibleRewards) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="summarySubtext">
                {counts.unlocked} dari {counts.all} badge terkumpul
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="badgeFilter">
        <button
          className={`filterButton ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          <span className="filterIcon">📋</span>
          <span className="filterText">
            <span className="filterLabel">Semua Badge</span>
            <span className="filterCount">{counts.all}</span>
          </span>
        </button>

        <button
          className={`filterButton ${filter === "unlocked" ? "active" : ""}`}
          onClick={() => setFilter("unlocked")}
        >
          <span className="filterIcon">✅</span>
          <span className="filterText">
            <span className="filterLabel">Sudah Didapat</span>
            <span className="filterCount">{counts.unlocked}</span>
          </span>
        </button>

        <button
          className={`filterButton ${filter === "locked" ? "active" : ""}`}
          onClick={() => setFilter("locked")}
        >
          <span className="filterIcon">🔒</span>
          <span className="filterText">
            <span className="filterLabel">Belum Didapat</span>
            <span className="filterCount">{counts.locked}</span>
          </span>
        </button>
      </div>

      {/* Results count - Use message from API if available */}
      <div className="filterResults">
        <p className="resultsText">
          {message || `Menampilkan ${allBadges.length} badge`}
        </p>
      </div>

      {/* Badge List */}
      <div className="achievementList">
        {allBadges.length === 0 ? (
          <div className="emptyState">
            <div className="emptyIcon">
              {filter === 'unlocked' ? '🎯' : filter === 'locked' ? '🎉' : '🔍'}
            </div>
            <p className="emptyTitle">
              {filter === 'unlocked'
                ? 'Belum ada badge yang didapat'
                : filter === 'locked'
                ? 'Semua badge sudah didapat!'
                : 'Tidak ada badge tersedia'}
            </p>
            <p className="emptySubtext">
              {filter === 'unlocked'
                ? 'Mulai setor sampah untuk mendapatkan badge pertamamu!'
                : filter === 'locked'
                ? 'Selamat! Kamu sudah mengumpulkan semua badge! 🎊'
                : 'Badge akan muncul di sini'}
            </p>
          </div>
        ) : (
          allBadges.map((badge, index) => (
            <BadgeCard key={badge.badge_id || `badge-${index}`} badge={badge} />
          ))
        )}
      </div>
    </>
  );
}
