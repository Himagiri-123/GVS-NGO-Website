import React from 'react';
import './index.css';

// Reusable loading spinner. Use this everywhere instead of a blank screen
// while data is being fetched from the API.
const Spinner = ({ text = 'Loading...' }) => {
  return (
    <div className="gvs-spinner-wrapper">
      <div className="gvs-spinner"></div>
      {text && <p className="gvs-spinner-text">{text}</p>}
    </div>
  );
};

export default Spinner;
