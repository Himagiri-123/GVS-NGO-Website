import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import './index.css';
import InitiativesManager from '../../components/InitiativesManager';
import ApplicationsManager from '../../components/ApplicationsManager';
import API_URL from '../../config/api';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [staffInfo, setStaffInfo] = useState(null);
  
  const [activeTab, setActiveTab] = useState('report');

  const [editingReportId, setEditingReportId] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
  const [studentsPresent, setStudentsPresent] = useState('');
  const [chikkisDistributed, setChikkisDistributed] = useState('');
  const [notes, setNotes] = useState('');
  const [myReports, setMyReports] = useState([]); 
  
  const [studentsList, setStudentsList] = useState([]);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [studentForm, setStudentForm] = useState({ name: '', className: '', phone: '', gender: 'Boy', academicYear: '2024-2025', batchNumber: '' });

  const [selectedStudentFilter, setSelectedStudentFilter] = useState('All');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [currentReportPage, setCurrentReportPage] = useState(1);
  const [currentStudentPages, setCurrentStudentPages] = useState({});

  const [chikkiStocks, setChikkiStocks] = useState([]);
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockFormData, setStockFormData] = useState({ date: new Date().toISOString().split('T')[0], used: '', remarks: '', supply: 0 });

  const [timeLeft, setTimeLeft] = useState('60:00');

  const academicYearsList = [];
  for (let year = 2008; year <= 2040; year++) {
    academicYearsList.push(`${year}-${year + 1}`);
  }

  // Tell the backend to clear the lock when staff logs out
  const handleLogout = async (staffId) => {
    const idToLogout = staffId || (staffInfo ? staffInfo._id : null);
    if (idToLogout) {
      try {
        await fetch(`${API_URL}/api/staff/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: idToLogout })
        });
      } catch (err) { console.error(err); }
    }
    localStorage.removeItem('staffInfo');
    navigate('/staff-login');
  };

  useEffect(() => {
    const infoStr = localStorage.getItem('staffInfo');
    if (!infoStr) {
      navigate('/staff-login');
      return;
    }

    const info = JSON.parse(infoStr);
    setStaffInfo(info);
    
    const loginTime = info.loginTimestamp || Date.now(); 

    const calculateTimeLeft = () => {
      const timePassed = Date.now() - loginTime;
      const remainingTime = 3600000 - timePassed; 

      if (remainingTime <= 0) {
        Swal.fire('Session Expired', 'Your login session has expired. Please login again.', 'warning');
        handleLogout(info._id); // clear the lock and log out when the session expires
      } else {
        const minutes = Math.floor((remainingTime % 3600000) / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    calculateTimeLeft(); 
    const timerId = setInterval(calculateTimeLeft, 1000); 

    const handleStorageSync = (e) => {
      if (e.key === 'staffInfo' && e.newValue === null) {
        handleLogout(info._id);
      }
    };
    window.addEventListener('storage', handleStorageSync);

    return () => {
      clearInterval(timerId);
      window.removeEventListener('storage', handleStorageSync);
    };

  }, [navigate]);

  const fetchStudents = async () => {
    if (!staffInfo) return;
    const userVillage = staffInfo.village || 'Not Specified'; 
    try {
      const response = await fetch(`${API_URL}/api/students?village=${userVillage}`, {
        headers: { Authorization: `Bearer ${staffInfo.token}` }
      });
      const data = await response.json();
      
      let filteredData = [];
      if(Array.isArray(data)){
         if (staffInfo.role === 'computer_teacher') {
            filteredData = data.filter(s => s.category === 'Computer');
         } else {
            filteredData = data.filter(s => s.category === 'VVK' || !s.category);
         }
      }
      setStudentsList(filteredData);
    } catch (err) { 
      console.error("Error fetching students:", err); 
      setStudentsList([]); 
    }
  };

  const fetchMyReports = async () => {
    if (!staffInfo) return;
    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${staffInfo.token}` }
      });
      const allReports = await response.json();
      if(Array.isArray(allReports)) {
         const filtered = allReports.filter(r => r.staffName === staffInfo.name && r.village === staffInfo.village);
         setMyReports(filtered);
      } else {
         setMyReports([]);
      }
    } catch (err) { 
      console.error("Error fetching reports:", err); 
    }
  };

  const fetchChikkiStocks = async () => {
    if (!staffInfo) return;
    try {
      const res = await fetch(`${API_URL}/api/chikki-stock`, {
        headers: { Authorization: `Bearer ${staffInfo.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const villageData = data.filter(s => s.village === staffInfo.village);
        setChikkiStocks(villageData);
      }
    } catch (err) {
      console.error("Error fetching stocks", err);
    }
  };

  useEffect(() => {
    if (staffInfo && activeTab === 'students') {
      fetchStudents();
      setSelectedStudentFilter('All');
    }
    if (staffInfo && activeTab === 'my-reports') fetchMyReports();
    if (staffInfo && activeTab === 'chikki-stock') fetchChikkiStocks();
  }, [staffInfo, activeTab]);

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); 
    if (val.length <= 10) setStudentForm({ ...studentForm, phone: val });
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setMsg({ type: '', text: '' });

    const reportData = {
      staffId: staffInfo._id, 
      staffName: staffInfo.name, 
      village: staffInfo.village || 'Not Specified',
      date, 
      studentsPresent: Number(studentsPresent), 
      chikkisDistributed: Number(chikkisDistributed), 
      notes
    };

    try {
      const url = editingReportId ? `${API_URL}/api/reports/${editingReportId}` : `${API_URL}/api/reports`;
      const method = editingReportId ? 'PUT' : 'POST';
      const response = await fetch(url, { 
        method: method, 
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffInfo.token}`
        }, 
        body: JSON.stringify(reportData) 
      });

      if (response.ok) {
        setMsg({ type: 'success', text: editingReportId ? '✅ Report Updated!' : '✅ Daily Report submitted!' });
        setStudentsPresent(''); 
        setChikkisDistributed(''); 
        setNotes(''); 
        setEditingReportId(null);
        if(editingReportId) setActiveTab('my-reports'); 
      } else {
        setMsg({ type: 'error', text: 'Failed to submit report' });
      }
    } catch (err) { 
      setMsg({ type: 'error', text: 'Server error. Try again.' }); 
    } finally { 
      setLoading(false); 
    }
  };

  const editReport = (report) => {
    setEditingReportId(report._id);
    setDate(report.date); 
    setStudentsPresent(report.studentsPresent); 
    setChikkisDistributed(report.chikkisDistributed); 
    setNotes(report.notes || '');
    setActiveTab('report'); 
  };

  const deleteReport = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this report!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${API_URL}/api/reports/${id}`, { 
          method: 'DELETE',
          headers: { Authorization: `Bearer ${staffInfo.token}` }
        });
        fetchMyReports();
        Swal.fire('Deleted!', 'Report has been deleted.', 'success');
      } catch (err) { 
        Swal.fire('Error!', 'Failed to delete report.', 'error');
      }
    }
  };

  const handleAddOrUpdateStudent = async (e) => {
    e.preventDefault();
    if(studentForm.phone.length !== 10) {
      Swal.fire('Invalid Phone', 'Phone number must be exactly 10 digits!', 'error'); 
      return;
    }
    
    const isComputer = staffInfo.role === 'computer_teacher';
    const studentCategory = isComputer ? 'Computer' : 'VVK';
    const batchNo = isComputer ? (studentForm.batchNumber || 'Unassigned') : '-';

    setLoading(true);
    const studentData = { 
      ...studentForm, 
      village: staffInfo.village || 'Not Specified', 
      addedBy: staffInfo.name,
      category: studentCategory,
      batchNumber: batchNo
    };

    try {
      const url = editingStudentId ? `${API_URL}/api/students/${editingStudentId}` : `${API_URL}/api/students`;
      const method = editingStudentId ? 'PUT' : 'POST';
      const response = await fetch(url, { 
        method: method, 
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${staffInfo.token}`
        }, 
        body: JSON.stringify(studentData) 
      });

      if (response.ok) {
        setStudentForm({ name: '', className: '', phone: '', gender: 'Boy', academicYear: '2024-2025', batchNumber: '' });
        setEditingStudentId(null); 
        fetchStudents();
        Swal.fire('Success!', editingStudentId ? "Student updated!" : "Student added successfully!", 'success'); 
      } else {
        const errData = await response.json();
        Swal.fire('Error!', errData.message || 'Server validation failed.', 'error');
      }
    } catch (err) { 
      Swal.fire('Error!', 'Server error, please try again.', 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const editStudent = (student) => {
    setEditingStudentId(student._id);
    setStudentForm({
      name: student.name, 
      className: student.className, 
      phone: student.phone, 
      gender: student.gender || 'Boy', 
      academicYear: student.academicYear || '2024-2025',
      batchNumber: student.batchNumber || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteStudent = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to remove this student?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove!'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${API_URL}/api/students/${id}`, { 
          method: 'DELETE',
          headers: { Authorization: `Bearer ${staffInfo.token}` }
        });
        fetchStudents();
        Swal.fire('Removed!', 'Student has been removed.', 'success');
      } catch (err) { 
        Swal.fire('Error!', 'Failed to remove student.', 'error');
      }
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        date: stockFormData.date,
        village: staffInfo.village || 'Not Specified',
        mandal: staffInfo.mandal || 'Not Specified',
        used: Number(stockFormData.used) || 0,
        remarks: stockFormData.remarks || '',
        addedBy: staffInfo.name
      };

      if (editingStockId) {
        submitData.supply = Number(stockFormData.supply) || 0;
      } else {
        submitData.supply = 0; 
      }

      const url = editingStockId ? `${API_URL}/api/chikki-stock/${editingStockId}` : `${API_URL}/api/chikki-stock`;
      const method = editingStockId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${staffInfo.token}` },
        body: JSON.stringify(submitData)
      });
      
      if (res.ok) {
        Swal.fire('Saved!', 'Usage record saved successfully.', 'success');
        setStockFormData({ date: new Date().toISOString().split('T')[0], used: '', remarks: '', supply: 0 });
        setEditingStockId(null);
        fetchChikkiStocks();
      } else {
        Swal.fire('Error', 'Failed to save record', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Server error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStock = (stock) => {
    setEditingStockId(stock._id);
    setStockFormData({
      date: stock.date,
      used: stock.used || '',
      remarks: stock.remarks || '',
      supply: stock.supply || 0 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteStock = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, Delete!' });
    if (result.isConfirmed) {
      try {
        await fetch(`${API_URL}/api/chikki-stock/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${staffInfo.token}` } });
        fetchChikkiStocks();
        Swal.fire('Deleted!', 'Record removed.', 'success');
      } catch (err) { Swal.fire('Error', 'Failed', 'error'); }
    }
  };

  const stocksWithBalance = useMemo(() => {
    const sorted = [...chikkiStocks].sort((a, b) => new Date(a.date) - new Date(b.date));
    let currentBalance = 0;
    
    const calculated = sorted.map(stock => {
      const oldBalance = currentBalance;
      const total = oldBalance + (Number(stock.supply) || 0);
      const closingBalance = total - (Number(stock.used) || 0);
      currentBalance = closingBalance;
      
      return { ...stock, oldBalance, total, closingBalance };
    });

    return calculated.reverse(); 
  }, [chikkiStocks]);

  if (!staffInfo) return null;

  const isComputerTeacher = staffInfo.role === 'computer_teacher';

  const sortedMyReports = [...myReports].sort((a, b) => b.date.localeCompare(a.date));
  const currentReportsList = sortedMyReports.slice((currentReportPage - 1) * 10, currentReportPage * 10);
  const totalReportPages = Math.ceil(sortedMyReports.length / 10);

  const availableFilterOptions = isComputerTeacher 
    ? [...new Set(studentsList.map(s => s.batchNumber))].filter(Boolean)
    : [...new Set(studentsList.map(s => s.academicYear))].filter(Boolean);

  const displayStudents = selectedStudentFilter === 'All' 
    ? studentsList 
    : studentsList.filter(s => isComputerTeacher ? s.batchNumber === selectedStudentFilter : s.academicYear === selectedStudentFilter);

  const groupedStudents = displayStudents.reduce((acc, student) => {
    const groupKey = isComputerTeacher ? (student.batchNumber || 'Unassigned Batch') : (student.academicYear || 'Unknown Year');
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(student);
    return acc;
  }, {});

  const sortStudentsByClass = (studentsArray) => {
    return studentsArray.sort((a, b) => {
      const numA = parseInt(a.className.match(/\d+/)) || 99;
      const numB = parseInt(b.className.match(/\d+/)) || 99;
      return numA - numB;
    });
  };

  return (
    <div className="staff-dashboard-page">
      <nav className="staff-nav">
        <div className="nav-brand"><i className="fas fa-shield-alt"></i> {isComputerTeacher ? 'GVS Computer Faculty Portal' : 'GVS Staff Portal'}</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#ffebee', color: '#c62828', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ef9a9a' }}>
            <i className="fas fa-stopwatch"></i> {timeLeft}
          </div>
          <button onClick={() => handleLogout()} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {staffInfo.name}! 👋</h2>
          <p>
            <i className="fas fa-map-marker-alt"></i> Center: <strong>{staffInfo.village || 'Not Assigned'}</strong> | Role: <strong>{isComputerTeacher ? 'Computer Faculty' : (staffInfo.role || staffInfo.category || 'Staff')}</strong>
          </p>
        </div>

        <div className="staff-tabs" style={{ flexWrap: 'wrap' }}>
          <button className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`} onClick={() => { setActiveTab('report'); setEditingReportId(null); }}>
            <i className="fas fa-clipboard-list"></i> Submit Report
          </button>
          
          <button className={`tab-btn ${activeTab === 'my-reports' ? 'active' : ''}`} onClick={() => setActiveTab('my-reports')}>
            <i className="fas fa-history"></i> My Reports
          </button>

          <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            <i className="fas fa-user-graduate"></i> My Students
          </button>

          {!isComputerTeacher && (
            <button className={`tab-btn ${activeTab === 'chikki-stock' ? 'active' : ''}`} onClick={() => { setActiveTab('chikki-stock'); setEditingStockId(null); }}>
              <i className="fas fa-boxes"></i> Chikki Stock (స్టాక్)
            </button>
          )}

          {isComputerTeacher && (
            <>
              <button className={`tab-btn ${activeTab === 'skill-dev' ? 'active' : ''}`} onClick={() => setActiveTab('skill-dev')}>
                <i className="fas fa-laptop-code"></i> Skill Dev Manager
              </button>
              <button className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
                <i className="fas fa-file-signature"></i> Class Applications
              </button>
            </>
          )}
        </div>

        {activeTab === 'report' && (
          <div className="report-form-card fade-in">
            <h3 style={{color: editingReportId ? '#0288d1' : '#1b5e20'}}>
              {editingReportId ? <><i className="fas fa-edit"></i> Edit Report</> : <><i className="fas fa-file-signature"></i> Submit Daily Report</>}
            </h3>
            
            {msg.text && (
              <div className={`msg-box ${msg.type === 'success' ? 'success-msg' : 'error-msg'}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleReportSubmit}>
              <div className="form-row">
                <div className="input-group">
                  <label>Date *</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Students Present *</label>
                  <input type="number" min="0" value={studentsPresent} onChange={(e) => setStudentsPresent(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Chikkis Distributed *</label>
                  <input type="number" min="0" value={chikkisDistributed} onChange={(e) => setChikkisDistributed(e.target.value)} required />
                </div>
              </div>

              <div className="input-group">
                <label>Notes (Optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="2"></textarea>
              </div>

              <button type="submit" className="submit-report-btn" style={{background: editingReportId ? '#0288d1' : '#1b5e20'}} disabled={loading}>
                {loading ? 'Saving...' : (editingReportId ? 'Update Report' : 'Submit Report')}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'chikki-stock' && !isComputerTeacher && (
          <div className="report-form-card fade-in">
            <h3 style={{color: editingStockId ? '#0288d1' : '#2e7d32'}}>
              {editingStockId ? <><i className="fas fa-edit"></i> Edit Usage (Edit Usage)</> : <><i className="fas fa-plus-circle"></i> Add Today's Usage (ఈరోజు వాడినవి)</>}
            </h3>
            
            <form onSubmit={handleStockSubmit}>
              <div className="form-row">
                <div className="input-group">
                  <label>Date (తేది) *</label>
                  <input type="date" value={stockFormData.date} onChange={(e) => setStockFormData({...stockFormData, date: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Used (వాడినవి) *</label>
                  <input type="number" min="0" value={stockFormData.used} onChange={(e) => setStockFormData({...stockFormData, used: e.target.value})} required style={{borderColor: '#f44336', fontWeight: 'bold', color: '#c62828'}} />
                </div>
              </div>
              
              {editingStockId && stockFormData.supply > 0 && (
                <div className="form-row">
                  <div className="input-group">
                    <label>Supply (సప్లై - ఆఫీస్ నుండి వచ్చినవి)</label>
                    <input type="number" value={stockFormData.supply} disabled style={{background: '#eee', color: '#2e7d32', fontWeight: 'bold'}} title="Only Admin can edit Supply" />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label>Remarks (వివరాలు)</label>
                <input type="text" value={stockFormData.remarks} onChange={(e) => setStockFormData({...stockFormData, remarks: e.target.value})} placeholder="Any notes..." />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="submit-report-btn" style={{background: editingStockId ? '#0288d1' : '#2e7d32', flex: 1}} disabled={loading}>
                  {loading ? 'Saving...' : (editingStockId ? 'Update Record' : 'Save Usage')}
                </button>
                {editingStockId && (
                  <button type="button" onClick={() => { setEditingStockId(null); setStockFormData({ date: new Date().toISOString().split('T')[0], used: '', remarks: '', supply: 0 }); }} className="icon-btn delete-btn" style={{ padding: '0 20px', borderRadius: '5px' }}>Cancel</button>
                )}
              </div>
            </form>

            <div style={{ marginTop: '40px' }}>
              <h3 style={{ marginBottom: '15px' }}><i className="fas fa-list"></i> Stock Ledger (స్టాక్ వివరాలు)</h3>
              <div className="table-responsive">
                <table className="admin-data-table accounts-table">
                  <thead>
                    <tr>
                      <th style={{width: '50px'}}>S.No</th>
                      <th style={{width: '100px'}}>Date</th>
                      <th>Old Bal</th>
                      <th style={{color: '#2e7d32'}}>Supply (+)</th>
                      <th>Total</th>
                      <th style={{color: '#c62828'}}>Used (-)</th>
                      <th style={{color: '#1565c0'}}>Close Bal</th>
                      <th>Remarks</th>
                      <th style={{width: '90px', textAlign: 'center'}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocksWithBalance.length > 0 ? (
                      stocksWithBalance.map((stock, idx) => (
                        <tr key={stock._id}>
                          <td style={{fontWeight: 'bold', textAlign: 'center'}}>{stocksWithBalance.length - idx}</td>
                          <td>{stock.date}</td>
                          <td style={{color: '#888'}}>{stock.oldBalance}</td>
                          <td style={{fontWeight: 'bold', color: '#2e7d32'}}>{stock.supply || '-'}</td>
                          <td style={{fontWeight: 'bold'}}>{stock.total}</td>
                          <td style={{fontWeight: 'bold', color: '#c62828'}}>{stock.used || '-'}</td>
                          <td style={{fontWeight: 'bold', color: '#1565c0', background: '#e3f2fd'}}>{stock.closingBalance}</td>
                          <td>{stock.remarks}</td>
                          <td style={{textAlign: 'center'}}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => handleEditStock(stock)} className="icon-btn edit-btn" style={{color: '#0288d1', background:'none', border:'none', cursor:'pointer'}}><i className="fas fa-edit"></i></button>
                              <button onClick={() => handleDeleteStock(stock._id)} className="icon-btn delete-btn" style={{color: '#d32f2f', background:'none', border:'none', cursor:'pointer'}}><i className="fas fa-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="9" style={{textAlign: 'center', padding: '20px', color: '#888'}}>No stock records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-reports' && (
          <div className="data-card fade-in">
            <h3><i className="fas fa-history"></i> My Reports History</h3>
            {myReports.length === 0 ? <p>No reports submitted yet.</p>  : (
              <>
                <div className="table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr><th>Date</th><th>Present</th><th>Chikkis</th><th>Notes</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {currentReportsList.map(r => (
                        <tr key={r._id}>
                          <td>{r.date}</td><td>{r.studentsPresent}</td><td>{r.chikkisDistributed}</td><td>{r.notes || '-'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button onClick={() => editReport(r)} className="icon-btn edit-btn"><i className="fas fa-edit"></i></button>
                              <button onClick={() => deleteReport(r._id)} className="icon-btn delete-btn"><i className="fas fa-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalReportPages > 1 && (
                  <div className="pagination">
                    {[...Array(totalReportPages)].map((_, i) => (
                      <button key={i} className={`page-btn ${currentReportPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentReportPage(i + 1)}>{i + 1}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="students-manager-card fade-in">
            <div className="add-student-section">
              <h3 style={{color: editingStudentId ? '#0288d1' : '#1b5e20'}}>
                {editingStudentId ? "Edit Student" : "Add New Student"}
              </h3>
              
              <form onSubmit={handleAddOrUpdateStudent} className="add-student-form">
                <div className="form-row">
                  <input type="text" placeholder="Full Name *" value={studentForm.name} onChange={(e) => setStudentForm({...studentForm, name: e.target.value})} required />
                  <input type="text" placeholder="Education/Class (Ex: Degree) *" value={studentForm.className} onChange={(e) => setStudentForm({...studentForm, className: e.target.value})} required />
                </div>

                {isComputerTeacher ? (
                  <div className="form-row" style={{marginTop:'10px'}}>
                    <input type="text" placeholder="Batch No (Ex: Batch 1) *" value={studentForm.batchNumber} onChange={(e) => setStudentForm({...studentForm, batchNumber: e.target.value})} required />
                    <select value={studentForm.gender} onChange={(e) => setStudentForm({...studentForm, gender: e.target.value})} required>
                      <option value="Boy">Boy</option><option value="Girl">Girl</option><option value="Not Specified">Not Specified</option>
                    </select>
                  </div>
                ) : (
                  <div className="form-row" style={{marginTop:'10px'}}>
                    <select value={studentForm.gender} onChange={(e) => setStudentForm({...studentForm, gender: e.target.value})} required>
                      <option value="Boy">Boy</option><option value="Girl">Girl</option>
                    </select>
                    <select value={studentForm.academicYear} onChange={(e) => setStudentForm({...studentForm, academicYear: e.target.value})} required>
                      {academicYearsList.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                )}

                <div className="form-row" style={{marginTop:'10px'}}>
                  <input type="text" placeholder="Phone (10 digits) *" value={studentForm.phone} onChange={handlePhoneChange} required />
                  <button type="submit" className="add-btn" style={{background: editingStudentId ? '#0288d1' : '#1b5e20'}} disabled={loading}>
                    {editingStudentId ? "Update" : "Add"}
                  </button>
                  {editingStudentId && (
                    <button type="button" onClick={() => {setEditingStudentId(null); setStudentForm({name:'', className:'', phone:'', gender:'Boy', academicYear:'2024-2025', batchNumber: ''})}} className="cancel-edit-btn">Cancel</button>
                  )}
                </div>
              </form>
            </div>

            <div className="students-list-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3><i className="fas fa-list-ol"></i> My Students</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontWeight: 'bold', color: '#1b5e20' }}>
                    <i className="fas fa-filter"></i> Filter by {isComputerTeacher ? 'Batch' : 'Year'}:
                  </label>
                  <select 
                    value={selectedStudentFilter} 
                    onChange={(e) => setSelectedStudentFilter(e.target.value)}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }}
                  >
                    <option value="All">All {isComputerTeacher ? 'Batches' : 'Years'}</option>
                    {availableFilterOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {Object.keys(groupedStudents).length === 0 ? <div className="empty-msg">No students added yet.</div> : (
                Object.keys(groupedStudents).sort().reverse().map(groupName => {
                  const sortedGroupStudents = sortStudentsByClass([...groupedStudents[groupName]]);
                  const currentPage = currentStudentPages[groupName] || 1;
                  const currentStudentsList = sortedGroupStudents.slice((currentPage - 1) * 10, currentPage * 10);
                  const totalStudentPages = Math.ceil(sortedGroupStudents.length / 10);

                  return (
                    <div key={groupName} className="academic-year-group" style={{marginBottom: '30px'}}>
                      <h4 style={{backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '5px', color: '#1b5e20'}}>
                        <i className={isComputerTeacher ? "fas fa-users" : "fas fa-calendar-alt"}></i> 
                        {isComputerTeacher ? ` Batch: ${groupName}` : ` Academic Year: ${groupName}`} ({groupedStudents[groupName].length} Students)
                      </h4>
                      <div className="table-responsive">
                        <table className="students-table">
                          <thead>
                            <tr><th>S.No</th><th>Name</th><th>Gender</th><th>Education</th><th>Phone</th><th>Action</th></tr>
                          </thead>
                          <tbody>
                            {currentStudentsList.map((student, index) => (
                              <tr key={student._id}>
                                <td>{(currentPage - 1) * 10 + index + 1}</td>
                                <td style={{ fontWeight: 'bold', color: '#1b5e20' }}>{student.name}</td>
                                <td>{student.gender}</td><td>{student.className}</td>
                                <td><i className="fas fa-phone-alt" style={{color: '#d32f2f', fontSize:'0.8rem'}}></i> {student.phone}</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => editStudent(student)} className="icon-btn edit-btn" style={{color: '#0288d1', background:'none', border:'none', cursor:'pointer'}}><i className="fas fa-edit"></i></button>
                                    <button onClick={() => handleDeleteStudent(student._id)} className="icon-btn delete-btn" style={{color: '#d32f2f', background:'none', border:'none', cursor:'pointer'}}><i className="fas fa-trash"></i></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {totalStudentPages > 1 && (
                        <div className="pagination">
                          {[...Array(totalStudentPages)].map((_, i) => (
                            <button key={i} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentStudentPages({...currentStudentPages, [groupName]: i + 1})}>{i + 1}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'skill-dev' && isComputerTeacher && (
          <div className="data-card fade-in" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
            <SkillDevManager forceCategory="skill-development" />
          </div>
        )}

        {activeTab === 'applications' && isComputerTeacher && (
          <div className="data-card fade-in" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
            <ApplicationsManager />
          </div>
        )}

      </div>
    </div>
  );
};

export default StaffDashboard;