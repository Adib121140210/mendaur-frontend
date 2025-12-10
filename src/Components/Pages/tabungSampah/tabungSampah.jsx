import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, Search } from "lucide-react";
import { JenisSampah } from "../../lib/jenisSampah";
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
  const [sampahData, setSampahData] = useState(JenisSampah);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get logged-in user ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("id_user");
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    }
  }, []);

  // Fetch waste prices from jenis-sampah API
  useEffect(() => {
    const fetchWastePrices = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // ✅ Fetch from jenis-sampah endpoint with proper headers
        const response = await fetch("http://127.0.0.1:8000/api/jenis-sampah", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          cache: 'no-store',
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // Handle API response
          const jenisArray = Array.isArray(result) ? result : result.data || [];
          
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
              
              return {
                id_sampah: jenis.jenis_sampah_id,
                nama_sampah: jenis.nama_jenis || jenis.name,
                kategori: jenis.kategori_sampah?.nama_kategori || jenis.kategori_name || 'Sampah',
                satuan: jenis.satuan || "kg",
                harga_satuan: parseFloat(jenis.harga_per_kg || jenis.price || 0),
                deskripsi: jenis.deskripsi || jenis.description,
                kategori_icon: jenis.kategori_sampah?.icon,
                kategori_color: jenis.kategori_sampah?.warna || jenis.kategori_sampah?.color || '#10b981',
                kode: jenis.kode || jenis.code,
              };
            });
            
            // Set the last updated timestamp
            if (mostRecentUpdate) {
              setLastUpdated(mostRecentUpdate);
            }
            
            setSampahData(allWasteTypes);
          }
        } else {
          console.error(`API Error: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.error('Response:', errorText);
          setSampahData(JenisSampah);
        }
      } catch (error) {
        console.error("Error fetching waste prices from jenis-sampah API:", error);
        // Keep using JenisSampah from local data as fallback
        setSampahData(JenisSampah);
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