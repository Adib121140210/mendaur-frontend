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
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

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
        const schedules = result.data || [];
        // Filter jadwal yang masih aktif
        const activeSchedules = schedules.filter(s => s.status === 'aktif');
        setJadwalList(activeSchedules);
      } catch (err) {
        console.error("Gagal ambil jadwal:", err);
        alert("Gagal memuat jadwal penyetoran");
      }
    };
    fetchJadwal();
  }, []);

  // Inisialisasi Google Maps
  useEffect(() => {
    if (!mapRef.current) return;

    // Load Google Maps API jika belum di-load
    if (!window.google) {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        console.error('Google Maps API key tidak ditemukan. Tambahkan VITE_GOOGLE_MAPS_API_KEY ke .env');
        // Tampilkan placeholder message
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f9f9f9; border: 2px dashed #ccc; border-radius: 8px;">
              <div style="text-align: center; padding: 20px;">
                <p style="color: #666; margin: 0 0 10px 0; font-weight: bold;">⚠️ Google Maps API Key Tidak Dikonfigurasi</p>
                <p style="color: #999; margin: 0; font-size: 0.9rem;">Hubungi admin untuk setup Google Maps API</p>
              </div>
            </div>
          `;
        }
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initializeMap();
      script.onerror = () => {
        console.error('Gagal memuat Google Maps API');
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #fee; border: 2px solid #f99; border-radius: 8px;">
              <div style="text-align: center; padding: 20px;">
                <p style="color: #c33; margin: 0 0 10px 0; font-weight: bold;">❌ Gagal Memuat Peta</p>
                <p style="color: #999; margin: 0; font-size: 0.9rem;">Periksa konfigurasi API Key</p>
              </div>
            </div>
          `;
        }
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    const initializeMap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: mapCoords,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      mapInstance.current = map;

      // Tambah marker awal di lokasi default
      const marker = new window.google.maps.Marker({
        position: mapCoords,
        map: map,
        title: 'Lokasi Anda',
        animation: window.google.maps.Animation.DROP,
      });

      markerInstance.current = marker;

      // Event listener saat user klik peta
      map.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        // Update marker position dengan animasi
        marker.setPosition({ lat, lng });
        marker.setAnimation(window.google.maps.Animation.BOUNCE);

        // Hentikan animasi setelah 750ms
        setTimeout(() => {
          marker.setAnimation(null);
        }, 750);

        // Update state dengan koordinat baru
        setMapCoords({ lat, lng });

        // Buat Google Maps link
        const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
        setFormData(prev => ({ ...prev, lokasi: mapsLink }));

        console.log(`📍 Lokasi dipilih: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      });

      // Geolocation - set marker ke lokasi user saat load
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const userLocation = { lat: userLat, lng: userLng };

            map.setCenter(userLocation);
            marker.setPosition(userLocation);
            setMapCoords(userLocation);

            const mapsLink = `https://www.google.com/maps?q=${userLat},${userLng}`;
            setFormData(prev => ({ ...prev, lokasi: mapsLink }));
          },
          (error) => {
            console.warn('Geolocation error:', error.message);
            // Tetap gunakan default Jakarta
          }
        );
      }
    };
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

    // Gunakan fallback ke 1 jika userId tidak diberikan
    const validUserId = userId || 1;
    console.log('Sending user_id:', validUserId);

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
                jadwalList.map((j) => {
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
                    <option key={j.jenis_sampah_id} value={j.id}>
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
