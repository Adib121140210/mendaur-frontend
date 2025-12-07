import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Recycle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter,
  Calendar,
  Package,
  Eye,
  X
} from "lucide-react";
import useScrollTop from "../../lib/useScrollTop";
import "./riwayatTabung.css";

const RiwayatTabung = () => {
  useScrollTop();
  const { user } = useAuth();

  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    if (user?.id) {
      fetchDeposits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, statusFilter]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const url = `http://127.0.0.1:8000/api/users/${user.id}/tabung-sampah${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn("Tabung Sampah API not available yet");
        setDeposits([]);
        return;
      }

      const result = await response.json();

      if (result.status === "success") {
        setDeposits(result.data || []);
        
        // Calculate stats from all data
        if (result.stats) {
          setStats(result.stats);
        } else {
          // Calculate manually if not provided
          calculateStats(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching tabung sampah:", error.message);
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (allDeposits) => {
    setStats({
      total: allDeposits.length,
      pending: allDeposits.filter(d => d.status === "pending").length,
      approved: allDeposits.filter(d => d.status === "approved").length,
      rejected: allDeposits.filter(d => d.status === "rejected").length
    });
  };

  const openModal = (deposit) => {
    setSelectedDeposit(deposit);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDeposit(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={18} />;
      case "approved":
        return <CheckCircle size={18} />;
      case "rejected":
        return <XCircle size={18} />;
      default:
        return <Package size={18} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f39c12";
      case "approved":
        return "#27ae60";
      case "rejected":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Menunggu Verifikasi";
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="riwayatTabungWrapper">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p>Memuat data penyetoran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="riwayatTabungWrapper">
      {/* Header */}
      <div className="riwayatTabungHeader">
        <div className="headerContent">
          <div className="headerTop">
            <div className="headerTextSection">
              <div className="titleGroup">
                <div className="iconWrapper">
                  <Recycle size={48} />
                </div>
                <div>
                  <h1 className="pageTitle">Riwayat Tabung Sampah</h1>
                  <p className="pageSubtitle">
                    Pantau kontribusi Anda untuk lingkungan yang lebih baik
                  </p>
                </div>
              </div>
            </div>
            
            <div className="headerBadge">
              <div className="badgeIcon">
                <Package size={24} />
              </div>
              <div className="badgeContent">
                <span className="badgeLabel">Total Setoran</span>
                <span className="badgeValue">{stats.total}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="depositStats">
            <div className="statCard approved">
              <div className="statIconWrapper">
                <CheckCircle size={32} />
              </div>
              <div className="statContent">
                <span className="statNumber">{stats.approved}</span>
                <span className="statLabel">Disetujui</span>
              </div>
              <div className="statPercentage">
                {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </div>
            </div>
            
            <div className="statCard pending">
              <div className="statIconWrapper">
                <Clock size={32} />
              </div>
              <div className="statContent">
                <span className="statNumber">{stats.pending}</span>
                <span className="statLabel">Menunggu</span>
              </div>
              <div className="statPercentage">
                {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
              </div>
            </div>
            
            <div className="statCard rejected">
              <div className="statIconWrapper">
                <XCircle size={32} />
              </div>
              <div className="statContent">
                <span className="statNumber">{stats.rejected}</span>
                <span className="statLabel">Ditolak</span>
              </div>
              <div className="statPercentage">
                {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filterSection">
        <div className="filterButtons">
          <button
            className={`filterBtn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            <Filter size={16} />
            Semua ({stats.total})
          </button>
          <button
            className={`filterBtn pending ${statusFilter === "pending" ? "active" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            <Clock size={16} />
            Menunggu ({stats.pending})
          </button>
          <button
            className={`filterBtn approved ${statusFilter === "approved" ? "active" : ""}`}
            onClick={() => setStatusFilter("approved")}
          >
            <CheckCircle size={16} />
            Disetujui ({stats.approved})
          </button>
          <button
            className={`filterBtn rejected ${statusFilter === "rejected" ? "active" : ""}`}
            onClick={() => setStatusFilter("rejected")}
          >
            <XCircle size={16} />
            Ditolak ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Deposits List */}
      <div className="depositsContainer">
        {deposits.length === 0 ? (
          <div className="emptyState">
            <div className="emptyIcon">
              {statusFilter === "all" ? "📦" : 
               statusFilter === "pending" ? "⏳" : 
               statusFilter === "approved" ? "✅" : "❌"}
            </div>
            <h3 className="emptyTitle">
              {statusFilter === "all" 
                ? "Belum ada penyetoran" 
                : `Tidak ada penyetoran ${getStatusText(statusFilter).toLowerCase()}`}
            </h3>
            <p className="emptySubtext">
              {statusFilter === "all" 
                ? "Mulai setor sampah untuk berkontribusi pada lingkungan!" 
                : `Ubah filter untuk melihat penyetoran lainnya.`}
            </p>
          </div>
        ) : (
          <div className="depositsList">
            {deposits.map((deposit) => (
              <DepositCard
                key={deposit.id}
                deposit={deposit}
                onViewDetail={() => openModal(deposit)}
                formatDate={formatDate}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedDeposit && (
        <DepositModal
          deposit={selectedDeposit}
          onClose={closeModal}
          formatDate={formatDate}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />
      )}
    </div>
  );
};

// Deposit Card Component
function DepositCard({ deposit, onViewDetail, formatDate, getStatusIcon, getStatusColor, getStatusText }) {
  return (
    <div className="depositCard">
      <div className="cardHeader">
        <div className="depositInfo">
          <h3 className="depositTitle">{deposit.jenis_sampah || "Sampah"}</h3>
          <p className="depositDate">
            <Calendar size={14} />
            {formatDate(deposit.created_at || deposit.tanggal_setor)}
          </p>
        </div>
        <div
          className="statusBadge"
          style={{ backgroundColor: getStatusColor(deposit.status) }}
        >
          {getStatusIcon(deposit.status)}
          <span>{getStatusText(deposit.status)}</span>
        </div>
      </div>

      <div className="cardBody">
        <div className="depositDetail">
          <span className="detailLabel">Berat</span>
          <span className="detailValue">{deposit.berat || 0} kg</span>
        </div>
        <div className="depositDetail">
          <span className="detailLabel">Poin Didapat</span>
          <span className="detailValue points">
            {deposit.status === "approved" ? `+${deposit.poin_didapat || 0}` : "-"}
          </span>
        </div>
      </div>

      <button className="viewDetailBtn" onClick={onViewDetail}>
        <Eye size={16} />
        Lihat Detail
      </button>
    </div>
  );
}

// Deposit Modal Component
function DepositModal({ deposit, onClose, formatDate, getStatusIcon, getStatusColor, getStatusText }) {
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h2 className="modalTitle">Detail Penyetoran</h2>
          <button className="closeBtn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modalBody">
          {/* Status Badge */}
          <div
            className="modalStatusBadge"
            style={{ backgroundColor: getStatusColor(deposit.status) }}
          >
            {getStatusIcon(deposit.status)}
            <span>{getStatusText(deposit.status)}</span>
          </div>

          {/* Photo Evidence */}
          {deposit.foto_bukti && (
            <div className="photoSection">
              <h3 className="sectionTitle">Foto Bukti</h3>
              <img
                src={deposit.foto_bukti.startsWith('http') 
                  ? deposit.foto_bukti 
                  : `http://127.0.0.1:8000${deposit.foto_bukti}`}
                alt="Bukti penyetoran"
                className="evidencePhoto"
              />
            </div>
          )}

          {/* Deposit Information */}
          <div className="infoSection">
            <h3 className="sectionTitle">Informasi Penyetoran</h3>
            <div className="infoGrid">
              <div className="infoItem">
                <span className="infoLabel">Jenis Sampah</span>
                <span className="infoValue">{deposit.jenis_sampah || "-"}</span>
              </div>
              <div className="infoItem">
                <span className="infoLabel">Berat</span>
                <span className="infoValue">{deposit.berat || 0} kg</span>
              </div>
              <div className="infoItem">
                <span className="infoLabel">Tanggal Setor</span>
                <span className="infoValue">{formatDate(deposit.created_at || deposit.tanggal_setor)}</span>
              </div>
              <div className="infoItem">
                <span className="infoLabel">Poin Didapat</span>
                <span className="infoValue points">
                  {deposit.status === "approved" ? `+${deposit.poin_didapat || 0} poin` : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Notes (if rejected) */}
          {deposit.status === "rejected" && deposit.catatan_admin && (
            <div className="notesSection rejected">
              <h3 className="sectionTitle">Alasan Penolakan</h3>
              <p className="notesText">{deposit.catatan_admin}</p>
            </div>
          )}

          {/* Admin Notes (if approved) */}
          {deposit.status === "approved" && deposit.catatan_admin && (
            <div className="notesSection approved">
              <h3 className="sectionTitle">Catatan Admin</h3>
              <p className="notesText">{deposit.catatan_admin}</p>
            </div>
          )}

          {/* Approval Info */}
          {(deposit.status === "approved" || deposit.status === "rejected") && deposit.tanggal_verifikasi && (
            <div className="approvalInfo">
              <p className="approvalText">
                {deposit.status === "approved" ? "Disetujui" : "Ditolak"} pada{" "}
                {formatDate(deposit.tanggal_verifikasi)}
              </p>
            </div>
          )}
        </div>

        <div className="modalFooter">
          <button className="closeModalBtn" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default RiwayatTabung;
