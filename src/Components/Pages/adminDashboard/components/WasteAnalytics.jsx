import { useState, useEffect } from 'react'
import { BarChart3, Loader, AlertCircle, Calendar } from 'lucide-react'

const WasteAnalytics = () => {
  const [wasteData, setWasteData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('monthly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    const fetchWasteData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const params = new URLSearchParams({
          period,
          year,
          ...(period === 'daily' && { month })
        })

        const response = await fetch(
          `http://127.0.0.1:8000/api/admin/dashboard/waste-summary?${params}`,
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
        setWasteData(data.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching waste data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchWasteData()
  }, [period, year, month])

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
              <p className="value">{wasteData.total_berat || 0} kg</p>
            </div>
            <div className="summary-card">
              <h4>Total Deposits</h4>
              <p className="value">{wasteData.total_setor || 0}</p>
            </div>
          </div>

          {/* Waste by Type */}
          <div className="waste-by-type">
            <h3>Waste Breakdown by Type</h3>
            <div className="waste-types-grid">
              {wasteData.summary && wasteData.summary.length > 0 ? (
                wasteData.summary.map((item, index) => (
                  <div key={index} className="waste-type-card">
                    <h4>{item.jenis_sampah}</h4>
                    <p className="weight">{item.total_berat} kg</p>
                    <p className="count">{item.jumlah_setor} deposits</p>
                  </div>
                ))
              ) : (
                <p className="no-data">No waste data available</p>
              )}
            </div>
          </div>

          {/* Chart Data */}
          {wasteData.chart_data && (
            <div className="waste-chart-data">
              <h3>Chart Data</h3>
              <div className="chart-items">
                {wasteData.chart_data.map((item, index) => (
                  <div key={index} className="chart-item">
                    <p>
                      <strong>{item.label}</strong>: {item.total_berat} kg
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

export default WasteAnalytics
