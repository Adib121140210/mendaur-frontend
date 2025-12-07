import {
  Home,
  User,
  Recycle,
  Package,
  ShoppingBag,
  History,
  Trophy,
  LogOut,
} from "lucide-react";

export const Sidebarlinks = [
  {
    key: 'beranda',
    label: 'Beranda',
    path: '/',
    icon: <Home/>
  },

  {
    key: 'profil',
    label: 'Profil',
    path: '/profil',
    icon: <User/>
  },

  {
    key: 'tabungSampah',
    label: 'Tabung Sampah',
    path: '/tabungSampah',
    icon: <Recycle/>
  },

  {
    key: 'tukarPoin',
    label: 'Tukar Poin',
    path: '/tukarPoin',
    icon: <Package/>
  },

  // {
  //   key: 'produk',
  //   label: 'Produk',
  //   path: '/produk',
  //   icon: <ShoppingBag/>
  // },

  {
    key: 'riwayat',
    label: 'Riwayat',
    path: '/riwayatTransaksi',
    icon: <History/>
  },

  {
    key: 'leaderboard',
    label: 'Leaderboard',
    path: '/leaderboard',
    icon: <Trophy/>
  },
];

export const SidebarBottomlinks = [
  {
    key: 'logout',
    label: 'Keluar',
    path: '/login',
    icon: <LogOut/>
  },
];