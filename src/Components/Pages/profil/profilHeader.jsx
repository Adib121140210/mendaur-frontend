import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserBadges } from "../../../services/api";
import "../profil/profilHeader.css";

export default function ProfilHeader() {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState([]);
  const [activeBadge, setActiveBadge] = useState(null);

  const fetchUserBadges = async () => {
    try {
      const result = await getUserBadges(user.user_id);

      if (result.status === 'success') {
        setUserBadges(result.data || []);

        // Set active badge from localStorage or first badge
        const savedBadge = localStorage.getItem("badge_aktif");
        if (savedBadge) {
          setActiveBadge(parseInt(savedBadge, 10));
        } else if (result.data.length > 0) {
          setActiveBadge(result.data[0].badge_id);
        }
      }
    } catch (error) {
      console.warn("Badges API not available yet:", error.message);
    }
  };

  // Fetch user badges from backend
  useEffect(() => {
    if (user?.user_id) {
      fetchUserBadges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const handleSelectBadge = (badgeId) => {
    setActiveBadge(badgeId);
    localStorage.setItem("badge_aktif", badgeId);
  };

  const currentBadge = userBadges.find(b => b.badge_id === activeBadge);

  // Generate avatar URL
  const getAvatarUrl = () => {
    if (user.foto_profil) {
      return `http://127.0.0.1:8000/storage/${user.foto_profil}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama)}&size=120&background=4CAF50&color=fff&bold=true`;
  };

  return (
    <div className="profilHeader">
      <div className="profilInfo">
        <img
          src={getAvatarUrl()}
          alt={`${user.nama} profile`}
          className="profilAvatar"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama || 'User')}&size=120&background=4CAF50&color=fff&bold=true`;
          }}
        />
        <div>
          <h2 className="profilName">{user.nama}</h2>
          <p className="profilEmail">{user.email}</p>
          <span className="profilBadge">
            {user.level || "Member"} • {user.total_poin || 0} Poin
          </span>
          {currentBadge && (
            <span className="profilBadge">
              🏆 {currentBadge.nama_badge || "Badge Aktif"}
            </span>
          )}
        </div>
      </div>

      {userBadges.length > 0 && (
        <div className="badgeSelector">
          <h4>Pilih Badge Aktif:</h4>
          <div className="badgeList">
            {userBadges.map((b, index) => (
              <button
                key={b.badge_id || `badge-${index}`}
                className={`badgeOption ${activeBadge === b.badge_id ? "selected" : ""}`}
                onClick={() => handleSelectBadge(b.badge_id)}
                title={`Reward: +${b.reward_poin || 0} poin`}
              >
                <span className="badgeIconMini">🏆</span>
                <div className="badgeOptionInfo">
                  <span className="badgeOptionName">{b.nama_badge || `Badge ${b.badge_id}`}</span>
                  <span className="badgeOptionReward">+{b.reward_poin || 0} poin</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {userBadges.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '1rem' }}>
          Belum memiliki badge. Setor sampah untuk mendapatkan badge!
        </p>
      )}
    </div>
  );
}
