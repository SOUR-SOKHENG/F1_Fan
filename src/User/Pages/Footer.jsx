import "../Css/Overall.css";
import ITE from "../../assets/Media/ITE.png";

function Footer() {
  return (
    <footer className="grid w-full grid-cols-1 gap-1 bg-[rgba(142,3,3,0.944)] px-6 py-8 text-gray-300 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4">
          <p>
            This F1-Fan page is created and developed by SOKHENG SOUR, ITE 11th
          </p>
          <p className="mb-0">© 2026-2027</p>
        </div>

        <div className="p-4">
          <h4 className="mb-3 text-base">Contact</h4>
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/share/1EG7XAScA9/?mibextid=wwXIfr" aria-label="Facebook">
              <i className="bi bi-facebook rounded-md bg-white px-2 text-2xl" />
            </a>
            <a className="text-xl text-white text-decoration-none " href="https://www.facebook.com/share/1EG7XAScA9/?mibextid=wwXIfr">
              @Sasorai
            </a>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <a href="https://www.instagram.com/callme_sasorai/" aria-label="Instagram">
              <i className="bi bi-instagram rounded-md bg-white px-2 text-2xl text-yellow-500" />
            </a>
            <a className="text-xl text-white text-decoration-none " 
            href="https://www.instagram.com/callme_sasorai/">
              @Sasorai
            </a>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <a href="https://t.me/Sasorai" aria-label="Telegram">
              <i className="bi bi-telegram rounded-md bg-white px-2 text-2xl text-blue-500" />
            </a>
            <a className="text-xl text-white text-decoration-none " href="https://t.me/Sasorai">
              @Sasorai
            </a>
          </div>
        </div>

        <div className="p-4">
          <h4>Reference</h4>
          <a href="https://www.formula1.com" className="text-white no-underline">
            www.Formular1.com
          </a>
        </div>
        <div className="p-4">
          <img className="h-30 w-32 rounded-3 object-cover" src={ITE} alt="ITE logo" />
        </div>
    </footer>
  );
}

export default Footer;
