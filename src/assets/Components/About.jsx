import React from 'react'
import './Css/OverAll.css'
import './Css/About.css'
const About = () => {
  return (
    <div className='Big-box'>
      <article className='container-fluid text-center article1'>     
         <span><h1>WHAT IS <span className=' text-red-500'>FORMULAR 1</span>?</h1></span>
          <p className=' w-1/2 mx-auto text-center'>Welcome to the pinacle of motorsport. 11 teams, 22 elite drivers, and cutting-edge open-wheel engineering reaching speeds over 350 km/h on straingt line and over 200km/h in corner in a global battle for ultimate glory.</p>
      </article>
      <article className='Title-section mt-5'>
          <h2>THE GRAND PRIX FORMAT</h2>
          <p>Every Grand Prix takes place over a high-stakes three-day weekend event:</p>
      </article>
      <section className='container-fluid grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-3'>
        <div className='box px-6 py-8 bg-gray-300 rounded-4'>
          <p className='text-red-500'>DAY 1</p>
          <h4>FRIDAY: PRACTICE</h4>
          <p>Two Practice sessions (FP1 & FP2) allow teams to dial in setups test tire compounds, and analyze data on track grip.</p>
        </div>
        <div className='box box px-6 py-8 bg-gray-300 rounded-4'>
          <p className='text-red-500'>DAY 2</p>
          <h3>SATURDAU:QUALIFYING</h3>
          <p>A thrillin three-stage knockout session(Q1, Q2 ,Q3). Driver push for the absolute fastest lap to claim <span className=' fw-bolder'> Pole position</span> for Sunday's grid.</p>
        </div>
        <div className='box box px-6 py-8 bg-gray-300 rounded-4'>
          <p className='text-red-500'>DAY 3</p>
          <h4>SUNDAY:THE RACE</h4>
          <p>The main event. Lighs out and wheel-to-wheel combat across roughly 5.15 kilometers or 3.2 miles per lap, with the average race hovers around 50 to 100 laps, requiring spilt-second team pit-stop stategies. </p>
        </div>
      </section>

      <article className='Title-section mt-5'>
          <h2>F1 BASICS EXPLAINED</h2>
          <p>Swipe or scroll right to watch beginner guides directly from the track :</p>
      </article>
      <section className='container-fluid w-100 h-auto flex overflow-x-auto scrollbar-thin gap-4 pb-4'>
        <div className='box p-4 bg-gray-300 rounded-4  shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]'>
          <iframe className='w-full aspect-video rounded-4 ' src="https://www.youtube.com/embed/eksv7obPEsw" title="F1&#39;s New Rules for 2026 Explained" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          <p className='text-gray-600 mt-3 fw-bolder'>2026 Regulations Guide</p>
        </div>
        <div className='box p-4 bg-gray-300 rounded-4  shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]' >
          <iframe className='w-full aspect-video rounded-4' src="https://www.youtube.com/embed/E__Yxf21EV8" title="Formula 1 Pit Stops EXPLAINED | Fasterclass" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          <p className='text-gray-600 mt-3 fw-bolder'>How Pit Stops Work</p>
        </div>
        <div className=' box p-4 bg-gray-300 rounded-4  shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]'>
          <iframe className=' w-full aspect-video rounded-4' src="https://www.youtube.com/embed/drEjTIp-8V0" title="How does F1 Qualifying work?" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          <p className='text-gray-600 mt-3 fw-bolder'>Understanding qualifying</p>
        </div>
        <div className=' box p-4 bg-gray-300 rounded-4  shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]'>
          <iframe className='w-full aspect-video rounded-4' src="https://www.youtube.com/embed/VIFCbG2vAlU" title="What are F1 Sprint Races and how do they work?" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          <p className='text-gray-600 mt-3 fw-bolder'>Understanding Sprint Race</p>
        </div>
        <div className=' box p-4 bg-gray-300 rounded-4  shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]'>
          <iframe className=' w-full aspect-video rounded-4' src="https://www.youtube.com/embed/YOha7BudrdQ" title="F1 Tyre Compounds Explained" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          <p className='text-gray-600 mt-3 fw-bolder'>Tired Compounds Explained</p>
        </div>
      </section>  
      <article className=' Title-section mt-5'>
        <h2>Champions</h2>
        <p>One Season , Two Championships</p>
      </article>
      <section className='container-fluid w-100 h-auto gap-3 grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2'>
        <div className='box bg-gray-300 p-6 rounded-4'>
          <h3 className=' text-danger'>DRIVERS' CHAMPIONSHIP</h3>
          <p>Awarded to the individual driver who scores the highest total points throughout the grand prix calender year.Points are earned strictly by finising in the Top 10 on race day, with 25 points aoocated to teh race winner.</p>
        </div>
        <div className='box bg-gray-300 p-6 rounded-4'>
          <h3 className=' text-danger'>CONSTRUCTORS' CHAMPIONSHIP</h3>
          <p>Awarded to the manufacturing team (e.g., Ferrari, Red Bull Racing, McLaren) that scores the highest combined points from <span className=' font-bold'>both</span> of their acrtive cars. This champioship directly decides multi-million dollar prize distributions!</p>
        </div>
      </section>
      <article className='Title-section mt-5'>
        <h3>ESSENTIAL TRACK SLANG</h3>
        <p>Some slangs which you will hear from the team radio communications between the driver and their race engineer.</p>
      </article>
      <section className=' container-fluid w-100 h-auto grid gap-3 grid-cols-1 sm:grid-cols-1 lg:grid-cols-4'>
        <div className='box  h-[250px] bg-gray-300 p-6 rounded-4'>
          <h4 className=' text-danger'>De-Rate or Clipping</h4>
          <p>Because the new regulation requires cars's power now to have 50% comes from the electric battery, the batterys will sometimes run out which lead the cars to lose power and speed , making them an easy tarket for anyone behind with full battery.   </p>
        </div>
        <div className='box bg-gray-300  h-[250px] p-6 rounded-4'>
          <h4 className=' text-danger'>Box Box Box...</h4>
          <p>Race Enginner asks the driver to bring the car back to pit stops for tires changing or any adjustment.</p>
        </div>
        <div className='box bg-gray-300  h-[250px] p-6 rounded-4' >
          <h4 className=' text-danger'>Use Overtake</h4>
          <p>Means driver has successfully crossed a detection point within 1.0 second of the car in front, which unlocks a special regulatory electionic override that inject an extra 0.5 megajoules of battery power onto their enginer mapping for the upcoming lap.</p>
        </div>
        <div className='box bg-gray-300  h-[250px] p-6 rounded-4'>
          <h4 className=' text-danger'>Charge Level Critical</h4>
          <p>The race engineers will order them to "harvest" or "recharge", meaning the drivers have to let of the gas pedal early before corners or apply break aggresively to funnel braking heat back into the hybrid system which will recharge the battery.</p>
        </div>
        <div className='box bg-gray-300  h-[280px] p-6 rounded-4'>
          <h4 className=' text-danger'>Comfirm Straight Mode / Cornor Mod</h4>
          <p>Refers to the <span className=' fw-bolder'>Active Aro</span> systems. Drivers manually open and flatten both their front and rear wings to drop grag on the straights(Straight Mode). The race enginners will tell them to switch back to<i>Cornor Mode</i> to make sure the wing flaps snap shut in order to increase down force before a high-speed turn. </p>
        </div>
      </section>
    </div>
  )
}

export default About