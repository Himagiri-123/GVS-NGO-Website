import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import API_URL from '../../config/api';

const StaffLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (phone.length !== 10) {
      setError('Phone number must be exactly 10 digits!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const staffDataToSave = {
          ...data,
          loginTimestamp: Date.now() 
        };
        localStorage.setItem('staffInfo', JSON.stringify(staffDataToSave));
        navigate('/staff-dashboard'); 
      } else {
        // Error gets printed here
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  return (
    <div className="staff-login-page">
      <div className="login-card">
        <div className="login-header">
          <i className="fas fa-user-circle"></i>
          <h2>Staff / Volunteer Login</h2>
          <p>Enter your phone number and password to submit daily reports.</p>
        </div>

        {error && <div className="error-msg" style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '5px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={handlePhoneChange} 
              placeholder="Enter your 10-digit number" 
              required 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Default is 123456" 
              required 
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'} <i className="fas fa-sign-in-alt"></i>
          </button>
        </form>
        
        <div className="login-footer">
          <button onClick={() => navigate('/')} className="back-home-btn">
            <i className="fas fa-arrow-left"></i> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;