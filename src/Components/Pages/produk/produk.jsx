import { useState, useEffect, useCallback } from "react";
import ProdukCard from "./produkCard";
import "./produk.css";
import productApi from "../../../services/productApi";

export default function Produk() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    kategori: '',
    search: ''
  });

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await productApi.getAllProducts({
      kategori: filter.kategori,
      search: filter.search
    });

    if (result.success) {
      setProducts(result.data);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    setFilter({ ...filter, search: e.target.value });
  };

  const handleCategoryFilter = (kategori) => {
    setFilter({ ...filter, kategori: kategori === filter.kategori ? '' : kategori });
  };

  return (
    <section className="ProdukWrapper">
      <h2 className="produkHeading">Produk Daur Ulang</h2>
      
      {/* Filter Section */}
      <div className="produkFilters">
        <div className="searchBox">
          <input
            type="text"
            placeholder="Cari produk..."
            value={filter.search}
            onChange={handleSearch}
            className="searchInput"
          />
        </div>
        
        <div className="categoryFilters">
          <button
            className={`filterBtn ${filter.kategori === '' ? 'active' : ''}`}
            onClick={() => handleCategoryFilter('')}
          >
            Semua
          </button>
          <button
            className={`filterBtn ${filter.kategori === 'Kerajinan' ? 'active' : ''}`}
            onClick={() => handleCategoryFilter('Kerajinan')}
          >
            Kerajinan
          </button>
          <button
            className={`filterBtn ${filter.kategori === 'Elektronik' ? 'active' : ''}`}
            onClick={() => handleCategoryFilter('Elektronik')}
          >
            Elektronik
          </button>
          <button
            className={`filterBtn ${filter.kategori === 'Fashion' ? 'active' : ''}`}
            onClick={() => handleCategoryFilter('Fashion')}
          >
            Fashion
          </button>
          <button
            className={`filterBtn ${filter.kategori === 'Peralatan' ? 'active' : ''}`}
            onClick={() => handleCategoryFilter('Peralatan')}
          >
            Peralatan
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="produkLoading">
          <div className="spinner"></div>
          <p>Memuat produk...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="produkError">
          <p>❌ {error}</p>
          <button onClick={fetchProducts} className="retryBtn">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <ProdukCard data={products} showPagination={true} perPage={8} />
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="produkEmpty">
          <p>Tidak ada produk yang tersedia saat ini.</p>
        </div>
      )}
    </section>
  );
}