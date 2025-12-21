import { useState, useEffect } from 'react'
import { PieChart, Loader, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// Mock points data for development
const MOCK_POINTS_DATA = {
  total_points: 8450,
  distributed_this_month: 2100,
  average_per_user: 285,
  points_by_source: [
    { source: 'Setoran Sampah', points: 4200, percentage: 49.7 },
    { source: 'Referral', points: 2100, percentage: 24.9 },
    { source: 'Bonus', points: 1050, percentage: 12.4 },
    { source: 'Kompetisi', points: 1100, percentage: 13.0 },
  ]
}

const PointsDistribution = () => {
  const { hasPermission } = useAuth()
  const [pointsData, setPointsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('monthly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    const fetchPointsData = async () => {
      try {
        // ✅ Permission check for view_analytics
        if (!hasPermission('view_analytics')) {
          setError('❌ You do not have permission to view points analytics')
          setLoading(false)
          return
        }
        
        setLoading(true)
        const token = localStorage.getItem('token')
        const params = new URLSearchParams({
          period,
          ...(period === 'monthly' && { year, month })
        })

        try {
          const response = await fetch(
            `http://127.0.0.1:8000/api/admin/analytics/points?${params}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          )

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
          // Backend response structure: { success: true, data: {...} }
          if (data.success && data.data) {
            setPointsData(data.data)
          } else {
            throw new Error('No data in response')
          }
          setError(null)
        } catch (err) {
          console.warn('Backend unreachable or error, using mock points data:', err.message)
          // Use mock data as fallback
          setPointsData(MOCK_POINTS_DATA)
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching points data:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPointsData()
  }, [period, year, month, hasPermission])

  if (error) {
    return (
      <div className="points-error">
        <AlertCircle className="error-icon" />
        <p>Error: {error}</p>
        <button onClick={() => setError(null)} className="btn-retry">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="points-distribution">
      <div className="points-header">
        <div className="points-title">
          <PieChart size={24} />
          <h2>Points Distribution</h2>
        </div>

        <div className="points-filters">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="filter-select"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="filter-select"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {period === 'daily' && (
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="filter-select"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Month {i + 1}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="points-loading">
          <Loader className="spinner" />
          <p>Loading points data...</p>
        </div>
      ) : pointsData ? (
        <>
          {/* Summary Stats */}
          <div className="points-summary">
            <div className="summary-card">
              <h4>Total Points</h4>
              <p className="value">{pointsData.total_poin || pointsData.total_points || 0}</p>
            </div>
            <div className="summary-card">
              <h4>Total Transactions</h4>
              <p className="value">{pointsData.total_transaksi || pointsData.total_transactions || 0}</p>
            </div>
            {(pointsData.total_poin || pointsData.total_points) && (pointsData.total_transaksi || pointsData.total_transactions) > 0 && (
              <div className="summary-card">
                <h4>Avg per Transaction</h4>
                <p className="value">
                  {Math.round((pointsData.total_poin || pointsData.total_points) / (pointsData.total_transaksi || pointsData.total_transactions))}
                </p>
              </div>
            )}
          </div>

          {/* Points by Source */}
          <div className="points-by-source">
            <h3>Points Breakdown by Source</h3>
            <div className="sources-grid">
              {pointsData.summary && pointsData.summary.length > 0 ? (
                pointsData.summary.map((item, index) => (
                  <div key={index} className="source-card">
                    <h4>{item.source}</h4>
                    <p className="points">{item.total_poin || item.points} points</p>
                    <p className="count">{item.jumlah_transaksi || item.count} transactions</p>
                  </div>
                ))
              ) : pointsData.points_by_source ? (
                pointsData.points_by_source.map((item, index) => (
                  <div key={index} className="source-card">
                    <h4>{item.source}</h4>
                    <p className="points">{item.points} points</p>
                    <p className="count">{item.percentage}%</p>
                  </div>
                ))
              ) : (
                <p className="no-data">No points data available</p>
              )}
            </div>
          </div>

          {/* Chart Data */}
          {pointsData.chart_data && (
            <div className="points-chart-data">
              <h3>Points Trend</h3>
              <div className="chart-items">
                {pointsData.chart_data.map((item, index) => (
                  <div key={index} className="chart-item">
                    <p>
                      <strong>{item.label}</strong>: {item.total_poin || item.points} points
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p>No data available</p>
      )}
    </div>
  )
}

export default PointsDistribution
