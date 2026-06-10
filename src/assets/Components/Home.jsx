import React from 'react'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Driver from "../Media/F1_driver_groupDriver.jpg"
import Home1 from "../Media/F1_track.jpg"
import './Css/Overall.css'
import './Css/Home.css'
import Kimi from '../Media/Kimi_antonelli.png'
import monaco from '../Media/monaco.jpg'
import spain from '../Media/spain.jpg'
import Calender from '../Media/f1-calendar.jpg'
import F1_Cru from '../Media/f1Crusel.jpg'
import { useState, useEffect } from "react";

const Home = () => {
  const [standings, setStandings]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [previousRace, setPreviousRace] = useState(null);
  const [nextRace, setNextRace]         = useState(null);

  useEffect(() => {
    const standingsFetch = fetch("https://api.jolpi.ca/ergast/f1/2026/driverstandings/")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const list = json?.MRData?.StandingsTable?.StandingsLists?.[0];
        if (!list) throw new Error("No data available yet.");
        setStandings(list.DriverStandings);
      });

    const previousFetch = fetch("https://api.jolpi.ca/ergast/f1/2026/last/races/")
      .then(res => res.json())
      // BUG 4 FIX: was ".the(" (typo, missing 'n')
      .then(json => {
        const race = json?.MRData?.RaceTable?.Races?.[0];
        setPreviousRace(race);
      });

    const nextFetch = fetch("https://api.jolpi.ca/ergast/f1/2026/next/races/")
      .then(res => res.json())
      .then(json => {
        const race = json?.MRData?.RaceTable?.Races?.[0];
        setNextRace(race);
      });

    // BUG 5 FIX: run all 3 fetches together, catch any error, then set loading false
    Promise.all([standingsFetch, previousFetch, nextFetch])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const half       = Math.ceil(standings.length / 2);
  const firstHalf  = standings.slice(0, half);
  const secondHalf = standings.slice(half);

  const renderTable = (rows) => (
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
          {rows.map((entry) => (
            <tr key={entry.Driver.driverId}>
              <td>{entry.position}</td>
              <td>{entry.Driver.givenName} {entry.Driver.familyName}</td>
              <td>{entry.Constructors[0]?.name}</td>
              <td>{entry.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
  return (
    <div className='Big-box h-100'>
      <section className='container mb-4'>
        <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src={F1_Cru} alt="Leader" style={{height : '55vh'}} className='d-block w-100  position-relative object-fit-contain' />
            </div>
            <div className="carousel-item">
              <img src={Driver} style={{height : '55vh'}} className="d-block w-100  object-fit-contain" alt="Leader" />            </div>
            <div className="carousel-item">
              <img src={Calender} style={{height : '55vh'}} className="d-block w-100  object-fit-contain" alt="..." />
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </section>
      <section className='Main-content content-center items-center'>
        <article className='w-100 place-items-center'>
          <h2 className=''>Welcome to F1</h2>
          <p className='w-[90%] content-center text-1xl'>Formula 1 (F1) is the absolute pinnacle of international motorsport and the most expensive sport in the world. It is a high-octane arena where the world's most elite drivers push cutting-edge, multi-million dollar machines to speeds exceeding 200 mph. Merging high-stakes strategy, split-second engineering precision, and fierce global rivalries, F1 is a thrilling spectacle of speed and luxury that captivates millions of fans around the globe</p>
        </article>

        <div className='result flex flex-col lg:flex-row justify-center gap-10 mt-5 px-4'>
          <div className='Current-results'>
            <h3 className='text-white'>Current Result</h3>
            <div className='table-result grid grid-cols-1 md:grid-cols-2 gap-4'>
              {renderTable(firstHalf)}
              {renderTable(secondHalf)}
            </div>
          </div>
          <div className='Current-Leader'>
            <h3>Current WDC Leader</h3>
            <img src={Kimi} alt="Kimi" />
            <article className='mt-3 p-0'>
              <p className='text-2xl font-bold'>Driver: Kimi Antonelli</p>
              <p className='text-2xl font-bold'>Nationality : 🇮🇹</p>
              <p className='text-2xl font-bold'>Team: Mercedes</p>
            </article>
          </div>
        </div> 
        {/* race icon */}
        <div className='place-items-center gap-0 mt-[150px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'>
          <section className='Race-icon'>
            <h3 className='text-center text-2xl'>Previous Race</h3>
            <div className='box bg-black w-[250px] h-[250px] rounded-5'>
              <img className='w-100 h-100 rounded-5 object-fit-fill' src={monaco} alt="" />
            </div>
            <p className='text-center mt-2 text-2xl '>{previousRace?.raceName}</p>
            <p className='text-center'>{previousRace?.Circuit?.Location?.country}</p>
            <p className='text-center'>{previousRace?.date}</p>
          </section>
          <section className='Race-icon'>
            <h3 className='text-center text-2xl'>Next Race</h3>
            <div className='box w-[250px] h-[250px] rounded-5'>
              <img src={spain} className='w-100 h-100 object-fit-fill rounded-5' alt="" />
            </div>
            <p className='text-center mt-2 text-2xl '>{nextRace?.raceName}</p>
            <p className='text-center'>{nextRace?.Circuit?.Location?.country}</p>
            <p className='text-center'>{nextRace?.date}</p>
          </section>
        </div>
        <div className="w-full h-50 mt-5 bg-[#15151e] pt-6">
          <div className=" container-fluid  px-4 mx-auto " >
            <div className="w-full mb-6 block">
               <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-wider text-white">Highlights 2026 Season</h2>
            </div>
              <section className='container-fluid w-100 h-[30vh]  flex overflow-x-auto gap-4 pb-4 scrollbar-thin flex-nowrap'>
                <div className='box p-4 bg-gray-200 rounded-md shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]'>
                  <iframe className='w-full aspect-video' src="https://www.youtube.com/embed/eWOsJa24sQo" title="Race Highlights | Formula 1 Canadian Grand Prix 2026" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>
                <div className='box p-4 bg-gray-200 rounded-md shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]'>
                  <iframe className='w-full aspect-video' src="https://www.youtube.com/embed/ksm1knZbzgc" title="Race Highlights | Formula 1 Miami Grand Prix 2026" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>
                <div className='box p-4 bg-gray-200 rounded-md shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]'>
                  <iframe className='w-full aspect-video' src="https://www.youtube.com/embed/EW92sQPZuWk" title="Qualifying Highlights | Formula 1 Japanese Grand Prix 2026" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>
                <div className='box p-4 bg-gray-200 rounded-md shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]'>
                  <iframe className='w-full aspect-video' src="https://www.youtube.com/embed/Fjpn0s-KtKI" title="Race Highlights | Formula 1 Chinese Grand Prix 2026" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>
                <div className='box p-4 bg-gray-200 rounded-md shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]'>
                  <iframe className='w-full aspect-video' src="https://www.youtube.com/embed/ovJKA-FMJUg" title="Race Highlights | Formula 1 Australian Grand Prix 2026" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>
              </section>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home