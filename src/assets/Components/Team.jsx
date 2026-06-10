import React from 'react'
import './Css/Team.css'
import F1 from '../Media/car.png'
const Team = () => {
  

  
  return (
    <div className='Big-box'>
      <article className='container-fluid text-center'>
        <h1 className='text-center text-danger'>Grid LineUp</h1>
        <p className=' w-full mx-auto'>Meet the constructors, team masterminds, and elete driver Parings fighting wheel-to-wheel on the world stage.</p>
      </article>
      <div className='container-fluid items-center content-center'>
        <img src={F1} alt="" className=' mx-auto w-25 mt-5' />
      </div>
      <h3 className='text-center mt-5'>Coming Soon.....</h3>
      
      {/* <section className=' '>
        <div className=''></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </section> */}
    </div>
  )
}

export default Team