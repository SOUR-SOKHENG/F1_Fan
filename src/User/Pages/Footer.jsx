import "../Css/Overall.css";
import ITE from "../../assets/Media/ITE.png";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const Footer = () => {
  return (
    <div className=" flex flex-col justify-between ">
        <section className='Footer w-100 h-auto pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 '>
        <div className='box px-20 py-10 '>
          <p>This F1-Fan page is created and developed by SOKHENG SOUR, ITE 11th</p>
          <p>© 2026-2027</p>
        </div>
        <div className='box px-20 py-10 '>
          <h4 className=' text-xs'>Contact</h4>
          <div>
            <a href="https://www.facebook.com/share/1EG7XAScA9/?mibextid=wwXIfr"><i className='bi bi-facebook bg-white text-2xl px-2 rounded-2'></i></a>
            <span className='pl-4 text-xl'><a href="https://www.facebook.com/share/1EG7XAScA9/?mibextid=wwXIfr"></a>Sasorai</span>
          </div>
          <div className='pt-2'>
            <a href="https://www.instagram.com/callme_sasorai/"><i className='bi bi-instagram text-yellow-500 bg-white text-2xl px-2 rounded-2'></i></a>
            <span className='pl-4 text-xl'><a href="https://www.instagram.com/callme_sasorai/"></a>Sasorai</span>
          </div>
          <div className='pt-2'>
            <a href="https://t.me/Sasorai"><i className='bi bi-telegram text-blue-500 bg-white text-2xl px-2 rounded-2'></i></a>
            <span className='pl-4 text-xl'><a href="https://t.me/Sasorai"></a>@Sasorai</span>
          </div>
        </div>
        <div className='box px-20 py-10 '>
          <h4>Reference</h4>
          <a href="https://www.formula1.com" className='text-decoration-none text-white'>www.Formular1.com</a>
        </div>
        <div className='box px-20 py-10 '>
          <img className='box-pic w-50 h-100' src={ITE} alt="" />
        </div>
        </section>
    </div>
  )
}

export default Footer
