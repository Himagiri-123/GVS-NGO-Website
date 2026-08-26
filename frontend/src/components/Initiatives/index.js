import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const Initiatives = () => {
  // Added a 'slug' to every item (used in the URL)
  const initiativesData = [
    { id: 1, title: "Education", slug: "education", description: "Running Vidyarthi Vikasa Kendrams to provide quality education and moral values.", icon: "fas fa-book-reader" },
    { id: 2, title: "Health", slug: "health", description: "Providing clean drinking water and nutrition (Chikkis) to ensure rural health.", icon: "fas fa-heartbeat" },
    { id: 3, title: "Environment", slug: "environment", description: "Planting trees, building toilets, and promoting eco-friendly living practices.", icon: "fas fa-leaf" },
    { id: 4, title: "Skill Development", slug: "skill-development", description: "Free computer training centers to equip youth with modern digital skills.", icon: "fas fa-laptop" },
    { id: 5, title: "Spirituality", slug: "spirituality", description: "Conducting mass prayers, poojas, and instilling cultural values in the community.", icon: "fas fa-om" },
    { id: 6, title: "Agriculture", slug: "agriculture", description: "Supporting farmers through organic farming training and agricultural awareness.", icon: "fas fa-tractor" }
  ];

  return (
    <div className="initiatives-section" id="initiatives">
      <div className="initiatives-header">
        <h2>Our Initiatives</h2>
        <div className="title-underline"></div>
      </div>
      
      <div className="initiatives-grid modern-grid">
        {initiativesData.map((item) => (
          /* Turned the card into a Link */
          <Link to={`/initiative/${item.slug}`} className="initiative-card modern-card" key={item.id} style={{textDecoration: 'none'}}>
            <div className="icon-wrapper">
              <i className={item.icon}></i>
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="others-link-container">
        {/* Made the Others link go to the same dynamic page */}
        <Link to="/initiative/others" className="others-text-link">
          Others <i className="fas fa-arrow-right"></i>
        </Link>
      </div>
      
    </div>
  );
};

export default Initiatives;