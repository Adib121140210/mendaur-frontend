import { useState, useEffect } from 'react'
import { Plus, Download, Eye, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import adminApi from '../../../../services/adminApi'
import '../styles/contentManagement.css'

// Mock data
const MOCK_PRODUCTS = [
  { id: 1, name: 'Tas Belanja Kain', category: 'Produk Daur Ulang', price: 25000, stock: 45, status: 'Aktif' },
  { id: 2, name: 'Gelas Tumbler', category: 'Ramah Lingkungan', price: 35000, stock: 28, status: 'Aktif' },
  { id: 3, name: 'Pot Tanaman Recycle', category: 'Produk Daur Ulang', price: 15000, stock: 62, status: 'Aktif' },
]

const MOCK_BADGES = [
  { id: 1, name: 'Pemula Hijau', description: 'Setorkan 5kg sampah pertama', requirement: '5kg sampah', icon: '🌱' },
  { id: 2, name: 'Pejuang Lingkungan', description: 'Setorkan 50kg sampah', requirement: '50kg sampah', icon: '♻️' },
  { id: 3, name: 'Pahlawan Bumi', description: 'Setorkan 200kg sampah', requirement: '200kg sampah', icon: '🌍' },
]

const MOCK_ARTICLES = [
  { id: 1, title: 'Cara Memilah Sampah dengan Benar', author: 'Admin', category: 'Edukasi', views: 1250, date: '2024-12-01' },
  { id: 2, title: 'Manfaat Daur Ulang untuk Lingkungan', author: 'Admin', category: 'Edukasi', views: 890, date: '2024-12-05' },
  { id: 3, title: 'Kreasi DIY dari Botol Plastik', author: 'Admin', category: 'Tutorial', views: 2100, date: '2024-12-10' },
]

export default function ContentManagement() {
  const { hasPermission } = useAuth()
  const [editDialog, setEditDialog] = useState({ open: false, data: null, type: '' })
  const [viewDialog, setViewDialog] = useState({ open: false, data: null })
  const [addDialog, setAddDialog] = useState({ open: false, type: '' })
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [badges, setBadges] = useState(MOCK_BADGES)
  const [articles, setArticles] = useState(MOCK_ARTICLES)

  // Load content from APIs on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch products
        const productsResult = await adminApi.getProducts?.()
        if (productsResult?.success) {
          setProducts(productsResult.data || MOCK_PRODUCTS)
        } else {
          setProducts(MOCK_PRODUCTS)
        }
      } catch (err) {
        console.warn('Products fetch error, using mock:', err)
        setProducts(MOCK_PRODUCTS)
      }

      try {
        // Fetch badges
        const badgesResult = await adminApi.getAllBadges()
        if (badgesResult.success) {
          setBadges(badgesResult.data || MOCK_BADGES)
        } else {
          setBadges(MOCK_BADGES)
        }
      } catch (err) {
        console.warn('Badges fetch error, using mock:', err)
        setBadges(MOCK_BADGES)
      }

      try {
        // Fetch articles
        const articlesResult = await adminApi.getArticles?.()
        if (articlesResult?.success) {
          setArticles(articlesResult.data || MOCK_ARTICLES)
        } else {
          setArticles(MOCK_ARTICLES)
        }
      } catch (err) {
        console.warn('Articles fetch error, using mock:', err)
        setArticles(MOCK_ARTICLES)
      }
    };
    fetchContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEdit = (item, type) => {
    // ✅ Permission check
    if (!hasPermission('manage_content')) {
      alert('❌ You do not have permission to edit content')
      return
    }
    setEditDialog({ open: true, data: item, type })
  }

  const handleView = (item) => {
    setViewDialog({ open: true, data: item })
  }

  const handleDelete = (id, type) => {
    // ✅ Permission check
    if (!hasPermission('manage_content')) {
      alert('❌ You do not have permission to delete content')
      return
    }
    if (confirm(`Apakah Anda yakin ingin menghapus ${type} ini?`)) {
      console.log('Delete item:', id, type)
    }
  }

  const handleAdd = (type) => {
    // ✅ Permission check
    if (!hasPermission('manage_content')) {
      alert('❌ You do not have permission to add content')
      return
    }
    setAddDialog({ open: true, type })
  }

  return (
    <div className="content-management">
      {/* Header */}
      <div className="management-header">
        <h2>Manajemen Konten</h2>
        <p>Kelola produk, badge, dan artikel untuk nasabah</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card products-card">
          <div className="stat-header">
            <h3>Total Produk</h3>
            <span className="stat-icon">📦</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">{products.length}</div>
            <p className="stat-label">Produk tersedia</p>
          </div>
        </div>

        <div className="stat-card badges-card">
          <div className="stat-header">
            <h3>Total Badge</h3>
            <span className="stat-icon">🏆</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">{badges.length}</div>
            <p className="stat-label">Badge achievement</p>
          </div>
        </div>

        <div className="stat-card articles-card">
          <div className="stat-header">
            <h3>Total Artikel</h3>
            <span className="stat-icon">📄</span>
          </div>
          <div className="stat-content">
            <div className="stat-number">{articles.length}</div>
            <p className="stat-label">Artikel diterbitkan</p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="content-section">
        <div className="content-header">
          <h3>📦 Manajemen Produk</h3>
          <button className="btn-add" onClick={() => handleAdd('product')}>
            <Plus size={18} /> Tambah Produk
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>Rp {product.price.toLocaleString('id-ID')}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`badge ${product.status === 'Aktif' ? 'badge-aktif' : 'badge-habis'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => handleView(product)} title="Lihat">
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon" onClick={() => handleEdit(product, 'product')} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(product.id, 'produk')} title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Badges Section */}
      <div className="content-section">
        <div className="content-header">
          <h3>🏆 Manajemen Badge</h3>
          <button className="btn-add" onClick={() => handleAdd('badge')}>
            <Plus size={18} /> Tambah Badge
          </button>
        </div>

        <div className="badges-grid">
          {badges.map((badge) => (
            <div key={badge.id} className="badge-card">
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-content">
                <h4>{badge.name}</h4>
                <p className="badge-desc">{badge.description}</p>
                <p className="badge-req">
                  <strong>Syarat:</strong> {badge.requirement}
                </p>
              </div>
              <div className="badge-actions">
                <button className="btn-icon" onClick={() => handleView(badge)}>
                  <Eye size={16} />
                </button>
                <button className="btn-icon" onClick={() => handleEdit(badge, 'badge')}>
                  <Edit2 size={16} />
                </button>
                <button className="btn-icon delete" onClick={() => handleDelete(badge.id, 'badge')}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Articles Section */}
      <div className="content-section">
        <div className="content-header">
          <h3>📄 Manajemen Artikel</h3>
          <button className="btn-add" onClick={() => handleAdd('article')}>
            <Plus size={18} /> Tambah Artikel
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Penulis</th>
                <th>Views</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>{article.id}</td>
                  <td>{article.title}</td>
                  <td>{article.category}</td>
                  <td>{article.author}</td>
                  <td>{article.views.toLocaleString('id-ID')}</td>
                  <td>{article.date}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => handleView(article)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon" onClick={() => handleEdit(article, 'article')}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(article.id, 'artikel')}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Dialog */}
      {viewDialog.open && (
        <div className="modal-overlay" onClick={() => setViewDialog({ open: false, data: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Detail Data</h4>
              <button className="btn-close" onClick={() => setViewDialog({ open: false, data: null })}>×</button>
            </div>
            <div className="modal-body">
              {viewDialog.data && Object.entries(viewDialog.data).map(([key, value]) => (
                <div key={key} className="field-row">
                  <span className="field-label">{key}:</span>
                  <span className="field-value">{String(value)}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-close-modal" onClick={() => setViewDialog({ open: false, data: null })}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editDialog.open && (
        <div className="modal-overlay" onClick={() => setEditDialog({ open: false, data: null, type: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Edit {editDialog.type}</h4>
              <button className="btn-close" onClick={() => setEditDialog({ open: false, data: null, type: '' })}>×</button>
            </div>
            <div className="modal-body">
              <p className="text-center text-muted">Form akan dikembangkan sesuai kebutuhan backend</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditDialog({ open: false, data: null, type: '' })}>
                Batal
              </button>
              <button className="btn-primary">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Dialog */}
      {addDialog.open && (
        <div className="modal-overlay" onClick={() => setAddDialog({ open: false, type: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Tambah {addDialog.type}</h4>
              <button className="btn-close" onClick={() => setAddDialog({ open: false, type: '' })}>×</button>
            </div>
            <div className="modal-body">
              <p className="text-center text-muted">Form akan dikembangkan sesuai kebutuhan backend</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setAddDialog({ open: false, type: '' })}>
                Batal
              </button>
              <button className="btn-primary">Tambah</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
