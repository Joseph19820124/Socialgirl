import React from 'react';
import '../styles/components/Pagination.css';

const Pagination = ({ 
    currentPage, 
    totalItems, 
    itemsPerPage, 
    onPageChange 
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return null;
    
    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5; // Show 5 page numbers max
        
        let start = Math.max(1, currentPage - Math.floor(showPages / 2));
        let end = Math.min(totalPages, start + showPages - 1);
        
        // Adjust start if we're near the end
        if (end - start + 1 < showPages) {
            start = Math.max(1, end - showPages + 1);
        }
        
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        
        return pages;
    };
    
    return (
        <div className="pagination">
            <div className="pagination-info">
                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </div>
            
            <div className="pagination-controls">
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    ‹ Prev
                </button>
                
                {getPageNumbers().map(page => (
                    <button
                        key={page}
                        className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}
                
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next ›
                </button>
            </div>
        </div>
    );
};

export default Pagination;