import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import './index.css';
import API_URL from '../../config/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isForgot, setIsForgot] = useState(false);
  const [step, setStep] = useState(1); 
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        localStorage.setItem('adminSessionStart', Date.now().toString());
        
        navigate('/admin-dashboard'); 
      } else {
        // If already logged in elsewhere, that error shows up here
        setError(data.message);
      }
    } catch (err) { setError("Server error."); }
    setLoading(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire('Success', 'OTP sent! (also check your backend console)', 'success');
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (err) { setError("Server error."); }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire('Success', 'Password changed successfully! Please login now.', 'success');
        setIsForgot(false); setStep(1); setPassword(''); setOtp(''); setNewPassword('');
      } else {
        setError(data.message);
      }
    } catch (err) { setError("Server error."); }
    setLoading(false);
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <div className="login-header">
          <i className="fas fa-user-shield"></i>
          <h2>GVS Admin Portal</h2>
          <p>{isForgot ? "Reset Your Password" : "Authorized Personnel Only"}</p>
        </div>

        {error && <div className="error-message" style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '5px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>{error}</div>}

        {!isForgot ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login Securely'}
            </button>
            <div style={{textAlign: 'center', marginTop: '15px'}}>
              <span onClick={() => setIsForgot(true)} style={{color: '#d94f00', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem'}}>
                Forgot Password?
              </span>
            </div>
          </form>
        ) : (
          step === 1 ? (
            <form onSubmit={handleSendOtp} className="login-form">
              <div className="input-group">
                <label>Admin Email</label>
                <input type="email" placeholder="Enter your admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="login-btn" style={{backgroundColor: '#d94f00'}} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>
              <div style={{textAlign: 'center', marginTop: '15px'}}>
                <span onClick={() => setIsForgot(false)} style={{color: '#1b5e20', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem'}}>Back to Login</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="login-form">
              <div className="input-group">
                <label>Enter 6-digit OTP</label>
                <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength="6"/>
              </div>
              <button type="submit" className="login-btn" style={{backgroundColor: '#2e7d32'}} disabled={loading}>
                {loading ? 'Updating...' : 'Save New Password'}
              </button>
              <div style={{textAlign: 'center', marginTop: '15px'}}>
                <span onClick={() => {setIsForgot(false); setStep(1);}} style={{color: '#1b5e20', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem'}}>Cancel</span>
              </div>
            </form>
          )
        )}
        
        <div className="back-to-home" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i> Back to Website
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;