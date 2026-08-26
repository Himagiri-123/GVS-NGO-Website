import React, { useState, useEffect } from 'react';
import './index.css';
import API_URL from '../../config/api';
import Spinner from '../Spinner';

const Donate = () => {
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching bank/UPI details directly from the database
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bank-details`);
        if (res.ok) {
          const data = await res.json();
          // Show details only if admin has set them, otherwise show "coming soon"
          if (data && (data.bankName || data.accNo || data.upiId)) {
            setBankDetails(data);
          } else {
            setBankDetails(null); 
          }
        }
      } catch (err) {
        console.error("Error fetching bank details:", err);
        setBankDetails(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, []);

  return (
    <div className="donate-section" id="donate">
      <div className="donate-header">
        <h2>Support Our Cause</h2>
        <p>Your small contribution can bring a big change in rural lives.</p>
      </div>
      
      <div className="donate-container">
        {loading ? (
          <Spinner text="Loading donation details..." />
        ) : bankDetails ? (
          <>
            <div className="donate-card">
              <h3>Bank Transfer</h3>
              <div className="details-text">
                <p><strong>Bank:</strong> {bankDetails.bankName}</p>
                <p><strong>Account Name:</strong> {bankDetails.accName}</p>
                <p><strong>Account No:</strong> {bankDetails.accNo}</p>
                <p><strong>IFSC Code:</strong> {bankDetails.ifsc}</p>
              </div>
            </div>

            <div className="donate-card upi-card">
              <h3>UPI Payment</h3>
              <p>Scan and Pay using any UPI app</p>
              <div className="qr-placeholder">
                <img src={bankDetails.qrCodeUrl} alt="GVS UPI QR Code" />
              </div>
              <p className="upi-id"><strong>UPI ID:</strong> {bankDetails.upiId}</p>
            </div>
          </>
        ) : (
          <div className="coming-soon-card" style={{ textAlign: 'center', padding: '40px', background: '#f1f8e9', borderRadius: '10px', width: '100%', maxWidth: '600px', margin: '0 auto', border: '2px dashed #81c784' }}>
            <i className="fas fa-shield-alt" style={{ fontSize: '3.5rem', color: '#2e7d32', marginBottom: '20px' }}></i>
            <h3 style={{ color: '#1b5e20', fontSize: '1.8rem', marginBottom: '10px' }}>Secure Donation Gateway</h3>
            <p style={{ color: '#555', fontSize: '1.1rem', lineHeight: '1.6' }}>
              Official Bank and UPI details will be updated here very soon by the GVS Administration. <br/><br/>
              For urgent contributions, please contact the GVS Main Office directly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Donate;