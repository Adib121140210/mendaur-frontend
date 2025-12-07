import React from "react";
import { getSyncedUserById } from "./syncUserData";
import { getUnlockedBadges, getNextBadge } from "./badgeUtils";

const BadgeCollection = () => {
  const user = getSyncedUserById("user-001"); // bisa diganti dengan props atau context
  const unlocked = getUnlockedBadges(user);
  const nextBadge = getNextBadge(user);

  return (
    <section className="badge-collection">
      <h3>🎖 Koleksi Badge</h3>
      <div className="badge-grid">
        {unlocked.map(b => (
          <div key={b.kode_badge} className="badge-card">
            <img src={b.gambar} alt={b.nama_badge} />
            <p>{b.nama_badge}</p>
          </div>
        ))}
      </div>

      {nextBadge && (
        <div className="next-badge">
          <h4>🔓 Badge Berikutnya</h4>
          <img src={nextBadge.gambar} alt={nextBadge.nama_badge} />
          <p>{nextBadge.nama_badge}</p>
          <p>{nextBadge.syarat_badge}</p>
          <progress value={nextBadge.progress} max={nextBadge.target} />
        </div>
      )}
    </section>
  );
};

export default BadgeCollection;