import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader } from 'lucide-react'
import OverviewCards from './components/OverviewCards'
import UserManagementTable from './components/UserManagementTable'
import WasteAnalytics from './components/WasteAnalytics'
import PointsDistribution from './components/PointsDistribution'
import WasteByUserTable from './components/WasteByUserTable'
import ReportsSection from './components/ReportsSection'
import './adminDashboard.css'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'waste', label: 'Waste Analytics' },
    { id: 'points', label: 'Points Distribution' },
    { id: 'waste-by-user', label: 'Waste by User' },
    { id: 'reports', label: 'Reports' }
  ]

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
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

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="tabs-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-pane">
            <OverviewCards userRole={userRole} />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="tab-pane">
            <UserManagementTable />
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

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="tab-pane">
            <ReportsSection />
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
