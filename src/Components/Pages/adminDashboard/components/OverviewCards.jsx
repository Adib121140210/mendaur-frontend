import { Users, Trash2, Coins, TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const OverviewCards = () => {
  const { hasPermission } = useAuth()
  // Simple mock data - NO API calls for now
  const mockData = {
    users: { total: 8, active_30days: 8 },
    waste: { yearly_total_kg: 16.7, yearly_total_count: 10 },
    points: { yearly_total: 0, monthly_total: 0 },
    redemptions: { yearly_total_points_redeemed: 0 }
  }

  const cards = [
    {
      id: 'users',
      title: 'Total Users',
      value: mockData.users.total,
      icon: Users,
      color: 'card-blue',
      subtitle: `${mockData.users.active_30days} active (30d)`
    },
    {
      id: 'waste',
      title: 'Total Waste',
      value: `${mockData.waste.yearly_total_kg} kg`,
      icon: Trash2,
      color: 'card-green',
      subtitle: `${mockData.waste.yearly_total_count} deposits`
    },
    {
      id: 'points',
      title: 'Points Distributed',
      value: mockData.points.yearly_total,
      icon: Coins,
      color: 'card-yellow',
      subtitle: `${mockData.points.monthly_total} this month`
    },
    {
      id: 'redemptions',
      title: 'Points Redeemed',
      value: mockData.redemptions.yearly_total_points_redeemed,
      icon: TrendingUp,
      color: 'card-purple',
      subtitle: 'This year'
    }
  ]

  return (
    <div className="overview-cards-grid">
      {cards.map((card) => {
        // ✅ Permission check - only show cards user has access to
        const canViewCard = card.id === 'users' 
          ? hasPermission('view_users') 
          : hasPermission('view_analytics')
        
        if (!canViewCard) return null
        
        const IconComponent = card.icon
        return (
          <div key={card.id} className={`overview-card ${card.color}`}>
            <div className="card-header">
              <div className="card-icon">
                <IconComponent size={24} />
              </div>
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
