import React from 'react'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Driver from "../Media/F1_driver_groupDriver.jpg"
import Home1 from "../Media/F1_track.jpg"
import './Css/Overall.css'
import './Css/Home.css'
import Kimi from '../Media/Kimi_antonelli.png'
import Miami from '../Media/Miami.png'
import Canada from '../Media/Canada.png'
import Calender from '../Media/f1-calendar.jpg'
import F1_Cru from '../Media/f1Crusel.jpg'
const Home = () => {
  return (
    <div className='Big-box'>
              <section className='container  mb-4'>
                    <div id="carouselExample" className="carousel slide ">
                      <div className="carousel-inner">
                      <div className="carousel-item active">
                      <img src={F1_Cru} alt="Leader" className=' d-block w-100 h-[55vh] position-relative object-fit-contain' />
                        {/* <h3 className=' position-absolute top-30 right-130'>Welcome To F1 2026 Season</h3> */}
                      </div>
                      <div className="carousel-item">
                      <img src={Driver} className="d-block w-100 h-[55vh] object-fit-contain" alt="Leader"/>
                          <h3 className=' position-absolute bottom-5 right-150  text-white'>2026 Driver</h3>
                      </div>
                    <div className="carousel-item">
                  <img src={Calender} className="d-block w-100 h-[55vh]  object-fit-contain" alt="..."/>
                </div>
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
              </div>
            </section>
            <section className='Main-content  content-center items-center '>
                <article className=' w-100  place-items-center'>
                  <h2 className=''>Welcome to F1</h2>
                  <p className=' w-[90%] content-center text-1xl'>Formula 1 (F1) is the absolute pinnacle of international motorsport and the most expensive sport in the world. It is a high-octane arena where the world’s most elite drivers push cutting-edge, multi-million dollar machines to speeds exceeding 200 mph. Merging high-stakes strategy, split-second engineering precision, and fierce global rivalries, F1 is a thrilling spectacle of speed and luxury that captivates millions of fans around the globe</p>
                </article>
                {/* Result + Current Driver */}
                <div className='result flex flex-col lg:flex-row justify-center gap-10 mt-5 px-4 '>
                  <div className='Current-results'>
                      <h3 className=' text-white'>Current Result </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* table 1  */}
                    <div className='overflow-x-auto'>
                      <table className='w-full text-sm border-collapse'>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Driver</th>
                        <th>Team</th>
                        <th>Total Score</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                          <td>1</td>
                          <td>Kimi Antonelli</td>
                          <td>Mercedes</td>
                          <td>100</td>
                        </tr>
                        <tr>
                        <td>2</td>
                        <td>George Russell</td>
                        <td>Mercedes</td>
                        <td>80</td>
                        </tr>
                        <tr>
                        <td>3</td>
                        <td>Charles Leclerc</td>
                        <td>Ferrari</td>
                        <td>59</td>
                        </tr>
                        <tr>
                        <td>4</td>
                        <td>Lando Norris</td>
                        <td>McLaren</td>
                        <td>51</td>
                      </tr>
                      <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                       <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                       <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                       <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                       <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                       <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                       <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm border-collapse'>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Driver</th>
                        <th>Team</th>
                        <th>Total Score</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                          <td>1</td>
                          <td>Kimi Antonelli</td>
                          <td>Mercedes</td>
                          <td>100</td>
                        </tr>
                        <tr>
                        <td>2</td>
                        <td>George Russell</td>
                        <td>Mercedes</td>
                        <td>80</td>
                        </tr>
                        <tr>
                        <td>3</td>
                        <td>Charles Leclerc</td>
                        <td>Ferrari</td>
                        <td>59</td>
                        </tr>
                        <tr>
                        <td>4</td>
                        <td>Lando Norris</td>
                        <td>McLaren</td>
                        <td>51</td>
                      </tr>
                      <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                       <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                       <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                       <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                       <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                       <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                       <tr>
                        <td>5</td>
                        <td>Lewis Hamilton</td>
                        <td>Ferrari</td>
                        <td>51</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                  
                  </div>
                </div>
                 <div className='Current-Leader'>
                    <h3>Current WDC Leader</h3>
                    <img src={Kimi} alt="Kimi" className='' />
                    <article className=' mt-3 p-0'>
                      <p className='text-2xl font-bold '>Driver: Kimi Antonelli</p>
                      <p className='text-2xl font-bold '>Nationality : 🇮🇹</p>
                      <p className='text-2xl font-bold '>Team: Mercedes</p>
                    </article>
                 </div>
                </div>
                <div className='  place-items-center gap-5 mt-[150px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'>
                  <section className='Race-icon'>
                    <h3 className='text-center text-2xl '>Previous Race</h3>
                    <div className='box bg-black w-[250px] h-[250px]  rounded-5 '>
                              <img className=' w-100 h-100 rounded-5 object-fit-cover ' src={Miami} alt="" />
                    </div>
                  </section>
                  <section className='Race-icon'>
                      <h3 className='text-center text-2xl '>Next Race</h3>
                      <div className='box  w-[250px] h-[250px]  rounded-5'>
                            <img src={Canada} className='w-100 h-100 object-fit-cover rounded-5' alt="" />
                      </div>
                  </section>
                </div>
            </section>
            <h1 className=' font-bold ml-20 mt-5 '>Features</h1>
            <section className=' container-fluid w-100 h-auto mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1'>
              <div className='box p-20 bg-yellow-200  '></div>
              <div className='box p-20   bg-yellow-200 ' ></div>
              <div className='box p-20  bg-yellow-200 '></div>
              <div className='box p-20   bg-yellow-200 '></div>
              </section>
    </div>
  )
}

export default Home