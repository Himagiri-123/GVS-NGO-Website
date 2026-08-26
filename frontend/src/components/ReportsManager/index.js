import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2'; 
import './index.css';
import API_URL from '../../config/api';

const ReportsManager = () => {
  const [activeTab, setActiveTab] = useState('reports'); 
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]); 
  
  // Computer Batches
  const [computerBatches, setComputerBatches] = useState([]);
  const [skillInitiativeData, setSkillInitiativeData] = useState(null); 
  const [loading, setLoading] = useState(true);
  
  // Villages Chikki Stocks State
  const [chikkiStocks, setChikkiStocks] = useState([]);
  
  // Main Office Stock State
  const [mainOfficeStocks, setMainOfficeStocks] = useState([]);

  // Filters
  const [selectedVillage, setSelectedVillage] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Advanced Filters
  const [studentType, setStudentType] = useState('VVK');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  // Villages Chikki Stock Filters
  const [stockFilterVillage, setStockFilterVillage] = useState('All');
  const [stockFilterMandal, setStockFilterMandal] = useState('All');
  const [stockFilterDate, setStockFilterDate] = useState('');
  const [stockFilterOnlySupply, setStockFilterOnlySupply] = useState(false);

  // Main Office Stock Filters
  const [mainStockFilterVillage, setMainStockFilterVillage] = useState('All');
  const [mainStockFilterMandal, setMainStockFilterMandal] = useState('All');
  const [mainStockFilterDate, setMainStockFilterDate] = useState('');

  const [editingReportId, setEditingReportId] = useState(null);
  const [editFormData, setEditFormData] = useState({ village: '', studentsPresent: '', chikkisDistributed: '' });

  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editStudentData, setEditStudentData] = useState({ name: '', gender: '', className: '', village: '', phone: '', batchNumber: '', academicYear: '' });

  // Unified form state (handles both office stock and village supply)
  const [entryType, setEntryType] = useState('receive'); // 'receive' or 'send'
  const [unifiedForm, setUnifiedForm] = useState({
    date: new Date().toISOString().split('T')[0],
    particulars: '', // used for donor name
    mandal: '',
    village: '',
    quantity: '',
    remarks: ''
  });

  // Edit States for Tables
  const [editingStockId, setEditingStockId] = useState(null);
  const [editingMainStockId, setEditingMainStockId] = useState(null);

  const [currentReportPage, setCurrentReportPage] = useState(1);
  const [currentStudentPages, setCurrentStudentPages] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const headers = { Authorization: `Bearer ${userInfo?.token}` };
      const [reportsRes, studentsRes, staffRes, skillRes, stockRes, mainStockRes] = await Promise.all([
        fetch(`${API_URL}/api/reports`, { headers }),
        fetch(`${API_URL}/api/students`, { headers }),
        fetch(`${API_URL}/api/staff`, { headers }),
        fetch(`${API_URL}/api/initiatives/skill-development`),
        fetch(`${API_URL}/api/chikki-stock`, { headers }).catch(e => ({ok: false})),
        fetch(`${API_URL}/api/main-office-stock`, { headers }).catch(e => ({ok: false}))
      ]);
      
      setReports(await reportsRes.json());
      setStudents(await studentsRes.json());
      setStaffList(await staffRes.json());
      
      const skillData = await skillRes.json();
      setSkillInitiativeData(skillData);
      setComputerBatches(skillData.tableRows || []);

      if (stockRes && stockRes.ok) {
        setChikkiStocks(await stockRes.json());
      }
      
      if (mainStockRes && mainStockRes.ok) {
        setMainOfficeStocks(await mainStockRes.json());
      }
      
    } catch (error) { 
      console.error("Error:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  useEffect(() => {
    setCurrentReportPage(1);
    setCurrentStudentPages({});
  }, [selectedVillage, activeTab, studentType, selectedBatch, selectedYear]);

  // --- REPORT LOGIC ---
  const allVillages = [...new Set([...reports.map(r => r.village), ...students.map(s => s.village)])].filter(Boolean);
  const filteredReports = selectedVillage === 'All' ? reports : reports.filter(r => r.village === selectedVillage);
  
  // --- STUDENTS LOGIC ---
  let filteredStudents = students.filter(s => {
    if (studentType === 'Computer') return s.category === 'Computer';
    return s.category !== 'Computer'; 
  });

  if (selectedVillage !== 'All') {
    filteredStudents = filteredStudents.filter(s => s.village === selectedVillage);
  }

  if (studentType === 'Computer' && selectedBatch !== 'All') {
    filteredStudents = filteredStudents.filter(s => s.batchNumber === selectedBatch);
  }

  if (studentType === 'VVK' && selectedYear !== 'All') {
    filteredStudents = filteredStudents.filter(s => s.academicYear === selectedYear);
  }

  const availableBatches = [...new Set(students.filter(s => s.category === 'Computer').map(s => s.batchNumber))].filter(Boolean);
  const availableYears = [...new Set(students.filter(s => s.category !== 'Computer').map(s => s.academicYear))].filter(Boolean);

  const groupedAdminStudents = filteredStudents.reduce((acc, student) => {
    const key = studentType === 'Computer' ? (student.batchNumber || 'Unassigned Batch') : (student.academicYear || '2024-2025'); 
    if (!acc[key]) acc[key] = [];
    acc[key].push(student);
    return acc;
  }, {});

  // --- EDIT REPORT LOGIC ---
  const handleEditClick = (report) => {
    setEditingReportId(report._id);
    setEditFormData({ village: report.village, studentsPresent: report.studentsPresent, chikkisDistributed: report.chikkisDistributed });
  };
  const handleUpdateReport = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await fetch(`${API_URL}/api/reports/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo?.token}` },
        body: JSON.stringify({ village: editFormData.village, studentsPresent: Number(editFormData.studentsPresent), chikkisDistributed: Number(editFormData.chikkisDistributed) })
      });
      setEditingReportId(null); fetchData(); 
    } catch (err) { Swal.fire('Error', 'Failed to update report.', 'error'); }
  };
  const handleDeleteReport = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        await fetch(`${API_URL}/api/reports/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${userInfo?.token}` } });
        fetchData(); Swal.fire('Deleted!', 'Report has been deleted.', 'success'); 
      } catch (err) { Swal.fire('Error', 'Failed to delete report.', 'error'); }
    }
  };

  // --- EDIT STUDENT LOGIC ---
  const handleEditStudentClick = (student) => {
    setEditingStudentId(student._id);
    setEditStudentData({
      name: student.name, gender: student.gender || 'Boy', className: student.className, 
      village: student.village, phone: student.phone, batchNumber: student.batchNumber || '', academicYear: student.academicYear || ''
    });
  };
  const handleUpdateStudent = async (id) => {
    if(editStudentData.phone.length !== 10) return Swal.fire('Invalid Phone', 'Phone number must be exactly 10 digits!', 'error');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await fetch(`${API_URL}/api/students/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo?.token}` },
        body: JSON.stringify(editStudentData)
      });
      setEditingStudentId(null); fetchData(); Swal.fire('Saved!', 'Student details updated successfully.', 'success');
    } catch (err) { Swal.fire('Error', 'Failed to update student.', 'error'); }
  };
  const handleDeleteStudent = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, remove it!' });
    if (result.isConfirmed) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        await fetch(`${API_URL}/api/students/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${userInfo?.token}` } });
        fetchData(); Swal.fire('Removed!', 'Student has been removed.', 'success');
      } catch (err) { Swal.fire('Error', 'Failed to delete student.', 'error'); }
    }
  };

  // --- COMPUTER BATCH EDIT LOGIC ---
  const updateBatchRow = (rIndex, colKey, val) => {
    const newRows = [...computerBatches];
    newRows[rIndex] = { ...newRows[rIndex], [colKey]: val };
    setComputerBatches(newRows);
  };
  const addBatchRow = () => { 
    setComputerBatches([{ status: 'active', col1: '', col2: '', col3: '', col4: '', col5: '', col6: '' }, ...computerBatches]); 
  };
  const deleteBatchRow = (rIndex) => { 
    const result = window.confirm("Are you sure you want to delete this batch row?");
    if(result) {
       setComputerBatches(computerBatches.filter((_, i) => i !== rIndex)); 
    }
  };
  const saveBatchesToDatabase = async () => {
    if (!skillInitiativeData) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const updatedData = { ...skillInitiativeData, tableRows: computerBatches };
      const response = await fetch(`${API_URL}/api/initiatives`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error('Update failed');
      setSkillInitiativeData(updatedData); 
      Swal.fire('Success!', 'Batches saved successfully!', 'success');
    } catch (err) { Swal.fire('Error!', err.message, 'error'); }
  };

  // Unified stock submit logic (one form handles both office and village entries)
  const handleUnifiedSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (entryType === 'receive') {
        // 1. New stock coming into the office (Inward)
        if(!unifiedForm.particulars || !unifiedForm.quantity) return Swal.fire('Error', 'Please enter the details and stock quantity', 'error');
        
        const submitData = {
          date: unifiedForm.date,
          mandal: 'GVS Head Office', 
          village: unifiedForm.particulars, // donor name gets stored here
          inward: Number(unifiedForm.quantity) || 0,
          outward: 0,
          remarks: unifiedForm.remarks
        };
        await fetch(`${API_URL}/api/main-office-stock`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(submitData)
        });

      } else {
        // 2. Supply sent to a village (Outward + Village Supply)
        if(!unifiedForm.mandal || !unifiedForm.village || !unifiedForm.quantity) return Swal.fire('Error', 'Please select the mandal and village', 'error');

        // A. Subtract from office stock (Outward)
        const mainOfficeData = {
          date: unifiedForm.date,
          mandal: unifiedForm.mandal,
          village: unifiedForm.village,
          inward: 0,
          outward: Number(unifiedForm.quantity) || 0,
          remarks: unifiedForm.remarks
        };
        await fetch(`${API_URL}/api/main-office-stock`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mainOfficeData)
        });

        // B. Automatically add to that village's stock (Supply)
        const villageStockData = {
          date: unifiedForm.date,
          mandal: unifiedForm.mandal,
          village: unifiedForm.village,
          supply: Number(unifiedForm.quantity) || 0,
          used: 0,
          remarks: 'Received from GVS Office',
          addedBy: 'Admin'
        };
        await fetch(`${API_URL}/api/chikki-stock`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(villageStockData)
        });
      }

      Swal.fire('Saved!', 'Stock details updated successfully.', 'success');
      setUnifiedForm({ date: new Date().toISOString().split('T')[0], particulars: '', mandal: '', village: '', quantity: '', remarks: '' });
      fetchData(); // refresh both tables
    } catch (err) {
      Swal.fire('Error', 'Failed to connect. Check Server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- MAIN OFFICE STOCK CALCULATIONS ---
  const mainStocksWithBalance = useMemo(() => {
    const sorted = [...mainOfficeStocks].sort((a, b) => new Date(a.date) - new Date(b.date)); 
    let currentBalance = 0;
    const calculated = sorted.map(stock => {
      const oldBalance = currentBalance;
      const total = oldBalance + (Number(stock.inward) || 0);
      const closingBalance = total - (Number(stock.outward) || 0);
      currentBalance = closingBalance; 
      return { ...stock, oldBalance, total, closingBalance };
    });
    return calculated.reverse(); 
  }, [mainOfficeStocks]);

  const allMainStockMandals = [...new Set(mainOfficeStocks.map(s => s.mandal))].filter(Boolean);
  const allMainStockVillages = [...new Set(mainOfficeStocks.map(s => s.village))].filter(Boolean);

  const filteredMainOfficeStocks = mainStocksWithBalance.filter(s => {
    if (mainStockFilterVillage !== 'All' && s.village !== mainStockFilterVillage) return false;
    if (mainStockFilterMandal !== 'All' && s.mandal !== mainStockFilterMandal) return false;
    if (mainStockFilterDate !== '' && s.date !== mainStockFilterDate) return false;
    return true;
  });

  const handleDeleteMainStock = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, Delete!' });
    if (result.isConfirmed) {
      try {
        await fetch(`${API_URL}/api/main-office-stock/${id}`, { method: 'DELETE' });
        fetchData(); Swal.fire('Deleted!', 'Record removed.', 'success');
      } catch (err) { Swal.fire('Error', 'Delete failed', 'error'); }
    }
  };

  // --- VILLAGES CHIKKI STOCK CALCULATIONS ---
  const stocksWithBalance = useMemo(() => {
    const sorted = [...chikkiStocks].sort((a, b) => new Date(a.date) - new Date(b.date)); 
    const villageBalances = {};
    const calculated = sorted.map(stock => {
      const v = stock.village;
      if (villageBalances[v] === undefined) villageBalances[v] = 0;
      const oldBalance = villageBalances[v];
      const total = oldBalance + (Number(stock.supply) || 0);
      const closingBalance = total - (Number(stock.used) || 0);
      villageBalances[v] = closingBalance; 
      return { ...stock, oldBalance, total, closingBalance };
    });
    return calculated.reverse(); 
  }, [chikkiStocks]);

  const allStockMandals = [...new Set(chikkiStocks.map(s => s.mandal))].filter(Boolean);
  const allStockVillages = [...new Set(chikkiStocks.map(s => s.village))].filter(Boolean);

  const filteredChikkiStocks = stocksWithBalance.filter(s => {
    if (stockFilterVillage !== 'All' && s.village !== stockFilterVillage) return false;
    if (stockFilterMandal !== 'All' && s.mandal !== stockFilterMandal) return false;
    if (stockFilterDate !== '' && s.date !== stockFilterDate) return false;
    if (stockFilterOnlySupply && (!s.supply || s.supply <= 0)) return false;
    return true;
  });

  const handleDeleteStock = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, Delete!' });
    if (result.isConfirmed) {
      try {
        await fetch(`${API_URL}/api/chikki-stock/${id}`, { method: 'DELETE' });
        fetchData(); Swal.fire('Deleted!', 'Record removed.', 'success');
      } catch (err) { Swal.fire('Error', 'Delete failed', 'error'); }
    }
  };

  const processMonthlyData = () => {
    const monthReports = reports.filter(r => r.date.startsWith(selectedMonth));
    const uniqueDays = [...new Set(monthReports.map(r => parseInt(r.date.split('-')[2])))].sort((a,b) => a - b);
    const villageToMandal = {};
    staffList.forEach(s => { 
      if(s.village) villageToMandal[s.village] = s.mandal ? s.mandal.toUpperCase() : 'OTHER MANDALS'; 
    });
    const mandalGroups = {};
    monthReports.forEach(r => {
        const day = parseInt(r.date.split('-')[2]);
        const mandal = villageToMandal[r.village] || 'OTHER MANDALS';
        if(!mandalGroups[mandal]) mandalGroups[mandal] = {};
        if(!mandalGroups[mandal][r.village]) mandalGroups[mandal][r.village] = { total: 0 };
        mandalGroups[mandal][r.village][day] = (mandalGroups[mandal][r.village][day] || 0) + r.chikkisDistributed;
        mandalGroups[mandal][r.village].total += r.chikkisDistributed;
    });
    return { uniqueDays, mandalGroups };
  };

  const { uniqueDays, mandalGroups } = processMonthlyData();
  const yearStr = selectedMonth.split('-')[0];
  const monthStr = selectedMonth.split('-')[1];

  const sortedAdminReports = [...filteredReports].sort((a, b) => b.date.localeCompare(a.date));
  const currentAdminReportsList = sortedAdminReports.slice((currentReportPage - 1) * 10, currentReportPage * 10);
  const totalAdminReportPages = Math.ceil(sortedAdminReports.length / 10);

  const sortStudentsByClass = (studentsArray) => {
    return studentsArray.sort((a, b) => {
      const numA = parseInt(a.className?.match(/\d+/)) || 99;
      const numB = parseInt(b.className?.match(/\d+/)) || 99;
      return numA - numB;
    });
  };

  return (
    <div className="reports-manager-container">
      <div className="manager-header">
        <h2><i className="fas fa-chart-pie"></i> Activity & Reports</h2>
      </div>
      
      <div className="admin-tabs" style={{ flexWrap: 'wrap' }}>
        <button className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          <i className="fas fa-clipboard-check"></i> Daily Reports
        </button>
        <button className={`admin-tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
          <i className="fas fa-users"></i> All Students
        </button>
        <button className={`admin-tab-btn ${activeTab === 'chikkis' ? 'active' : ''}`} onClick={() => setActiveTab('chikkis')}>
          <i className="fas fa-box-open"></i> Monthly Chikkis
        </button>
        <button className={`admin-tab-btn ${activeTab === 'computer-batch' ? 'active' : ''}`} onClick={() => setActiveTab('computer-batch')}>
          <i className="fas fa-laptop-code"></i> Computer Batch
        </button>
        <button className={`admin-tab-btn ${activeTab === 'chikki-stock' ? 'active' : ''}`} onClick={() => setActiveTab('chikki-stock')}>
          <i className="fas fa-boxes"></i> Chikki Stock Ledger
        </button>
      </div>

      {activeTab === 'reports' && (
        <div className="filter-section">
          <label><i className="fas fa-filter"></i> Filter by Village: </label>
          <select value={selectedVillage} onChange={(e) => setSelectedVillage(e.target.value)} className="village-select">
            <option value="All">All Centers</option>
            {allVillages.map((v, i) => <option key={i} value={v}>{v}</option>)}
          </select>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="filter-section" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div>
            <label style={{fontWeight: 'bold', color: '#1b5e20'}}><i className="fas fa-layer-group"></i> Center Type: </label>
            <select value={studentType} onChange={(e) => {setStudentType(e.target.value); setSelectedVillage('All'); setSelectedBatch('All'); setSelectedYear('All');}} className="village-select" style={{marginLeft: '5px'}}>
              <option value="VVK">VVK Study Centers</option>
              <option value="Computer">Computer Skill Centers</option>
            </select>
          </div>

          <div>
            <label><i className="fas fa-map-marker-alt"></i> Village: </label>
            <select value={selectedVillage} onChange={(e) => setSelectedVillage(e.target.value)} className="village-select" style={{marginLeft: '5px'}}>
              <option value="All">All Centers</option>
              {allVillages.map((v, i) => <option key={i} value={v}>{v}</option>)}
            </select>
          </div>

          {studentType === 'Computer' ? (
            <div>
              <label><i className="fas fa-users"></i> Batch: </label>
              <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="village-select" style={{marginLeft: '5px'}}>
                <option value="All">All Batches</option>
                {availableBatches.map((b, i) => <option key={i} value={b}>{b}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label><i className="fas fa-calendar-alt"></i> Year: </label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="village-select" style={{marginLeft: '5px'}}>
                <option value="All">All Years</option>
                {availableYears.map((y, i) => <option key={i} value={y}>{y}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
        </div>
      ) : (
        <div className="tab-content-area">
          
          {activeTab === 'reports' && (
            <div className="data-card fade-in">
              <h3>Daily Reports</h3>
              <div className="table-responsive">
                <table className="admin-data-table">
                  <thead>
                    <tr><th>Date</th><th>Village</th><th>Present</th><th>Chikkis</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {currentAdminReportsList.map((report) => (
                      <tr key={report._id}>
                        <td>{report.date}</td>
                        <td>{editingReportId === report._id ? <input type="text" value={editFormData.village} onChange={e => setEditFormData({...editFormData, village: e.target.value})} className="edit-input" /> : report.village}</td>
                        <td>{editingReportId === report._id ? <input type="number" value={editFormData.studentsPresent} onChange={e => setEditFormData({...editFormData, studentsPresent: e.target.value})} className="edit-input" style={{width:'60px'}} /> : report.studentsPresent}</td>
                        <td>{editingReportId === report._id ? <input type="number" value={editFormData.chikkisDistributed} onChange={e => setEditFormData({...editFormData, chikkisDistributed: e.target.value})} className="edit-input" style={{width:'60px'}} /> : report.chikkisDistributed}</td>
                        <td>
                          {editingReportId === report._id ? (
                            <button onClick={() => handleUpdateReport(report._id)} className="save-btn"><i className="fas fa-save"></i> Save</button>
                          ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button onClick={() => handleEditClick(report)} className="icon-btn edit-btn"><i className="fas fa-edit"></i></button>
                              <button onClick={() => handleDeleteReport(report._id)} className="icon-btn delete-btn"><i className="fas fa-trash"></i></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalAdminReportPages > 1 && (
                <div className="pagination">
                  {[...Array(totalAdminReportPages)].map((_, i) => (
                    <button key={i} className={`page-btn ${currentReportPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentReportPage(i + 1)}>{i + 1}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="data-card fade-in">
              <h3 style={{color: studentType === 'Computer' ? '#d94f00' : '#1b5e20'}}>
                <i className={studentType === 'Computer' ? "fas fa-laptop-code" : "fas fa-book-reader"}></i> {studentType === 'Computer' ? 'Computer Skill Students' : 'VVK Students'}
              </h3>
              {Object.keys(groupedAdminStudents).length === 0 ? <div className="empty-msg" style={{textAlign: 'center', padding: '20px'}}>No students found matching your filters.</div> : (
                Object.keys(groupedAdminStudents).sort().reverse().map(groupKey => {
                  const sortedYearStudents = sortStudentsByClass([...groupedAdminStudents[groupKey]]);
                  const currentPage = currentStudentPages[groupKey] || 1;
                  const currentStudentsList = sortedYearStudents.slice((currentPage - 1) * 10, currentPage * 10);
                  const totalStudentPages = Math.ceil(sortedYearStudents.length / 10);

                  return (
                    <div key={groupKey} className="academic-year-group" style={{marginBottom: '30px'}}>
                      <h4 style={{backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '5px', color: '#1b5e20', borderLeft: '4px solid #1b5e20'}}>
                        <i className={studentType === 'Computer' ? "fas fa-users" : "fas fa-calendar-alt"}></i> 
                        {studentType === 'Computer' ? ` Batch: ${groupKey}` : ` Academic Year: ${groupKey}`} 
                        <span style={{fontSize: '0.9rem', color: '#555', float: 'right'}}>Total: {groupedAdminStudents[groupKey].length}</span>
                      </h4>
                      <div className="table-responsive">
                        <table className="admin-data-table">
                          <thead>
                            <tr><th>S.No</th><th>Name</th><th>Gender</th><th>Class</th><th>Center</th><th>Phone</th><th>Action</th></tr>
                          </thead>
                          <tbody>
                            {currentStudentsList.map((s, idx) => (
                              <tr key={s._id}>
                                <td>{(currentPage - 1) * 10 + idx + 1}</td>
                                {editingStudentId === s._id ? (
                                  <>
                                    <td><input type="text" value={editStudentData.name} onChange={e => setEditStudentData({...editStudentData, name: e.target.value})} className="edit-input" style={{width:'130px'}} /></td>
                                    <td>
                                      <select value={editStudentData.gender} onChange={e => setEditStudentData({...editStudentData, gender: e.target.value})} className="edit-input" style={{width:'75px'}}>
                                        <option value="Boy">Boy</option><option value="Girl">Girl</option><option value="Not Specified">Not Specified</option>
                                      </select>
                                    </td>
                                    <td><input type="text" value={editStudentData.className} onChange={e => setEditStudentData({...editStudentData, className: e.target.value})} className="edit-input" style={{width:'75px'}} /></td>
                                    <td>
                                      <input type="text" value={editStudentData.village} onChange={e => setEditStudentData({...editStudentData, village: e.target.value})} className="edit-input" style={{width:'100px'}} />
                                      {studentType === 'Computer' && (
                                        <input type="text" placeholder="Batch No" value={editStudentData.batchNumber} onChange={e => setEditStudentData({...editStudentData, batchNumber: e.target.value})} className="edit-input" style={{width:'80px', display:'block', marginTop:'5px'}} />
                                      )}
                                    </td>
                                    <td><input type="text" maxLength="10" value={editStudentData.phone} onChange={e => setEditStudentData({...editStudentData, phone: e.target.value.replace(/\D/g, '').slice(0,10)})} className="edit-input" style={{width:'100px'}} /></td>
                                    <td>
                                      <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleUpdateStudent(s._id)} className="save-btn"><i className="fas fa-save"></i> Save</button>
                                        <button onClick={() => setEditingStudentId(null)} className="icon-btn" style={{color:'#d32f2f'}} title="Cancel"><i className="fas fa-times"></i></button>
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td style={{ fontWeight: 'bold', color: '#1b5e20' }}>{s.name}</td>
                                    <td>{s.gender || 'Boy'}</td><td>{s.className}</td>
                                    <td><span className="village-badge">{s.village}</span></td>
                                    <td><i className="fas fa-phone-alt" style={{fontSize: '0.8rem', color: '#666'}}></i> {s.phone}</td>
                                    <td>
                                      <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleEditStudentClick(s)} className="icon-btn edit-btn"><i className="fas fa-edit"></i></button>
                                        <button onClick={() => handleDeleteStudent(s._id)} className="icon-btn delete-btn"><i className="fas fa-trash"></i></button>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {totalStudentPages > 1 && (
                        <div className="pagination">
                          {[...Array(totalStudentPages)].map((_, i) => (
                            <button key={i} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentStudentPages({...currentStudentPages, [groupKey]: i + 1})}>{i + 1}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'chikkis' && (
             <div className="data-card fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div className="month-picker">
                  <label><i className="far fa-calendar-alt"></i> Select Month: </label>
                  <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                </div>
                <button className="save-btn" onClick={() => window.print()}><i className="fas fa-print"></i> Print Report</button>
              </div>
              
              {Object.keys(mandalGroups).length === 0 ? <div className="empty-state">No chikkis distributed in this month.</div> : (
                Object.keys(mandalGroups).map((mandal) => {
                  const villages = mandalGroups[mandal];
                  let mandalGrandTotal = 0;
                  
                  return (
                    <div key={mandal} className="mandal-report-section">
                      <div className="report-book-header">
                        <h4>VIDYARTHI VIKASA KENDRAM - NUTRITION FOOD INFORMATION</h4>
                        <div className="report-book-subhead">
                          <span><strong>YEAR:</strong> {yearStr}</span>
                          <span><strong>MONTH:</strong> {monthStr}</span>
                          <span><strong>MANDAL:</strong> {mandal}</span>
                        </div>
                      </div>
                      <div className="table-responsive">
                        <table className="book-style-table">
                          <thead>
                            <tr>
                              <th rowSpan="2" style={{width: '50px'}}>S.NO</th>
                              <th rowSpan="2" style={{minWidth: '150px'}}>VILLAGE</th>
                              <th colSpan={uniqueDays.length || 1} style={{textAlign: 'center', letterSpacing: '2px'}}>DATES</th>
                              <th rowSpan="2" style={{width: '80px'}}>TOTAL</th>
                            </tr>
                            <tr>
                              {uniqueDays.length > 0 ? uniqueDays.map(day => <th key={day} className="day-col">{day}</th>) : <th>-</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(villages).map((village, idx) => {
                              mandalGrandTotal += villages[village].total;
                              return (
                                <tr key={village}>
                                  <td style={{textAlign: 'center'}}>{idx + 1}</td>
                                  <td style={{fontWeight: 'bold', color: '#333'}}>{village}</td>
                                  {uniqueDays.length > 0 ? uniqueDays.map(day => <td key={day} className="day-val">{villages[village][day] || '-'}</td>) : <td>-</td>}
                                  <td className="row-total">{villages[village].total}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr>
                              <th colSpan="2" style={{textAlign: 'center'}}>TOTAL</th>
                              {uniqueDays.length > 0 ? uniqueDays.map(day => { 
                                const dayTotal = Object.keys(villages).reduce((sum, v) => sum + (villages[v][day] || 0), 0); 
                                return <th key={day} className="day-val">{dayTotal || '-'}</th>; 
                              }) : <th>-</th>}
                              <th className="row-total">{mandalGrandTotal}</th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'computer-batch' && (
            <div className="data-card fade-in">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ color: '#1b5e20', margin: 0, marginRight: '15px' }}>Batch Details Data</h3>
                <button type="button" onClick={addBatchRow} style={{ background: '#e8f5e9', color: '#1b5e20', border: '2px dashed #81c784', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  <i className="fas fa-plus"></i> Add New Row
                </button>
              </div>

              <div className="table-responsive">
                <table className="admin-data-table" style={{ minWidth: '800px' }}>
                  <thead>
                    <tr style={{ background: '#e8f5e9' }}>
                      <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                      <th>Batch No.</th>
                      <th>Starting Date</th>
                      <th>Ending Date</th>
                      <th>Days</th>
                      <th>Students</th>
                      <th>Villages</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computerBatches.length > 0 ? (
                      computerBatches.map((batch, idx) => (
                        <tr key={idx} style={{ opacity: batch.status === 'inactive' ? 0.6 : 1, backgroundColor: batch.status === 'inactive' ? '#f5f5f5' : 'transparent' }}>
                          <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{idx + 1}</td>
                          <td><input type="text" value={batch.col1 || ''} onChange={(e) => updateBatchRow(idx, 'col1', e.target.value)} className="edit-input" style={{width: '100%', padding: '6px'}} disabled={batch.status === 'inactive'} /></td>
                          <td><input type="text" value={batch.col2 || ''} onChange={(e) => updateBatchRow(idx, 'col2', e.target.value)} className="edit-input" style={{width: '100%', padding: '6px'}} disabled={batch.status === 'inactive'} /></td>
                          <td><input type="text" value={batch.col3 || ''} onChange={(e) => updateBatchRow(idx, 'col3', e.target.value)} className="edit-input" style={{width: '100%', padding: '6px'}} disabled={batch.status === 'inactive'} /></td>
                          <td><input type="text" value={batch.col4 || ''} onChange={(e) => updateBatchRow(idx, 'col4', e.target.value)} className="edit-input" style={{width: '100%', padding: '6px'}} disabled={batch.status === 'inactive'} /></td>
                          <td><input type="text" value={batch.col5 || ''} onChange={(e) => updateBatchRow(idx, 'col5', e.target.value)} className="edit-input" style={{width: '100%', padding: '6px'}} disabled={batch.status === 'inactive'} /></td>
                          <td><input type="text" value={batch.col6 || ''} onChange={(e) => updateBatchRow(idx, 'col6', e.target.value)} className="edit-input" style={{width: '100%', padding: '6px'}} disabled={batch.status === 'inactive'} /></td>
                          
                          <td style={{textAlign: 'center', padding: '5px'}}>
                            <button type="button" onClick={() => updateBatchRow(idx, 'status', batch.status === 'inactive' ? 'active' : 'inactive')} 
                              style={{ background: batch.status === 'inactive' ? '#9e9e9e' : '#4caf50', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                              {batch.status === 'inactive' ? 'Inactive' : 'Active'}
                            </button>
                          </td>
                          <td style={{textAlign: 'center', padding: '5px'}}>
                            <button type="button" onClick={() => deleteBatchRow(idx)} style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}><i className="fas fa-trash"></i></button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="9" style={{textAlign: 'center', color: '#888', padding: '20px'}}>No batch records found. Click "Add New Row" to create one.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button type="button" onClick={saveBatchesToDatabase} className="save-btn" style={{ padding: '10px 20px', fontSize: '1.1rem' }}>
                  <i className="fas fa-save"></i> Save Batches to Website
                </button>
              </div>

            </div>
          )}

          {/* 🔴 NEW INTEGRATED CHIKKI STOCK MANAGER */}
          {activeTab === 'chikki-stock' && (
            <>
              {/* SMART FORM FOR ADDING STOCK OR SENDING SUPPLY */}
              <div className="data-card fade-in" style={{ marginBottom: '30px', borderTop: '4px solid #1565c0' }}>
                <h3 style={{ color: '#1565c0', marginBottom: '15px' }}>
                  <i className="fas fa-truck-loading"></i> GVS Stock Manager (స్టాక్ ఎంట్రీ)
                </h3>
                
                <form onSubmit={handleUnifiedSubmit} className="account-form" style={{ background: entryType === 'receive' ? '#e8f5e9' : '#ffebee', padding: '20px', borderRadius: '8px', border: `1px solid ${entryType === 'receive' ? '#c5e1a5' : '#ffcdd2'}` }}>
                  
                  {/* RADIO BUTTONS */}
                  <div style={{ display: 'flex', gap: '25px', marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '15px' }}>
                    <label style={{ cursor: 'pointer', fontWeight: 'bold', color: entryType === 'receive' ? '#2e7d32' : '#555', fontSize: '1.1rem' }}>
                      <input type="radio" checked={entryType === 'receive'} onChange={() => {setEntryType('receive'); setUnifiedForm({...unifiedForm, quantity: ''});}} style={{marginRight: '8px', transform: 'scale(1.2)'}} /> 
                      ఆఫీస్ కి స్టాక్ వచ్చింది (Inward / +)
                    </label>
                    <label style={{ cursor: 'pointer', fontWeight: 'bold', color: entryType === 'send' ? '#c62828' : '#555', fontSize: '1.1rem' }}>
                      <input type="radio" checked={entryType === 'send'} onChange={() => {setEntryType('send'); setUnifiedForm({...unifiedForm, quantity: ''});}} style={{marginRight: '8px', transform: 'scale(1.2)'}} /> 
                      గ్రామానికి సప్లై పంపాము (Outward / -)
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="input-group" style={{maxWidth: '200px'}}>
                      <label>Date (తేది) *</label>
                      <input type="date" value={unifiedForm.date} onChange={e => setUnifiedForm({...unifiedForm, date: e.target.value})} required />
                    </div>

                    {entryType === 'receive' ? (
                      <div className="input-group" style={{ flex: 1 }}>
                        <label>Donor / Details (దాత / వివరాలు) *</label>
                        <input type="text" value={unifiedForm.particulars} onChange={e => setUnifiedForm({...unifiedForm, particulars: e.target.value})} placeholder="Ex: Received 5000 Chikkis from XYZ" required />
                      </div>
                    ) : (
                      <>
                        <div className="input-group" style={{ flex: 1 }}>
                          <label>Mandal (మండలం) *</label>
                          <input type="text" value={unifiedForm.mandal} onChange={e => setUnifiedForm({...unifiedForm, mandal: e.target.value})} placeholder="Ex: Bhamini" required />
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                          <label>Village (గ్రామం) *</label>
                          <input type="text" value={unifiedForm.village} onChange={e => setUnifiedForm({...unifiedForm, village: e.target.value})} placeholder="Ex: Ghanasara" required />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="form-row" style={{marginTop: '15px'}}>
                    <div className="input-group">
                      <label>{entryType === 'receive' ? 'Inward Quantity *' : 'Supply Quantity *'}</label>
                      <input type="number" value={unifiedForm.quantity} onChange={e => setUnifiedForm({...unifiedForm, quantity: e.target.value})} placeholder="Ex: 500" required style={{ borderColor: entryType === 'receive' ? '#4caf50' : '#f44336', fontWeight: 'bold', fontSize: '1.1rem' }} />
                    </div>
                    <div className="input-group" style={{ flex: 2 }}>
                      <label>Remarks (రిమార్క్స్ - Optional)</label>
                      <input type="text" value={unifiedForm.remarks} onChange={e => setUnifiedForm({...unifiedForm, remarks: e.target.value})} placeholder="Any additional notes..." />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <button type="submit" className="save-btn" disabled={loading} style={{ padding: '12px 25px', background: entryType === 'receive' ? '#2e7d32' : '#c62828', fontSize: '1.1rem' }}>
                      <i className={entryType === 'receive' ? "fas fa-download" : "fas fa-truck"}></i> {entryType === 'receive' ? 'Save Office Stock (+)' : 'Send to Village (-)'}
                    </button>
                  </div>
                </form>
              </div>

              {/* 🔴 SECTION 1: MAIN OFFICE STOCK TABLE (TOP) */}
              <div className="data-card fade-in" style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#1565c0', marginBottom: '15px' }}><i className="fas fa-building"></i> GVS Head Office Ledger (హెడ్ ఆఫీస్ నిల్వలు)</h3>
                
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <div className="filter-group" style={{flex: 1, minWidth: '150px'}}>
                    <label style={{fontWeight: 'bold', fontSize: '0.9rem'}}><i className="fas fa-map-marker-alt"></i> Mandal:</label>
                    <select value={mainStockFilterMandal} onChange={(e) => setMainStockFilterMandal(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}}>
                      <option value="All">All Mandals</option>
                      {allMainStockMandals.map((m, i) => <option key={i} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="filter-group" style={{flex: 1, minWidth: '150px'}}>
                    <label style={{fontWeight: 'bold', fontSize: '0.9rem'}}><i className="fas fa-home"></i> Village/Details:</label>
                    <select value={mainStockFilterVillage} onChange={(e) => setMainStockFilterVillage(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}}>
                      <option value="All">All Details</option>
                      {allMainStockVillages.map((v, i) => <option key={i} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="filter-group" style={{flex: 1, minWidth: '150px'}}>
                    <label style={{fontWeight: 'bold', fontSize: '0.9rem'}}><i className="fas fa-calendar"></i> Date:</label>
                    <input type="date" value={mainStockFilterDate} onChange={(e) => setMainStockFilterDate(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}} />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-data-table accounts-table">
                    <thead>
                      <tr>
                        <th style={{width: '50px'}}>S.No</th>
                        <th style={{width: '100px'}}>Date</th>
                        <th>Details / Village</th>
                        <th>Mandal</th>
                        <th>Old Bal</th>
                        <th style={{color: '#2e7d32'}}>Inward (+)</th>
                        <th>Total</th>
                        <th style={{color: '#c62828'}}>Outward (-)</th>
                        <th style={{color: '#1565c0', fontSize: '1.05rem'}}>Office Balance</th>
                        <th style={{width: '60px', textAlign: 'center'}}>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMainOfficeStocks.length > 0 ? (
                        filteredMainOfficeStocks.map((stock, idx) => (
                          <tr key={stock._id}>
                            <td style={{fontWeight: 'bold', textAlign: 'center'}}>{filteredMainOfficeStocks.length - idx}</td>
                            <td>{stock.date}</td>
                            <td style={{fontWeight: 'bold', color: '#333'}}>{stock.village}</td>
                            <td>{stock.mandal}</td>
                            <td style={{color: '#888'}}>{stock.oldBalance}</td>
                            <td style={{fontWeight: 'bold', color: '#2e7d32'}}>{stock.inward || '-'}</td>
                            <td style={{fontWeight: 'bold'}}>{stock.total}</td>
                            <td style={{fontWeight: 'bold', color: '#c62828'}}>{stock.outward || '-'}</td>
                            <td style={{fontWeight: 'bold', color: '#1565c0', background: '#bbdefb', fontSize: '1.1rem'}}>{stock.closingBalance}</td>
                            <td style={{textAlign: 'center'}}>
                              <button onClick={() => handleDeleteMainStock(stock._id)} className="icon-btn delete-btn" style={{color: '#d32f2f', background:'none', border:'none', cursor:'pointer'}}><i className="fas fa-trash"></i></button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="10" style={{textAlign: 'center', padding: '20px', color: '#888'}}>No main office records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 2: Villages stock table */}
              <div className="data-card fade-in" style={{ borderTop: '4px solid #4caf50', paddingTop: '20px' }}>
                <h3 style={{ color: '#2e7d32', marginBottom: '15px' }}>
                  <i className="fas fa-boxes"></i> Villages Chikki Stock Register (గ్రామాలకు వెళ్ళిన సప్లై)
                </h3>

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <div className="filter-group" style={{flex: 1, minWidth: '150px'}}>
                    <label style={{fontWeight: 'bold', fontSize: '0.9rem'}}><i className="fas fa-map-marker-alt"></i> Mandal:</label>
                    <select value={stockFilterMandal} onChange={(e) => setStockFilterMandal(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}}>
                      <option value="All">All Mandals</option>
                      {allStockMandals.map((m, i) => <option key={i} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="filter-group" style={{flex: 1, minWidth: '150px'}}>
                    <label style={{fontWeight: 'bold', fontSize: '0.9rem'}}><i className="fas fa-home"></i> Village:</label>
                    <select value={stockFilterVillage} onChange={(e) => setStockFilterVillage(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}}>
                      <option value="All">All Villages</option>
                      {allStockVillages.map((v, i) => <option key={i} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="filter-group" style={{flex: 1, minWidth: '150px'}}>
                    <label style={{fontWeight: 'bold', fontSize: '0.9rem'}}><i className="fas fa-calendar"></i> Date:</label>
                    <input type="date" value={stockFilterDate} onChange={(e) => setStockFilterDate(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}} />
                  </div>
                  <div className="filter-group" style={{display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '25px'}}>
                    <input type="checkbox" id="onlySupply" checked={stockFilterOnlySupply} onChange={(e) => setStockFilterOnlySupply(e.target.checked)} style={{transform: 'scale(1.5)'}} />
                    <label htmlFor="onlySupply" style={{fontWeight: 'bold', cursor: 'pointer'}}>Only Supply (సప్లై మాత్రమే)</label>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-data-table accounts-table">
                    <thead>
                      <tr>
                        <th style={{width: '50px'}}>S.No</th>
                        <th style={{width: '100px'}}>Date</th>
                        <th>Mandal</th>
                        <th>Village</th>
                        <th>Old Bal</th>
                        <th style={{color: '#2e7d32'}}>Supply (+)</th>
                        <th>Total</th>
                        <th style={{color: '#c62828'}}>Used (-)</th>
                        <th style={{color: '#1565c0'}}>Close Bal</th>
                        <th>Remarks</th>
                        <th style={{width: '60px', textAlign: 'center'}}>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChikkiStocks.length > 0 ? (
                        filteredChikkiStocks.map((stock, idx) => (
                          <tr key={stock._id}>
                            <td style={{fontWeight: 'bold', textAlign: 'center'}}>{filteredChikkiStocks.length - idx}</td>
                            <td>{stock.date}</td>
                            <td>{stock.mandal}</td>
                            <td><span className="village-badge" style={{background: '#e0f2f1', color: '#00695c'}}>{stock.village}</span></td>
                            <td style={{color: '#888'}}>{stock.oldBalance}</td>
                            <td style={{fontWeight: 'bold', color: '#2e7d32'}}>{stock.supply || '-'}</td>
                            <td style={{fontWeight: 'bold'}}>{stock.total}</td>
                            <td style={{fontWeight: 'bold', color: '#c62828'}}>{stock.used || '-'}</td>
                            <td style={{fontWeight: 'bold', color: '#1565c0', background: '#e3f2fd'}}>{stock.closingBalance}</td>
                            <td>{stock.remarks}</td>
                            <td style={{textAlign: 'center'}}>
                               <button onClick={() => handleDeleteStock(stock._id)} className="icon-btn delete-btn" style={{color: '#d32f2f', background:'none', border:'none', cursor:'pointer'}}><i className="fas fa-trash"></i></button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="11" style={{textAlign: 'center', padding: '20px', color: '#888'}}>No village stock records found for selected filters.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
};

export default ReportsManager;