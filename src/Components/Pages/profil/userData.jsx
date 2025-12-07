import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../profil/userData.css";

import { Recycle, Star, ArrowLeftRight, Calendar, Trophy, MapPin, Phone } from "lucide-react";

export default function UserData() {
  const { user } = useAuth();
  const [aktivitas, setAktivitas] = useState([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [totalBadgeRewards, setTotalBadgeRewards] = useState(0);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch activity logs
      try {
        const aktRes = await fetch(`http://127.0.0.1:8000/api/users/${user.id}/aktivitas`);
        if (aktRes.ok) {
          const aktResult = await aktRes.json();
          if (aktResult.status === 'success') {
            setAktivitas(aktResult.data || []);
          }
        }
      } catch {
        console.warn("Activity logs API not available yet");
      }

      // Fetch badges count and calculate total rewards
      try {
        const badgeRes = await fetch(`http://127.0.0.1:8000/api/users/${user.id}/badges`);
        if (badgeRes.ok) {
          const badgeResult = await badgeRes.json();
          if (badgeResult.status === 'success') {
            const badges = badgeResult.data || [];
            setBadgeCount(badges.length);
            
            // Calculate total badge rewards earned
            const totalRewards = badges.reduce((sum, badge) => sum + (badge.reward_poin || 0), 0);
            setTotalBadgeRewards(totalRewards);
          }
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const stats = [
    { title: "Total Poin", value: `${user.total_poin || 0}`, icon: <Star size={20} /> },
    { title: "Total Sampah", value: `${user.total_setor_sampah || 0} Kg`, icon: <Recycle size={20} /> },
    { title: "Badge Rewards", value: `${totalBadgeRewards} Poin`, icon: <Trophy size={20} />, highlight: true },
    { title: "Level", value: user.level || "Member", icon: <Trophy size={20} /> },
    { title: "Badge Terklaim", value: `${badgeCount}`, icon: <Trophy size={20} /> },
    { title: "Bergabung", value: formatDate(user.created_at), icon: <Calendar size={20} /> },
  ];

  const contactInfo = [
    { label: "Email", value: user.email, icon: <Star size={16} /> },
    { label: "No. HP", value: user.no_hp || '-', icon: <Phone size={16} /> },
    { label: "Alamat", value: user.alamat || '-', icon: <MapPin size={16} /> },
  ];

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

      <ActivityTimelineSection aktivitas={aktivitas} loading={loading} />
    </section>
  );
}

function UserStatsSection({ stats }) {
  return (
    <div className="userStatsSection">
      <div className="statsGrid">
        {stats.map((stat, index) => (
          <div key={index} className={`statCard ${stat.highlight ? 'highlighted' : ''}`}>
            <div className="statContent">
              <div className="iconBox bg-primary-light">
                <span className="statIcon text-primary">{stat.icon}</span>
              </div>
              <div className="statText">
                <p className="statTitle">{stat.title}</p>
                <p className={`statValue ${stat.highlight ? 'rewardValue' : ''}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityTimelineSection({ aktivitas, loading }) {
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
          <div key={index} className="activityItem">
            <div className="activityIcon">
              <Recycle size={16} />
            </div>
            <div className="activityContent">
              <p className="activityTitle">{akt.tipe_aktivitas || 'Aktivitas'}</p>
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

