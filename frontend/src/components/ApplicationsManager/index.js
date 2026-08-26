import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // for alerts
import './index.css';
import API_URL from '../../config/api';

const ApplicationsManager = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State for storing batch numbers
  const [batchInputs, setBatchInputs] = useState({}); 

  const fetchApplications = async () => {
    try {
      const infoStr = localStorage.getItem('userInfo') || localStorage.getItem('staffInfo');
      const userInfo = JSON.parse(infoStr);
      
      const response = await fetch(`${API_URL}/api/applications`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      if (!response.ok) throw new Error('Error fetching data.');
      const data = await response.json();
      
      // Only show applications that are still 'Pending' (approved ones disappear)
      const pendingApps = data.filter(app => app.status === 'Pending');
      setApplications(pendingApps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Function to allocate a batch and approve
  const handleApprove = async (id, studentName) => {
    const batchNo = batchInputs[id];
    if (!batchNo) {
      return Swal.fire('Error', 'Please enter the batch number! (Ex: Batch 1)', 'error');
    }

    try {
      const infoStr = localStorage.getItem('userInfo') || localStorage.getItem('staffInfo');
      const userInfo = JSON.parse(infoStr);
      const response = await fetch(`${API_URL}/api/applications/${id}/approve`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}` 
        },
        body: JSON.stringify({ batchNumber: batchNo })
      });

      if (response.ok) {
        Swal.fire('Success!', `${studentName} batch allocation placeholder - handled separately`, 'success');
        // Refresh the list after approving (so it disappears from the pending list)
        fetchApplications(); 
      } else {
        Swal.fire('Error', 'Approval failed, please try again.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Server error.', 'error');
    }
  };

  return (
    <div className="applications-manager">
      <div className="manager-header">
        <h2><i className="fas fa-file-signature"></i> Kalam Dreams Applications</h2>
        <p>List of all pending applications waiting for batch allocation.</p>
      </div>

      {loading && <div style={{ padding: '20px', color: '#1b5e20' }}><i className="fas fa-spinner fa-spin"></i> Loading Applications...</div>}
      {error && <div style={{ padding: '20px', color: 'red', background: '#ffebee', borderRadius: '5px' }}>{error}</div>}

      {!loading && !error && (
        <div className="table-responsive" style={{ marginTop: '20px', background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student Name</th>
                <th>Education</th>
                <th>Village</th>
                <th>Phone</th>
                <th>Allocate Batch</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app._id}>
                    <td>{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontWeight: 'bold' }}>{app.studentName}</td>
                    <td>{app.education}</td>
                    <td>{app.village}</td>
                    <td><a href={`tel:${app.phoneNumber}`} style={{ color: '#1b5e20', textDecoration: 'none' }}><i className="fas fa-phone-alt"></i> {app.phoneNumber}</a></td>
                    {/* Input for entering the batch number */}
                    <td>
                      <input 
                        type="text" 
                        placeholder="Ex: Batch 1" 
                        value={batchInputs[app._id] || ''} 
                        onChange={(e) => setBatchInputs({...batchInputs, [app._id]: e.target.value})}
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100px' }}
                      />
                    </td>
                    {/* Approve button */}
                    <td>
                      <button 
                        onClick={() => handleApprove(app._id, app.studentName)}
                        style={{ background: '#1b5e20', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    No pending applications right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManager;