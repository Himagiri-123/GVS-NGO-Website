import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './index.css';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // scroll to top as soon as the page opens
  }, []);

  return (
    <div className="policy-page">
      <Navbar />
      <div className="policy-container" style={{ marginTop: '90px' }}>
        <div className="policy-header">
          <h1>Privacy Policy</h1>
          <p>Last updated: March 17, 2026</p>
        </div>
        
        <div className="policy-content">
          <h3>1. Introduction</h3>
          <p>Welcome to Grameena Vikas Sangham (GVS). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>
          
          <h3>2. The Data We Collect</h3>
          <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
          <ul>
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Donation Data:</strong> includes details about payments to and from you and other details of donations you have made.</li>
          </ul>

          <h3>3. How We Use Your Data</h3>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul>
            <li>To process and acknowledge your donations.</li>
            <li>To manage our relationship with you, including sending you updates about our programs.</li>
            <li>To process volunteer applications.</li>
          </ul>

          <h3>4. Data Security</h3>
          <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.</p>

          <h3>5. Contact Us</h3>
          <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: <strong>grameenavikassangamsrikakulam@gmail.com</strong></p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;