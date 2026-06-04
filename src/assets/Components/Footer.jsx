import React from 'react'
import './Css/Overall.css'
const Footer = () => {
  return (
    <div>
        <section className='Footer  w-100 h-auto mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 '>
        <div className='box px-20 py-10 '>
          <p>© 2026-2027</p>
          <p>This F1-Fan page is created and developed by SOKHENG SOUR, ITE 11th</p>
        </div>
        <div className='box px-20 py-10 '>
          <h4 className=' text-xs'>Contact</h4>
          <i className='bi bi-facebook'></i>
        </div>
        <div className='box px-20 py-10 bg-yellow-200'></div>
        <div className='box px-20 py-10 bg-yellow-200'></div>
        </section>
    </div>
  )
}

export default Footer