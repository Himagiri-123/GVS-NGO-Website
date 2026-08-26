import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const LoginGateway = () => {
  const navigate = useNavigate();

  return (
    <div className="gateway-container">
      <div className="gateway-header">
        <h2>Select Login Type</h2>
        <p>Please choose your account type to proceed</p>
      </div>

      <div className="gateway-cards">
        {/* Admin Login Card */}
        <div className="gateway-card" onClick={() => navigate('/admin-login')}>
          <div className="card-icon">
            <i className="fas fa-user-shield"></i>
          </div>
          <h3>Admin Login</h3>
          <p>For Management & Core Committee</p>
        </div>

        {/* Staff Login Card (link updated here) */}
        <div className="gateway-card" onClick={() => navigate('/staff-login')}>
          <div className="card-icon">
            <i className="fas fa-users"></i>
          </div>
          <h3>Staff / User Login</h3>
          <p>For Volunteers, Teachers & Coordinators</p>
        </div>
      </div>

      <div className="back-to-home" onClick={() => navigate('/')}>
        <i className="fas fa-arrow-left"></i> Back to Website
      </div>
    </div>
  );
};

export default LoginGateway;