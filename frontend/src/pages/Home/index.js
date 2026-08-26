import React from 'react';
import Navbar from '../../components/Navbar';
import NewsTicker from '../../components/NewsTicker'; 
import Hero from '../../components/Hero';
import AboutPillars from '../../components/AboutPillars';
import Initiatives from '../../components/Initiatives';
import SuccessStories from '../../components/SuccessStories'; 
import Donate from '../../components/Donate';
import JoinUs from '../../components/JoinUs'; // newly added Join Us
import Contact from '../../components/Contact'; 
import Footer from '../../components/Footer'; 

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      
      <div style={{ marginTop: '70px' }}>
        <NewsTicker /> 
      </div>

      <section id="home" style={{ marginTop: '-70px' }}><Hero /></section>
      
      <section id="about"><AboutPillars /></section>
      <section id="initiatives"><Initiatives /></section>
      <section id="success-stories"><SuccessStories /></section>
      <section id="donate"><Donate /></section>
      
      {/* Placed this volunteer banner above the contact section */}
      <JoinUs />

      <section id="contact"><Contact /></section> 
      <Footer />
    </div>
  );
};

export default Home;