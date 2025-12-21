import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader } from 'lucide-react'
import AdminSidebar from './components/AdminSidebar'
import OverviewCards from './components/OverviewCards'
import UserManagementTable from './components/UserManagementTable'
import WasteAnalytics from './components/WasteAnalytics'
import PointsDistribution from './components/PointsDistribution'
import WasteByUserTable from './components/WasteByUserTable'
import ReportsSection from './components/ReportsSection'
import ContentManagement from './components/ContentManagement'
import WasteDepositsManagement from './components/WasteDepositsManagement'
import ProductRedemptionManagement from './components/ProductRedemptionManagement'
import CashWithdrawalManagement from './components/CashWithdrawalManagement'
import ScheduleManagement from './components/ScheduleManagement'
import BadgeManagement from './components/BadgeManagement'
import NotificationManagement from './components/NotificationManagement'
import './adminDashboard.css'
import './styles/adminSidebar.css'
import './styles/analyticsComponents.css'
import './styles/contentManagement.css'
import './styles/wasteDepositsManagement.css'
import './styles/productRedemptionManagement.css'
import './styles/cashWithdrawalManagement.css'
import './styles/scheduleManagement.css'
import './styles/badgeManagement.css'
import './styles/notificationManagement.css'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    // Check user role from localStorage
    const role = localStorage.getItem('role')
    const token = localStorage.getItem('token')

    if (!token || (role !== 'admin' && role !== 'superadmin')) {
      setError('Access denied. Admin or Superadmin role required.')
      setLoading(false)
      return
    }

    setUserRole(role)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <Loader className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-dashboard-error">
        <AlertCircle className="error-icon" />
        <h2>Access Denied</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')} className="btn-redirect">
          Go to Login
        </button>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const tabs = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'waste-deposits', label: 'Penyetoran Sampah' },
    { id: 'product-redemption', label: 'Penukaran Produk' },
    { id: 'cash-withdrawal', label: 'Penarikan Tunai' },
    { id: 'schedule', label: 'Jadwal Penyetoran' },
    { id: 'waste', label: 'Waste Analytics' },
    { id: 'points', label: 'Points Distribution' },
    { id: 'waste-by-user', label: 'Waste by User' },
    { id: 'users', label: 'User Management' },
    { id: 'badge', label: 'Badge Management' },
    { id: 'notification', label: 'Notification Management' },
    { id: 'content', label: 'Content Management' },
    { id: 'reports', label: 'Reports' }
  ]

  return (
    <>
      {/* Admin Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} userRole={userRole} />

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Header Section */}
        <div className="admin-dashboard-container">
          <div className="admin-dashboard-header">
            <div className="header-content">
              <h1>Admin Dashboard</h1>
              <p className="role-badge">
                Role: <span className="role-text">{userRole.toUpperCase()}</span>
              </p>
            </div>
            <p className="header-description">
              Comprehensive analytics and management for Mendaur system
            </p>
          </div>
        </div>

        {/* Overview Cards - Always Visible */}
        <div className="admin-dashboard-container overview-section">
          {activeTab === 'overview' || activeTab === 'users' || activeTab === 'content' || activeTab === 'reports' ? null : (
            <OverviewCards />
          )}
        </div>

        {/* Tab Content Section */}
        <div className="admin-dashboard-container">
          <div className="tab-content">
            {/* Overview Dashboard Tab */}
            {activeTab === 'overview' && (
              <div className="tab-pane">
                <OverviewCards />
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="tab-pane">
                <UserManagementTable />
              </div>
            )}

            {/* Waste Deposits Tab */}
            {activeTab === 'waste-deposits' && (
              <div className="tab-pane">
                <WasteDepositsManagement />
              </div>
            )}

            {/* Product Redemption Tab */}
            {activeTab === 'product-redemption' && (
              <div className="tab-pane">
                <ProductRedemptionManagement />
              </div>
            )}

            {/* Cash Withdrawal Tab */}
            {activeTab === 'cash-withdrawal' && (
              <div className="tab-pane">
                <CashWithdrawalManagement />
              </div>
            )}

            {/* Schedule Management Tab */}
            {activeTab === 'schedule' && (
              <div className="tab-pane">
                <ScheduleManagement />
              </div>
            )}

            {/* Waste Analytics Tab */}
            {activeTab === 'waste' && (
              <div className="tab-pane">
                <WasteAnalytics />
              </div>
            )}

            {/* Points Distribution Tab */}
            {activeTab === 'points' && (
              <div className="tab-pane">
                <PointsDistribution />
              </div>
            )}

            {/* Waste by User Tab */}
            {activeTab === 'waste-by-user' && (
              <div className="tab-pane">
                <WasteByUserTable />
              </div>
            )}

            {/* Badge Management Tab */}
            {activeTab === 'badge' && (
              <div className="tab-pane">
                <BadgeManagement />
              </div>
            )}

            {/* Notification Management Tab */}
            {activeTab === 'notification' && (
              <div className="tab-pane">
                <NotificationManagement />
              </div>
            )}

            {/* Content Management Tab */}
            {activeTab === 'content' && (
              <div className="tab-pane">
                <ContentManagement />
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="tab-pane">
                <ReportsSection />
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default AdminDashboard
