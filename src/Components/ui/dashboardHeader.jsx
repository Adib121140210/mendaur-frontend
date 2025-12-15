import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Pages/context/AuthContext";
import "./dashboardHeader.css";
import { Search, Bell, LogOut } from "lucide-react";

export default function DashboardHeader() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* handle search */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Implementasi search ke halaman atau API
      setSearchQuery("");
      setShowSearchModal(false);
    }
  };

  /* handle logout */
  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  /* handle notifications */
  const handleNotifications = () => {
    console.log("Membuka notifikasi...");
    // Implementasi notifikasi akan ditambahkan nanti
  };

  return (
    <header className="dashboardHeader" role="banner">
      <div className="headerContent">
        <div className="headerLeft">
          <div className="desktopTitle">
            <h1 className="headerTitle">Dashboard</h1>
            <p className="headerSubtitle">Selamat Datang Kembali di Mendaur</p>
          </div>
          <div className="mobileTitle">
            <h1 className="headerTitle">Mendaur</h1>
          </div>
        </div>

        <nav className="headerRight" aria-label="Navigasi cepat">
          {/* Tombol Cari */}
          <button
            className="iconButton"
            onClick={() => setShowSearchModal(true)}
            aria-label="Cari"
            title="Cari"
          >
            <Search className="icon" />
          </button>

          {/* Tombol Notifikasi */}
          <button
            className="iconButton"
            onClick={handleNotifications}
            aria-label="Notifikasi"
            title="Notifikasi"
          >
            <Bell className="icon" />
          </button>

          {/* Tombol Logout */}
          <button
            className="iconButton logout-button"
            onClick={handleLogout}
            aria-label="Keluar"
            title="Keluar"
          >
            <LogOut className="icon" />
          </button>
        </nav>
      </div>

      {/* Modal Pencarian */}
      {showSearchModal && (
        <div className="searchModal" onClick={() => setShowSearchModal(false)}>
          <div
            className="searchModalContent"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="searchForm">
              <Search className="searchIcon" />
              <input
                type="text"
                className="searchInput"
                placeholder="Cari artikel, produk, atau pengguna..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="searchSubmitBtn">
                Cari
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
