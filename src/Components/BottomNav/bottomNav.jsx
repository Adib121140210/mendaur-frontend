import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Pages/context/authContext';
import './bottomNav.css';

// Icons as inline SVGs
const Icons = {
  home: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ),
  tabung: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  tukar: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  riwayat: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.46-1.38-3.74-2.16V8h-1z" />
    </svg>
  ),
  leaderboard: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
    </svg>
  ),
  profil: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  ),
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  // Update active tab based on current route
  useEffect(() => {
    const pathname = location.pathname;
    
    if (pathname === '/' || pathname.includes('/home')) {
      setActiveTab('home');
    } else if (pathname.includes('/tabung')) {
      setActiveTab('tabung');
    } else if (pathname.includes('/tukar-poin')) {
      setActiveTab('tukar');
    } else if (pathname.includes('/riwayat')) {
      setActiveTab('riwayat');
    } else if (pathname.includes('/leaderboard')) {
      setActiveTab('leaderboard');
    } else if (pathname.includes('/profil')) {
      setActiveTab('profil');
    }
  }, [location]);

  const handleNavigation = (tab, path) => {
    setActiveTab(tab);
    navigate(path);
  };

  // Hide bottom nav on desktop (only show on mobile/tablet)
  if (!user) return null;

  return (
    <nav className="bottom-nav-container">
      <div className="bottom-nav-wrapper">
        {/* Home */}
        <button
          className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => handleNavigation('home', '/')}
          title="Home"
        >
          <div className="bottom-nav-icon">{Icons.home}</div>
          <span className="bottom-nav-label">Home</span>
        </button>

        {/* Tabung Sampah */}
        <button
          className={`bottom-nav-item ${activeTab === 'tabung' ? 'active' : ''}`}
          onClick={() => handleNavigation('tabung', '/tabung-sampah')}
          title="Tabung Sampah"
        >
          <div className="bottom-nav-icon">{Icons.tabung}</div>
          <span className="bottom-nav-label">Tabung</span>
        </button>

        {/* Riwayat */}
        <button
          className={`bottom-nav-item ${activeTab === 'riwayat' ? 'active' : ''}`}
          onClick={() => handleNavigation('riwayat', '/riwayat-transaksi')}
          title="Riwayat"
        >
          <div className="bottom-nav-icon">{Icons.riwayat}</div>
          <span className="bottom-nav-label">Riwayat</span>
        </button>

        {/* Tukar Poin */}
        <button
          className={`bottom-nav-item ${activeTab === 'tukar' ? 'active' : ''}`}
          onClick={() => handleNavigation('tukar', '/tukar-poin')}
          title="Tukar Poin"
        >
          <div className="bottom-nav-icon">{Icons.tukar}</div>
          <span className="bottom-nav-label">Tukar</span>
        </button>

        {/* Leaderboard */}
        <button
          className={`bottom-nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => handleNavigation('leaderboard', '/leaderboard')}
          title="Leaderboard"
        >
          <div className="bottom-nav-icon">{Icons.leaderboard}</div>
          <span className="bottom-nav-label">Top</span>
        </button>

        {/* Profil */}
        <button
          className={`bottom-nav-item ${activeTab === 'profil' ? 'active' : ''}`}
          onClick={() => handleNavigation('profil', '/profil')}
          title="Profil"
        >
          <div className="bottom-nav-icon">{Icons.profil}</div>
          <span className="bottom-nav-label">Profil</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
