// lib/kategoriSampah.jsx
import {
  FileText,
  Package,
  Hammer,
  Shirt,
  Monitor,
  MoreHorizontal,
} from "lucide-react";

export const KategoriSampah = [
  {
    id: "Kertas",
    label: "Kertas",
    color: "#0284c7", // Biru
    icon: FileText,
  },
  {
    id: "Plastik",
    label: "Plastik",
    color: "#047857", // Hijau
    icon: Package,
  },
  {
    id: "Logam",
    label: "Logam",
    color: "#6b7280", // Abu-abu
    icon: Hammer,
  },
  {
    id: "Tekstil",
    label: "Tekstil",
    color: "#7c3aed", // Ungu
    icon: Shirt,
  },
  {
    id: "Elektronik",
    label: "Elektronik",
    color: "#facc15", // Kuning terang (ganti dari #F59E0B)
    icon: Monitor,
  },
  {
    id: "Campuran",
    label: "Lainnya",
    color: "#b45309", // Oranye
    icon: MoreHorizontal,
  },
];

export const JenisSampah = [
  {
    id_sampah: "sampah-001",
    nama_sampah: "Botol Plastik",
    kategori: "Plastik",
    satuan: "kg",
    harga_satuan: 2000,
    },
  {
    id_sampah: "sampah-002",
    nama_sampah: "Kardus",
    kategori: "Kertas",
    satuan: "kg",
    harga_satuan: 1500,
  },
  {
    id_sampah: "sampah-003",
    nama_sampah: "Alumunium",
    kategori: "Logam",
    satuan: "kg",
    harga_satuan: 3000,
  },
  {
    id_sampah: "sampah-004",
    nama_sampah: "Botol Kaca",
    kategori: "Pecah Belah",
    satuan: "kg",
    harga_satuan: 2500,
  },
  {
    id_sampah: "sampah-005",
    nama_sampah: "Baju Bekas",
    kategori: "Tekstil",
    satuan: "kg",
    harga_satuan: 1000,
  },
  {
    id_sampah: "sampah-006",
    nama_sampah: "Elektronik",
    kategori: "B3",
    satuan: "unit",
    harga_satuan: 5000,
  },
  {
    id_sampah: "sampah-007",
    nama_sampah: "Rongsok",
    kategori: "Campuran",
    satuan: "kg",
    harga_satuan: 500,
  },
]