import React, { useState, useEffect, useRef } from "react";
import "./FormSetorSampah.css";
import KategoriSampahWrapper from "../Pages/tabungSampah/kategoriSampah";
import { useAuth } from "../Pages/context/AuthContext";

// Component for waste deposit form submission
export default function FormSetorSampah({ onClose, userId, preSelectedSchedule }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nama: "",
    noHp: "",
    lokasi: "",
    jenis: "",
    foto: null,
    jadwalId: preSelectedSchedule || "",
  });

  const [jadwalList, setJadwalList] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [mapCoords, setMapCoords] = useState({ lat: -6.2088, lng: 106.8456 }); // Default: Jakarta
  const mapRef = useRef(null);

  // Set user data otomatis saat pertama kali load
  useEffect(() => {
    // Isi nama dan nomor HP dari data user yang login
    if (user) {
      setFormData(prev => ({
        ...prev,
        nama: user.nama || user.name || "",
        noHp: user.no_hp || user.phone || "",
      }));
    }

    // Ambil lokasi user secara otomatis
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const mapsLink = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
          setFormData(prev => ({ ...prev, lokasi: mapsLink }));
          setMapCoords({ lat: coords.latitude, lng: coords.longitude });
          console.log('Lokasi otomatis terdeteksi:', mapsLink);
        },
        (error) => {
          console.warn('Gagal mengambil lokasi otomatis:', error.message);
          // Tidak menampilkan alert, user bisa set lokasi secara manual
        }
      );
    }
  }, [user]);

  // Update jadwalId when preSelectedSchedule changes
  useEffect(() => {
    if (preSelectedSchedule) {
      setFormData(prev => ({ ...prev, jadwalId: preSelectedSchedule }));
    }
  }, [preSelectedSchedule]);

  // Ambil jadwal aktif dari backend
  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/jadwal-penyetoran");
        if (!res.ok) throw new Error("Gagal mengambil jadwal");
        const result = await res.json();
        let schedules = result.data || [];
        console.log('🔍 Jadwal dari API:', schedules);
        console.log('📊 Total jadwal:', schedules.length);

        // ✅ Backend sekarang mengembalikan real IDs (1, 2, 3, dll)
        // Tidak perlu menambahkan synthetic IDs lagi
        setJadwalList(schedules);
        console.log('📋 Jadwal yang ditampilkan:', schedules);
      } catch (err) {
        console.error("❌ Gagal ambil jadwal:", err);
        setJadwalList([]);
      }
    };
    fetchJadwal();
  }, []);

  // Inisialisasi Static Map (tanpa perlu API key)
  useEffect(() => {
    if (!mapRef.current) return;

    // Render static map image
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${mapCoords.lat},${mapCoords.lng}&zoom=15&size=600x300&markers=color:red%7C${mapCoords.lat},${mapCoords.lng}&style=feature:all%7Celement:labels.text%7Cvisibility:on`;

    mapRef.current.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%;">
        <img
          src="${staticMapUrl}"
          alt="Static Map"
          style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;"
        />
        <div style="position: absolute; top: 10px; right: 10px; background: white; padding: 8px 12px; border-radius: 4px; font-size: 0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          📍 ${mapCoords.lat.toFixed(4)}, ${mapCoords.lng.toFixed(4)}
        </div>
      </div>
    `;
  }, [mapCoords]);

  // Handle input perubahan form
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    // Hapus error untuk field ini jika ada
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle kategori selection dari KategoriSampahWrapper
  const handleKategoriChange = (kategoriId, kategoriLabel) => {
    setSelectedKategori(kategoriId);
    setFormData(prev => ({
      ...prev,
      jenis: kategoriLabel || kategoriId
    }));
    // Hapus error
    if (errors.jenis) {
      setErrors(prev => ({ ...prev, jenis: null }));
    }
    console.log('Kategori dipilih:', kategoriLabel || kategoriId);
  };

  // Ambil lokasi otomatis
  const handleAmbilLokasi = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung di browser ini.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const mapsLink = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
        setFormData((prev) => ({ ...prev, lokasi: mapsLink }));
        setMapCoords({ lat: coords.latitude, lng: coords.longitude });
      },
      (error) => {
        alert("Gagal mengambil lokasi: " + error.message);
        window.open("https://www.google.com/maps", "_blank");
      }
    );
  };

  // Validasi sederhana
  const validate = () => {
    const newErrors = {};
    if (!formData.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (!formData.noHp.trim()) newErrors.noHp = "No HP wajib diisi";
    if (!formData.lokasi.trim()) newErrors.lokasi = "Titik lokasi wajib diisi";
    if (!formData.jenis) newErrors.jenis = "Jenis sampah wajib dipilih";
    if (!formData.foto) newErrors.foto = "Foto sampah wajib diunggah";
    if (!formData.jadwalId) newErrors.jadwal = "Jadwal wajib dipilih";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    // Check authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Anda harus login terlebih dahulu untuk mengajukan penjemputan sampah');
      return;
    }

    setLoading(true);

    const data = new FormData();

    // Gunakan user_id dari authenticated user
    // Fallback: gunakan userId prop jika diberikan, atau coba dari user context, terakhir fallback ke 1
    let finalUserId = userId;
    if (!finalUserId && user?.user_id) {
      finalUserId = user.user_id;  // ✅ Backend returns user_id, not id
    }
    if (!finalUserId) {
      finalUserId = 1;
    }
    console.log('Sending user_id:', finalUserId);

    // jadwalId adalah index string, convert ke int dan get selected schedule
    const selectedIndex = parseInt(formData.jadwalId);
    const selectedSchedule = jadwalList[selectedIndex];
    // ✅ Backend sekarang mengembalikan real ID (1, 2, 3, dll)
    const scheduleId = selectedSchedule?.id;

    console.log('Selected index:', selectedIndex);
    console.log('Selected schedule:', selectedSchedule);
    console.log('Schedule ID to send:', scheduleId);

    data.append("user_id", finalUserId);
    data.append("jadwal_id", scheduleId);  // tabung_sampah table uses jadwal_id (not jadwal_penyetoran_id)
    data.append("nama_lengkap", formData.nama);
    data.append("no_hp", formData.noHp);
    data.append("titik_lokasi", formData.lokasi);
    data.append("jenis_sampah", formData.jenis);

    if (formData.foto) {
      data.append("foto_sampah", formData.foto);
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/tabung-sampah", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();

      // Log response untuk debugging
      console.log('Response status:', res.status);
      console.log('Response data:', result);

      if (!res.ok) {
        // Tangani validation errors dari Laravel
        if (result.errors) {
          console.error('Validation errors:', result.errors);

          const backendErrors = {};
          Object.keys(result.errors).forEach(key => {
            backendErrors[key] = result.errors[key][0];
          });
          setErrors(backendErrors);

          // Tampilkan pesan error detail
          const errorMessages = Object.values(result.errors).flat().join('\n');
          alert(`Validasi gagal:\n${errorMessages}`);

          throw new Error(result.message || "Validasi gagal");
        }
        throw new Error(result.message || "Terjadi kesalahan");
      }

      console.log("Respons backend:", result);

      if (result.status === "success") {
        alert(result.message || "Setor sampah berhasil!");
        // Reset form kembali ke awal
        setFormData({
          nama: "",
          noHp: "",
          lokasi: "",
          jenis: "",
          foto: null,
          jadwalId: "",
        });
        onClose();
      }
    } catch (err) {
      console.error("Error submit:", err);
      alert(err.message || "Gagal mengirim data");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="formModalOverlay" onClick={onClose}>
      <div className="formModal" onClick={(e) => e.stopPropagation()}>
        <h2>Form Penjemputan Sampah</h2>

        {/* Add debug info */}
        {!userId && (
          <div style={{padding: '10px', background: '#fff3cd', marginBottom: '10px', borderRadius: '4px'}}>
            User ID tidak diberikan. Menggunakan user default (ID: 1)
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Field tersembunyi - dikirim ke backend tapi tidak terlihat user */}
          <div className="hiddenFields">
            <input
              type="hidden"
              name="nama"
              value={formData.nama}
            />
            <input
              type="hidden"
              name="noHp"
              value={formData.noHp}
            />
          </div>

          {/* Dropdown Jadwal */}
          <label>
            Pilih Jadwal Penyetoran*:
            <select
              name="jadwalId"
              value={formData.jadwalId}
              onChange={handleChange}
              required
            >
              <option value="">-- Pilih Jadwal --</option>
              {jadwalList.length === 0 ? (
                <option disabled>Tidak ada jadwal tersedia</option>
              ) : (
                jadwalList.map((j, index) => {
                  // Format tanggal dengan benar
                  const date = new Date(j.tanggal);
                  const formattedDate = date.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  // Format waktu (tanpa detik)
                  const timeStart = j.waktu_mulai?.substring(0, 5) || '';
                  const timeEnd = j.waktu_selesai?.substring(0, 5) || '';

                  return (
                    <option key={index} value={index}>
                      {formattedDate} ({timeStart} - {timeEnd}) @ {j.lokasi}
                    </option>
                  );
                })
              )}
            </select>
            {errors.jadwal && <span className="errorText">{errors.jadwal}</span>}
          </label>

          <label>
            Titik Lokasi* (Pilih Lokasi di Peta):
            <div style={{ marginTop: '0.8rem' }}>
              {/* Container Peta Google Maps */}
              <div
                ref={mapRef}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '300px',
                  backgroundColor: '#f0f0f0',
                  border: '2px solid #ccc',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '0.8rem'
                }}
              >
              </div>

              {/* Input Lokasi - Otomatis Terisi */}
              <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleChange}
                placeholder="📍 Klik pada peta untuk memilih lokasi..."
                readOnly
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  marginBottom: '0.8rem',
                  fontSize: '0.9rem',
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed'
                }}
              />

              {/* Tombol Aksi */}
              <button
                type="button"
                className="lokasiButton"
                onClick={handleAmbilLokasi}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginBottom: '0.8rem'
                }}
              >
                � Gunakan Lokasi Saya Saat Ini
              </button>

              {errors.lokasi && <span className="errorText">{errors.lokasi}</span>}
              {formData.lokasi && (
                <span className="successText" style={{ marginTop: '0.5rem', display: 'block' }}>
                  ✅ Lokasi telah diatur
                </span>
              )}
            </div>
          </label>

          <label>
            {/* Jenis Sampah */}
            <KategoriSampahWrapper
              selectedKategori={selectedKategori}
              setSelectedKategori={setSelectedKategori}
              onSelectionChange={handleKategoriChange}
            />
            {errors.jenis && <span className="errorText">{errors.jenis}</span>}
            {selectedKategori && (
              <span className="successText">Kategori terseleksi: {formData.jenis}</span>
            )}
          </label>

          <label>
            Foto Sampah*:
            <input
              type="file"
              name="foto"
              accept="image/*"
              onChange={handleChange}
              required
            />
            {formData.foto && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                📸 {formData.foto.name} ({(formData.foto.size / 1024).toFixed(2)} KB)
              </div>
            )}
            {errors.foto && <span className="errorText">{errors.foto}</span>}
          </label>

          <p className="formNote">
            *Catatan: Berat minimum sampah adalah <strong>3Kg</strong> untuk melakukan penjemputan.
          </p>

          <div className="formActions">
            <button type="submit" disabled={loading}>
              {loading ? "Mengirim..." : "Ajukan Penjemputan"}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
