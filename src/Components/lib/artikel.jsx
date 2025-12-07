import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./artikel.css";
import Pagination from "../ui/pagination";
import { Eye } from "lucide-react";

const ArtikelCard = ({ 
  data = null, 
  showPagination = true, 
  perPage = 8,
  fetchFromAPI = false,
  category = "",
  searchQuery = ""
}) => {
  const [artikel, setArtikel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (fetchFromAPI) {
      fetchArtikel();
    } else if (data) {
      setArtikel(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFromAPI, data, category, searchQuery]);

  const fetchArtikel = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (category) params.append('kategori', category);
      if (searchQuery) params.append('search', searchQuery);
      
      const url = `http://127.0.0.1:8000/api/artikel${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn('Artikel API not available, using empty array');
        setArtikel([]);
        return;
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setArtikel(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching artikel:', error.message);
      setArtikel([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(artikel.length / perPage);

  const paginatedArtikel = showPagination
    ? artikel.slice((currentPage - 1) * perPage, currentPage * perPage)
    : artikel;

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="artikelWrapper">
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading articles...
        </div>
      </div>
    );
  }

  if (artikel.length === 0) {
    return (
      <div className="artikelWrapper">
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <p>Tidak ada artikel ditemukan.</p>
          {(category || searchQuery) && (
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Coba ubah filter atau kata kunci pencarian.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="artikelWrapper">
      {paginatedArtikel.map((item) => (
        <div className="artikelCard" key={item.id}>
          {item.gambar_artikel && (
            <img 
              src={item.gambar_artikel.startsWith('http') 
                ? item.gambar_artikel 
                : `http://127.0.0.1:8000${item.gambar_artikel}`
              } 
              alt={item.judul_artikel} 
            />
          )}
          <div className="artikelContent">
            <span className="artikelKategori">{item.kategori}</span>
            <h3>{item.judul_artikel}</h3>
            <p>{(item.isi_artikel || item.konten)?.slice(0, 150)}...</p>
            <p className="artikelMeta">
              Ditulis oleh {item.penulis} pada {formatDate(item.tanggal_terbit)}
              {item.jumlah_views > 0 && (
                <span style={{ marginLeft: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={14} /> {item.jumlah_views}
                </span>
              )}
            </p>
            <Link to={`/artikel/${item.slug}`} className="readMoreBtn">
              Baca Selengkapnya
            </Link>
          </div>
        </div>
      ))}

      {showPagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={prevPage}
          onNext={nextPage}
        />
      )}
    </div>
  );
};

export default ArtikelCard;