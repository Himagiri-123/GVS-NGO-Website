import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './index.css';

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page">
      <Navbar />
      <div className="policy-container" style={{ marginTop: '90px' }}>
        <div className="policy-header">
          <h1>Terms and Conditions</h1>
          <p>Last updated: March 17, 2026</p>
        </div>
        
        <div className="policy-content">
          <h3>1. Acceptance of Terms</h3>
          <p>By accessing and using the Grameena Vikas Sangham (GVS) website, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h3>2. Use of Website</h3>
          <p>You agree to use this site only for lawful purposes, and in a manner which does not infringe the rights, or restrict, or inhibit the use and enjoyment of the site by any third party.</p>

          <h3>3. Donations</h3>
          <p>All donations made through our website are voluntary. We utilize these funds for the rural development programs as mentioned on our website. Please ensure you enter the correct amount while making a transaction.</p>

          <h3>4. Intellectual Property</h3>
          <p>All content included on this site, such as text, graphics, logos, images, and software, is the property of Grameena Vikas Sangham or its content suppliers and protected by copyright laws.</p>

          <h3>5. Modifications</h3>
          <p>We reserve the right to revise these terms of service for our website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;