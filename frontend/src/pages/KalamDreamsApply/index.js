import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import API_URL from '../../config/api';

const KalamDreamsApply = () => {
  const navigate = useNavigate();
  
  // State for storing the form data
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    education: '',
    village: '',
    mandal: '',
    phoneNumber: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Logic that blocks letters from being typed
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      // Keeps only digits, capped at 10
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Function that sends the data to the backend on Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Stop here if the number isn't exactly 10 digits
    if (formData.phoneNumber.length !== 10) {
      setError('Please enter exactly a 10-digit phone number!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Server problem. Please try again.');
      }

      setSuccess('🎉 Your application was submitted successfully! Our team will contact you.');
      
      // Clear the form after submitting
      setFormData({
        studentName: '', fatherName: '', education: '', village: '', mandal: '', phoneNumber: ''
      });

    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="apply-page-container">
      <div className="apply-card">
        <div className="apply-header">
          <i className="fas fa-laptop-code"></i>
          <h2>Kalam Dreams</h2>
          <p>Free Computer Training Application</p>
        </div>

        {error && <div className="error-msg"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        {success && <div className="success-msg"><i className="fas fa-check-circle"></i> {success}</div>}

        <form onSubmit={handleSubmit} className="apply-form">
          <div className="input-row">
            <div className="input-group">
              <label>Student Name *</label>
              <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} required placeholder="Enter your full name" />
            </div>
            <div className="input-group">
              <label>Father's Name *</label>
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required placeholder="Enter father's name" />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Education/Class *</label>
              <input type="text" name="education" value={formData.education} onChange={handleChange} required placeholder="Ex: 10th, Inter, Degree" />
            </div>
            <div className="input-group">
              <label>Phone Number *</label>
              {/* Also set maxLength="10" as an extra safeguard */}
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="10 digit mobile number" maxLength="10" pattern="[0-9]{10}" title="Please enter valid 10 digit number" />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Village Name *</label>
              <input type="text" name="village" value={formData.village} onChange={handleChange} required placeholder="Enter your village" />
            </div>
            <div className="input-group">
              <label>Mandal *</label>
              <input type="text" name="mandal" value={formData.mandal} onChange={handleChange} required placeholder="Enter your mandal" />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'} <i className="fas fa-paper-plane"></i>
          </button>
        </form>

        <div className="back-link" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i> Back to Home
        </div>
      </div>
    </div>
  );
};

export default KalamDreamsApply;