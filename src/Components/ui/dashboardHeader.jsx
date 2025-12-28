import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Pages/context/AuthContext";
import "./dashboardHeader.css";
import { Bell, LogOut } from "lucide-react";

export default function DashboardHeader() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  /* handle logout */
  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  /* handle notifications */
  const handleNotifications = () => {
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
    </header>
  );
}
