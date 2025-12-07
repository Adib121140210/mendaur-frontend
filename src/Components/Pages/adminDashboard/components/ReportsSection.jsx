import { useState } from 'react'
import { FileText, Loader, AlertCircle } from 'lucide-react'

const ReportsSection = () => {
  const [reportType, setReportType] = useState('monthly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [day, setDay] = useState(1)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        type: reportType,
        year,
        month,
        ...(reportType === 'daily' && { day })
      })

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/dashboard/report?${params}`,
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
      setReport(data.data)
      setError(null)
    } catch (err) {
      console.error('Error generating report:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    alert('PDF export functionality coming soon!')
  }

  const handleExportExcel = () => {
    alert('Excel export functionality coming soon!')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="reports-section">
      <div className="reports-header">
        <div className="reports-title">
          <FileText size={24} />
          <h2>Reports</h2>
        </div>
      </div>

      {/* Report Generator */}
      <div className="report-generator">
        <h3>Generate Report</h3>
        <div className="generator-controls">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="filter-select"
          >
            <option value="daily">Daily Report</option>
            <option value="monthly">Monthly Report</option>
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

          {reportType === 'daily' && (
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="filter-select"
            >
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Day {i + 1}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="btn-generate"
          >
            {loading ? (
              <>
                <Loader size={18} /> Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="report-error">
          <AlertCircle className="error-icon" />
          <p>Error: {error}</p>
          <button onClick={() => setError(null)} className="btn-retry">
            Dismiss
          </button>
        </div>
      )}

      {report && (
        <>
          {/* Report Summary */}
          <div className="report-summary">
            <h3>
              {reportType === 'daily'
                ? `Daily Report - ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                : `Monthly Report - ${year}-${String(month).padStart(2, '0')}`}
            </h3>

            {/* Waste Section */}
            <div className="report-section">
              <h4>Waste Statistics</h4>
              <div className="report-grid">
                <div className="report-item">
                  <span className="label">Total Waste:</span>
                  <span className="value">{report.waste?.total_kg || 0} kg</span>
                </div>
                <div className="report-item">
                  <span className="label">Total Deposits:</span>
                  <span className="value">{report.waste?.total_count || 0}</span>
                </div>
                {reportType === 'daily' && (
                  <>
                    <div className="report-item">
                      <span className="label">Approved:</span>
                      <span className="value">
                        {report.waste?.by_type ? Object.keys(report.waste.by_type).length : 0}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Waste by Type */}
              {report.waste?.by_type && (
                <div className="waste-types-breakdown">
                  <h5>Breakdown by Type</h5>
                  {Object.entries(report.waste.by_type).map(([type, data]) => (
                    <div key={type} className="type-item">
                      <span>{type}:</span>
                      <span>{data.total_kg} kg ({data.count} deposits)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Points Section */}
            <div className="report-section">
              <h4>Points Distribution</h4>
              <div className="report-grid">
                <div className="report-item">
                  <span className="label">Total Points:</span>
                  <span className="value">{report.points?.total || 0}</span>
                </div>
              </div>

              {/* Points by Source */}
              {report.points?.by_source && (
                <div className="points-breakdown">
                  <h5>Breakdown by Source</h5>
                  {Object.entries(report.points.by_source).map(([source, data]) => (
                    <div key={source} className="source-item">
                      <span>{source}:</span>
                      <span>{data.total_poin} points ({data.count} transactions)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Users Section */}
            {report.users_active && (
              <div className="report-section">
                <h4>User Activity</h4>
                <div className="report-grid">
                  <div className="report-item">
                    <span className="label">Active Users:</span>
                    <span className="value">{report.users_active}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Breakdown (Monthly Only) */}
            {reportType === 'monthly' && report.daily_breakdown && (
              <div className="report-section">
                <h4>Daily Breakdown</h4>
                <div className="daily-breakdown-list">
                  {Object.entries(report.daily_breakdown).slice(0, 10).map(([date, data]) => (
                    <div key={date} className="daily-item">
                      <span>{date}:</span>
                      <span>{data.waste_kg} kg ({data.waste_count} deposits)</span>
                    </div>
                  ))}
                  {Object.keys(report.daily_breakdown).length > 10 && (
                    <p className="more-items">
                      ... and {Object.keys(report.daily_breakdown).length - 10} more days
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Export Buttons */}
          <div className="report-actions">
            <button onClick={handleExportPDF} className="btn-export btn-pdf">
              Export PDF
            </button>
            <button onClick={handleExportExcel} className="btn-export btn-excel">
              Export Excel
            </button>
            <button onClick={handlePrint} className="btn-export btn-print">
              Print
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ReportsSection
