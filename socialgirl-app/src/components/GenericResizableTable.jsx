import React, { useState, useEffect } from 'react';
import { useColumnResize } from '../hooks/useColumnResize';
import { getStoredSortConfig, storeSortConfig, getStoredPageSize, storePageSize } from '../utils/sortPersistence';
import Pagination from './Pagination';
import { performSort } from './tableSorting';
import { getHeaderClass, renderSkeletonCell } from './tableHelpers.jsx';
import { renderCellContent } from './tableCellRenderers.jsx';
import '../styles/components/Table.css';
import '../styles/components/DataVisualization.css';
import '../styles/performance.css';

const GenericResizableTable = ({ data, isLoading, columns, cellRenderers, skeletonComponents, tableId = 'default', onSelectionChange }) => {

    // Initialize sort config from localStorage or default
    const [sortConfig, setSortConfig] = useState(() => {
        const stored = getStoredSortConfig(tableId);
        return stored || { key: null, direction: null };
    });
    
    const [sortedData, setSortedData] = useState(data);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSorting, setIsSorting] = useState(false);
    const [selectedRows, setSelectedRows] = useState(new Set());
    
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



    useEffect(() => {
        let dataToSet = data || [];
        
        // Apply stored sort config if it exists and data is available
        if (dataToSet.length > 0 && sortConfig.key && sortConfig.direction) {
            dataToSet = performSort(dataToSet, sortConfig.key, sortConfig.direction);
        }
        
        setSortedData(dataToSet);
        setCurrentPage(1); // Reset to first page when data changes
        setSelectedRows(new Set()); // Clear selections when data changes
    }, [data, sortConfig.key, sortConfig.direction]);

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing page size
        storePageSize(tableId, newItemsPerPage); // Persist page size
    };

    const handleRowClick = (globalIndex) => {
        const newSelectedRows = new Set(selectedRows);
        if (newSelectedRows.has(globalIndex)) {
            newSelectedRows.delete(globalIndex);
        } else {
            newSelectedRows.add(globalIndex);
        }
        setSelectedRows(newSelectedRows);
        
        // Notify parent component of selection change
        if (onSelectionChange) {
            const selectedData = Array.from(newSelectedRows).map(index => sortedData[index]);
            onSelectionChange(selectedData);
        }
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








    // Calculate paginated data
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Determine if scroll is needed - only show scroll when there are more than 15 rows displayed
    const needsScroll = paginatedData.length > 15;



    if (isLoading) {
        return (
            <div className="table-wrapper">
                <table ref={tableRef} style={{ tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={column.key}
                                    className={`${column.key}-col ${getHeaderClass(column.key, sortConfig, isSorting)}`}
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
                        {[...Array(5)].map((_, index) => (
                            <tr key={index}>
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`${column.key}-col`}
                                        style={{ textAlign: column.align }}
                                    >
                                        {renderSkeletonCell(column, skeletonComponents)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    
    const wrapperClasses = `table-wrapper ${needsScroll ? 'needs-scroll' : ''}`;

    return (
        <>
            <div className={wrapperClasses}>
                <table ref={tableRef} style={{ tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={column.key}
                                    className={`${column.key}-col ${getHeaderClass(column.key, sortConfig, isSorting)}`}
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
                        {paginatedData.map((row, pageIndex) => {
                            const globalIndex = (currentPage - 1) * itemsPerPage + pageIndex;
                            const isSelected = selectedRows.has(globalIndex);
                            return (
                                <tr 
                                    key={pageIndex} 
                                    className={isSelected ? 'selected' : ''}
                                    onClick={() => handleRowClick(globalIndex)}
                                    style={isSelected ? { '--animation-delay': `${(globalIndex * 0.2) % 2}s` } : {}}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`${column.key}-col`}
                                            style={{ textAlign: column.align }}
                                        >
                                            {renderCellContent(row, column, columns, cellRenderers)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
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