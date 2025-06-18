import React from 'react';
import '../styles/components/Pagination.css';

const Pagination = ({ 
    currentPage, 
    totalItems, 
    itemsPerPage, 
    onPageChange,
    onItemsPerPageChange,
    pageSizeOptions = [15, 25, 50, 100]
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1 && !onItemsPerPageChange) return null;
    
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
            <div className="pagination-left">
                {onItemsPerPageChange && (
                    <div className="pagination-page-size">
                        <label htmlFor="page-size-select">Show:</label>
                        <select 
                            id="page-size-select"
                            value={itemsPerPage} 
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="page-size-select"
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <span>per page</span>
                    </div>
                )}
            </div>
            
            <div className="pagination-center">
                {totalItems > 0 && (
                    <div className="pagination-info">
                        Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                    </div>
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="pagination-controls">
                <button
                    className="aurora-btn aurora-btn-subtle aurora-btn-sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    ‹ Prev
                </button>
                
                {getPageNumbers().map(page => (
                    <button
                        key={page}
                        className={`aurora-btn aurora-btn-sm ${page === currentPage ? 'aurora-btn-primary' : 'aurora-btn-subtle'}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}
                
                <button
                    className="aurora-btn aurora-btn-subtle aurora-btn-sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next ›
                </button>
                </div>
            )}
        </div>
    );
};

export default Pagination;