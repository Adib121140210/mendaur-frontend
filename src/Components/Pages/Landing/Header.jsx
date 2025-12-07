import { useEffect } from "react";
import feather from 'feather-icons'
import './Header.css'

function Navbar () {
     useEffect(() => {
        feather.replace();
    }, []);
    return (
        <header className="header" >
            <h1 className="headerTitle">BSI Nusa</h1>
            <div className="navbar">
                <nav className="navLinks">
                    <img src="" alt="" />
                    <a href="/">Produk</a>
                    <a href="/">Tabung Sampah</a>
                    {/* <a href="/">Kegiatan</a>
                    <a href="/">Komunitas</a> */}
                </nav>
            </div>
            
            <div className="navBtn">
                <a href="/" className="btnMasuk">Masuk
                    <i data-feather="user" className="masukIcon"></i>
                </a>
                
                <button className="btnDaftar">Daftar</button>
            </div>

        </header>
       
    )
}

export default Navbar;