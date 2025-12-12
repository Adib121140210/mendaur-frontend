import {Routes, Route, Navigate} from 'react-router-dom'
import "./index.css"
import { useAuth } from './Components/Pages/context/AuthContext'
import BottomNav from './Components/BottomNav/bottomNav'

// Auth Pages
import Landing from './Components/Pages/Landing/Landing'
import Login from "./Components/Pages/login/login"
import Daftar from "./Components/Pages/daftar/daftar"
import Register from './Components/Pages/register/register'

// User Layout & Pages
import Layout from "./Components/Pages/home/Layout"
import HomeContent from "./Components/Pages/home/homeContent"
import ArtikelPage from './Components/Pages/artikel/artikelPage'
import ArtikelDetail from './Components/Pages/artikelDetail/artikelDetail'
import Profil from "./Components/Pages/profil/profil"
import TabungSampah from './Components/Pages/tabungSampah/tabungSampah'
import RiwayatTabung from './Components/Pages/tabungSampah/riwayatTabung'
import Produk from "./Components/Pages/produk/produk"
import ProdukDetail from './Components/Pages/produk/produkDetail/produkDetail'
import TukarPoin from "./Components/Pages/tukarPoin/tukarPoin"
import Leaderboard from "./Components/Pages/leaderboard/leaderboard"
import RiwayatTransaksi from './Components/Pages/riwayatTransaksi/riwayatTransaksi'

// Admin Point System Components
import AdminPointDashboard from './Components/Pages/pointDashboard/pointDashboard'
import AdminStatsCard from './Components/Pages/pointCard/pointCard'
import AllUsersHistory from './Components/Pages/pointHistory/pointHistory'
import PointBreakdown from './Components/Pages/pointBreakdown/pointBreakdown'
import AllRedemptions from './Components/Pages/redeemHistory/redeemHistory'

// Admin Dashboard Component
import AdminDashboard from './Components/Pages/adminDashboard/AdminDashboard'

// Protected Route Components
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Admin-only routes
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // User routes - block admins from accessing user dashboard
  if (requiredRole === 'user' && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <>
      <Routes>
        {/* Root Route - Redirect based on auth status */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

      {/* Public Auth Routes */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/daftar" element={<Daftar />} />

      {/* User Dashboard Routes (Protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeContent />} />
        <Route path="artikel" element={<ArtikelPage />} />
        <Route path="artikel/:id" element={<ArtikelDetail />} />
        <Route path="profil" element={<Profil />} />
        <Route path="tabungSampah" element={<TabungSampah/>} />
        <Route path="riwayatTabung" element={<RiwayatTabung/>} />
        <Route path="produk" element={<Produk />} />
        <Route path="produk/:id" element={<ProdukDetail />} />
        <Route path="tukarPoin" element={<TukarPoin />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="riwayatTransaksi" element={<RiwayatTransaksi />} />
      </Route>

      {/* Admin Dashboard Routes (Protected) */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Point System Routes (Protected) */}
      <Route
        path="/admin/dashboard/points"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPointDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard/points/stats"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminStatsCard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard/points/history"
        element={
          <ProtectedRoute requiredRole="admin">
            <AllUsersHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard/points/breakdown"
        element={
          <ProtectedRoute requiredRole="admin">
            <PointBreakdown />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard/points/redemptions"
        element={
          <ProtectedRoute requiredRole="admin">
            <AllRedemptions />
          </ProtectedRoute>
        }
      />

      {/* Catch-all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  );
};

export default App
