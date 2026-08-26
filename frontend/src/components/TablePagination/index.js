import React, { useState } from 'react';
import './index.css';

const TablePagination = ({ headers, rows, rowsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!rows || rows.length === 0) return null;

  // Calculate total pages (at least 1 page)
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const currentRows = rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Array for displaying page numbers (1, 2, 3...)
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="table-pagination-container">
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              {headers.map((h, i) => <th key={i}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((r, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(r).map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination numbers render here */}
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

export default TablePagination;