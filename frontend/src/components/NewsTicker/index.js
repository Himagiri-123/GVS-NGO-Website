import React, { useState, useEffect } from 'react';
import './index.css';
import API_URL from '../../config/api';

const NewsTicker = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${API_URL}/api/news`);
        if (response.ok) {
          const data = await response.json();
          setNews(data);
        }
      } catch (err) {
        console.error("Failed to load news", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatLink = (url) => {
    if (!url) return '#';
    let cleanUrl = url.trim();
    return cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
  };

  // Robust function to open the link whether the ticker is paused or moving
  const handleLinkClick = (e, url) => {
    e.preventDefault(); 
    window.open(formatLink(url), '_blank', 'noopener,noreferrer'); 
  };

  if (loading || news.length === 0) return null;

  return (
    <div className="news-ticker-container">
      <div className="ticker-label">
        <i className="fas fa-bell"></i> Latest Updates
      </div>
      
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {news.map((item, index) => (
            <span key={item._id} className="ticker-item">
              <i className="fas fa-hand-point-right"></i> 
              
              {/* Using onMouseDown instead of onClick — works reliably */}
              {item.link ? (
                <a 
                  href={formatLink(item.link)} 
                  onMouseDown={(e) => handleLinkClick(e, item.link)} 
                  className="news-link"
                >
                  {item.text}
                </a>
              ) : (
                <span>{item.text}</span>
              )}
            </span>
          ))}
          
          {news.map((item, index) => (
            <span key={`dup-${item._id}`} className="ticker-item">
              <i className="fas fa-hand-point-right"></i> 
              
              {/* Using onMouseDown here too */}
              {item.link ? (
                <a 
                  href={formatLink(item.link)} 
                  onMouseDown={(e) => handleLinkClick(e, item.link)} 
                  className="news-link"
                >
                  {item.text}
                </a>
              ) : (
                <span>{item.text}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;