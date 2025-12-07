import React, { useState, useEffect } from "react";
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

  // ✅ AUTO-POPULATE user data and auto-track location on mount
  useEffect(() => {
    // Pre-fill user data from authenticated user
    if (user) {
      setFormData(prev => ({
        ...prev,
        nama: user.nama || user.name || "",
        noHp: user.no_hp || user.phone || "",
      }));
    }

    // Auto-track location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const mapsLink = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
          setFormData(prev => ({ ...prev, lokasi: mapsLink }));
          console.log('✅ Lokasi otomatis terdeteksi:', mapsLink);
        },
        (error) => {
          console.warn('⚠️ Gagal mengambil lokasi otomatis:', error.message);
          // Don't show alert, user can manually set location
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
        const schedules = result.data || [];
        // Filter only active schedules on frontend
        const activeSchedules = schedules.filter(s => s.status === 'aktif');
        setJadwalList(activeSchedules);
      } catch (err) {
        console.error("Gagal ambil jadwal:", err);
        alert("Gagal memuat jadwal penyetoran");
      }
    };
    fetchJadwal();
  }, []);

  // Handler input umum
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // ✅ Handle kategori selection from KategoriSampahWrapper
  const handleKategoriChange = (kategoriId, kategoriLabel) => {
    setSelectedKategori(kategoriId);
    setFormData(prev => ({
      ...prev,
      jenis: kategoriLabel || kategoriId // Store label or ID
    }));
    // Clear error
    if (errors.jenis) {
      setErrors(prev => ({ ...prev, jenis: null }));
    }
    console.log('✅ Kategori dipilih:', kategoriLabel || kategoriId);
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

    // ✅ Check authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Anda harus login terlebih dahulu untuk mengajukan penjemputan sampah');
      return;
    }

    setLoading(true);
    
    const data = new FormData();
    
    // ✅ FIX: Use fallback to 1 if userId is not provided
    const validUserId = userId || 1;
    console.log('Sending user_id:', validUserId); // Debug log
    
    data.append("user_id", validUserId);
    data.append("jadwal_id", formData.jadwalId);
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
          'Authorization': `Bearer ${token}`, // ✅ ADD AUTHORIZATION HEADER
        },
        body: data,
      });

      const result = await res.json();
      
      // ✅ Better error logging
      console.log('Response status:', res.status);
      console.log('Response data:', result);

      if (!res.ok) {
        // Handle validation errors dari Laravel
        if (result.errors) {
          console.error('Validation errors:', result.errors);
          
          const backendErrors = {};
          Object.keys(result.errors).forEach(key => {
            backendErrors[key] = result.errors[key][0];
          });
          setErrors(backendErrors);
          
          // Show detailed error message
          const errorMessages = Object.values(result.errors).flat().join('\n');
          alert(`Validasi gagal:\n${errorMessages}`);
          
          throw new Error(result.message || "Validasi gagal");
        }
        throw new Error(result.message || "Terjadi kesalahan");
      }

      console.log("Respons backend:", result);

      if (result.status === "success") {
        alert(result.message || "Setor sampah berhasil!");
        // Reset form
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

        {/* ✅ Add debug info */}
        {!userId && (
          <div style={{padding: '10px', background: '#fff3cd', marginBottom: '10px', borderRadius: '4px'}}>
            ⚠️ User ID not provided. Using default user (ID: 1)
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Hidden fields - sent to backend but not visible to user */}
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
                jadwalList.map((j) => {
                  // Format date properly
                  const date = new Date(j.tanggal);
                  const formattedDate = date.toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                  // Format time (remove seconds)
                  const timeStart = j.waktu_mulai?.substring(0, 5) || '';
                  const timeEnd = j.waktu_selesai?.substring(0, 5) || '';
                  
                  return (
                    <option key={j.id} value={j.id}>
                      {formattedDate} ({timeStart} - {timeEnd}) @ {j.lokasi}
                    </option>
                  );
                })
              )}
            </select>
            {errors.jadwal && <span className="errorText">{errors.jadwal}</span>}
          </label>

          <label>
            Titik Lokasi* (Otomatis Terdeteksi):
            <input
              type="text"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleChange}
              placeholder="Lokasi akan terdeteksi otomatis..."
              required
            />
            <button type="button" className="lokasiButton" onClick={handleAmbilLokasi}>
            Perbarui Lokasi Saya
            </button>
            {errors.lokasi && <span className="errorText">{errors.lokasi}</span>}
            {formData.lokasi && (
              <span className="successText">✅ Lokasi terdeteksi</span>
            )}
          </label>

          {formData.lokasi.includes("maps.google.com") && (
            <iframe
              src={formData.lokasi}
              width="100%"
              height="200"
              style={{ border: 0, marginBottom: "1rem", borderRadius: "8px" }}
              allowFullScreen
              loading="lazy"
              title="Preview Lokasi"
            ></iframe>
          )}

          <label>
            {/* Jenis Sampah */}
            <KategoriSampahWrapper 
              selectedKategori={selectedKategori} 
              setSelectedKategori={setSelectedKategori}
              onSelectionChange={handleKategoriChange}
            />
            {errors.jenis && <span className="errorText">{errors.jenis}</span>}
            {selectedKategori && (
              <span className="successText">✅ Kategori terseleksi: {formData.jenis}</span>
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
