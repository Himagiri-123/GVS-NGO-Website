import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './index.css';
import API_URL from '../../config/api';

const ComputerStudentManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [filterName, setFilterName] = useState('');
  const [filterBatch, setFilterBatch] = useState('');

  const [formData, setFormData] = useState({
    name: '', fatherName: '', className: '', gender: 'Male', academicYear: '2025-2026', 
    phone: '', village: '', category: 'Computer', batchNumber: '', 
    courseName: 'MS-OFFICE & INTERNET', joinDate: '', endDate: '', grade: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const infoStr = localStorage.getItem('userInfo');
      const token = infoStr ? JSON.parse(infoStr).token : '';
      const res = await fetch(`${API_URL}/api/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.filter(s => s.category === 'Computer'));
      }
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const infoStr = localStorage.getItem('userInfo');
      const token = infoStr ? JSON.parse(infoStr).token : '';
      
      const url = editMode ? `${API_URL}/api/students/${editId}` : `${API_URL}/api/students`;
      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        Swal.fire('Success', editMode ? 'Details Updated!' : 'Computer Student Added!', 'success');
        resetForm();
        fetchStudents();
      } else {
        Swal.fire('Error', 'Failed to save student', 'error');
      }
    } catch (err) { Swal.fire('Error', err.message, 'error'); }
    setLoading(false);
  };

  const handleEdit = (student) => {
    setEditMode(true);
    setEditId(student._id);
    setFormData({
      name: student.name || '',
      fatherName: student.fatherName || '',
      className: student.className || '',
      gender: student.gender || 'Male',
      academicYear: student.academicYear || '2025-2026',
      phone: student.phone || '',
      village: student.village || '',
      category: 'Computer',
      batchNumber: student.batchNumber || '',
      courseName: student.courseName || 'MS-OFFICE & INTERNET',
      joinDate: student.joinDate || '',
      endDate: student.endDate || '',
      grade: student.grade || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditMode(false);
    setEditId(null);
    setFormData({
      name: '', fatherName: '', className: '', gender: 'Male', academicYear: '2025-2026', 
      phone: '', village: '', category: 'Computer', batchNumber: '', 
      courseName: 'MS-OFFICE & INTERNET', joinDate: '', endDate: '', grade: ''
    });
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this student?")) {
      try {
        const infoStr = localStorage.getItem('userInfo');
        const token = infoStr ? JSON.parse(infoStr).token : '';
        await fetch(`${API_URL}/api/students/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchStudents();
      } catch (err) { console.error(err); }
    }
  };

  const filteredStudents = students.filter(s => {
    const matchName = s.name.toLowerCase().includes(filterName.toLowerCase());
    const matchBatch = filterBatch === '' || s.batchNumber.toLowerCase().includes(filterBatch.toLowerCase());
    return matchName && matchBatch;
  });

  return (
    <div className="manager-container" style={{ padding: '20px', background: '#fff', borderRadius: '10px' }}>
      <div className="section-header" style={{ marginBottom: '20px', borderBottom: '2px solid #fdd835', paddingBottom: '10px' }}>
        <h2 style={{color: '#1b5e20', margin: 0}}><i className="fas fa-laptop-code"></i> Computer Course Students</h2>
      </div>
      
      <form onSubmit={handleSubmit} style={{background: '#f9f9f9', padding: '25px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #e0e0e0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
        <h3 style={{marginTop: 0, color: '#d94f00', marginBottom: '20px'}}>
          {editMode ? 'Update Student Details' : 'Add New Student'}
        </h3>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px'}}>
          <div>
            <label style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#555'}}>Student Name *</label>
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px'}} />
          </div>
          <div>
            <label style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#555'}}>Father's Name *</label>
            <input type="text" name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleChange} required style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px'}} />
          </div>
          <div>
            <label style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#555'}}>Batch Number *</label>
            <input type="text" name="batchNumber" placeholder="Ex: Batch 14" value={formData.batchNumber} onChange={handleChange} required style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px'}} />
          </div>
          <div>
            <label style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#555'}}>Course Name</label>
            <input type="text" name="courseName" placeholder="Course Name" value={formData.courseName} onChange={handleChange} required style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px'}} />
          </div>
          <div>
            <label style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#555'}}>Join Date *</label>
            <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} required style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px'}} />
          </div>
          <div>
            <label style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#555'}}>End Date *</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px'}} />
          </div>
          <div>
            <label style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#555'}}>Grade (A+/A/B) *</label>
            <input type="text" name="grade" placeholder="Ex: A+" value={formData.grade} onChange={handleChange} required style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px'}} />
          </div>
          <div>
            <label style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#555'}}>Phone Number *</label>
            <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px'}} />
          </div>
          <div>
            <label style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#555'}}>Village *</label>
            <input type="text" name="village" placeholder="Village" value={formData.village} onChange={handleChange} required style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px'}} />
          </div>
          <div>
            <label style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#555'}}>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px'}}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#555'}}>Qualification *</label>
            <input type="text" name="className" placeholder="Ex: B.Tech" value={formData.className} onChange={handleChange} required style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px'}} />
          </div>
        </div>

        <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
          <button type="submit" disabled={loading} style={{background: '#1b5e20', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'}}>
            {loading ? 'Saving...' : (editMode ? 'Update Student Details' : 'Add Student & Auto-Generate ID')}
          </button>
          {editMode && (
            <button type="button" onClick={resetForm} style={{background: '#e53935', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'}}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div style={{background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap'}}>
        <strong style={{color: '#1565c0'}}><i className="fas fa-filter"></i> Filters:</strong>
        <input 
          type="text" placeholder="Search by Student Name..." 
          value={filterName} onChange={(e) => setFilterName(e.target.value)}
          style={{padding: '8px 12px', border: '1px solid #90caf9', borderRadius: '5px', minWidth: '200px'}}
        />
        <input 
          type="text" placeholder="Filter by Batch (Ex: Batch 14)..." 
          value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)}
          style={{padding: '8px 12px', border: '1px solid #90caf9', borderRadius: '5px', minWidth: '200px'}}
        />
        <span style={{marginLeft: 'auto', fontWeight: 'bold', color: '#1b5e20'}}>Total: {filteredStudents.length}</span>
      </div>

      {/* Added all 11 fields to the table */}
      <div className="table-responsive" style={{overflowX: 'auto'}}>
        <table className="custom-table" style={{width: '100%', minWidth: '1300px'}}>
          <thead>
            <tr style={{background: '#1b5e20', color: 'white', whiteSpace: 'nowrap'}}>
              <th>S.No</th>
              <th>Cert. ID</th>
              <th>Student Name</th>
              <th>Father Name</th>
              <th>Gender</th>
              <th>Qual.</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Dates (Join - End)</th>
              <th>Grade</th>
              <th>Phone</th>
              <th>Village</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? filteredStudents.map((s, i) => (
              <tr key={i}>
                <td style={{fontWeight: 'bold'}}>{i + 1}</td>
                <td><strong style={{color: '#d94f00'}}>{s.certificateSerialNo}</strong></td>
                <td style={{fontWeight: 'bold', whiteSpace: 'nowrap'}}>{s.name}</td>
                <td style={{whiteSpace: 'nowrap'}}>{s.fatherName}</td>
                <td>{s.gender}</td>
                <td>{s.className}</td>
                <td>{s.courseName}</td>
                <td><span style={{background: '#e8f5e9', color: '#2e7d32', padding: '3px 8px', borderRadius: '5px', border: '1px solid #c8e6c9', fontWeight: 'bold'}}>{s.batchNumber}</span></td>
                <td style={{fontSize: '0.85rem', whiteSpace: 'nowrap'}}>{s.joinDate} <br/>to<br/> {s.endDate}</td>
                <td><span style={{fontWeight: 'bold', color: s.grade ? '#1565c0' : '#888'}}>{s.grade || '-'}</span></td>
                <td>{s.phone}</td>
                <td>{s.village}</td>
                <td style={{whiteSpace: 'nowrap'}}>
                  <button onClick={() => handleEdit(s)} style={{color: '#1976d2', border: 'none', background: 'none', cursor: 'pointer', marginRight: '15px', fontSize: '1.1rem'}} title="Edit Student">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDelete(s._id)} style={{color: '#e53935', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem'}} title="Delete Student">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="13" style={{textAlign: 'center', padding: '20px', color: '#888'}}>No students found matching your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComputerStudentManager;