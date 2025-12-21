import { useState, useEffect } from 'react'
import { BarChart3, Loader, AlertCircle, Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// Mock waste data for development
const MOCK_WASTE_DATA = {
  total_weight: 245.8,
  total_transactions: 128,
  average_per_transaction: 1.92,
  waste_by_type: [
    { type: 'Plastik', weight: 89.2, count: 45 },
    { type: 'Kertas', weight: 78.5, count: 32 },
    { type: 'Logam', weight: 45.3, count: 28 },
    { type: 'Kaca', weight: 32.8, count: 23 },
  ]
}

const WasteAnalytics = () => {
  const { hasPermission } = useAuth()
  const [wasteData, setWasteData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('monthly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    const fetchWasteData = async () => {
      try {
        // ✅ Permission check for view_analytics
        if (!hasPermission('view_analytics')) {
          setError('❌ You do not have permission to view waste analytics')
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
            `http://127.0.0.1:8000/api/admin/analytics/waste?${params}`,
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
            setWasteData(data.data)
          } else {
            throw new Error('No data in response')
          }
          setError(null)
        } catch (err) {
          console.warn('Backend unreachable or error, using mock waste data:', err.message)
          // Use mock data as fallback
          setWasteData(MOCK_WASTE_DATA)
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching waste data:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchWasteData()
  }, [period, year, month, hasPermission])

  if (error) {
    return (
      <div className="waste-analytics-error">
        <AlertCircle className="error-icon" />
        <p>Error: {error}</p>
        <button onClick={() => setError(null)} className="btn-retry">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="waste-analytics">
      <div className="waste-header">
        <div className="waste-title">
          <BarChart3 size={24} />
          <h2>Waste Analytics</h2>
        </div>

        <div className="waste-filters">
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
        <div className="waste-loading">
          <Loader className="spinner" />
          <p>Loading waste data...</p>
        </div>
      ) : wasteData ? (
        <>
          {/* Summary Stats */}
          <div className="waste-summary">
            <div className="summary-card">
              <h4>Total Waste</h4>
              <p className="value">{wasteData.total_berat || wasteData.total_weight || 0} kg</p>
            </div>
            <div className="summary-card">
              <h4>Total Deposits</h4>
              <p className="value">{wasteData.total_setor || wasteData.total_transactions || 0}</p>
            </div>
          </div>

          {/* Waste by Type - Table */}
          <div className="waste-by-type">
            <h3>Waste Breakdown by Type</h3>
            {wasteData.summary && wasteData.summary.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Waste Type</th>
                    <th>Total Weight (kg)</th>
                    <th>Deposits Count</th>
                    <th>Average per Deposit</th>
                  </tr>
                </thead>
                <tbody>
                  {wasteData.summary.map((item, index) => (
                    <tr key={index}>
                      <td>{item.jenis_sampah || item.type}</td>
                      <td><strong>{parseFloat(item.total_berat || item.weight).toFixed(2)}</strong></td>
                      <td>{item.jumlah_setor || item.count}</td>
                      <td>{(parseFloat(item.total_berat || item.weight) / (item.jumlah_setor || item.count)).toFixed(2)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : wasteData.waste_by_type ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Waste Type</th>
                    <th>Total Weight (kg)</th>
                    <th>Deposits Count</th>
                    <th>Average per Deposit</th>
                  </tr>
                </thead>
                <tbody>
                  {wasteData.waste_by_type.map((item, index) => (
                    <tr key={index}>
                      <td>{item.type}</td>
                      <td><strong>{parseFloat(item.weight).toFixed(2)}</strong></td>
                      <td>{item.count}</td>
                      <td>{(parseFloat(item.weight) / item.count).toFixed(2)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No waste data available</p>
            )}
          </div>

          {/* Chart Data - Table */}
          {wasteData.chart_data && wasteData.chart_data.length > 0 && (
            <div className="waste-chart-data">
              <h3>Timeline Data</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Total Weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {wasteData.chart_data.map((item, index) => (
                    <tr key={index}>
                      <td>{item.label}</td>
                      <td><strong>{parseFloat(item.total_berat || item.value).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <p>No data available</p>
      )}
    </div>
  )
}

export default WasteAnalytics
