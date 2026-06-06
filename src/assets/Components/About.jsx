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
    </div>
  )
}

export default About