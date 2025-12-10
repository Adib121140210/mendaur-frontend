import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Loader, AlertCircle } from "lucide-react";
import "./jadwalTabungSampah.css";

export default function JadwalTabungSampah({ onSelect, showSelection = false }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeSchedule, setActiveSchedule] = useState(null);

  // Fetch schedules from backend
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("id_user");

        // Both modes fetch from same endpoint, filter on frontend
        const endpoint = `http://127.0.0.1:8000/api/jadwal-penyetoran`;

        const headers = {
          Accept: "application/json",
        };

        // For viewing mode (pickup), need auth - fetch user's schedules
        if (!showSelection) {
          if (!token || !userId) {
            throw new Error("Authentication required");
          }
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, { headers });

        if (!response.ok) {
          throw new Error("Failed to fetch schedules");
        }

        const result = await response.json();
        let data = result.data || result || [];

        // Normalization: map known alternative field names to expected shape
        const normalized = (Array.isArray(data) ? data : []).map((item, index) => {
          console.log(`Raw item ${index}:`, item); // Debug: see actual field names
          return {
            jadwal_penyetoran_id: item.jadwal_penyetoran_id || item.id || item._id || index, // Use index as fallback
            status: (item.status || item.keterangan || item.st || "aktif").toString().toLowerCase(), // Default to 'aktif'
            tanggal: item.tanggal || item.date || item.day || null,
            jam: item.jam || item.time || item.waktu || null,
            waktu_mulai: item.waktu_mulai || item.start_time || null,
            waktu_selesai: item.waktu_selesai || item.end_time || null,
            lokasi: item.lokasi || item.alamat || item.location || null,
            area: item.area || item.areas || null,
            catatan: item.catatan || item.notes || null,
            hari: item.hari || null,
          };
        });

        console.log('Fetched schedules raw:', result);
        console.log('Normalized schedules:', normalized);

        // For selection mode, filter only active schedules (tolerate different status strings)
        if (showSelection) {
          const activeStatuses = ['aktif', 'active', 'available', 'open'];
          data = normalized.filter(s => activeStatuses.includes((s.status || '').toLowerCase()));
          console.log(`Selection mode: filtered from ${normalized.length} to ${data.length} schedules`);
          console.log('Filtered data:', data);
        } else {
          data = normalized;
          console.log(`View mode: showing all ${normalized.length} schedules`);
        }

        console.log('Final setSchedules data:', data);
        setSchedules(data);
      } catch (err) {
        console.error("Error fetching schedules:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [refreshTrigger, showSelection]);

  const handleScheduleSelect = (scheduleId) => {
    if (activeSchedule === scheduleId) {
      setActiveSchedule(null);
      if (onSelect) onSelect(null);
    } else {
      setActiveSchedule(scheduleId);
      if (onSelect) onSelect(scheduleId);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "selesai":
      case "approved":
        return <CheckCircle size={16} className="status-icon success" />;
      case "pending":
      case "dijadwalkan":
        return <Clock size={16} className="status-icon pending" />;
      case "dibatalkan":
      case "rejected":
        return <XCircle size={16} className="status-icon rejected" />;
      default:
        return <AlertCircle size={16} className="status-icon default" />;
    }
  };

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "selesai":
      case "approved":
        return "status-badge success";
      case "pending":
      case "dijadwalkan":
        return "status-badge pending";
      case "dibatalkan":
      case "rejected":
        return "status-badge rejected";
      default:
        return "status-badge default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString.substring(0, 5); // HH:MM
  };

  return (
    <div className="jadwalCardWrapper">
      {/* Header */}
      <div className="jadwalHeader">
        <div>
          <p className="jadwalCardTitle">
            {showSelection ? " Pilih Jadwal Penyetoran" : " Jadwal Pengambilan Sampah"}
          </p>
          <p className="jadwalSubtitle">
            {showSelection
              ? "Pilih jadwal untuk menyetor sampah Anda"
              : "Lihat jadwal pengambilan sampah Anda (Penjadwalan diatur oleh admin)"}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="jadwalLoading">
          <Loader className="spinner" size={36} />
          <p>Memuat jadwal...</p>
        </div>
      ) : error ? (
        <div className="jadwalError">
          <AlertCircle size={36} />
          <p>Gagal memuat jadwal</p>
          <span>{error}</span>
          <button className="btnRetry" onClick={handleRefresh}>
            Coba Lagi
          </button>
        </div>
      ) : schedules.length === 0 ? (
        <div className="jadwalEmpty">
          <Calendar size={52} />
          <h4>Belum ada jadwal</h4>
          <p>Jadwal pengambilan akan ditampilkan di sini setelah admin mengatur jadwal untuk Anda</p>
        </div>
      ) : (
        <div className="jadwalCardGrid">
          {schedules.map((schedule) => {
            const isActive = showSelection && activeSchedule === schedule.jadwal_penyetoran_id;
            return (
              <div
                key={schedule.jadwal_penyetoran_id}
                className={`jadwalCardItem ${isActive ? "active" : ""} ${showSelection ? "selectable" : ""}`}
                onClick={() => showSelection && handleScheduleSelect(schedule.jadwal_penyetoran_id)}
              >
                <div className="jadwalCardTop">
                  <div className="cardTitleSection">
                    <Calendar size={18} />
                    <h4>{schedule.hari || formatDate(schedule.tanggal || schedule.tanggal)}</h4>
                  </div>
                  {showSelection ? (
                    isActive && <span className="activeBadge">✓ Dipilih</span>
                  ) : (
                    <div className={getStatusClass(schedule.status)}>
                      {getStatusIcon(schedule.status)}
                      <span>{schedule.status || "Pending"}</span>
                    </div>
                  )}
                </div>

                <div className="jadwalCardBody">
                  <div className="infoRow">
                    <Clock size={14} />
                    <span>
                      {schedule.jam ||
                       (schedule.waktu_mulai && schedule.waktu_selesai
                         ? `${formatTime(schedule.waktu_mulai)} - ${formatTime(schedule.waktu_selesai)}`
                         : "-")}
                    </span>
                  </div>

                  <div className="infoRow">
                    <MapPin size={14} />
                    <span>
                      {schedule.lokasi ||
                       schedule.alamat ||
                       (Array.isArray(schedule.area)
                         ? schedule.area.join(", ")
                         : schedule.area) ||
                       "-"}
                    </span>
                  </div>

                  {!showSelection && schedule.catatan && (
                    <div className="infoRow notes">
                      <AlertCircle size={14} />
                      <span>{schedule.catatan}</span>
                    </div>
                  )}
                </div>

                {showSelection && (
                  <button
                    className={`selectButton ${isActive ? "selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScheduleSelect(schedule.jadwal_penyetoran_id);
                    }}
                  >
                    {isActive ? "✓ Dipilih" : "Pilih Jadwal"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
