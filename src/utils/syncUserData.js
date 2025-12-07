import { User } from "../Components/lib/user";
import { LeaderboardUsers } from "../Components/lib/leaderboardUser";
import { Badge } from "../Components/lib/badge";

export function getSyncedUserById(id_user) {
  const userLocal = User.find(u => u.id_user === id_user);
  const userLeaderboard = LeaderboardUsers.find(u => u.id_user === id_user);

  if (!userLocal && !userLeaderboard) return null;

  const merged = {
    ...(userLeaderboard || {}),
    ...(userLocal || {}),
  };

  // Hybrid badge unlock logic
  const unlocked = new Set(merged.badge_terkumpul || []);
  const badgeListWithProgress = Badge.map(b => {
    let progress = 0;
    if (b.kategori === "transaksi") progress = merged.transaksi;
    if (b.kategori === "ajakan") progress = merged.ajakan || 0;
    if (b.kategori === "sampah") progress = merged.sampah_terkumpul || 0;

    const hasMetTarget = progress >= b.target;
    const isUnlocked = unlocked.has(b.kode_badge) || hasMetTarget;

    if (hasMetTarget && !unlocked.has(b.kode_badge)) {
      unlocked.add(b.kode_badge); // auto-unlock
    }

    return {
      ...b,
      progress,
      isUnlocked,
    };
  });

  // Update badge_terkumpul with auto-unlocked badges
  merged.badge_terkumpul = Array.from(unlocked);

  // Set default badge_aktif if not set and user has unlocked badges
  if (!merged.badge_aktif && unlocked.size > 0) {
    merged.badge_aktif = Array.from(unlocked)[0]; // default to first unlocked badge
  }

  // Determine next badge (first locked badge sorted by target)
  const nextBadge = badgeListWithProgress
    .filter(b => !b.isUnlocked)
    .sort((a, b) => a.target - b.target)[0];

  // Get full detail of badge_aktif
  const activeBadge = Badge.find(b => b.kode_badge === merged.badge_aktif);

  return {
    ...merged,
    badge: nextBadge?.nama_badge || null,
    badge_gambar: nextBadge?.gambar || null,
    badge_deskripsi: nextBadge?.deskripsi_badge || null,
    badge_aktif_nama: activeBadge?.nama_badge || null,
    badge_aktif_gambar: activeBadge?.gambar || null,
    badge_aktif_deskripsi: activeBadge?.deskripsi_badge || null,
  };
}