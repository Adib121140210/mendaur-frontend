import { useState, useEffect } from 'react'
import { Users, Loader, AlertCircle, Download } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// Mock waste by user data for development
const MOCK_WASTE_BY_USER = [
  { id: 1, user_name: 'Ahmad Hidayat', waste_type: 'Plastik', total_kg: 12.5, points_earned: 125, transactions: 8 },
  { id: 2, user_name: 'Siti Nurhaliza', waste_type: 'Kertas', total_kg: 18.3, points_earned: 183, transactions: 12 },
  { id: 3, user_name: 'Budi Santoso', waste_type: 'Logam', total_kg: 8.7, points_earned: 87, transactions: 5 },
  { id: 4, user_name: 'Wulan Dwi', waste_type: 'Kaca', total_kg: 15.2, points_earned: 152, transactions: 9 },
  { id: 5, user_name: 'Rinto Harahap', waste_type: 'Plastik', total_kg: 22.1, points_earned: 221, transactions: 14 },
]

const WasteByUserTable = () => {
  const { hasPermission } = useAuth()
  const [wasteByUser, setWasteByUser] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('monthly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    const fetchWasteByUser = async () => {
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
            `http://127.0.0.1:8000/api/admin/analytics/waste-by-user?${params}`,
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
          // Backend response structure: { success: true, data: { records: [...] } }
          let records = []
          if (data.success && data.data) {
            records = data.data.records || data.data || []
          } else {
            throw new Error('No data in response')
          }
          setWasteByUser(Array.isArray(records) ? records : [])
          setError(null)
        } catch (err) {
          console.warn('Backend unreachable or error, using mock waste by user data:', err.message)
          // Use mock data as fallback
          setWasteByUser(MOCK_WASTE_BY_USER)
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching waste by user:', err.message)
        setError(err.message)
        setWasteByUser([])
      } finally {
        setLoading(false)
      }
    }
    fetchWasteByUser()
  }, [period, year, month, hasPermission])

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
                      <td>{item.user_name || item.nama_pengguna || 'N/A'}</td>
                      <td>{item.jenis_sampah || item.waste_type || item.type || 'N/A'}</td>
                      <td>{item.total_berat || item.total_kg || item.weight || 'N/A'}</td>
                      <td>{item.total_poin || item.points_earned || item.points || 'N/A'}</td>
                      <td>{item.jumlah_setor || item.transactions || item.deposits || 'N/A'}</td>
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
                    <span className="value">{item.user_name || item.nama_pengguna || 'N/A'}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Waste Type:</span>
                    <span className="value">{item.jenis_sampah || item.waste_type || item.type || 'N/A'}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Total kg:</span>
                    <span className="value">{item.total_berat || item.total_kg || item.weight || 'N/A'}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Points:</span>
                    <span className="value">{item.total_poin || item.points_earned || item.points || 'N/A'}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Deposits:</span>
                    <span className="value">{item.jumlah_setor || item.transactions || item.deposits || 'N/A'}</span>
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
