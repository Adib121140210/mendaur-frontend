import useScrollTop from "../../lib/useScrollTop";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ArtikelCard from "../../lib/artikel";
import { Eye, Calendar, User } from "lucide-react";
import "./artikelDetail.css";

const ArtikelDetail = () => {
  useScrollTop();
  
  const { id: slug } = useParams(); // 'id' in route is actually the slug
  const navigate = useNavigate();
  const [artikelData, setArtikelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArtikelDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchArtikelDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://127.0.0.1:8000/api/artikel/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Artikel tidak ditemukan');
        } else {
          setError('Gagal memuat artikel');
        }
        return;
      }
      
      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        // Log to see actual API response structure
        console.log('API Response:', result.data);
        setArtikelData(result.data);
      } else {
        setError('Artikel tidak ditemukan');
      }
    } catch (error) {
      console.error('Error fetching artikel detail:', error.message);
      setError('Gagal memuat artikel');
    } finally {
      setLoading(false);
    }
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
      <div className="artikelDetailWrapper">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          Loading article...
        </div>
      </div>
    );
  }

  if (error || !artikelData) {
    return (
      <div className="artikelDetailWrapper">
        <button className="backButton" onClick={() => navigate("/")}>
          ← Kembali ke Beranda
        </button>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <p>{error || 'Artikel tidak ditemukan.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="artikelDetailWrapper">
      <button className="backButton" onClick={() => navigate("/")}>
        ← Kembali ke Beranda
      </button>

      <div className="artikelDetailCard">
        {artikelData.gambar_artikel && (
          <div className="artikelImage">
            <img 
              src={artikelData.gambar_artikel.startsWith('http') 
                ? artikelData.gambar_artikel 
                : `http://127.0.0.1:8000${artikelData.gambar_artikel}`
              } 
              alt={artikelData.judul_artikel || 'Artikel'} 
            />
          </div>
        )}

        <div className="artikelText">
          <span className="artikelKategori">{artikelData.kategori || 'Artikel'}</span>
          <h2>{artikelData.judul_artikel || 'Judul Tidak Tersedia'}</h2>
          
          <div className="artikelMeta">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} />
              {artikelData.penulis || 'Anonim'}
            </span>
            <span style={{ margin: '0 8px' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} />
              {artikelData.tanggal_terbit ? formatDate(artikelData.tanggal_terbit) : 'Tanggal tidak tersedia'}
            </span>
            {artikelData.jumlah_views > 0 && (
              <>
                <span style={{ margin: '0 8px' }}>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={16} />
                  {artikelData.jumlah_views} views
                </span>
              </>
            )}
          </div>

          <div className="artikelIsi">
            {(artikelData.isi_artikel || artikelData.konten) ? (
              (artikelData.isi_artikel || artikelData.konten).split('\n').map((paragraph, index) => (
                <p key={`paragraph-${index}`}>{paragraph}</p>
              ))
            ) : (
              <p>Konten artikel tidak tersedia.</p>
            )}
          </div>
        </div>

        <div className="artikelLainnya">
          <h3>Rekomendasi Artikel</h3>
          <ArtikelCard
            fetchFromAPI={true}
            showPagination={false}
            perPage={4}
          />
        </div>

      </div>
    </div>
  );
};

export default ArtikelDetail;