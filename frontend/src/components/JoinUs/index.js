import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './index.css';
import API_URL from '../../config/api';

const JoinUs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Rule to ensure the phone number is exactly 10 digits
    if (formData.phone.length !== 10) {
      return Swal.fire('Invalid Number', 'Please enter a valid 10-digit mobile number.', 'warning');
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Application Sent!',
          text: 'Thank you for your interest in joining GVS. Our team will contact you soon.',
          confirmButtonColor: '#1b5e20'
        });
        setFormData({ name: '', phone: '', village: '', reason: '' });
        setIsModalOpen(false); // close the popup after success
      } else {
        Swal.fire('Error', 'Failed to send application. Please try again.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Server error. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Function that blocks non-numeric characters while typing
  const handlePhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, ''); // strips anything that isn't a digit
    if (onlyNums.length <= 10) {
      setFormData({ ...formData, phone: onlyNums }); // won't allow typing past 10 digits
    }
  };

  return (
    <>
      <div className="joinus-banner-section">
        <div className="joinus-banner-content">
          <h2>Want to Make a Difference?</h2>
          <p>Become a volunteer at Grameena Vikas Sangham and help us transform rural lives through education and empowerment.</p>
          <button onClick={() => setIsModalOpen(true)} className="join-btn-large">
            Join Us Now <i className="fas fa-hand-holding-heart"></i>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content fade-in" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setIsModalOpen(false)}>&times;</span>
            
            <div className="modal-header">
              <h3><i className="fas fa-hands-helping"></i> Volunteer Application</h3>
              <p>Your time and skills can change lives.</p>
            </div>

            <form onSubmit={handleSubmit} className="joinus-form">
              <input 
                type="text" 
                placeholder="Your Full Name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
              
              {/* Linked that rule to the phone number input here */}
              <input 
                type="tel" 
                placeholder="Phone Number (10 Digits)" 
                value={formData.phone}
                onChange={handlePhoneChange}
                required 
              />
              
              <input 
                type="text" 
                placeholder="Village / Town" 
                value={formData.village}
                onChange={(e) => setFormData({...formData, village: e.target.value})}
                required 
              />
              <textarea 
                placeholder="Why do you want to join GVS? (Optional skills)" 
                rows="3" 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              ></textarea>
              <button type="submit" disabled={loading} className="join-submit-btn">
                {loading ? 'Submitting...' : 'Submit Application'} <i className="fas fa-arrow-right"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default JoinUs;