import ProdukCard from "./produkCard";
import "./produk.css";

export default function Produk() {
  return (
    <section className="ProdukWrapper">
      <h2 className="produkHeading">Produk Daur Ulang</h2>
      <ProdukCard/>
    </section>
  );
}