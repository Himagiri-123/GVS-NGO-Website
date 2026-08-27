import React, { useState, useEffect } from 'react';
import './index.css';
import API_URL from '../../config/api';
import NO_PHOTO_PLACEHOLDER from '../../config/noPhotoPlaceholder';

const OurTeam = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the staff list from the backend as soon as the page opens
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`${API_URL}/api/staff`);
        if (!response.ok) throw new Error('Failed to fetch team data');
        const data = await response.json();
        setTeam(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="our-team-page">
      <div className="team-header">
        <h2>Our <span className="highlight">Heroes</span></h2>
        <p>Meet the dedicated volunteers and staff behind GVS.</p>
        <div className="title-underline"></div>
      </div>

      {loading && <div className="loading-state"><i className="fas fa-spinner fa-spin"></i> Loading team members...</div>}
      {error && <div className="error-state">{error}</div>}

      {!loading && !error && team.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-users-slash"></i>
          <p>Team members will be updated soon.</p>
        </div>
      )}

      {!loading && !error && team.length > 0 && (
        <div className="team-grid">
          {team.map((member) => (
            <div className="team-card" key={member._id}>
              <div className="member-photo">
                <img src={member.photoUrl || NO_PHOTO_PLACEHOLDER} alt={member.name} />
              </div>
              <div className="member-info">
                <h3>{member.name}</h3>
                <p className="role">{member.role}</p>
                <p className="location"><i className="fas fa-map-marker-alt"></i> {member.location}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OurTeam;