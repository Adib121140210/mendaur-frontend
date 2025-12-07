import { getAllBadgesWithProgress } from "./badgeUtils";

export function syncBadgePointsToUser(user) {
  const badgeProgressList = getAllBadgesWithProgress(user);

  const newBadges = badgeProgressList.filter(
    badge => badge.isUnlocked && !user.badge_terkumpul.includes(badge.kode_badge)
  );

  const totalNewPoints = newBadges.reduce((sum, badge) => sum + badge.poin, 0);

  const newBadgeLogs = newBadges.map(badge => ({
    kategori: "badge",
    deskripsi: `Mendapat Badge '${badge.nama_badge}'`,
    detail: `+${badge.poin} Poin · baru saja`,
    timestamp: new Date().toISOString()
  }));

  return {
    ...user,
    total_poin: user.poin_terkumpul + totalNewPoints,
    badge_terkumpul: [...user.badge_terkumpul, ...newBadges.map(b => b.kode_badge)],
    riwayat_aktivitas: [...user.riwayat_aktivitas, ...newBadgeLogs]
  };
}