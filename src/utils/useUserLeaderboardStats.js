import { useMemo } from "react";
import { User } from "../Components/lib/user";
import { LeaderboardUsers } from "../Components/lib/leaderboardUser";

export function useUserLeaderboardStats() {
  const currentUser = User[0];

  return useMemo(() => {
    const allUsers = [...LeaderboardUsers];

    const totalPeserta = allUsers.length;

    const avgPoin =
      allUsers.reduce((sum, u) => sum + u.poin_terkumpul, 0) / totalPeserta;

    const poinRatio = (currentUser.poin_terkumpul / avgPoin).toFixed(1);

    const sorted = allUsers.sort((a, b) => b.poin_terkumpul - a.poin_terkumpul);
    const userIndex = sorted.findIndex(u => u.id_user === currentUser.id_user);
    const peringkat = userIndex !== -1 ? `#${userIndex + 1}` : "—";

    return {
      nama_user: currentUser.nama_user,
      poin: currentUser.poin_terkumpul,
      sampah: currentUser.sampah_terkumpul,
      peringkat,
      totalPeserta,
      poinRatio,
    };
  }, [currentUser]);
}