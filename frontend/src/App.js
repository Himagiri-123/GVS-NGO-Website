import React from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import VvkInstructors from './pages/VvkInstructors'; 
import GovtTeachers from './pages/GovtTeachers'; 
import Caretakers from './pages/Caretakers';     
import InitiativeDetails from './pages/InitiativeDetails'; 
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import LoginGateway from './pages/LoginGateway';
import KalamDreamsApply from './pages/KalamDreamsApply';
import OurTeam from './pages/OurTeam';
import OurLeadership from './pages/OurLeadership';
import ExperienceCertificate from './pages/ExperienceCertificate';
import StaffLogin from './pages/StaffLogin';
import StaffDashboard from './pages/StaffDashboard';
import NotFound from './pages/NotFound';

// Importing the newly created policy pages here
import PrivacyPolicy from './pages/Policies/PrivacyPolicy';
import TermsOfService from './pages/Policies/TermsOfService';

// Newly added security guard (to block direct link access)
const ProtectedRoute = ({ children, roleType }) => {
  const adminData = localStorage.getItem('userInfo');
  const staffData = localStorage.getItem('staffInfo');

  if (roleType === 'admin') {
    return adminData ? children : <Navigate to="/admin-login" />;
  } else if (roleType === 'staff') {
    return staffData ? children : <Navigate to="/staff-login" />;
  }
  
  return <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="main-content">
        <Routes>
          {/* Public routes (anyone can view) */}
          <Route path="/" element={<Home />} />
          <Route path="/vvk-instructors" element={<VvkInstructors />} />
          <Route path="/govt-teachers" element={<GovtTeachers />} /> 
          <Route path="/caretakers" element={<Caretakers />} />       
          <Route path="/initiative/:slug" element={<InitiativeDetails />} /> 
          <Route path="/apply-kalam-dreams" element={<KalamDreamsApply />} />
          <Route path="/our-team" element={<OurTeam />} />
          <Route path="/our-leadership" element={<OurLeadership />} />
          <Route path="/experience-certificate" element={<ExperienceCertificate />} />
          
          {/* Policy page links (anyone can read) */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          
          {/* Login pages */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/login" element={<LoginGateway />} />
          <Route path="/staff-login" element={<StaffLogin />} />

          {/* Private routes (only accessible after login) */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute roleType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff-dashboard" 
            element={
              <ProtectedRoute roleType="staff">
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />

          {/* 404 page for any unmatched route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;