import { useState, useEffect } from 'react'
import { PieChart, Loader, AlertCircle } from 'lucide-react'

const PointsDistribution = () => {
  const [pointsData, setPointsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('monthly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    const fetchPointsData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const params = new URLSearchParams({
          period,
          year,
          ...(period === 'daily' && { month })
        })

        const response = await fetch(
          `http://127.0.0.1:8000/api/admin/dashboard/point-summary?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setPointsData(data.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching points data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPointsData()
  }, [period, year, month])

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
              <p className="value">{pointsData.total_poin || 0}</p>
            </div>
            <div className="summary-card">
              <h4>Total Transactions</h4>
              <p className="value">{pointsData.total_transaksi || 0}</p>
            </div>
            {pointsData.total_poin && pointsData.total_transaksi > 0 && (
              <div className="summary-card">
                <h4>Avg per Transaction</h4>
                <p className="value">
                  {Math.round(pointsData.total_poin / pointsData.total_transaksi)}
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
                    <p className="points">{item.total_poin} points</p>
                    <p className="count">{item.jumlah_transaksi} transactions</p>
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
                      <strong>{item.label}</strong>: {item.total_poin} points
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
