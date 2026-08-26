import React from 'react';
import './index.css';

const Hero = () => {
  return (
    <div 
      className="hero-container"
      style={{ 
        backgroundImage: "linear-gradient(rgba(27, 94, 32, 0.7), rgba(0, 0, 0, 0.8)), url('/images/ngo-building.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="hero-content">
        
        

        <h1 className="hero-heading">GRAMEENA VIKAS SANGHAM</h1>
        {/* Organization badge styled here */}
        <div className="registration-badge">
          <i className="fas fa-shield-alt"></i> 
          Govt. Registered NGO: CIT 2/80G/28/2009-10
        </div>
        <div className="hero-caption">
          <p>Dedicated to the holistic development and empowerment of rural communities.</p>
          <p>Focusing on quality education, moral values, and sustainable environments.</p>
        </div>

        <div className="hero-buttons">
          <a href="#initiatives" className="btn-modern">
            Explore Our Initiatives <i className="fas fa-arrow-down"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;