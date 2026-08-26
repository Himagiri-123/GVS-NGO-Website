import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import './index.css';
import API_URL from '../../config/api';

const AboutPillars = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/home`);
        if (!res.ok) throw new Error('Failed to fetch home data');
        const data = await res.json();
        setHomeData(data);
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  useEffect(() => {
    if (!homeData || !homeData.carouselPhotos || homeData.carouselPhotos.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % homeData.carouselPhotos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [homeData]);

  const pillars = [
    // Renamed the card to "GVS Instructors" here
    { id: 1, title: "GVS Instructors", description: "Dedicated coordinators, computer teachers, and VVK instructors.", icon: "fas fa-graduation-cap", path: "/vvk-instructors" },
    { id: 2, title: "Govt Teachers", description: "Experienced educators providing guidance and training.", icon: "fas fa-school", path: "/govt-teachers" },
    { id: 3, title: "Caretakers", description: "Dedicated volunteers ensuring facility maintenance.", icon: "fas fa-home", path: "/caretakers" }
  ];

  const defaultImages = [
    '/images/IMG_20200320_162806.jpg',
    '/images/NULAKAJODU (12).jpg',
    '/images/1639050352122.jpg'
  ];

  const displayImages = homeData?.carouselPhotos?.length > 0 
    ? homeData.carouselPhotos.map(p => p.url) 
    : defaultImages;

  return (
    <div className="about-section" id="about">
      <div className="about-split-container">
        <div className="about-left">
          <h2>About Grameena Vikas Sangham</h2>
          <div className="title-underline-left"></div>
          
          <p>Grameena Vikas Sangham (GVS) was established in 2008 in Srikakulam. Founded by Shri K. Rajendra, GVS works for rural upliftment through various community-driven projects.</p>
          
          <p>We focus on holistic development by running night study centers,promoting eco-friendly practices, and offering free computer training to rural youth.</p>
          
          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #2e7d32', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div style={{ background: '#2e7d32', color: '#fff', padding: '10px', borderRadius: '50%' }}>
              <i className="fas fa-file-signature" style={{ fontSize: '1.2rem' }}></i>
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#1b5e20', fontSize: '1rem' }}>Govt. Registered NGO</h4>
              <p style={{ margin: 0, color: '#333', fontSize: '0.9rem', fontWeight: 'bold' }}>Regd. No: {homeData?.stats?.regdNo || 'CIT 2/80G/28/2009-10'}</p>
              <p style={{ margin: '2px 0 0 0', color: '#555', fontSize: '0.85rem' }}>Dated: {homeData?.stats?.regdDate || '08/06/2010'}</p>
            </div>
          </div>
          
          <div className="stats-container">
            <div className="stat-box">
              <h3>{homeData?.stats?.establishedYear || '2008'}</h3>
              <span>Established</span>
            </div>
            <div className="stat-box">
              <h3>{homeData?.stats?.villagesCount || '21+'}</h3>
              <span>Villages</span>
            </div>
            <div className="stat-box">
              <h3>{homeData?.stats?.impactCount || '770+'}</h3>
              <span>Impact</span>
            </div>
          </div>

          <Link to="/our-leadership" className="view-more-team-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px', background: '#1b5e20', color: '#fff', padding: '10px 22px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
            <i className="fas fa-users"></i> View More (Our Leadership)
          </Link>
        </div>

        <div className="about-right">
          <div className="image-carousel">
            {displayImages.map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt={`GVS Activity ${index + 1}`} 
                className={`carousel-img ${index === currentImage ? 'active' : ''}`} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="pillars-section">
        <h2 style={{ textAlign: 'center' }}>Our Pillars of Success</h2>
        <div className="title-underline" style={{ margin: '0 auto 40px auto' }}></div>
        <div className="pillars-grid">
          {pillars.map((pillar) => (
            <Link to={pillar.path} className="pillar-card modern-pillar" key={pillar.id} style={{ textDecoration: 'none' }}>
              <div className="pillar-icon"><i className={pillar.icon}></i></div>
              <div className="pillar-info">
                <h3 style={{ textAlign: 'center' }}>{pillar.title}</h3>
                <p style={{ color: '#555', lineHeight: '1.6', margin: '10px 0 0 0', textAlign: 'center' }}>{pillar.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPillars;