import React, { useState, useEffect } from 'react';
import NO_PHOTO_PLACEHOLDER from '../../config/noPhotoPlaceholder';
import Swal from 'sweetalert2'; 
import './index.css';
import API_URL from '../../config/api';
import { calculateExperience } from '../../config/calculateExperience';

const StaffManager = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [editingId, setEditingId] = useState(null); 

  const [formData, setFormData] = useState({
    name: '', category: 'VVK Instructor', role: 'Instructor', qualification: '',
    experience: '', mandal: 'Bhamini', village: '', phone: '', status: 'active', photoUrl: '', password: '',
    fatherName: '', joinDate: '', district: 'Parvathipuram Manyam', state: 'Andhra Pradesh',
    gender: 'Male', showPhotoOnCert: true
  });

  // Added the 'Computer Teacher' category
  const categories = ['Coordinator', 'VVK Instructor', 'Govt Teacher', 'Caretaker', 'Computer Teacher'];

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/staff`);
      if (!res.ok) throw new Error('Failed to fetch staff list');
      const data = await res.json();
      setStaffList(Array.isArray(data) ? data : []); // ensure only an array ever gets set
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const onlyNums = value.replace(/\D/g, '');
      if (onlyNums.length <= 10) setFormData({ ...formData, [name]: onlyNums });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setError(''); setSuccess('');
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${userInfo.token}` }, body: uploadData,
      });

      if (!response.ok) throw new Error('Photo upload failed!');
      const data = await response.json();
      setFormData({ ...formData, photoUrl: data.imageUrl });
      setSuccess('Photo uploaded! Now fill details and save.');
    } catch (err) { setError(err.message); } 
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      return Swal.fire('Error', 'Phone number must be exactly 10 digits!', 'error'); 
    }

    setLoading(true); setError(''); setSuccess('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const url = editingId ? `${API_URL}/api/staff/${editingId}` : `${API_URL}/api/staff`;
      const method = editingId ? 'PUT' : 'POST';

      const payload = { ...formData };
      if (editingId && !payload.password) {
        delete payload.password; 
      } else if (!editingId && !payload.password) {
        payload.password = '123456'; 
      }

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify(payload), 
      });

      if (!response.ok) throw new Error('Failed to save staff data');
      
      Swal.fire('Success!', editingId ? 'Staff member updated successfully!' : 'Staff member added successfully!', 'success'); 
      
      setFormData({ name: '', category: 'VVK Instructor', role: 'Instructor', qualification: '', experience: '', mandal: 'Bhamini', village: '', phone: '', status: 'active', photoUrl: '', password: '', fatherName: '', joinDate: '', district: 'Parvathipuram Manyam', state: 'Andhra Pradesh', gender: 'Male', showPhotoOnCert: true });
      setEditingId(null);
      fetchStaff();
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  };

  const handleEdit = (staff) => {
    setEditingId(staff._id);
    setFormData({
      name: staff.name, category: staff.category || 'VVK Instructor', role: staff.role || 'Instructor', 
      qualification: staff.qualification, experience: staff.experience, 
      mandal: staff.mandal || 'Bhamini', village: staff.village || '', 
      phone: staff.phone, status: staff.status, photoUrl: staff.photoUrl || '',
      password: '',
      fatherName: staff.fatherName || '', joinDate: staff.joinDate || '',
      district: staff.district || 'Parvathipuram Manyam', state: staff.state || 'Andhra Pradesh',
      gender: staff.gender || 'Male', showPhotoOnCert: staff.showPhotoOnCert !== false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSuccess(''); setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', category: 'VVK Instructor', role: 'Instructor', qualification: '', experience: '', mandal: 'Bhamini', village: '', phone: '', status: 'active', photoUrl: '', password: '', fatherName: '', joinDate: '', district: 'Parvathipuram Manyam', state: 'Andhra Pradesh', gender: 'Male', showPhotoOnCert: true });
    setSuccess(''); setError('');
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await fetch(`${API_URL}/api/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to change status');
      fetchStaff();
    } catch (err) { Swal.fire('Error', err.message, 'error'); } 
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this staff member?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!'
    });

    if (result.isConfirmed) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        await fetch(`${API_URL}/api/staff/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${userInfo.token}` } });
        if(editingId === id) cancelEdit();
        fetchStaff();
        Swal.fire('Deleted!', 'Staff member has been deleted.', 'success'); 
      } catch (err) { setError(err.message); }
    }
  };

  return (
    <div className="staff-manager-container">
      <div className="manager-header">
        <h2><i className="fas fa-users-cog"></i> Manage GVS Team</h2>
        <p>Click on the status badge to quickly toggle Active/Inactive.</p>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <div className="staff-content-grid">
        {/* LEFT: FORM */}
        <div className="staff-form-card">
          <h3 style={{ color: editingId ? '#0288d1' : '#d94f00' }}>
            {editingId ? <><i className="fas fa-user-edit"></i> Edit Member Details</> : <><i className="fas fa-user-plus"></i> Add New Member</>}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="photo-upload-section">
              {formData.photoUrl ? (
                <div className="preview-image">
                  <img src={formData.photoUrl} alt="Preview" />
                  <button type="button" onClick={() => setFormData({...formData, photoUrl: ''})} className="remove-photo-btn">&times;</button>
                </div>
              ) : (
                <label className="upload-placeholder">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} hidden />
                </label>
              )}
              {formData.photoUrl && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.showPhotoOnCert}
                    onChange={(e) => setFormData({ ...formData, showPhotoOnCert: e.target.checked })}
                  />
                  Show this photo on the public staff card (GVS Instructors page etc.)
                </label>
              )}
            </div>

            <div className="input-group">
              <label>Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required className="custom-select">
                  <option value="Coordinator">Coordinator</option>
                  <option value="VVK Instructor">VVK Instructor</option>
                  <option value="Govt Teacher">Govt Teacher</option>
                  <option value="Caretaker">Caretaker</option>
                  {/* Added the Computer Teacher option */}
                  <option value="Computer Teacher">Computer Teacher</option>
                </select>
              </div>
              <div className="input-group">
                <label>Status *</label>
                <select name="status" value={formData.status} onChange={handleChange} required className="custom-select">
                  <option value="active">Active (Working)</option>
                  <option value="inactive">Inactive (Left)</option>
                </select>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Role *</label>
                <select name="role" value={formData.role} onChange={handleChange} required className="custom-select">
                  <option value="Coordinator">Coordinator</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Govt Teacher">Govt Teacher</option>
                  <option value="Caretaker">Caretaker</option>
                  {/* Using 'computer_teacher' (with underscore) so the backend understands it */}
                  <option value="computer_teacher">Computer Faculty</option>
                </select>
              </div>
              <div className="input-group">
                <label>Qualification (Ex: B.Ed) *</label>
                <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Experience (auto-calculated from Join Date below)</label>
                <input type="text" value={formData.joinDate ? calculateExperience(formData.joinDate) : 'Enter Join Date below'} readOnly disabled style={{ background: '#f0f0f0', color: '#555', cursor: 'not-allowed' }} />
              </div>
              <div className="input-group">
                <label>Phone Number (10 digits) *</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Mandal *</label>
                <select name="mandal" value={formData.mandal} onChange={handleChange} required className="custom-select">
                  <option value="Bhamini">Bhamini</option>
                  <option value="Kotturu">Kotturu</option>
                </select>
              </div>
              <div className="input-group">
                <label>Village *</label>
                <input type="text" name="village" value={formData.village} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff8e1', borderRadius: '8px', border: '1px solid #fdd835' }}>
              <label style={{ fontWeight: 'bold', color: '#795548' }}><i className="fas fa-certificate"></i> Join Date &amp; Experience Certificate Details</label>
              <p style={{ fontSize: '0.8rem', color: '#795548', margin: '4px 0 0 0' }}>Join Date is used everywhere to auto-calculate "years of experience". Father's Name/District/State are only needed for Coordinator, VVK Instructor, and Computer Teacher (for their Experience Certificate).</p>
              <div className="input-row" style={{ marginTop: '10px' }}>
                <div className="input-group">
                  <label>Father's Name</label>
                  <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Ex: Golla Govindarao" />
                </div>
                <div className="input-group">
                  <label>Gender (for S/o or D/o on the certificate)</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="custom-select">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div className="input-row" style={{ marginTop: '10px' }}>
                <div className="input-group">
                  <label>Join Date (used to auto-calculate years of service)</label>
                  <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} />
                </div>
              </div>
              <div className="input-row" style={{ marginTop: '10px' }}>
                <div className="input-group">
                  <label>District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="Ex: Parvathipuram Manyam" />
                </div>
                <div className="input-group">
                  <label>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="Ex: Andhra Pradesh" />
                </div>
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f4f7f6', borderRadius: '8px', border: '1px solid #1b5e20' }}>
              <label style={{ color: '#1b5e20', fontWeight: 'bold' }}>
                <i className="fas fa-key"></i> {editingId ? "Reset Password" : "Set Login Password"}
              </label>
              <input 
                type="text" name="password" value={formData.password} onChange={handleChange} 
                placeholder={editingId ? "Type only if you want to set a new password..." : "Default: 123456"} 
                style={{ borderColor: '#ffca28', marginTop: '5px' }}
              />
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                {editingId ? "Leave this box empty if you don't want to change the password." : "If left blank, 123456 will be saved automatically."}
              </small>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="save-staff-btn" style={{ background: editingId ? '#0288d1' : '#1b5e20' }} disabled={loading || uploading}>
                {loading ? 'Saving...' : (editingId ? 'Update Details' : 'Save Details')} <i className={editingId ? "fas fa-sync" : "fas fa-save"}></i>
              </button>
              {editingId && <button type="button" onClick={cancelEdit} className="cancel-edit-btn">Cancel</button>}
            </div>
          </form>
        </div>

        {/* RIGHT: GROUPED STAFF LIST */}
        <div className="staff-list-section">
          <h3>Current Team Members ({staffList.length})</h3>
          {loading && staffList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#1b5e20' }}><i className="fas fa-spinner fa-spin fa-2x"></i></div>
          ) : staffList.length === 0 ? (
            <div className="empty-staff">No team members added yet.</div>
          ) : (
            <div className="grouped-staff-container">
              {categories.map(cat => {
                const catStaff = staffList.filter(s => s.category === cat);
                if (catStaff.length === 0) return null;

                const mandals = [...new Set(catStaff.map(s => s.mandal || 'Other Mandals'))];

                return (
                  <div key={cat} className="admin-category-group">
                    <h4 className="admin-cat-title"><i className="fas fa-layer-group"></i> {cat}s</h4>
                    {mandals.map(mandal => {
                      const mandalStaff = catStaff.filter(s => (s.mandal || 'Other Mandals') === mandal);
                      const villages = [...new Set(mandalStaff.map(s => s.village || 'Other Villages'))];

                      return (
                        <div key={mandal} className="admin-mandal-group">
                          <h5 className="admin-mandal-title"><i className="fas fa-map"></i> {mandal}</h5>
                          {villages.map(village => {
                            const villageStaff = mandalStaff.filter(s => (s.village || 'Other Villages') === village);
                            return (
                              <div key={village} className="admin-village-group">
                                <h6 className="admin-village-title"><i className="fas fa-map-marker-alt"></i> {village}</h6>
                                <div className="staff-cards-grid">
                                  {villageStaff.map(staff => (
                                    <div key={staff._id} className={`staff-card ${editingId === staff._id ? 'editing-active' : ''}`}>
                                      <div className="status-badge" style={{ backgroundColor: staff.status === 'active' ? '#4caf50' : '#f44336', cursor: 'pointer' }} onClick={() => handleToggleStatus(staff._id, staff.status)} title="Click to change status">
                                        <i className="fas fa-power-off"></i> {staff.status.toUpperCase()}
                                      </div>
                                      <div className="action-buttons">
                                        <button onClick={() => handleEdit(staff)} className="edit-staff-btn"><i className="fas fa-edit"></i></button>
                                        <button onClick={() => handleDelete(staff._id)} className="delete-staff-btn"><i className="fas fa-trash-alt"></i></button>
                                      </div>
                                      <div className="staff-photo">
                                        <img src={staff.photoUrl || NO_PHOTO_PLACEHOLDER} alt={staff.name} />
                                      </div>
                                      <div className="staff-info">
                                        <h4>{staff.name}</h4>
                                        <p className="staff-role">{staff.role === 'computer_teacher' ? 'Computer Faculty' : staff.role}</p>
                                        <p style={{ color: '#d32f2f', fontWeight: 'bold' }}><i className="fas fa-phone-alt"></i> {staff.phone}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffManager;