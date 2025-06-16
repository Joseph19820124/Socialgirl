import React, { useState, useEffect } from 'react';
import { useColumnResize } from '../hooks/useColumnResize';
import { formatNumber, getStatClass } from '../utils/formatters';
import Pagination from './Pagination';
import '../styles/components/Table.css';
import '../styles/components/ResizableTable.css';
import '../styles/components/UsersTable.css';
import '../styles/performance.css';

const GenericResizableTable = ({ data, isLoading, columns, cellRenderers, skeletonComponents }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [sortedData, setSortedData] = useState(data);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const {
        columnWidths,
        resizedColumns,
        tableRef,
        handleMouseDown
    } = useColumnResize(columns);

    useEffect(() => {
        setSortedData(data);
        setCurrentPage(1); // Reset to first page when data changes
    }, [data]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        const sorted = [...sortedData].sort((a, b) => {
            if (typeof a[key] === 'string') {
                return direction === 'asc' 
                    ? a[key].toLowerCase().localeCompare(b[key].toLowerCase())
                    : b[key].toLowerCase().localeCompare(a[key].toLowerCase());
            }
            return direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
        });

        setSortedData(sorted);
        setSortConfig({ key, direction });
    };

    const getHeaderClass = (key) => {
        if (sortConfig.key === key) {
            return `sort-active sort-${sortConfig.direction}`;
        }
        return '';
    };

    const renderCellContent = (row, column) => {
        // Safety check for row and column
        if (!row || !column) {
            return '';
        }

        // Use custom renderer if provided
        if (cellRenderers && cellRenderers[column.key]) {
            return cellRenderers[column.key](row[column.key], row);
        }

        // Default rendering logic
        const value = row[column.key];
        
        switch (column.key) {
            case 'username':
                return <span className="username">{value || ''}</span>;
            case 'followers':
                return (
                    <span className={`followers ${getStatClass(value, 'followers')} animated-stat stat-highlight`}>
                        {formatNumber(value)}
                    </span>
                );
            case 'title':
                return <span className="title">{value || ''}</span>;
            case 'views':
                return (
                    <span className={`views ${getStatClass(value, 'views')} animated-stat`}>
                        {formatNumber(value)}
                    </span>
                );
            case 'comments':
                return (
                    <span className={`comments ${getStatClass(value, 'comments')} animated-stat`}>
                        {value || 0}
                    </span>
                );
            case 'likes':
                return (
                    <span className={`likes ${getStatClass(value, 'likes')} animated-stat`}>
                        {formatNumber(value)}
                    </span>
                );
            case 'shares':
                return (
                    <span className={`shares ${getStatClass(value, 'shares')} animated-stat`}>
                        {value || 0}
                    </span>
                );
            case 'media':
                return (
                    <span className={`media ${getStatClass(value, 'media')} animated-stat`}>
                        {formatNumber(value)}
                    </span>
                );
            case 'about':
                return <span className="about" title={value || ''}>{value || ''}</span>;
            case 'performance': {
                const getPerformanceClass = (score) => {
                    if (score >= 80) return 'performance-high';
                    if (score >= 60) return 'performance-medium-high';
                    if (score >= 40) return 'performance-medium';
                    if (score >= 20) return 'performance-low';
                    return 'performance-very-low';
                };
                
                return (
                    <span className={`performance-score ${getPerformanceClass(value)}`}>
                        {value}
                    </span>
                );
            }
            case 'videoCount':
                return (
                    <span className={`video-count ${getStatClass(value, 'videos')} animated-stat`}>
                        {formatNumber(value)}
                    </span>
                );
            case 'totalViews':
                return (
                    <span className={`total-views ${getStatClass(value, 'views')} animated-stat stat-highlight`}>
                        {formatNumber(value)}
                    </span>
                );
            case 'avgViews':
                return (
                    <span className={`avg-views ${getStatClass(value, 'views')} animated-stat`}>
                        {formatNumber(value)}
                    </span>
                );
            case 'totalLikes':
                return (
                    <span className={`total-likes ${getStatClass(value, 'likes')} animated-stat`}>
                        {formatNumber(value)}
                    </span>
                );
            case 'avgPerformance': {
                const getPerformanceClass = (score) => {
                    if (score >= 5) return 'performance-high';
                    if (score >= 3) return 'performance-medium-high';
                    if (score >= 2) return 'performance-medium';
                    if (score >= 1) return 'performance-low';
                    return 'performance-very-low';
                };
                
                return (
                    <span className={`performance-score ${getPerformanceClass(value)}`}>
                        {value}%
                    </span>
                );
            }
            case 'url': {
                // Determine button text and class based on table type
                const hasAboutColumn = columns.find(col => col.key === 'about');
                const hasVideoCountColumn = columns.find(col => col.key === 'videoCount');
                
                let buttonText, buttonClass;
                if (hasAboutColumn) {
                    buttonText = 'Visit';
                    buttonClass = 'visit-btn';
                } else if (hasVideoCountColumn) {
                    buttonText = 'Profile';
                    buttonClass = 'visit-btn';
                } else {
                    buttonText = 'Watch';
                    buttonClass = 'watch-btn';
                }
                
                return <a href={value || '#'} className={buttonClass} target="_blank" rel="noopener noreferrer">{buttonText}</a>;
            }
            default:
                return value;
        }
    };

    const renderSkeletonCell = (column) => {
        if (skeletonComponents && skeletonComponents[column.key]) {
            return skeletonComponents[column.key]();
        }
        return <div className={`skeleton ${column.key}`}></div>;
    };

    if (isLoading) {
        return (
            <div className="table-wrapper">
                <table ref={tableRef}>
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th 
                                    key={column.key} 
                                    className={`${column.key}-col`}
                                    data-column={column.key}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, index) => (
                            <tr key={index}>
                                {columns.map((column) => (
                                    <td key={column.key} className={`${column.key}-col`}>
                                        {renderSkeletonCell(column)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // Calculate paginated data
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            <div className="table-wrapper">
                <table ref={tableRef}>
                    <thead>
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={column.key}
                                    className={`${column.key}-col ${getHeaderClass(column.key)}`}
                                    onClick={column.sortable !== false ? () => handleSort(column.key) : undefined}
                                    style={{ 
                                        ...(resizedColumns.has(column.key) && { width: `${columnWidths[column.key]}px` }),
                                        textAlign: column.align,
                                        cursor: column.sortable !== false ? 'pointer' : 'default'
                                    }}
                                    data-column={column.key}
                                >
                                    {column.label}
                                    {index < columns.length - 1 && (
                                        <div
                                            className="resize-handle"
                                            onMouseDown={(e) => handleMouseDown(e, column.key)}
                                        />
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, index) => (
                            <tr key={index}>
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`${column.key}-col`}
                                        style={{ textAlign: column.align }}
                                    >
                                        {renderCellContent(row, column)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <Pagination
                currentPage={currentPage}
                totalItems={sortedData.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />
        </>
    );
};

export default GenericResizableTable;