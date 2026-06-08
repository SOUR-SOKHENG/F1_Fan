import React from 'react'
import { BrowserRouter as Router , Route , Routes } from 'react-router-dom'
import { BrowserRouter  } from 'react-router-dom'
import Home from '../assets/Components/Home'
import About from'../assets/Components/About'
import Team from '../assets/Components/Team'
import News from '../assets/Components/News'
import Clip from '../assets/Components/Clip'
import Navbar from '../assets/Components/Navbar'
import Footer from '../assets/Components/Footer'


const MenuRouth = () => {
  return (
    <BrowserRouter basename="/F1_Fan">
        <Navbar/>
            <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/Home' element={<Home/>}/>
                <Route path='/About' element={<About/>}/>
                <Route path='/Team' element={<Team/>}/>
                <Route path='/News' element={<News/>}/>
                <Route path='/Clips' element={<Clip/>}/>
            </Routes>
        <Footer/>
    </BrowserRouter>
  )
}

export default MenuRouth