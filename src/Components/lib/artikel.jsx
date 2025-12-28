import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./artikel.css";
import Pagination from "../ui/pagination";
import { Eye } from "lucide-react";
import { API_BASE_URL, getStorageUrl } from "../../config/api";

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
      setCurrentPage(1); // Reset to first page when filters change
    } else if (data) {
      setArtikel(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFromAPI, data, category, searchQuery]);

  const fetchArtikel = async () => {
    try {
      setLoading(true);

      // Fetch all articles from API (backend doesn't support query params)
      const url = `${API_BASE_URL}/artikel`;
      
      const response = await fetch(url);

      if (!response.ok) {
        console.error('Failed to fetch artikel:', response.status);
        setArtikel([]);
        return;
      }

      const result = await response.json();

      if (result.status === 'success') {
        let filteredData = result.data || [];

        // Client-side filtering by category
        if (category) {
          filteredData = filteredData.filter(item => 
            item.kategori && item.kategori.toLowerCase() === category.toLowerCase()
          );
        }

        // Client-side filtering by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredData = filteredData.filter(item => 
            (item.judul && item.judul.toLowerCase().includes(query)) ||
            (item.konten && item.konten.toLowerCase().includes(query)) ||
            (item.kategori && item.kategori.toLowerCase().includes(query))
          );
        }

        setArtikel(filteredData);
      } else {
        setArtikel([]);
      }
    } catch (err) {
      console.error('Error fetching artikel:', err);
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
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  // Helper function untuk image URL - handles Cloudinary and local storage
  const getImageUrl = (foto) => {
    if (!foto) return null;
    
    // Handle Cloudinary URLs and local storage paths
    if (foto.startsWith('http://') || foto.startsWith('https://')) {
      return foto;
    }
    
    return getStorageUrl(foto);
  };

  if (loading) {
    return (
      <div className="artikelWrapper">
        <div className="artikel-loading-state">
          <div className="artikel-spinner"></div>
          <p>Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (artikel.length === 0) {
    return (
      <div className="artikelWrapper">
        <div className="artikel-empty-state">
          <p>Tidak ada artikel ditemukan.</p>
          {(category || searchQuery) && (
            <p className="artikel-empty-hint">
              Coba ubah filter atau kata kunci pencarian.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="artikelWrapper">
      {paginatedArtikel.map((item) => {
        // Use artikel_id since slug doesn't exist in API response
        const linkPath = `/dashboard/artikel/${item.artikel_id}`;
        
        return (
          <div className="artikelCard" key={item.artikel_id || item.id}>
            <Link to={linkPath} className="artikelCardImageLink">
              <div className="artikelCardImage">
                {item.gambar ? (
                  <img
                    src={getImageUrl(item.gambar)}
                    alt={item.judul || 'Artikel'}
                    onError={(e) => { 
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="artikelNoImage" style={{ display: item.gambar ? 'none' : 'flex' }}>
                  <span>📰</span>
                  <p>Gambar tidak tersedia</p>
                </div>
              </div>
            </Link>
            <div className="artikelContent">
              <span className="artikelKategori">{item.kategori || 'Artikel'}</span>
              <Link to={linkPath} className="artikelTitleLink">
                <h3 className="artikelTitle">{item.judul || 'Judul Tidak Tersedia'}</h3>
              </Link>
              <p className="artikelExcerpt">
                {((item.konten || '').slice(0, 120))}...
              </p>
              <div className="artikelMeta">
                <span className="artikelAuthor">Tim Mendaur</span>
                <span className="artikelDate">{formatDate(item.created_at)}</span>
                {(item.dilihat || 0) > 0 && (
                  <span className="artikelViews">
                    <Eye size={14} /> {item.dilihat}
                  </span>
                )}
              </div>
              <Link to={linkPath} className="readMoreBtn">
                Baca Selengkapnya →
              </Link>
            </div>
          </div>
        );
      })}

      {showPagination && totalPages > 1 && (
        <div className="artikelPaginationWrapper">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={prevPage}
            onNext={nextPage}
          />
        </div>
      )}
    </div>
  );
};

export default ArtikelCard;
