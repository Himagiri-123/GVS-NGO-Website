import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../VvkInstructors/index.css'; // reusing the VVK CSS
import API_URL from '../../config/api';
import { calculateExperience } from '../../config/calculateExperience';

const GovtTeachers = () => {
  const navigate = useNavigate();
  const [coordinators, setCoordinators] = useState([]);
  const [mandalData, setMandalData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${API_URL}/api/staff`);
        const data = await res.json();
        
        // 1. Filter only the active 'Govt Teacher' entries
        const activeTeachers = data.filter(s => s.status === 'active' && s.category === 'Govt Teacher');

        // 2. Separate out those with "Advisor", "Coordinator", "Head" in their title
        const coords = activeTeachers.filter(s => 
          s.role.toLowerCase().includes('advisor') || 
          s.role.toLowerCase().includes('head') ||
          s.role.toLowerCase().includes('coordinator')
        );
        const insts = activeTeachers.filter(s => 
          !(s.role.toLowerCase().includes('advisor') || 
            s.role.toLowerCase().includes('head') ||
            s.role.toLowerCase().includes('coordinator'))
        );

        setCoordinators(coords);

        // 3. Group the rest by mandal and village
        const grouped = {};
        insts.forEach(inst => {
          const m = inst.mandal || 'Other Mandals';
          const v = inst.village || 'Other Villages';
          if (!grouped[m]) grouped[m] = {};
          if (!grouped[m][v]) grouped[m][v] = [];
          grouped[m][v].push(inst);
        });
        setMandalData(grouped);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchTeam();
  }, []);

  return (
    <div className="team-page">
      <div className="top-icons">
        <button onClick={() => navigate(-1)} className="icon-btn" title="Back"><i className="fas fa-arrow-left"></i></button>
        <Link to="/" className="icon-btn" title="Home"><i className="fas fa-home"></i></Link>
      </div>

      <div className="team-header">
        <h1>Govt Teachers</h1>
        <p>Experienced educators providing valuable guidance and training</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem', color: '#1b5e20' }}>Loading Team...</div>
      ) : (
        <div className="team-container">
          
          {coordinators.length > 0 && (
            <div className="coordinators-section">
              <h2>Advisory Board & Heads</h2>
              <div className="coordinators-grid">
                {coordinators.map(coord => (
                  <div className="coord-card" key={coord._id}>
                    <div className="coord-icon"><i className="fas fa-chalkboard-teacher"></i></div>
                    {coord.photoUrl && <img src={coord.photoUrl} alt={coord.name} style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px', objectFit: 'cover' }} />}
                    <div>
                      <h3>{coord.name}</h3>
                      <span className="coord-role">{coord.role}</span>
                      <p className="coord-details"><i className="fas fa-graduation-cap"></i> {coord.qualification}</p> 
                      <p className="coord-details"><i className="fas fa-briefcase"></i> {coord.joinDate ? calculateExperience(coord.joinDate) : (coord.experience || 'N/A')}</p> 
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="split-layout">
            {Object.keys(mandalData).map(mandal => (
              <div className="mandal-column" key={mandal}>
                <h2 className="mandal-title">{mandal}</h2>
                
                {Object.keys(mandalData[mandal]).map(village => (
                  <div className="village-group" key={village}>
                    <h3 className="village-name"><i className="fas fa-map-marker-alt"></i> {village}</h3>
                    <div className="team-grid">
                      
                      {mandalData[mandal][village].map(person => (
                        <div className="team-card" key={person._id}>
                          {person.photoUrl && <img src={person.photoUrl} alt={person.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />}
                          <div style={{ padding: '15px' }}>
                            <h4>{person.name}</h4>
                            <p><i className="fas fa-graduation-cap"></i> {person.qualification}</p>
                            <p><i className="fas fa-briefcase"></i> {person.joinDate ? calculateExperience(person.joinDate) : (person.experience || 'N/A')}</p>
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

export default GovtTeachers;