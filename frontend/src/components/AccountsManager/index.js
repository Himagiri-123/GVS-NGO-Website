import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './index.css';
import API_URL from '../../config/api';

const AccountsManager = () => {
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accName: '',
    accNo: '',
    ifsc: '',
    upiId: '',
    qrCodeUrl: ''
  });
  const [savingBank, setSavingBank] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterCategory, setFilterCategory] = useState('All');
  const [filterMonth, setFilterMonth] = useState(''); 

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    category: 'Total NGO',
    date: new Date().toISOString().split('T')[0],
    details: '',
    income: '',
    expense: '',
    billUrl: ''
  });
  const [uploadingBill, setUploadingBill] = useState(false);
  const [viewImage, setViewImage] = useState(null); 

  useEffect(() => {
    fetchAccounts();
    fetchBankDetails();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/accounts`);
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bank-details`);
      const data = await res.json();
      if(data) {
        setBankDetails(data);
      }
    } catch (err) {
      console.error("Failed to fetch bank details", err);
    }
  };

  const handleBankInputChange = (e) => {
    setBankDetails({ ...bankDetails, [e.target.name]: e.target.value });
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingQR(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userInfo?.token}` },
        body: uploadData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setBankDetails({ ...bankDetails, qrCodeUrl: data.imageUrl });
      Swal.fire('Success', '✅ QR Code Uploaded!', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to upload QR code', 'error');
    } finally {
      setUploadingQR(false);
    }
  };

  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    setSavingBank(true);
    try {
      const res = await fetch(`${API_URL}/api/bank-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankDetails)
      });
      if(res.ok) {
        Swal.fire('Success!', 'Bank Details updated securely for Donors.', 'success');
        fetchBankDetails(); 
      } else {
        Swal.fire('Error', 'Failed to save bank details', 'error');
      }
    } catch(err) {
      Swal.fire('Error', 'Server Error', 'error');
    }
    setSavingBank(false);
  };

  const handleDeleteBankDetails = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will remove the bank details and QR code from the public website.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Remove it!'
    });

    if (result.isConfirmed) {
      setSavingBank(true);
      const emptyData = { bankName: '', accName: '', accNo: '', ifsc: '', upiId: '', qrCodeUrl: '' };
      
      try {
        const res = await fetch(`${API_URL}/api/bank-details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emptyData)
        });
        if(res.ok) {
          setBankDetails(emptyData);
          Swal.fire('Deleted!', 'Bank details have been removed from the website.', 'success');
        } else {
          Swal.fire('Error', 'Failed to remove details', 'error');
        }
      } catch(err) {
        Swal.fire('Error', 'Server Error', 'error');
      }
      setSavingBank(false);
    }
  };

  const hasBankData = bankDetails.bankName || bankDetails.accNo || bankDetails.upiId;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBill(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userInfo?.token}` },
        body: uploadData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData({ ...formData, billUrl: data.imageUrl });
      Swal.fire('Success', '✅ Bill Image Uploaded!', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to upload bill', 'error');
    } finally {
      setUploadingBill(false);
    }
    e.target.value = ''; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.details || (!formData.income && !formData.expense)) {
      return Swal.fire('Error', 'Please fill the necessary details (Income or Expense)!', 'error');
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        income: Number(formData.income) || 0,
        expense: Number(formData.expense) || 0
      };

      const url = editingId ? `${API_URL}/api/accounts/${editingId}` : `${API_URL}/api/accounts`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      if (res.ok) {
        Swal.fire('Saved!', editingId ? 'Record updated successfully.' : 'Record added successfully.', 'success');
        setFormData({
          category: 'Total NGO',
          date: new Date().toISOString().split('T')[0],
          details: '',
          income: '',
          expense: '',
          billUrl: ''
        });
        setEditingId(null);
        fetchAccounts();
      } else {
        Swal.fire('Error', 'Failed to save record', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Server error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    setFormData({
      category: record.category,
      date: record.date,
      details: record.details,
      income: record.income || '',
      expense: record.expense || '',
      billUrl: record.billUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this record? Balance will be recalculated automatically.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete!'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${API_URL}/api/accounts/${id}`, { method: 'DELETE' });
        fetchAccounts();
        Swal.fire('Deleted!', 'Record has been removed.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to delete record', 'error');
      }
    }
  };

  let runningBalance = 0;
  const accountsWithBalance = accounts.map(acc => {
    runningBalance = runningBalance + (acc.income || 0) - (acc.expense || 0);
    return { ...acc, calculatedBalance: runningBalance };
  });

  const displayAccounts = [...accountsWithBalance].reverse();

  const filteredAccounts = displayAccounts.filter(acc => {
    const matchCategory = filterCategory === 'All' || acc.category === filterCategory;
    const matchMonth = filterMonth === '' || acc.date.startsWith(filterMonth);
    return matchCategory && matchMonth;
  });

  const totalIncome = filteredAccounts.reduce((sum, acc) => sum + (acc.income || 0), 0);
  const totalExpense = filteredAccounts.reduce((sum, acc) => sum + (acc.expense || 0), 0);

  return (
    <div className="accounts-manager-container fade-in">
      <div className="manager-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2><i className="fas fa-file-invoice-dollar"></i> NGO Accounts & Bank Details</h2>
      </div>

      <div className="data-card" style={{ marginBottom: '30px', background: '#e8f5e9', border: '1px solid #81c784' }}>
        <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}><i className="fas fa-university"></i> Official Bank Details (Visible to Donors)</h3>
        <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '20px' }}>These details will be shown on the website's Donate page for public contributions.</p>
        
        <form onSubmit={handleSaveBankDetails}>
          <div className="form-row">
            <div className="input-group">
              <label>Bank Name</label>
              <input type="text" name="bankName" placeholder="Ex: State Bank of India" value={bankDetails.bankName || ''} onChange={handleBankInputChange} />
            </div>
            <div className="input-group">
              <label>Account Name</label>
              <input type="text" name="accName" placeholder="Ex: Grameena Vikas Sangham" value={bankDetails.accName || ''} onChange={handleBankInputChange} />
            </div>
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label>Account Number</label>
              <input type="text" name="accNo" placeholder="Account No" value={bankDetails.accNo || ''} onChange={handleBankInputChange} />
            </div>
            <div className="input-group">
              <label>IFSC Code</label>
              <input type="text" name="ifsc" placeholder="IFSC Code" value={bankDetails.ifsc || ''} onChange={handleBankInputChange} />
            </div>
          </div>

          <div className="form-row" style={{ alignItems: 'flex-end', background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '8px' }}>
            <div className="input-group">
              <label>UPI ID</label>
              <input type="text" name="upiId" placeholder="Ex: gvs@sbi" value={bankDetails.upiId || ''} onChange={handleBankInputChange} />
            </div>
            <div className="input-group">
              <label><i className="fas fa-qrcode"></i> Upload Payment QR Code</label>
              <input type="file" accept="image/*" onChange={handleQRUpload} disabled={uploadingQR} />
              {uploadingQR && <span style={{color: '#d94f00', fontSize: '0.8rem'}}>Uploading...</span>}
            </div>
            
            {bankDetails.qrCodeUrl && (
               <div style={{ width: '60px', height: '60px', borderRadius: '5px', overflow: 'hidden', border: '1px solid #ccc' }}>
                 <img src={bankDetails.qrCodeUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               </div>
            )}
            
            {/* Delete and Update buttons styled correctly here */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <button type="submit" disabled={savingBank || uploadingQR} className="save-btn" style={{ padding: '0 25px', height: '45px', background: hasBankData ? '#f57c00' : '#1b5e20', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '5px', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                <i className={hasBankData ? "fas fa-edit" : "fas fa-shield-alt"}></i> 
                <span>{savingBank ? 'Saving...' : (hasBankData ? 'Update Details' : 'Save Details')}</span>
              </button>
              
              {hasBankData && (
                <button type="button" onClick={handleDeleteBankDetails} disabled={savingBank || uploadingQR} style={{ padding: '0 25px', height: '45px', borderRadius: '5px', background: '#d32f2f', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-trash"></i> 
                  <span>Delete</span>
                </button>
              )}
            </div>

          </div>
        </form>
      </div>

      <div className="data-card" style={{ marginBottom: '30px', background: editingId ? '#fff3e0' : '#f1f8e9', border: editingId ? '2px solid #ffb74d' : '1px solid #c5e1a5' }}>
        <h3 style={{ color: editingId ? '#f57c00' : '#2e7d32', marginBottom: '15px' }}>
          {editingId ? <><i className="fas fa-edit"></i> Edit Ledger Record</> : <><i className="fas fa-plus-circle"></i> Add New Ledger Record</>}
        </h3>
        
        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-row">
            <div className="input-group">
              <label>Category (Branch) *</label>
              <select name="category" value={formData.category} onChange={handleInputChange} required>
                <option value="Total NGO">Total NGO</option>
                <option value="Study Center">Study Center</option>
                <option value="Computer Center">Computer Center</option>
                <option value="Water Plant">Water Plant</option>
              </select>
            </div>
            <div className="input-group">
              <label>Date *</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="input-group">
            <label>Account Details (వివరాలు) *</label>
            <input type="text" name="details" placeholder="Ex: Donated by XYZ / Purchased Computers" value={formData.details} onChange={handleInputChange} required />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Income (జమ - ₹)</label>
              <input type="number" name="income" placeholder="0" value={formData.income} onChange={handleInputChange} style={{borderColor: '#4caf50', fontWeight: 'bold', color: '#2e7d32'}} />
            </div>
            <div className="input-group">
              <label>Expense (ఖర్చు - ₹)</label>
              <input type="number" name="expense" placeholder="0" value={formData.expense} onChange={handleInputChange} style={{borderColor: '#f44336', fontWeight: 'bold', color: '#c62828'}} />
            </div>
            <div className="input-group">
              <label>Balance (నిల్వ - ₹) <span style={{fontSize:'0.75rem', color:'#888'}}>(Auto Calc)</span></label>
              <input type="text" value="Calculated Automatically" disabled style={{background: '#eee', color: '#888', fontStyle: 'italic'}} />
            </div>
          </div>

          <div className="form-row" style={{ alignItems: 'flex-end' }}>
            <div className="input-group">
              <label><i className="fas fa-receipt"></i> Upload Bill / Proof (Optional)</label>
              <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploadingBill} />
              {uploadingBill && <span style={{color: '#d94f00', fontSize: '0.8rem'}}>Uploading... Please wait</span>}
              {formData.billUrl && <span style={{color: '#2e7d32', fontSize: '0.8rem'}}>✅ Bill Ready / Attached</span>}
            </div>
            
            <div style={{display: 'flex', gap: '10px'}}>
              <button type="submit" className="save-btn" disabled={uploadingBill} style={{ padding: '12px 25px', height: '45px', background: editingId ? '#f57c00' : '#2e7d32' }}>
                <i className="fas fa-save"></i> {editingId ? 'Update Record' : 'Save Record'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({category: 'Total NGO', date: new Date().toISOString().split('T')[0], details: '', income: '', expense: '', billUrl: ''}); }} className="icon-btn delete-btn" style={{ height: '45px', padding: '0 20px', borderRadius: '5px' }}>Cancel</button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="data-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h3><i className="fas fa-list"></i> Accounts Ledger</h3>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div className="filter-group">
              <label><i className="fas fa-filter"></i> Category:</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{marginLeft: '5px', padding: '6px', borderRadius: '4px'}}>
                <option value="All">All Categories</option>
                <option value="Total NGO">Total NGO</option>
                <option value="Study Center">Study Center</option>
                <option value="Computer Center">Computer Center</option>
                <option value="Water Plant">Water Plant</option>
              </select>
            </div>
            <div className="filter-group">
              <label><i className="fas fa-calendar-alt"></i> Month:</label>
              <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{marginLeft: '5px', padding: '6px', borderRadius: '4px'}} />
            </div>
          </div>
        </div>

        <div className="accounts-summary">
          <div className="summary-box jama-box">
            <h4>Total Income (మొత్తం జమ)</h4>
            <p>₹ {totalIncome.toLocaleString('en-IN')}</p>
          </div>
          <div className="summary-box karchu-box">
            <h4>Total Expense (మొత్తం ఖర్చు)</h4>
            <p>₹ {totalExpense.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {loading ? (
           <div style={{textAlign: 'center', padding: '30px'}}><i className="fas fa-spinner fa-spin fa-2x"></i></div>
        ) : (
          <div className="table-responsive">
            <table className="admin-data-table accounts-table">
              <thead>
                <tr>
                  <th style={{width: '50px'}}>S.No</th>
                  <th style={{width: '100px'}}>Date</th>
                  <th style={{width: '150px'}}>Category</th>
                  <th>Details (వివరాలు)</th>
                  <th style={{width: '100px'}}>Income (జమ - ₹)</th>
                  <th style={{width: '100px'}}>Expense (ఖర్చు - ₹)</th>
                  <th style={{width: '110px'}}>Balance (నిల్వ - ₹)</th>
                  <th style={{width: '80px', textAlign: 'center'}}>Bill</th>
                  <th style={{width: '90px', textAlign: 'center'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((acc, index) => (
                    <tr key={acc._id}>
                      <td style={{fontWeight: 'bold', textAlign: 'center'}}>{filteredAccounts.length - index}</td>
                      <td>{acc.date}</td>
                      <td><span className="cat-badge">{acc.category}</span></td>
                      <td>{acc.details}</td>
                      <td style={{color: '#2e7d32', fontWeight: 'bold'}}>{acc.income ? acc.income.toLocaleString('en-IN') : '-'}</td>
                      <td style={{color: '#c62828', fontWeight: 'bold'}}>{acc.expense ? acc.expense.toLocaleString('en-IN') : '-'}</td>
                      <td style={{color: '#1565c0', fontWeight: 'bold', background: '#e3f2fd'}}>{acc.calculatedBalance.toLocaleString('en-IN')}</td>
                      
                      <td style={{textAlign: 'center'}}>
                        {acc.billUrl ? (
                          <button onClick={() => setViewImage(acc.billUrl)} className="bill-btn" title="View Bill">
                            <i className="fas fa-file-invoice"></i> View
                          </button>
                        ) : '-'}
                      </td>
                      <td style={{textAlign: 'center'}}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleEdit(acc)} className="icon-btn edit-btn" style={{color: '#0288d1', background:'none', border:'none', cursor:'pointer'}}><i className="fas fa-edit"></i></button>
                          <button onClick={() => handleDelete(acc._id)} className="icon-btn delete-btn" style={{color: '#d32f2f', background:'none', border:'none', cursor:'pointer'}}><i className="fas fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="9" style={{textAlign: 'center', padding: '20px', color: '#888'}}>No records found for this filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewImage && (
        <div className="bill-modal" onClick={() => setViewImage(null)}>
          <span className="close-modal">&times;</span>
          <img src={viewImage} alt="Receipt/Bill" className="bill-img-large" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

    </div>
  );
};

export default AccountsManager;