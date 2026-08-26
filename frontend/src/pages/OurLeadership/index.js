import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';
import '../../components/TablePagination/index.css';
import '../../components/TablePagination/index.css';
import '../../components/TablePagination/index.css';
import API_URL from '../../config/api';
import Spinner from '../../components/Spinner';

const MEMBERS_PER_PAGE = 8;

const OurLeadership = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${API_URL}/api/team`);
        if (!res.ok) throw new Error('Failed to fetch team data');
        const data = await res.json();
        setTeam(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const totalPages = Math.max(1, Math.ceil(team.length / MEMBERS_PER_PAGE));
  const currentMembers = team.slice((page - 1) * MEMBERS_PER_PAGE, page * MEMBERS_PER_PAGE);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  return (
    <div className="leadership-page">
      <div className="top-icons-wrapper" style={{ position: 'relative', width: '100%', height: '50px', marginBottom: '20px' }}>
        <div style={{ position: 'absolute', left: '0', top: '0', display: 'flex', gap: '15px' }}>
          <button onClick={() => navigate(-1)} className="icon-btn" title="Back"><i className="fas fa-arrow-left"></i></button>
          <Link to="/" className="icon-btn" title="Home"><i className="fas fa-home"></i></Link>
        </div>
      </div>

      <div className="leadership-header">
        <h2>Our <span className="highlight">Leadership</span></h2>
        <p>Meet the people guiding Grameena Vikas Sangham's mission.</p>
        <div className="title-underline"></div>
      </div>

      {loading && <Spinner text="Loading leadership team..." />}
      {error && <div className="error-state">{error}</div>}

      {!loading && !error && team.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-users-slash"></i>
          <p>Leadership details will be updated soon.</p>
        </div>
      )}

      {!loading && !error && team.length > 0 && (
        <>
          <div className="leadership-grid">
            {currentMembers.map((member) => (
              <div className="leadership-card" key={member._id}>
                <div className="member-photo">
                  <img src={member.photoUrl || 'https://via.placeholder.com/250x300?text=No+Photo'} alt={member.name} />
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p className="role">{member.role}</p>
                  {member.bio && <p className="bio">{member.bio}</p>}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="number-pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>&laquo; Prev</button>
              <div className="page-numbers">
                {pageNumbers.map(num => (
                  <button key={num} className={`num-btn ${page === num ? 'active-num' : ''}`} onClick={() => setPage(num)}>{num}</button>
                ))}
              </div>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next &raquo;</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OurLeadership;
