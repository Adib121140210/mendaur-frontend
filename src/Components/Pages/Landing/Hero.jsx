import {useEffect} from "react";
import './Hero.css'
import feather from 'feather-icons'


function Hero () {
    useEffect(() => {
        feather.replace();
    }, []);

 return(
    <section className="hero">
        <div className="wrapHero">
            <div className="heroContent">
                <h1 className="heroTitle">BANK SAMPAH <br/> <span>INDUK NUSA</span></h1>
                <p className="tagline">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis at pretium odio, sit amet commodo quam. Sed ut metus tincidunt, malesuada mauris ac, rhoncus ipsum.</p>

                <div className="heroButtons">
                    <a href="/" className="btnMulai">Mulai Nabung
                    <i data-feather="arrow-right" className="daftarIcon"></i>
                    </a>
                    <a href="/" className="btnInfo">Info
                    <i data-feather="info" className="infoIcon"></i>
                    </a>
                </div>

                 <div className="capaian">
                    <div className="capaianItem">
                        <h2 className="capaianNumber">1000+</h2>
                        <p className="capaianText">Nasabah</p>
                    </div>
                    <div className="capaianItem">
                        <h2 className="capaianNumber">500+</h2>
                        <p className="capaianText">Capaian Sampah</p>
                    </div>
                    <div className="capaianItem">
                        <h2 className="capaianNumber">50+</h2>
                        <p className="capaianText">Sampah Terkelola</p>
                    </div>
                        <div className="capaianItem">
                        <h2 className="capaianNumber">50+</h2>
                        <p className="capaianText">Produk Daur Ulang</p>
                    </div>
                </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="wrapFooter">
            <div className="contact">
                <h1 className="contactTitle">Hubungi Kami</h1>
                <p className="contactSub">Ingin berkunjung?</p>
                <p className="contactSub">Bisa hubungi kami melalui kontak di bawah ini.</p>
                <a href="mailto:hello@mendaur.org" className="contactButton">Kontak</a>
            </div>

            <footer>
                <div className="footerBtn">
                    <a href="">Instagram</a>
                    <a href="">Whatsapp</a>
                </div>
            </footer>
        </div>   
    </section>

 )
}
export default Hero;

