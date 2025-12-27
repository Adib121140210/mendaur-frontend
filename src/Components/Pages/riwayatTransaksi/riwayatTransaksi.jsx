import React, { useState, useEffect } from "react";
import {
  Clock,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  CheckCircle,
  Truck,
  RefreshCcw,
  XCircle,
  DollarSign,
  Package,
  Recycle,
  AlertCircle,
  Loader,
} from "lucide-react";
import "./riwayatTransaksi.css";

export default function RiwayatTransaksi() {
  const [filterKategori, setFilterKategori] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusOptions = ["semua", "pending", "diproses", "selesai", "ditolak"];

  // Fetch transactions from API
  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id_user');

      console.log('🔍 Fetching transactions for user:', userId);

      // Fetch cash withdrawals
      const withdrawalsResponse = await fetch('http://127.0.0.1:8000/api/penarikan-tunai', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      let withdrawals = [];
      if (withdrawalsResponse.ok) {
        const withdrawalsData = await withdrawalsResponse.json();
        console.log('Raw withdrawals response:', withdrawalsData);
        
        // Filter only withdrawals for current user
        const allWithdrawals = withdrawalsData.data?.data || withdrawalsData.data || [];
        const userWithdrawals = allWithdrawals.filter(item => 
          item.user_id?.toString() === userId?.toString()
        );
        
        console.log(`Filtered ${userWithdrawals.length} withdrawals from ${allWithdrawals.length} total`);
        
        withdrawals = userWithdrawals.map(item => ({
          id: `withdrawal-${item.penarikan_tunai_id}`,
          type: 'tarik_tunai',
          kategori: 'penukaran',
          deskripsi: `Penarikan Tunai ke ${item.nama_bank}`,
          detail: `-${item.jumlah_poin} poin`,
          points: -item.jumlah_poin,
          amount: item.jumlah_rupiah,
          status: item.status, // pending, approved, rejected
          timestamp: item.created_at,
          bankName: item.nama_bank,
          accountNumber: item.nomor_rekening,
          accountName: item.nama_penerima,
          adminNote: item.catatan_admin,
          processedAt: item.processed_at,
        }));
      }

      // Fetch waste deposits (tabung sampah)
      let wasteDeposits = [];
      try {
        // Get user ID from localStorage
        const userId = localStorage.getItem('id_user');

        if (userId) {
          const wasteResponse = await fetch(`http://127.0.0.1:8000/api/users/${userId}/tabung-sampah`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (wasteResponse.ok) {
            const wasteData = await wasteResponse.json();

            // Response format: { status: 'success', data: [...] }
            const wasteArray = wasteData.data || [];

            wasteDeposits = wasteArray.map(item => ({
              id: `waste-${item.tabung_sampah_id}`,
              type: 'tabung_sampah',
              kategori: 'tabung',
              deskripsi: `Tabung ${item.jenis_sampah}`,
              detail: `+${item.poin_diperoleh || 0} poin`,
              points: item.poin_diperoleh || 0,
              status: item.status || 'approved',
              timestamp: item.tanggal_setor || item.created_at,
              wasteType: item.jenis_sampah,
              weight: item.berat,
              location: item.titik_lokasi || item.lokasi,
            }));
          }
        }
      } catch (wasteError) {
        console.error('Error fetching waste deposits:', wasteError);
        // Continue even if waste deposits fail
      }

      // Fetch product redemptions
      let productRedemptions = [];
      try {
        const productResponse = await fetch('http://127.0.0.1:8000/api/penukaran-produk', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (productResponse.ok) {
          const productData = await productResponse.json();
          console.log('Raw product redemptions response:', productData);

          // Handle both array and object with data property
          const allRedemptions = Array.isArray(productData)
            ? productData
            : (productData.data?.data || productData.data || []);

          // Filter only redemptions for current user
          const userRedemptions = allRedemptions.filter(item => 
            item.user_id?.toString() === userId?.toString()
          );
          
          console.log(`Filtered ${userRedemptions.length} product redemptions from ${allRedemptions.length} total`);

          productRedemptions = userRedemptions.map(item => ({
            id: `product-${item.penukaran_produk_id}`,
            type: 'tukar_produk',
            kategori: 'penukaran',
            deskripsi: `Penukaran ${item.nama_produk || item.produk?.nama || 'Produk'}`,
            detail: `-${item.poin_digunakan || item.jumlah_poin || 0} poin`,
            points: -(item.poin_digunakan || item.jumlah_poin || 0),
            status: item.status || 'pending', // pending, approved, claimed, rejected
            timestamp: item.created_at,
            productName: item.nama_produk || item.produk?.nama,
            productId: item.produk_id,
            quantity: item.jumlah || 1,
            claimInstructions: item.status === 'approved' ? 'Silakan datang ke kantor Bank Sampah untuk mengambil produk' : null,
            adminNote: item.catatan_admin,
            approvedAt: item.approved_at,
            claimedAt: item.claimed_at,
            rejectedAt: item.rejected_at,
          }));
        } else {
          // Log error response
          console.error('Penukaran produk fetch error - Status:', productResponse.status);
          try {
            const errorData = await productResponse.json();
            console.error('Error details:', errorData);
          } catch {
            console.error('Could not parse error response');
          }
        }
      } catch (productError) {
        console.error('Error fetching product redemptions:', productError);
        // Continue even if product redemptions fail
      }

      // Combine all transactions
      const allTransactions = [
        ...withdrawals,
        ...wasteDeposits,
        ...productRedemptions,
      ];

      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setTransactions(allTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Gagal memuat riwayat transaksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
      case "selesai":
      case "delivered":
      case "claimed":
        return <CheckCircle className="statusIcon green" />;
      case "pending":
      case "diproses":
        return <RefreshCcw className="statusIcon orange" />;
      case "rejected":
      case "dibatalkan":
      case "cancelled":
        return <XCircle className="statusIcon red" />;
      case "dikirim":
      case "shipped":
        return <Truck className="statusIcon blue" />;
      default:
        return <Clock className="statusIcon gray" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved": return "Disetujui - Siap Diambil";
      case "pending": return "Menunggu Persetujuan";
      case "rejected": return "Ditolak";
      case "claimed": return "Sudah Diambil";
      case "selesai": return "Selesai";
      case "dikirim": return "Dikirim";
      case "shipped": return "Dalam Pengiriman";
      case "delivered": return "Sudah Diterima";
      case "diproses": return "Diproses";
      case "dibatalkan": return "Dibatalkan";
      case "cancelled": return "Dibatalkan";
      default: return "Pending";
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((item) => {
    const matchKategori = filterKategori === "semua" || item.kategori === filterKategori;
    const matchStatus = filterStatus === "semua" || item.status === filterStatus;
    const matchSearch = item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    return matchKategori && matchStatus && matchSearch;
  });

  return (
    <div className="riwayatContainer">
      <header className="riwayatHeader">
        <h1>Riwayat Aktivitas</h1>
        <p>Jejak kontribusi dan penukaran Anda di Mendaur</p>
      </header>

      {/* Search & Status Filter */}
      <div className="searchAndStatus">
        <div className="searchBox">
          <Search className="searchIcon" />
          <input
            type="text"
            placeholder="Cari aktivitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="statusDropdown"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Kategori Filter */}
      <div className="riwayatFilterBar">
        <div className="filterKategoriStatus">
          <button
            className={`filterStatusItem ${filterKategori === "semua" ? "active" : ""}`}
            onClick={() => setFilterKategori("semua")}
          >
            <div className="statusIconWrapper">
              <RefreshCcw className="statusIcon gray" />
              <span className="statusLabel">Semua</span>
            </div>
          </button>

          <button
            className={`filterStatusItem ${filterKategori === "tabung" ? "active" : ""}`}
            onClick={() => setFilterKategori("tabung")}
          >
            <div className="statusIconWrapper">
              <CheckCircle className="statusIcon green" />
              <span className="statusLabel">Tabung Sampah</span>
            </div>
          </button>

          <button
            className={`filterStatusItem ${filterKategori === "penukaran" ? "active" : ""}`}
            onClick={() => setFilterKategori("penukaran")}
          >
            <div className="statusIconWrapper">
              <XCircle className="statusIcon red" />
              <span className="statusLabel">Penukaran</span>
            </div>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loadingState">
          <Loader className="spinner" size={40} />
          <p>Memuat riwayat transaksi...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="errorState">
          <AlertCircle size={40} />
          <p>{error}</p>
          <button onClick={fetchTransactions}>Coba Lagi</button>
        </div>
      )}

      {/* Riwayat List */}
      {!loading && !error && (
        <div className={`riwayatCardWrapper ${filterKategori === "semua" ? "scrollableWrapper" : ""}`}>
          <ul className="riwayatCardList">
            {filteredTransactions.length === 0 ? (
              <div className="emptyState">
                <p>Tidak ada transaksi ditemukan</p>
                <button onClick={() => {
                  setSearchTerm("");
                  setFilterKategori("semua");
                  setFilterStatus("semua");
                }}>Reset Filter</button>
              </div>
            ) : (
              filteredTransactions.map((item) => (
                <li key={item.poin_transaksi_id} className={`riwayatCard ${item.status}`}>
                  <div className="cardTop">
                    <div className="cardTitleBlock">
                      <h3 className="cardTitle">{item.deskripsi}</h3>
                      <p className="cardSub">
                        {item.type === "tarik_tunai" && "Penarikan Tunai"}
                        {item.type === "tukar_produk" && "Penukaran Produk"}
                        {item.type === "tabung_sampah" && "Tabung Sampah"}
                        {item.type === "setor_sampah" && "Tabung Sampah"}
                      </p>
                    </div>
                    <div className={`cardPoint ${item.kategori === 'tabung' || item.kategori === 'penyetoran' ? "masuk" : "keluar"}`}>
                      {item.kategori === 'tabung' || item.kategori === 'penyetoran' ? <ArrowUpCircle className="pointIcon" /> : <ArrowDownCircle className="pointIcon" />}
                      <span>{item.detail}</span>
                    </div>
                  </div>

                  <div className="cardDetail">
                    <div className="cardInfoBlock">
                      {/* Cash Withdrawal Details */}
                      {item.type === "tarik_tunai" && (
                        <>
                          <p className="cardNote kurang">
                            <DollarSign size={14} />
                            Rp {item.amount?.toLocaleString('id-ID')}
                          </p>
                          <p className="cardInfo">
                            {item.bankName} - {item.accountNumber}
                          </p>
                          {item.adminNote && (
                            <p className="adminNote">
                              <AlertCircle size={14} />
                              {item.adminNote}
                            </p>
                          )}
                        </>
                      )}

                      {/* Waste Deposit Details */}
                      {(item.type === "tabung_sampah" || item.type === "setor_sampah") && (
                        <>
                          <p className="cardNote tambah">
                            <Recycle size={14} />
                            {item.weight} kg {item.wasteType}
                          </p>
                          {item.location && (
                            <p className="cardInfo">
                              📍 {item.location}
                            </p>
                          )}
                        </>
                      )}

                      {/* Product Redemption Details */}
                      {item.type === "tukar_produk" && (
                        <>
                          <p className="cardNote kurang">
                            <Package size={14} />
                            {item.productName} {item.quantity > 1 && `(${item.quantity}x)`}
                          </p>

                          {/* Claim Instructions for Approved Status */}
                          {item.status === 'approved' && item.claimInstructions && (
                            <div className="claimInstructions">
                              <CheckCircle size={14} className="claimIcon" />
                              <p>{item.claimInstructions}</p>
                            </div>
                          )}

                          {/* Claimed Status */}
                          {item.status === 'claimed' && item.claimedAt && (
                            <p className="cardInfo success">
                              <CheckCircle size={14} />
                              Diambil pada {new Date(item.claimedAt).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}

                          {/* Admin Note for Rejected */}
                          {item.status === 'rejected' && item.adminNote && (
                            <p className="adminNote">
                              <AlertCircle size={14} />
                              Alasan: {item.adminNote}
                            </p>
                          )}

                          {item.trackingNumber && (
                            <p className="cardInfo">
                              <Truck size={14} />
                              Resi: {item.trackingNumber}
                            </p>
                          )}
                          {item.deliveryAddress && (
                            <p className="cardInfo">
                              � {item.deliveryAddress.length > 50
                                ? item.deliveryAddress.substring(0, 50) + '...'
                                : item.deliveryAddress}
                            </p>
                          )}
                          {item.notes && (
                            <p className="cardInfo">
                              💬 {item.notes}
                            </p>
                          )}
                        </>
                      )}

                      {/* Generic Point Labels */}
                      {!item.type && item.points > 0 && <p className="cardNote tambah">Penambahan poin</p>}
                      {!item.type && item.points < 0 && <p className="cardNote kurang">Pengurangan poin</p>}
                    </div>
                    <div className="cardMeta">
                      <div className="metaItem">
                        <Calendar className="metaIcon" />
                        {new Date(item.timestamp).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="metaItem">
                        <Clock className="metaIcon" />
                        {new Date(item.timestamp).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="statusBadge">
                      {getStatusIcon(item.status)}
                      <span>{getStatusText(item.status)}</span>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
