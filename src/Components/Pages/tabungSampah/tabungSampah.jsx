import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, Search } from "lucide-react";
import KategoriSampahWrapper from "./kategoriSampah";
import JadwalTabungSampah from "./jadwalTabungSampah";
import FormSetorSampah from "../../Form/FormSetorSampah";
import "./tabungSampah.css";

export default function TabungSampah() {
  const navigate = useNavigate();
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [sampahData, setSampahData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch waste prices from jenis-sampah API and kategori-sampah
  useEffect(() => {
    // Color mapping for categories
    const categoryColorMap = {
      'Plastik': '#2196F3',       // Light Blue
      'Kertas': '#8B4513',        // Saddle Brown
      'Logam': '#A9A9A9',         // Dark Gray
      'Tekstil': '#E91E63',       // Pink
      'Elektronik': '#FF9800',    // Deep Orange
      'Kaca': '#00BCD4',          // Cyan
      'Pecah Belah': '#00BCD4',   // Cyan
      'Lainnya': '#607D8B',       // Blue Gray
      'Campuran': '#607D8B',      // Blue Gray
    };

    const fetchWastePrices = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const fetchOptions = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          cache: 'no-store',
        };

        // ✅ Fetch BOTH jenis-sampah AND kategori-sampah in parallel
        const [jenisResponse, kategoriResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/jenis-sampah", fetchOptions),
          fetch("http://127.0.0.1:8000/api/kategori-sampah", fetchOptions),
        ]);

        if (jenisResponse.ok && kategoriResponse.ok) {
          const jenisResult = await jenisResponse.json();
          const kategoriResult = await kategoriResponse.json();

          // Handle API responses - could be array or { data: array }
          const jenisArray = Array.isArray(jenisResult) ? jenisResult : jenisResult.data || [];
          const kategoriArray = Array.isArray(kategoriResult) ? kategoriResult : kategoriResult.data || [];

          // Create a map for quick kategori lookup by kategori_sampah_id
          const kategoriMap = {};
          kategoriArray.forEach(kat => {
            kategoriMap[kat.kategori_sampah_id] = kat;
          });

          console.log('Kategori Map:', kategoriMap);
          console.log('Jenis Array:', jenisArray);

          if (Array.isArray(jenisArray) && jenisArray.length > 0) {
            // Find the most recent update timestamp
            let mostRecentUpdate = null;

            // Transform API data to match table format
            const allWasteTypes = jenisArray.map(jenis => {
              // Track the most recent update
              const jenisUpdate = new Date(jenis.updated_at);
              if (!mostRecentUpdate || jenisUpdate > mostRecentUpdate) {
                mostRecentUpdate = jenisUpdate;
              }

              // Look up category from the kategoriMap using kategori_sampah_id
              const kategoriInfo = kategoriMap[jenis.kategori_sampah_id] || {};
              
              // Use color from backend if available, otherwise fallback to categoryColorMap
              const categoryColor = kategoriInfo.warna || categoryColorMap[kategoriInfo.nama_kategori] || '#10b981';

              return {
                id_sampah: jenis.jenis_sampah_id,
                nama_sampah: jenis.nama_jenis,
                kategori: kategoriInfo.nama_kategori || 'Uncategorized', // Get from kategori lookup
                kategori_sampah_id: jenis.kategori_sampah_id, // Link to kategoriSampah table
                satuan: jenis.satuan || "kg",
                harga_satuan: parseFloat(jenis.harga_per_kg || 0),
                deskripsi: jenis.deskripsi || kategoriInfo.deskripsi || '',
                kategori_icon: kategoriInfo.icon,
                kategori_color: categoryColor, // Use the mapped/provided color
                kode: jenis.kode,
              };
            });

            // Set the last updated timestamp
            if (mostRecentUpdate) {
              setLastUpdated(mostRecentUpdate);
            }

            setSampahData(allWasteTypes);
          } else {
            console.warn("No data received from API");
            setSampahData([]);
          }
        } else {
          console.error(`API Error: jenis=${jenisResponse.status}, kategori=${kategoriResponse.status}`);
          setSampahData([]);
        }
      } catch (error) {
        console.error("Error fetching waste prices:", error);
        setSampahData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWastePrices();
  }, []);

  // Filter and search logic
  const filteredSampah = sampahData.filter((item) => {
    // Category filter
    const matchesCategory = selectedKategori
      ? item.kategori === selectedKategori
      : true;

    // Search filter (name or category)
    const matchesSearch = searchQuery
      ? item.nama_sampah.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="tabungSampahPage">
      <h1 className="pageTitle">Tabung Sampah Digital</h1>
      <p className="pageSubtitle">
        Kelola setoran sampah dan pantau harga terkini
      </p>

      {/* Kategori Interaktif */}
      <KategoriSampahWrapper
        selectedKategori={selectedKategori}
        setSelectedKategori={setSelectedKategori}
      />

      {/* Tabel Harga Sampah */}
      <div className="daftarSampahWrapper">
        <div className="filterBar">
          {/* Last Updated Timestamp */}
          {lastUpdated && (
            <div className="lastUpdatedBanner">
              <span className="updateText">
                Terakhir diperbarui: {lastUpdated.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} pukul {lastUpdated.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}

          <div className="searchWrapper">
            <Search className="searchIcon" size={20} />
            <input
              type="text"
              className="searchInput"
              placeholder="Cari jenis sampah…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Memuat harga sampah...</p>
          </div>
        ) : (
          <table className="hargaTable">
            <thead>
              <tr>
                <th className="namaBarang">Nama Barang</th>
                <th className="satuanBarang">Satuan</th>
                <th className="hargaJual">Harga Jual</th>
              </tr>
            </thead>
            <tbody>
              {filteredSampah.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    {searchQuery
                      ? `Tidak ada hasil untuk "${searchQuery}"`
                      : "Tidak ada data harga sampah"}
                  </td>
                </tr>
              ) : (
                filteredSampah.map((item) => (
                  <tr key={item.id_sampah}>
                    <td className="namaBarang">
                      {item.nama_sampah}
                      <span
                        className="kategoriBadge"
                        style={{
                          borderColor: item.kategori_color,
                          color: item.kategori_color
                        }}
                      >
                        {item.kategori}
                      </span>
                    </td>
                    <td className="satuanBarang">{item.satuan}</td>
                    <td className="hargaJual">
                      Rp. {item.harga_satuan.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>


      {/* Jadwal Penyetoran - Choose Available Deposit Slot */}
      <JadwalTabungSampah showSelection={true} onSelect={setSelectedScheduleId} />


      {/* Action Bar */}
      <div className="TabungActionBar">
        <div className="actionBarContainer">
          <div className="actionBarContent">
            <span className="kategoriCount">
              Total kategori dipilih:{" "}
              <span className="kategoriCountBold">
                {selectedKategori ? 1 : 0}
              </span>
            </span>
            <div className="actionButtons">
              <button className="riwayatButton" onClick={() => navigate('/dashboard/riwayatTabung')}>
                Riwayat Setoran
              </button>
              <button
                className="setorButton"
                onClick={() => setShowFormModal(true)}
              >
                <Recycle className="iconBox" />
                Setor Sampah Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form - Diletakkan di luar ActionBar agar tidak ikut disembunyikan */}
      {showFormModal && (
        <FormSetorSampah
          onClose={() => setShowFormModal(false)}
          userId={userId} // Real logged-in user ID from localStorage
          selectedKategori={selectedKategori}
          preSelectedSchedule={selectedScheduleId} // Pass selected schedule to form
        />
      )}
    </div>
  );
}
