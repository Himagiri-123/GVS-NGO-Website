import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './index.css';
import API_URL from '../../config/api';

const VolunteerManager = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVolunteers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/volunteers`);
      const data = await res.json();
      setVolunteers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this volunteer application?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete!'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${API_URL}/api/volunteers/${id}`, { method: 'DELETE' });
        fetchVolunteers();
        Swal.fire('Deleted!', 'Application has been removed.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to delete application', 'error');
      }
    }
  };

  // To display the date in the correct format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="volunteer-manager-container fade-in">
      <div className="manager-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2><i className="fas fa-hands-helping"></i> Volunteer Applications</h2>
        <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
          Total Received: {volunteers.length}
        </div>
      </div>

      <div className="data-card">
        <h3 style={{ marginBottom: '20px', color: '#d94f00' }}><i className="fas fa-list"></i> New Requests</h3>
        
        {loading ? (
          <div style={{textAlign: 'center', padding: '30px'}}><i className="fas fa-spinner fa-spin fa-2x"></i></div>
        ) : (
          <div className="table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th style={{width: '50px'}}>S.No</th>
                  <th style={{width: '150px'}}>Date</th>
                  <th style={{width: '180px'}}>Applicant Name</th>
                  <th style={{width: '120px'}}>Phone No</th>
                  <th style={{width: '150px'}}>Village / Town</th>
                  <th>Reason / Skills</th>
                  <th style={{width: '80px', textAlign: 'center'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.length > 0 ? (
                  volunteers.map((vol, index) => (
                    <tr key={vol._id}>
                      <td style={{fontWeight: 'bold', textAlign: 'center'}}>{index + 1}</td>
                      <td style={{fontSize: '0.9rem', color: '#555'}}>{formatDate(vol.createdAt)}</td>
                      <td style={{fontWeight: 'bold', color: '#1b5e20'}}>{vol.name}</td>
                      <td style={{fontWeight: 'bold'}}><i className="fas fa-phone-alt" style={{color:'#888', fontSize:'0.8rem'}}></i> {vol.phone}</td>
                      <td>{vol.village}</td>
                      <td style={{fontStyle: 'italic', fontSize: '0.95rem'}}>{vol.reason}</td>
                      <td style={{textAlign: 'center'}}>
                        <button onClick={() => handleDelete(vol._id)} className="icon-btn delete-btn" style={{color: '#d32f2f', background:'none', border:'none', cursor:'pointer'}} title="Delete Application">
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" style={{textAlign: 'center', padding: '30px', color: '#888'}}>No volunteer applications found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerManager;