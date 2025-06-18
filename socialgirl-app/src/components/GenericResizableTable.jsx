import React, { useState, useEffect } from 'react';
import { useColumnResize } from '../hooks/useColumnResize';
import { formatNumber, getStatClass } from '../utils/formatters';
import { getStoredSortConfig, storeSortConfig, getStoredPageSize, storePageSize } from '../utils/sortPersistence';
import Pagination from './Pagination';
import { ProgressBar, StatBadge, PerformanceRing } from './DataVisualization';
import '../styles/components/Table.css';
import '../styles/components/DataVisualization.css';
import '../styles/performance.css';

const GenericResizableTable = ({ data, isLoading, columns, cellRenderers, skeletonComponents, tableId = 'default' }) => {
    // Initialize sort config from localStorage or default
    const [sortConfig, setSortConfig] = useState(() => {
        const stored = getStoredSortConfig(tableId);
        return stored || { key: null, direction: null };
    });
    
    const [sortedData, setSortedData] = useState(data);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSorting, setIsSorting] = useState(false);
    
    // Initialize page size from localStorage or default
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const stored = getStoredPageSize(tableId);
        return stored || 15;
    });
    
    const {
        columnWidths,
        resizedColumns,
        tableRef,
        handleMouseDown
    } = useColumnResize(columns);

    // Enhanced sorting function for better performance with large datasets
    const performSort = (dataToSort, sortKey, sortDirection) => {
        if (!dataToSort || !sortKey || !sortDirection) return dataToSort;
        
        // Performance optimization: Use a more efficient sort for large datasets
        const dataArray = Array.isArray(dataToSort) ? dataToSort : [];
        
        // For very large datasets (>1000 items), consider chunked sorting
        
        return [...dataArray].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];
            
            // Handle null/undefined values - put them at the end
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;
            
            // Handle string values
            if (typeof aValue === 'string' || typeof bValue === 'string') {
                const aStr = String(aValue).toLowerCase();
                const bStr = String(bValue).toLowerCase();
                return sortDirection === 'asc' 
                    ? aStr.localeCompare(bStr)
                    : bStr.localeCompare(aStr);
            }
            
            // Handle numeric values
            const aNum = Number(aValue);
            const bNum = Number(bValue);
            
            // If both are valid numbers
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
            }
            
            // Fallback to string comparison
            const aStr = String(aValue).toLowerCase();
            const bStr = String(bValue).toLowerCase();
            return sortDirection === 'asc' 
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr);
        });
    };

    useEffect(() => {
        let dataToSet = data || [];
        
        // Apply stored sort config if it exists and data is available
        if (dataToSet.length > 0 && sortConfig.key && sortConfig.direction) {
            dataToSet = performSort(dataToSet, sortConfig.key, sortConfig.direction);
        }
        
        setSortedData(dataToSet);
        setCurrentPage(1); // Reset to first page when data changes
    }, [data, sortConfig.key, sortConfig.direction]);

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing page size
        storePageSize(tableId, newItemsPerPage); // Persist page size
    };

    const handleSort = (key) => {
        // Don't allow sorting if already sorting
        if (isSorting) return;
        
        setIsSorting(true);
        
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        // For large datasets, use setTimeout to prevent UI blocking
        const dataSize = (data || []).length;
        const sortDelay = dataSize > 500 ? 50 : 0; // Add small delay for large datasets
        
        setTimeout(() => {
            requestAnimationFrame(() => {
                try {
                    // Sort the complete dataset instead of just the current page
                    const sorted = performSort(data || [], key, direction);

                    setSortedData(sorted);
                    const newSortConfig = { key, direction };
                    setSortConfig(newSortConfig);
                    storeSortConfig(tableId, newSortConfig); // Persist sort config
                    setCurrentPage(1); // Reset to first page after sorting
                } catch (error) {
                    console.error('Error during sorting:', error);
                    // On error, maintain current data but update sort config
                    const newSortConfig = { key, direction };
                    setSortConfig(newSortConfig);
                    storeSortConfig(tableId, newSortConfig);
                } finally {
                    setIsSorting(false);
                }
            });
        }, sortDelay);
    };

    const getHeaderClass = (key) => {
        let classes = '';
        if (sortConfig.key === key) {
            classes = `sort-active sort-${sortConfig.direction}`;
        }
        if (isSorting && sortConfig.key === key) {
            classes += ' sorting';
        }
        return classes;
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
                // Use StatBadge for high follower counts
                if (value > 100000) {
                    return <StatBadge value={formatNumber(value)} isHigh={true} />;
                }
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
                // Use ProgressBar for performance visualization
                return <ProgressBar value={value || 0} max={100} />;
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
                // Use PerformanceRing for average performance visualization
                return <PerformanceRing value={value || 0} max={10} size={40} />;
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
                                        cursor: column.sortable !== false ? (isSorting ? 'wait' : 'pointer') : 'default'
                                    }}
                                    data-column={column.key}
                                    title={column.sortable !== false ? `Click to sort by ${column.label}` : undefined}
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
                onItemsPerPageChange={handleItemsPerPageChange}
            />
        </>
    );
};

export default GenericResizableTable;