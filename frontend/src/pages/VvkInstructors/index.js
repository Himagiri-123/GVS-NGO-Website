import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';
import API_URL from '../../config/api';

const VvkInstructors = () => {
  const navigate = useNavigate();
  const [coordinators, setCoordinators] = useState([]);
  const [mandalData, setMandalData] = useState({});
  const [computerFaculty, setComputerFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${API_URL}/api/staff`);
        const data = await res.json();
        
        const activeStaff = data.filter(s => s.status === 'active' && (s.category === 'VVK Instructor' || s.category === 'Coordinator'));
        const coords = activeStaff.filter(s => s.category === 'Coordinator' || s.role.toLowerCase().includes('coordinator') || s.role.toLowerCase().includes('head'));
        const insts = activeStaff.filter(s => !(s.category === 'Coordinator' || s.role.toLowerCase().includes('coordinator') || s.role.toLowerCase().includes('head')));
        
        setCoordinators(coords);

        const grouped = {};
        insts.forEach(inst => {
          const m = inst.mandal || 'Other Mandals';
          const v = inst.village || 'Other Villages';
          if (!grouped[m]) grouped[m] = {};
          if (!grouped[m][v]) grouped[m][v] = [];
          grouped[m][v].push(inst);
        });
        setMandalData(grouped);

        const compFaculty = data.filter(s => s.status === 'active' && s.category === 'Computer Teacher');
        setComputerFaculty(compFaculty);

      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchTeam();
  }, []);

  return (
    <div className="team-page">
      <div className="top-icons">
        <button onClick={() => navigate(-1)} className="icon-btn"><i className="fas fa-arrow-left"></i></button>
        <Link to="/" className="icon-btn"><i className="fas fa-home"></i></Link>
      </div>

      <div className="exp-cert-btn-wrapper">
        <Link
          to="/experience-certificate"
          className="exp-cert-btn-link"
        >
          <i className="fas fa-certificate"></i> Experience Certificate
        </Link>
      </div>

      <div className="team-header">
        <h1>GVS INSTRUCTORS</h1>
        {/* Updated the paragraph here to be more inclusive */}
        <p>Our dedicated team of Coordinators, Computer Teachers, and VVK Instructors working together to empower rural students and shape their bright futures.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem', color: '#1b5e20' }}>Loading Team...</div>
      ) : (
        <div className="team-container">
          
          {coordinators.length > 0 && (
            <div className="coordinators-section">
              <h2>Mandal Coordinators</h2>
              <div className="coordinators-grid">
                {coordinators.map(coord => (
                  <div className="coord-card" key={coord._id}>
                    {coord.photoUrl && <img src={coord.photoUrl} alt={coord.name} style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px', objectFit: 'cover' }} />}
                    <div>
                      <h3>{coord.name}</h3>
                      <span className="coord-role">{coord.role}</span>
                      <p className="coord-details" style={{ color: '#1b5e20', fontWeight: 'bold', marginTop: '5px' }}>
                        <i className="fas fa-map-marker-alt"></i> {coord.mandal || 'GVS'} Mandal
                      </p>
                      <p className="coord-details"><i className="fas fa-graduation-cap"></i> {coord.qualification}</p> 
                      <p className="coord-details"><i className="fas fa-briefcase"></i> {coord.experience}</p> 
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {computerFaculty.length > 0 && (
            <div className="coordinators-section" style={{ marginTop: '40px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <h2 style={{ color: '#047857' }}><i className="fas fa-laptop-code"></i> Computer Faculty</h2>
              <p style={{ textAlign: 'center', marginBottom: '20px', color: '#065f46' }}>Empowering rural youth with digital skills.</p>
              
              <div className="coordinators-grid">
                {computerFaculty.map(faculty => (
                  <div className="coord-card" key={faculty._id} style={{ borderTop: '4px solid #10b981' }}>
                    {faculty.photoUrl ? (
                      <img src={faculty.photoUrl} alt={faculty.name} style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px', objectFit: 'cover', border: '2px solid #34d399' }} />
                    ) : (
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#d1fae5', margin: '0 auto 10px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <i className="fas fa-laptop" style={{ color: '#059669', fontSize: '2rem' }}></i>
                      </div>
                    )}
                    <div>
                      <h3 style={{ color: '#064e3b' }}>{faculty.name}</h3>
                      <span className="coord-role" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #6ee7b7' }}>{faculty.role === 'computer_teacher' ? 'Computer Faculty' : faculty.role}</span>
                      <p className="coord-details" style={{ color: '#047857', fontWeight: 'bold', marginTop: '8px' }}>
                        <i className="fas fa-map-marker-alt"></i> {faculty.village} Center
                      </p>
                      <p className="coord-details"><i className="fas fa-graduation-cap"></i> {faculty.qualification}</p> 
                      <p className="coord-details"><i className="fas fa-briefcase"></i> {faculty.experience}</p> 
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="split-layout">
            {Object.keys(mandalData).map(mandal => (
              <div className="mandal-column" key={mandal}>
                <h2 className="mandal-title">VVk instructors {mandal}</h2>
                
                {Object.keys(mandalData[mandal]).map(village => (
                  <div className="village-group" key={village}>
                    <h3 className="village-name"><i className="fas fa-map-marker-alt"></i> {village}</h3>
                    <div className="team-grid">
                      
                      {mandalData[mandal][village].map(person => (
                        <div className="team-card" key={person._id}>
                          {person.photoUrl && <img src={person.photoUrl} alt={person.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />}
                          <div style={{ padding: '15px' }}>
                            <h4>{person.name}</h4>
                            
                            {/* Added "VVK Instructor" inside the card */}
                            <p style={{ color: '#d94f00', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>
                              VVK Instructor
                            </p>
                            
                            <p><i className="fas fa-graduation-cap"></i> {person.qualification}</p>
                            <p><i className="fas fa-briefcase"></i> {person.experience}</p>
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default VvkInstructors;