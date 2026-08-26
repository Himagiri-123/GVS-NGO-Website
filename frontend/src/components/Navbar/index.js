import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('EN'); 

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'తెలుగు' : 'EN');
  };

  return (
    <nav className="navbar">
      <a href="#home" className="nav-left">
        <img src="/images/logo.png" alt="GVS Logo" className="nav-logo" />
        <span className="nav-title" id="nav-brand">Grameena Vikas Sangham</span>
      </a>

      <div className="hamburger" onClick={toggleMenu}>
        <i className={isMobileMenuOpen ? "fas fa-times" : "fas fa-bars"} style={{ color: 'white', fontSize: '24px' }}></i>
      </div>

      <div className={isMobileMenuOpen ? "nav-right active" : "nav-right"}>
        <a href="#home" onClick={toggleMenu}>Home</a>
        <a href="#about" onClick={toggleMenu}>About</a>
        <a href="#initiatives" onClick={toggleMenu}>Initiatives</a>
        <a href="#donate" onClick={toggleMenu}>Donate</a>
        <a href="#contact" onClick={toggleMenu}>Contact</a>
        
        <div id="google_translate_element" className="translate-btn-container"></div>
        
        <Link to="/login" className="login-btn" onClick={toggleMenu}>Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;