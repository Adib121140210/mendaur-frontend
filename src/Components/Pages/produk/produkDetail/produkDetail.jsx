// src/pages/ProdukDetail.jsx
import useScrollTop from "../../../lib/useScrollTop";
import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import { Produk as defaultProduk } from "../../../lib/dataProduk";
import ProdukCard from "../produkCard";
import "./produkDetail.css";

import { 
  Coins,
  CircleArrowLeft
} from "lucide-react";

const ProdukDetail = () => {
  useScrollTop();

  const { id } = useParams();
  const navigate = useNavigate();
  const produkData = defaultProduk.find((p) => p.id_produk === id);

  if (!produkData) return <p>Produk tidak ditemukan.</p>;

  return (
    <div className="produkDetailWrapper">
      <button className="backButton" onClick={() => navigate("/tukarPoin")}>
        <CircleArrowLeft/>
        Kembali ke Tukar Poin
      </button>

      <div className="produkDetailCard">
        <div className="produkImage">
          {produkData.gambar_produk ? (
            <img src={produkData.gambar_produk} alt={produkData.nama_produk} />
          ) : (
            <div className="produkImagePlaceholder">Gambar belum tersedia</div>
          )}
        </div>

        <div className="produkText">
          <span className="produkKategori">{produkData.tipe_produk}</span>
          <h2>{produkData.nama_produk}</h2>
          <p className="produkMeta">Stok: {produkData.stok}</p>
          <p className="produkHarga">
            <Coins size={16} /> {produkData.harga_produk} Poin
          </p>
          <p className="produkDeskripsi">{produkData.desc_produk}</p>
        </div>

        <div className="tukarProdukBtnWrapper">   
          <Link className="tukarProdukBtn">
            Tukar Produk
          </Link>
        </div>

        <div className="produkLainnya">
          <h3>Rekomendasi Produk Lainnya</h3>
          <ProdukCard
            data={defaultProduk.filter((p) => p.id_produk !== produkData.id_produk).slice(0, 4)}
            showPagination={false}
            perPage={4}
          />
        </div>
      </div>
    </div>
  );
};

export default ProdukDetail;