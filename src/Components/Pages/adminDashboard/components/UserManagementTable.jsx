import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, Loader, AlertCircle } from 'lucide-react'

function UserManagementTable() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 10,
        search: searchTerm
      })

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/dashboard/users?${params}`,
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
      setUsers(data.data.users || [])
      setTotalPages(data.data.pagination?.total_pages || 1)
      setError(null)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleRetry = () => {
    setCurrentPage(1)
    setSearchTerm('')
    setError(null)
  }

  if (error) {
    return (
      <div className="users-table-error">
        <AlertCircle className="error-icon" />
        <p>Error: {error}</p>
        <button onClick={handleRetry} className="btn-retry">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="users-management">
      <div className="users-header">
        <h2>User Management</h2>
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="users-loading">
          <Loader className="spinner" />
          <p>Loading users...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Points</th>
                  <th>Level</th>
                  <th>Deposits</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user.id}>
                      <td>{(currentPage - 1) * 10 + index + 1}</td>
                      <td className="user-name">{user.nama}</td>
                      <td>{user.email}</td>
                      <td>{user.no_hp}</td>
                      <td className="points">{user.total_poin}</td>
                      <td>
                        <span className={`level-badge level-${user.level}`}>
                          {user.level}
                        </span>
                      </td>
                      <td>{user.total_setor_sampah || 0}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-message">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="users-mobile-cards">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-card-row">
                    <span className="label">Name:</span>
                    <span className="value">{user.nama}</span>
                  </div>
                  <div className="user-card-row">
                    <span className="label">Email:</span>
                    <span className="value">{user.email}</span>
                  </div>
                  <div className="user-card-row">
                    <span className="label">Phone:</span>
                    <span className="value">{user.no_hp}</span>
                  </div>
                  <div className="user-card-row">
                    <span className="label">Points:</span>
                    <span className="value">{user.total_poin}</span>
                  </div>
                  <div className="user-card-row">
                    <span className="label">Level:</span>
                    <span className={`level-badge level-${user.level}`}>
                      {user.level}
                    </span>
                  </div>
                  <div className="user-card-row">
                    <span className="label">Deposits:</span>
                    <span className="value">{user.total_setor_sampah || 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No users found</p>
            )}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn-paginate"
            >
              <ChevronLeft size={18} /> Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="btn-paginate"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default UserManagementTable;
