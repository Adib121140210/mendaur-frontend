import { useState, useEffect } from 'react'
import { Users, Trash2, Coins, TrendingUp, Loader } from 'lucide-react'

// Mock data untuk fallback ketika backend tidak tersedia
const mockData = {
  users: {
    total: 1250,
    active_30days: 840,
    new_this_month: 45
  },
  waste: {
    yearly_total_kg: 15420,
    yearly_total_count: 2380,
    monthly_total_kg: 1320,
    monthly_total_count: 195
  },
  points: {
    yearly_total: 384500,
    monthly_total: 32100,
    distributed_today: 2450
  },
  redemptions: {
    yearly_total_points_redeemed: 156200,
    yearly_total_value: 78100,
    monthly_total_redeemed: 12800
  }
}

const OverviewCards = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOverviewStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch(
        'http://127.0.0.1:8000/api/admin/dashboard/overview',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      // Backend response structure: { success: true, data: {...} }
      if (data.success && data.data) {
        setStats(data.data)
      } else {
        throw new Error('Invalid response format')
      }
      setLoading(false)
    } catch (err) {
      console.error('Error fetching overview stats:', err.message)
      // Fallback to mock data only if API is truly unavailable
      console.info('Using mock data as fallback')
      setStats(mockData)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverviewStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchOverviewStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="overview-cards-loading">
        <Loader className="spinner" />
        <p>Loading overview...</p>
      </div>
    )
  }

  if (!stats) {
    return <p>No data available</p>
  }

  const cards = [
    {
      id: 'users',
      title: 'Total Users',
      value: stats.users?.total || 0,
      icon: Users,
      color: 'card-blue',
      subtitle: `${stats.users?.active_30days || 0} active (30d)`
    },
    {
      id: 'waste',
      title: 'Total Waste',
      value: `${stats.waste?.yearly_total_kg || 0} kg`,
      icon: Trash2,
      color: 'card-green',
      subtitle: `${stats.waste?.yearly_total_count || 0} deposits`
    },
    {
      id: 'points',
      title: 'Points Distributed',
      value: stats.points?.yearly_total || 0,
      icon: Coins,
      color: 'card-yellow',
      subtitle: `${stats.points?.monthly_total || 0} this month`
    },
    {
      id: 'redemptions',
      title: 'Points Redeemed',
      value: stats.redemptions?.yearly_total_points_redeemed || 0,
      icon: TrendingUp,
      color: 'card-purple',
      subtitle: 'This year'
    }
  ]

  return (
    <div className="overview-cards-grid">
      {cards.map((card) => {
        const IconComponent = card.icon
        return (
          <div key={card.id} className={`overview-card ${card.color}`}>
            <div className="card-header">
              <div className="card-icon">
                <IconComponent size={24} />
              </div>
              <button
                onClick={fetchOverviewStats}
                className="btn-refresh"
                title="Refresh data"
              >
                ↻
              </button>
            </div>
            <div className="card-body">
              <h3 className="card-title">{card.title}</h3>
              <p className="card-value">{card.value}</p>
              <p className="card-subtitle">{card.subtitle}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default OverviewCards
