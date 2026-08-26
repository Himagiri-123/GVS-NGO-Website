import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import './index.css';
import InitiativesManager from '../../components/InitiativesManager';
import ApplicationsManager from '../../components/ApplicationsManager';
import StaffManager from '../../components/StaffManager';
import HomePageManager from '../../components/HomePageManager';
import ReportsManager from '../../components/ReportsManager';
import AccountsManager from '../../components/AccountsManager';
import SuccessStoryManager from '../../components/SuccessStoryManager';
import VolunteerManager from '../../components/VolunteerManager';
// Newly added component
import ComputerStudentManager from '../../components/ComputerStudentManager';
import OrgInfoManager from '../../components/OrgInfoManager';
import API_URL from '../../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState(''); 
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState('60:00');

  const handleLogout = async (emailToLogout = adminEmail) => {
    if (emailToLogout) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToLogout })
        });
      } catch (err) { console.error(err); }
    }
    localStorage.removeItem('userInfo'); 
    localStorage.removeItem('adminSessionStart'); 
    navigate('/admin-login'); 
  };

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/admin-login');
      return;
    } 

    const parsedInfo = JSON.parse(userInfo);
    setAdminName(parsedInfo.name);
    setAdminEmail(parsedInfo.email);

    const sessionStart = localStorage.getItem('adminSessionStart');
    if (!sessionStart) {
      handleLogout(parsedInfo.email);
      return;
    }

    const calculateTimeLeft = () => {
      const timePassed = Date.now() - parseInt(sessionStart, 10);
      const remainingTime = 3600000 - timePassed; 

      if (remainingTime <= 0) {
        handleLogout(parsedInfo.email); 
      } else {
        const minutes = Math.floor((remainingTime % 3600000) / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    calculateTimeLeft(); 
    const timerId = setInterval(calculateTimeLeft, 1000); 

    const handleStorageSync = (e) => {
      if (e.key === 'userInfo' && e.newValue === null) {
        handleLogout(parsedInfo.email);
      }
    };
    window.addEventListener('storage', handleStorageSync);

    return () => {
      clearInterval(timerId);
      window.removeEventListener('storage', handleStorageSync);
    };
  }, [navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if(newPassword !== confirmPassword) {
      return Swal.fire('Error', 'New Passwords do not match!', 'error');
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, oldPassword, newPassword }),
      });
      const data = await response.json();
      if(response.ok) {
        Swal.fire('Success!', 'Password Changed Successfully! Please login again.', 'success').then(() => {
            handleLogout(adminEmail); 
        });
      } else {
        Swal.fire('Error', data.message, 'error');
      }
    } catch(err) {
      Swal.fire('Error', 'Server Error', 'error');
    }
    setLoading(false);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setIsMenuOpen(false); 
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content overview-tab fade-in">
            <h2>Welcome back, {adminName}! 👋</h2>
            <p>Here is the quick overview of GVS activities.</p>
            <div className="stats-grid">
              <div className="stat-card" onClick={() => handleTabChange('initiatives')} style={{ cursor: 'pointer' }}>
                <i className="fas fa-hand-holding-heart"></i>
                <h3>Initiatives</h3><p>Manage Programs</p>
              </div>
              <div className="stat-card" onClick={() => handleTabChange('skill-dev')} style={{ cursor: 'pointer' }}>
                <i className="fas fa-laptop-code"></i>
                <h3>Skill Dev Manager</h3><p>Manage Computer Courses</p>
              </div>
              
              {/* Removed the old green styling here, made it normal */}
              <div className="stat-card" onClick={() => handleTabChange('computer-students')} style={{ cursor: 'pointer' }}>
                <i className="fas fa-user-graduate"></i>
                <h3>Computer Students</h3><p>Certificates & Batches</p>
              </div>

              <div className="stat-card" onClick={() => handleTabChange('applications')} style={{ cursor: 'pointer' }}>
                <i className="fas fa-file-alt"></i>
                <h3>Applications</h3><p>Kalam Dreams</p>
              </div>
              <div className="stat-card" onClick={() => handleTabChange('volunteers')} style={{ cursor: 'pointer' }}>
                <i className="fas fa-hands-helping"></i>
                <h3>Join Requests</h3><p>New Volunteers</p>
              </div>
              <div className="stat-card" onClick={() => handleTabChange('staff')} style={{ cursor: 'pointer' }}>
                <i className="fas fa-users"></i>
                <h3>Staff</h3><p>Manage Team</p>
              </div>
              <div className="stat-card" onClick={() => handleTabChange('home')} style={{ cursor: 'pointer' }}>
                <i className="fas fa-image"></i>
                <h3>Home Page</h3><p>Carousel & Stats</p>
              </div>
              <div className="stat-card" onClick={() => handleTabChange('reports')} style={{ cursor: 'pointer' }}>
                <i className="fas fa-chart-bar"></i>
                <h3>Daily Reports</h3><p>View Progress</p>
              </div>
              <div className="stat-card" onClick={() => handleTabChange('accounts')} style={{ cursor: 'pointer' }}>
                <i className="fas fa-file-invoice-dollar"></i>
                <h3>Accounts</h3><p>Manage Finances</p>
              </div>
              <div className="stat-card" onClick={() => handleTabChange('success-stories')} style={{ cursor: 'pointer' }}>
                <i className="fas fa-graduation-cap"></i>
                <h3>Success Stories</h3><p>Achievements</p>
              </div>
              <div className="stat-card" onClick={() => handleTabChange('ngo-history')} style={{ cursor: 'pointer' }}>
                <i className="fas fa-history"></i>
                <h3>NGO History</h3><p>Excel Records</p>
              </div>
            </div>
          </div>
        );
      case 'initiatives': return <div className="tab-content"><InitiativesManager key="tab-manage-initiatives" /></div>;
      case 'skill-dev': return <div className="tab-content fade-in" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
            <InitiativesManager key="tab-skill-dev" forceCategory="skill-development" />
          </div>;
      
      // Logic for loading the new tab
      case 'computer-students': return <div className="tab-content fade-in"><ComputerStudentManager /></div>;

      case 'applications': return <div className="tab-content"><ApplicationsManager /></div>;
      case 'volunteers': return <div className="tab-content"><VolunteerManager /></div>;
      case 'staff': return <div className="tab-content"><StaffManager /></div>;
      case 'home': return <div className="tab-content"><HomePageManager /></div>;
      case 'reports': return <div className="tab-content"><ReportsManager /></div>;
      case 'accounts': return <div className="tab-content"><AccountsManager /></div>;
      case 'success-stories': return <div className="tab-content"><SuccessStoryManager /></div>;
      case 'org-info': return <div className="tab-content"><OrgInfoManager /></div>;
      
      case 'ngo-history': 
        return (
          <div className="tab-content fade-in" style={{ height: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ color: '#1b5e20', margin: 0, fontSize: '1.2rem' }}><i className="fas fa-file-excel"></i> NGO Complete History</h2>
              <span style={{ fontSize: '0.8rem', color: '#1565c0', background: '#e3f2fd', padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold' }}>
                <i className="fas fa-cloud-upload-alt"></i> Auto-saves to Google Drive
              </span>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              <iframe 
                src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSx1u3coGSwHBpwDSfXBvf8dJc_i1-20-Bq0vnIFC-yqHWzsc7xIKguIySBPcIQkgbP7ZqNi00NF84n/pubhtml?widget=true&amp;headers=false" 
                width="100%" height="100%" frameBorder="0" title="NGO Excel History"
              ></iframe>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="tab-content fade-in" style={{maxWidth: '500px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}}>
            <h2 style={{color: '#1b5e20', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>
              <i className="fas fa-key"></i> Change Admin Password
            </h2>
            <form onSubmit={handleChangePassword}>
              <div style={{marginBottom: '15px'}}>
                <label style={{display:'block', fontWeight:'bold', marginBottom:'5px'}}>Current Password *</label>
                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required style={{width:'100%', padding:'10px', border:'1px solid #ccc', borderRadius:'5px', boxSizing:'border-box'}} />
              </div>
              <div style={{marginBottom: '15px'}}>
                <label style={{display:'block', fontWeight:'bold', marginBottom:'5px'}}>New Password *</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength="6" style={{width:'100%', padding:'10px', border:'1px solid #ccc', borderRadius:'5px', boxSizing:'border-box'}} />
              </div>
              <div style={{marginBottom: '25px'}}>
                <label style={{display:'block', fontWeight:'bold', marginBottom:'5px'}}>Confirm New Password *</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength="6" style={{width:'100%', padding:'10px', border:'1px solid #ccc', borderRadius:'5px', boxSizing:'border-box'}} />
              </div>
              <button type="submit" disabled={loading} style={{width:'100%', background:'#d94f00', color:'white', border:'none', padding:'12px', fontSize:'1.1rem', fontWeight:'bold', borderRadius:'5px', cursor:'pointer'}}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        );
      default: return <div>Select a tab</div>;
    }
  };

  return (
    <div className="admin-layout">
      <div className={`mobile-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>

      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <i className="fas fa-shield-alt"></i><h2>GVS Admin</h2>
        </div>

        <ul className="sidebar-menu">
          <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => handleTabChange('overview')}><i className="fas fa-chart-line"></i> Dashboard</li>
          <li className={activeTab === 'initiatives' ? 'active' : ''} onClick={() => handleTabChange('initiatives')}><i className="fas fa-tasks"></i> Manage Initiatives</li>
          
          <li className={activeTab === 'skill-dev' ? 'active' : ''} onClick={() => handleTabChange('skill-dev')} style={{ borderLeft: activeTab === 'skill-dev' ? '4px solid #fdd835' : 'none' }}>
            <i className="fas fa-laptop-code"></i> Skill Dev Manager
          </li>

          {/* New tab button in the sidebar */}
          <li className={activeTab === 'computer-students' ? 'active' : ''} onClick={() => handleTabChange('computer-students')} style={{ borderLeft: activeTab === 'computer-students' ? '4px solid #fdd835' : 'none', background: activeTab === 'computer-students' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
            <i className="fas fa-user-graduate"></i> Computer Students
          </li>

          <li className={activeTab === 'applications' ? 'active' : ''} onClick={() => handleTabChange('applications')}><i className="fas fa-file-signature"></i> Applications</li>
          
          <li className={activeTab === 'volunteers' ? 'active' : ''} onClick={() => handleTabChange('volunteers')} style={{borderLeft: activeTab === 'volunteers' ? '4px solid #fdd835' : 'none', background: activeTab === 'volunteers' ? 'rgba(255,255,255,0.1)' : 'transparent'}}>
            <i className="fas fa-hands-helping"></i> Join Requests
          </li>

          <li className={activeTab === 'staff' ? 'active' : ''} onClick={() => handleTabChange('staff')}><i className="fas fa-users-cog"></i> Manage Staff</li>
          <li className={activeTab === 'home' ? 'active' : ''} onClick={() => handleTabChange('home')}><i className="fas fa-image"></i> Home Controls</li>
          <li className={activeTab === 'reports' ? 'active' : ''} onClick={() => handleTabChange('reports')}><i className="fas fa-chart-bar"></i> Daily Reports</li>
          <li className={activeTab === 'accounts' ? 'active' : ''} onClick={() => handleTabChange('accounts')}><i className="fas fa-file-invoice-dollar"></i> Accounts Details</li>
          
          <li className={activeTab === 'success-stories' ? 'active' : ''} onClick={() => handleTabChange('success-stories')} style={{borderLeft: activeTab === 'success-stories' ? '4px solid #fdd835' : 'none'}}>
            <i className="fas fa-graduation-cap"></i> Success Stories
          </li>
          
          <li className={activeTab === 'ngo-history' ? 'active' : ''} onClick={() => handleTabChange('ngo-history')} style={{borderLeft: activeTab === 'ngo-history' ? '4px solid #fdd835' : 'none'}}>
            <i className="fas fa-history"></i> NGO History (Excel)
          </li>

          <li className={activeTab === 'org-info' ? 'active' : ''} onClick={() => handleTabChange('org-info')} style={{borderLeft: activeTab === 'org-info' ? '4px solid #fdd835' : 'none'}}>
            <i className="fas fa-address-card"></i> About &amp; Contact Info
          </li>

          <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => handleTabChange('settings')} style={{marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px'}}>
            <i className="fas fa-cog"></i> Change Password
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-top-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
                <i className="fas fa-bars"></i>
              </button>
              <div className="header-title">Admin Control Panel</div>
            </div>
          </div>
          
          <div className="header-actions" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div className="header-profile"><i className="fas fa-user-circle"></i> {adminName}</div>
            
            <div style={{ background: '#ffebee', color: '#c62828', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ef9a9a' }}>
              <i className="fas fa-stopwatch"></i> {timeLeft}
            </div>
            
            <button onClick={() => handleLogout()} className="logout-btn" style={{ margin: 0, padding: '8px 15px', fontSize: '0.9rem', width: 'auto' }}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>

        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;