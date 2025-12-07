export const fetchRiwayat = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/riwayat`);
  return res.json();
};
