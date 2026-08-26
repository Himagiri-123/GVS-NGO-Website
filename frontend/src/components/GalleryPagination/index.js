import React, { useState } from 'react';
import '../TablePagination/index.css'; // reusing the same CSS as the table pagination

const GalleryPagination = ({ photos, photosPerPage = 6, onImageClick }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!photos || photos.length === 0) return null;

  const totalPages = Math.max(1, Math.ceil(photos.length / photosPerPage));
  const currentPhotos = photos.slice((currentPage - 1) * photosPerPage, currentPage * photosPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="gallery-section">
      <h3>Activity Gallery</h3>
      <div className="gallery-grid-3">
        {currentPhotos.map((photo, index) => (
          <div className="gallery-card" key={index} onClick={() => onImageClick(photo.url)}>
            <img src={photo.url} alt={photo.village} />
            <div className="gallery-caption">
              <i className="fas fa-map-marker-alt"></i> {photo.village}
            </div>
          </div>
        ))}
      </div>

      {/* Page numbers for the gallery too (1, 2, 3...) */}
      <div className="number-pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
          &laquo; Prev
        </button>
        
        <div className="page-numbers">
          {pageNumbers.map(number => (
            <button 
              key={number} 
              className={`num-btn ${currentPage === number ? 'active-num' : ''}`}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </button>
          ))}
        </div>

        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
          Next &raquo;
        </button>
      </div>
    </div>
  );
};

export default GalleryPagination;