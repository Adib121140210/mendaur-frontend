import React from "react";
import "./dashboardHeader.css";
import { Search, MessageSquare, Bell } from "lucide-react";

export default function DashboardHeader() {
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
          <button className="iconButton" aria-label="Cari">
            <Search className="icon" />
          </button>
          <button className="iconButton" aria-label="Pesan">
            <MessageSquare className="icon" />
          </button>
          <button className="iconButton" aria-label="Notifikasi">
            <Bell className="icon" />
          </button>
        </nav>
      </div>
    </header>
  );
}