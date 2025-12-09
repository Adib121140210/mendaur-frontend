import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../profil/userData.css";
import { getUser, getUserActivity, getUserBadges } from "../../../services/api";

import { Recycle, Star, ArrowLeftRight, Calendar, Trophy, MapPin, Phone, Gift, Zap, ChevronLeft, ChevronRight } from "lucide-react";

export default function UserData() {
  const { user } = useAuth();
  const [aktivitas, setAktivitas] = useState([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userCreatedAt, setUserCreatedAt] = useState(null);

  const [totalBadgeRewards, setTotalBadgeRewards] = useState(0);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user detail to get created_at
      try {
        const userDetail = await getUser(user.id);
        console.log("User detail response:", userDetail);
        if (userDetail.data && userDetail.data.created_at) {
          setUserCreatedAt(userDetail.data.created_at);
          console.log("Set created_at:", userDetail.data.created_at);
        }
      } catch {
        console.warn("User detail API not available yet");
      }

      // Fetch activity logs
      try {
        const aktResult = await getUserActivity(user.id);
        if (aktResult.status === 'success') {
          setAktivitas(aktResult.data || []);
        }
      } catch {
        console.warn("Activity logs API not available yet");
      }

      // Fetch badges count and calculate total rewards
      try {
        const badgeResult = await getUserBadges(user.id);
        if (badgeResult.status === 'success') {
          const badges = badgeResult.data || [];
          setBadgeCount(badges.length);

          // Calculate total badge rewards earned
          const totalRewards = badges.reduce((sum, badge) => sum + (badge.reward_poin || 0), 0);
          setTotalBadgeRewards(totalRewards);
        }
      } catch {
        console.warn("Badges API not available yet");
      }
    } catch {
      console.warn("Some user data APIs not available yet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }

      // Format: DD-MM-YYYY (e.g., "08-12-2024")
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString || 'N/A';
    }
  };

  const stats = [
    { title: "Total Poin", value: `${user.total_poin || 0}`, icon: <Star size={20} /> },
    { title: "Total Sampah", value: `${user.total_setor_sampah || 0} Kg`, icon: <Recycle size={20} /> },
    { title: "Badge Rewards", value: `${totalBadgeRewards} Poin`, icon: <Trophy size={20} />},
    { title: "Level", value: user.level || "Member", icon: <Trophy size={20} /> },
    { title: "Badge Terklaim", value: `${badgeCount}`, icon: <Trophy size={20} /> },
    { title: "Bergabung", value: formatDate(userCreatedAt), icon: <Calendar size={20} /> },
  ];

  const contactInfo = [
    { label: "Email", value: user.email, icon: <Star size={16} /> },
    { label: "No. HP", value: user.no_hp || '-', icon: <Phone size={16} /> },
    { label: "Alamat", value: user.alamat || '-', icon: <MapPin size={16} /> },
  ];

  // Helper function untuk mendapatkan icon berdasarkan tipe aktivitas
  const getActivityIcon = (tipeAktivitas) => {
    if (!tipeAktivitas) return <Recycle size={16} />;

    const tipe = tipeAktivitas.toLowerCase();

    if (tipe.includes('tukar_poin') || tipe.includes('tukar poin')) {
      return <ArrowLeftRight size={16} />;
    } else if (tipe.includes('setor_sampah') || tipe.includes('setor sampah')) {
      return <Recycle size={16} />;
    } else if (tipe.includes('badge_unlock') || tipe.includes('badge unlock') || tipe.includes('badge')) {
      return <Trophy size={16} />;
    } else if (tipe.includes('tukar_produk') || tipe.includes('tukar produk')) {
      return <Gift size={16} />;
    } else if (tipe.includes('poin') || tipe.includes('reward')) {
      return <Zap size={16} />;
    }

    return <Recycle size={16} />;
  };

  // Helper function untuk format nama aktivitas (ubah underscore jadi spasi dan capitalize)
  const formatActivityTitle = (tipeAktivitas) => {
    if (!tipeAktivitas) return 'Aktivitas';

    // Replace underscores with spaces
    const withSpaces = tipeAktivitas.replace(/_/g, ' ');

    // Capitalize each word
    const capitalized = withSpaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return capitalized;
  };

  // Helper function untuk mendapatkan background color berdasarkan tipe aktivitas
  const getActivityColor = (tipeAktivitas) => {
    if (!tipeAktivitas) return 'activity-default';

    const tipe = tipeAktivitas.toLowerCase();

    if (tipe.includes('tukar_poin') || tipe.includes('tukar poin')) {
      return 'activity-tukar-poin';
    } else if (tipe.includes('setor_sampah') || tipe.includes('setor sampah')) {
      return 'activity-setor-sampah';
    } else if (tipe.includes('badge_unlock') || tipe.includes('badge unlock') || tipe.includes('badge')) {
      return 'activity-badge';
    } else if (tipe.includes('tukar_produk') || tipe.includes('tukar produk')) {
      return 'activity-tukar-produk';
    } else if (tipe.includes('poin') || tipe.includes('reward')) {
      return 'activity-poin';
    }

    return 'activity-default';
  };

  return (
    <section className="userDataContainer">
      <UserStatsSection stats={stats} />

      <div className="contactInfoSection">
        <h3>Informasi Kontak</h3>
        <div className="contactGrid">
          {contactInfo.map((info, index) => (
            <div key={index} className="contactItem">
              <span className="contactIcon">{info.icon}</span>
              <div>
                <p className="contactLabel">{info.label}</p>
                <p className="contactValue">{info.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ActivityTimelineSection aktivitas={aktivitas} loading={loading} getActivityIcon={getActivityIcon} getActivityColor={getActivityColor} formatActivityTitle={formatActivityTitle} />
    </section>
  );
}

function UserStatsSection({ stats }) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(stats.length / itemsPerPage);

  const startIndex = currentPage * itemsPerPage;
  const displayedStats = stats.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  return (
    <div className="userStatsSection">
      <div className="statsContainer">
        <div className="statsGrid">
          {displayedStats.map((stat, index) => (
            <div key={index} className={`statCard ${stat.highlight ? 'highlighted' : ''}`}>
              <div className="statContent">
                <div className="iconBox">
                  <span className="statIcon">{stat.icon}</span>
                </div>
                <div className="statText">
                  <p className="statTitle">{stat.title}</p>
                  <p className={`statValue ${stat.highlight ? 'rewardValue' : ''}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="statsPaginationControls">
            <button
              className="paginationBtn prevBtn"
              onClick={handlePrevious}
              aria-label="Previous stats"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="paginationIndicators">
              {Array.from({ length: totalPages }).map((_, index) => (
                <div
                  key={index}
                  className={`paginationDot ${currentPage === index ? 'active' : ''}`}
                  onClick={() => setCurrentPage(index)}
                />
              ))}
            </div>

            <button
              className="paginationBtn nextBtn"
              onClick={handleNext}
              aria-label="Next stats"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityTimelineSection({ aktivitas, loading, getActivityIcon, getActivityColor, formatActivityTitle }) {
  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading aktivitas...</div>;
  }

  if (aktivitas.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Belum ada aktivitas
      </div>
    );
  }

  return (
    <div className="activitySection">
      <h3>Riwayat Aktivitas</h3>
      <div className="activityList">
        {aktivitas.slice(0, 10).map((akt, index) => (
          <div key={index} className={`activityItem ${getActivityColor(akt.tipe_aktivitas)}`}>
            <div className={`activityIcon ${getActivityColor(akt.tipe_aktivitas)}`}>
              {getActivityIcon(akt.tipe_aktivitas)}
            </div>
            <div className="activityContent">
              <p className="activityTitle">{formatActivityTitle(akt.tipe_aktivitas)}</p>
              <p className="activityDesc">{akt.deskripsi || 'Tidak ada deskripsi'}</p>
              <p className="activityTime">
                {new Date(akt.tanggal).toLocaleDateString('id-ID')}
                {akt.poin_perubahan && akt.poin_perubahan > 0 && (
                  <span style={{ color: '#4CAF50', marginLeft: '8px' }}>
                    +{akt.poin_perubahan} poin
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

