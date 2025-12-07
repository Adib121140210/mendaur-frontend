import { useState, useEffect } from 'react'
import { Users, Loader, AlertCircle, Download } from 'lucide-react'

const WasteByUserTable = () => {
  const [wasteByUser, setWasteByUser] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('monthly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    const fetchWasteByUser = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const params = new URLSearchParams({
          period,
          year,
          ...(period === 'daily' && { month })
        })

        const response = await fetch(
          `http://127.0.0.1:8000/api/admin/dashboard/waste-by-user?${params}`,
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
        setWasteByUser(data.data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching waste by user:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchWasteByUser()
  }, [period, year, month])

  const handleExportCSV = () => {
    if (wasteByUser.length === 0) return

    const headers = [
      'User Name',
      'Waste Type',
      'Total kg',
      'Points Earned',
      'Deposits'
    ]
    const rows = wasteByUser.map((item) => [
      item.user_name,
      item.jenis_sampah,
      item.total_berat,
      item.total_poin,
      item.jumlah_setor
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waste-by-user-${new Date().toISOString()}.csv`
    a.click()
  }

  if (error) {
    return (
      <div className="waste-by-user-error">
        <AlertCircle className="error-icon" />
        <p>Error: {error}</p>
        <button onClick={() => setError(null)} className="btn-retry">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="waste-by-user">
      <div className="waste-user-header">
        <div className="header-title">
          <Users size={24} />
          <h2>Waste by User</h2>
        </div>

        <div className="header-controls">
          <div className="filters">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="filter-select"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
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

          <button onClick={handleExportCSV} className="btn-export">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="waste-user-loading">
          <Loader className="spinner" />
          <p>Loading waste data...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="waste-user-table-wrapper">
            <table className="waste-user-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Waste Type</th>
                  <th>Total kg</th>
                  <th>Points Earned</th>
                  <th>Deposits</th>
                </tr>
              </thead>
              <tbody>
                {wasteByUser.length > 0 ? (
                  wasteByUser.map((item, index) => (
                    <tr key={index}>
                      <td>{item.user_name}</td>
                      <td>{item.jenis_sampah}</td>
                      <td>{item.total_berat}</td>
                      <td>{item.total_poin}</td>
                      <td>{item.jumlah_setor}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-message">
                      No waste data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="waste-user-mobile-cards">
            {wasteByUser.length > 0 ? (
              wasteByUser.map((item, index) => (
                <div key={index} className="waste-user-card">
                  <div className="card-row">
                    <span className="label">User:</span>
                    <span className="value">{item.user_name}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Waste Type:</span>
                    <span className="value">{item.jenis_sampah}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Total kg:</span>
                    <span className="value">{item.total_berat}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Points:</span>
                    <span className="value">{item.total_poin}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Deposits:</span>
                    <span className="value">{item.jumlah_setor}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No waste data found</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default WasteByUserTable
