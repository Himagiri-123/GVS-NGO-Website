import React, { useState, useEffect } from 'react';
import './index.css'; 
import API_URL from '../../config/api';
import NO_PHOTO_PLACEHOLDER from '../../config/noPhotoPlaceholder';

const SuccessStories = () => {
  // Dummy data: shown when there's no data in admin yet
  const dummyStories = [
    {
      _id: "dummy1",
      name: "Student Name 1",
      village: "Ghanasara",
      achievement: "Secured IT Job at MNC",
      quote: "GVS Computer Center changed my life. The free computer training helped me develop skills and secure a job in the IT sector.",
      image: NO_PHOTO_PLACEHOLDER
    },
    {
      _id: "dummy2",
      name: "Student Name 2",
      village: "Kadumu",
      achievement: "Completed Higher Education",
      quote: "The VVK night study centers and nutrition food provided by GVS helped me focus on my studies without health issues.",
      image: NO_PHOTO_PLACEHOLDER
    },
    {
      _id: "dummy3",
      name: "Student Name 3",
      village: "Other Village",
      achievement: "Started Own Business",
      quote: "GVS guidance and support helped me become self-reliant. I started a small business and am now able to support my family.",
      image: NO_PHOTO_PLACEHOLDER
    },
    {
      _id: "dummy4",
      name: "Student Name 4",
      village: "Kadumu",
      achievement: "Got Government Job",
      quote: "The competitive exam coaching at VVK helped me clear the entrance. Now I have a government job. Thank you GVS.",
      image: NO_PHOTO_PLACEHOLDER
    }
  ];

  // Show dummy data first
  const [stories, setStories] = useState(dummyStories);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(350); 

  // Function to fetch data from the backend
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/success-stories`);
        if (res.ok) {
          const data = await res.json();
          // Only replace with real stories if the database has some, otherwise keep dummy data
          if (data && data.length > 0) {
            setStories(data);
          }
        }
      } catch (err) {
        console.error("Error fetching success stories:", err);
      }
    };
    fetchStories();
  }, []);

  // Auto-calculate based on screen size
  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth <= 768) {
        setCardWidth(330); 
      } else {
        setCardWidth(350); 
      }
    };

    updateWidth(); 
    window.addEventListener('resize', updateWidth); 
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const nextStory = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % stories.length);
  };

  const prevStory = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + stories.length) % stories.length);
  };

  useEffect(() => {
    if (stories.length <= 1) return; 
    const intervalId = setInterval(nextStory, 4000); 
    return () => clearInterval(intervalId);
  }, [stories.length]);

  return (
    <div className="success-section" id="success-stories">
      <h2 style={{ textAlign: 'center', color: '#1b5e20', fontSize: '2.5rem', margin: '0 0 10px 0' }}>Success Stories</h2>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: '30px' }}>Inspiring journeys of our students from rural villages.</p>
      <div className="title-underline" style={{ margin: '0 auto 40px auto', width: '80px', height: '4px', background: '#d94f00' }}></div>
      
      <div className="carousel-container">
        
        <button className="carousel-control prev" onClick={prevStory}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="carousel-control next" onClick={nextStory}>
          <i className="fas fa-chevron-right"></i>
        </button>
        
        <div className="stories-track" style={{ 
            transform: `translateX(calc(50% - ${cardWidth / 2}px - ${currentIndex * cardWidth}px))` 
        }}>
          {stories.map((story, index) => (
            <div key={story._id || index} className={`story-card ${index === currentIndex ? 'active' : ''}`}>
              <div className="story-img-container">
                <img src={story.image || NO_PHOTO_PLACEHOLDER} alt={story.name} />
              </div>
              
              <i className="fas fa-quote-left quote-icon"></i>
              
              <p className="story-quote">"{story.quote}"</p>
              
              <div className="story-info">
                <h3>{story.name}</h3>
                <p className="village-name">{story.village}</p>
                <p className="achievement">{story.achievement}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SuccessStories;