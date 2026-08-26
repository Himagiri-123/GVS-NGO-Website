import React from 'react';
import { Link } from 'react-router-dom'; // for navigating to new pages
import './index.css';

const Footer = () => {
  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="footer-brand">
            <img src="/images/logo.png" alt="GVS Logo" className="footer-logo" />
            <h3>Grameena Vikas Sangham</h3>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: '5px', display: 'inline-block', marginBottom: '15px', borderLeft: '4px solid #81c784' }}>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#e8f5e9', fontWeight: 'bold' }}>
              <i className="fas fa-certificate" style={{color: '#ffd54f', marginRight: '8px'}}></i> 
              Regd. No: CIT 2/80G/28/2009-10
            </p>
            <p style={{ margin: '4px 0 0 25px', fontSize: '0.85rem', color: '#c8e6c9' }}>
              Dated: 08/06/2010
            </p>
          </div>

          <p>Empowering rural communities through education, health, and environment initiatives since 2008.</p>
        </div>

        {/* Split the links into two sections here */}
        <div className="footer-links-wrapper">
          <div className="footer-right">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <a href="/#home">Home</a>
              <a href="/#about">About</a>
              <a href="/#initiatives">Initiatives</a>
              <a href="/#donate">Donate</a>
              <a href="/#contact">Contact</a>
            </div>
          </div>

          {/* Newly added legal section */}
          <div className="footer-right legal-links-section">
            <h4>Legal</h4>
            <div className="footer-links">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/terms-of-service">Terms of Service</Link>
            </div>
          </div>
        </div>

      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Grameena Vikas Sangham. All Rights Reserved.</p>
        <p className="developer-credit">
          Designed & Developed by <a href="https://himagiri-portfolio-2001.vercel.app/" target="_blank" rel="noopener noreferrer">Himagiri</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;