import { Link } from "react-router-dom";
import { useState } from "react";
import "./produkCard.css";
import { Produk as defaultProduk } from "../../lib/dataProduk";
import Pagination from '../../ui/pagination'

import { Coins } from "lucide-react";

// MANAJEMEN KONTEN PRODUK
const ProdukCard = ({ 
  data = defaultProduk, 
  showPagination = true, 
  perPage = 8,
  onRedeem = null,
  userPoints = 0,
  showRedeemButton = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / perPage);

  const paginatedProduk = showPagination
    ? data.slice((currentPage - 1) * perPage, currentPage * perPage)
    : data;

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

return (
  <>
    <div className="produkGrid">
      {paginatedProduk.map((item, index) => {
        // Use id_produk as primary key, fallback to nama_produk + index if id_produk is missing
        const uniqueKey = item.id_produk || `${item.nama_produk}-${index}`;
        const animationIndex = paginatedProduk.indexOf(item);
        
        return (
          <div
            className="produkCard"
            key={uniqueKey}
            style={{ animationDelay: `${animationIndex * 0.05}s` }}
          >
          <div className="produkImageWrapper">
            {item.gambar_produk ? (
              <img src={item.gambar_produk} alt={item.nama_produk} />
            ) : (
              <div className="produkImagePlaceholder">Gambar belum tersedia</div>
            )}
            <span className="produkKategori">{item.tipe_produk}</span>
          </div>
          
          {/* DESKRIPSI */}
          <div className="produkContent">
            <h3>
              {item.nama_produk}
            </h3>
            <p>{item.desc_produk?.slice(0, 100)}...</p>
            <p className="produkMeta">Stok {item.stok}</p>

          {/* POIN & ACTION BUTTON */}
            <div className="produkFooter">
              <span className="produkPoin">
                <Coins size={16} />
                {item.harga_produk} Poin
              </span>
              {showRedeemButton && onRedeem ? (
                <button
                  className={`redeemBtn ${parseInt(item.harga_produk) > userPoints ? 'disabled' : ''}`}
                  onClick={() => onRedeem(item)}
                  disabled={parseInt(item.harga_produk) > userPoints || parseInt(item.stok) <= 0}
                  title={
                    parseInt(item.stok) <= 0 
                      ? 'Stok habis' 
                      : parseInt(item.harga_produk) > userPoints 
                      ? 'Poin tidak mencukupi' 
                      : 'Tukar produk ini'
                  }
                >
                  {parseInt(item.stok) <= 0 ? 'Stok Habis' : 'Tukar Sekarang'}
                </button>
              ) : (
                <Link to={`/produk/${item.id_produk}`} className="readMoreBtn">
                  Lihat Detail
                </Link>
              )}
            </div>
          </div>
        </div>
        );
      })}
    </div>

      {showPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={prevPage}
          onNext={nextPage}
        />
      )}
  </>
);
};

export default ProdukCard;