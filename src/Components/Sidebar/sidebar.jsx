import { Link, useLocation } from "react-router-dom";
import { Sidebarlinks, SidebarBottomlinks } from "../lib/navigation";
import { useAuth } from "../Pages/context/AuthContext";
import "./sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebarTop">
        <ProfileSection />
        <NavSection title="HALAMAN" links={Sidebarlinks} />
      </div>
      <div className="logoutSection">
        <NavSection links={SidebarBottomlinks} />
      </div>
    </aside>
  );
}

function ProfileSection() {
  const { user, isAuthenticated } = useAuth();

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="profileSection">
        <Link to="/login" className="profileImageLink">
          <img 
            src="https://ui-avatars.com/api/?name=Guest&size=80&background=4CAF50&color=fff&bold=true" 
            alt="Guest profile" 
            className="profileImage" 
          />
        </Link>
        <div className="profileData">
          <span className="profileName">Guest</span>
          <Link to="/login" className="profileBadge" style={{ color: '#4CAF50', cursor: 'pointer' }}>
            Login untuk mulai
          </Link>
        </div>
      </div>
    );
  }

  // Generate avatar URL
  const getAvatarUrl = () => {
    if (user.foto_profil) {
      return `http://127.0.0.1:8000/storage/${user.foto_profil}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama)}&size=80&background=4CAF50&color=fff&bold=true`;
  };

  return (
    <div className="profileSection">
      <Link to="/profil" className="profileImageLink">
        <img 
          src={getAvatarUrl()} 
          alt={`${user.nama} profile`} 
          className="profileImage"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama || 'User')}&size=80&background=4CAF50&color=fff&bold=true`;
          }}
        />
      </Link>
      <div className="profileData">
        <span className="profileName">{user.nama || 'User'}</span>
        <span className="profileBadge">{user.level || 'Member'}</span>
        <span className="profilePoints">Poin: {user.total_poin || 0}</span>
      </div>
    </div>
  );
}



function NavSection({ title, links }) {
  return (
    <nav className="navSection">
      {title && <p className="navTitle">{title}</p>}
      <ul className="navList">
        {links.map((item) => (
          <li key={item.key}>
            <NavItem item={item} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function NavItem({ item }) {
  const { logout } = useAuth();
  const location = useLocation();
  const isActive = location.pathname === item.path;

  // Handle logout
  const handleClick = (e) => {
    if (item.key === 'logout') {
      e.preventDefault();
      logout();
      window.location.href = '/login';
    }
  };

  return (
    <Link to={item.path} onClick={handleClick} className={`navItem ${isActive ? "active" : ""}`}>
      <span className="navIcon">{item.icon}</span>
      <span className="navLabel">{item.label}</span>
    </Link>
  );
}