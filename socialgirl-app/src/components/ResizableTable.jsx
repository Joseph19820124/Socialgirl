import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import '../styles/components/Table.css';
import '../styles/components/ResizableTable.css';
import { formatNumber, getStatClass, calculateMinWidth } from '../utils/formatters';

const ResizableTable = ({ data, isLoading }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [sortedData, setSortedData] = useState(data);
    const [columnWidths, setColumnWidths] = useState({});
    const [isResizing, setIsResizing] = useState(false);
    const [resizeData, setResizeData] = useState(null);
    const tableRef = useRef(null);

    const columns = useMemo(() => [
        { key: 'username', label: '👤 Username', align: 'left' },
        { key: 'followers', label: '👥 Followers', align: 'right' },
        { key: 'title', label: '📝 Title', align: 'left' },
        { key: 'views', label: '👁️ Views', align: 'right' },
        { key: 'comments', label: '💬 Comments', align: 'right' },
        { key: 'likes', label: '❤️ Likes', align: 'right' },
        { key: 'shares', label: '🔄 Shares', align: 'right' },
        { key: 'url', label: '🔗 URL', align: 'center', sortable: false }
    ], []);

    useEffect(() => {
        setSortedData(data);
        // Initialize column widths based on content
        if (data.length > 0 && Object.keys(columnWidths).length === 0) {
            const initialWidths = {};
            columns.forEach(col => {
                initialWidths[col.key] = calculateMinWidth(col.label);
            });
            setColumnWidths(initialWidths);
        }
    }, [data, columnWidths, columns]);

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

    const handleMouseDown = useCallback((e, columnKey) => {
        e.preventDefault();
        setIsResizing(true);
        setResizeData({
            columnKey,
            startX: e.clientX,
            startWidth: columnWidths[columnKey] || calculateMinWidth(columns.find(col => col.key === columnKey)?.label || '')
        });
    }, [columnWidths, columns]);

    const handleMouseMove = useCallback((e) => {
        if (!isResizing || !resizeData) return;

        const deltaX = e.clientX - resizeData.startX;
        const newWidth = resizeData.startWidth + deltaX;
        const minWidth = calculateMinWidth(columns.find(col => col.key === resizeData.columnKey)?.label || '');
        const constrainedWidth = Math.max(newWidth, minWidth);

        setColumnWidths(prev => ({
            ...prev,
            [resizeData.columnKey]: constrainedWidth
        }));
    }, [isResizing, resizeData, columns]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        setResizeData(null);
    }, []);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    const getHeaderClass = (key) => {
        if (sortConfig.key === key) {
            return `sort-active sort-${sortConfig.direction}`;
        }
        return '';
    };

    const renderCellContent = (row, column) => {
        const value = row[column.key];
        
        switch (column.key) {
            case 'username':
                return <span className="username">{value}</span>;
            case 'followers':
                return (
                    <span className={`followers ${getStatClass(value, 'followers')} animated-stat stat-highlight`}>
                        {formatNumber(value)}
                    </span>
                );
            case 'title':
                return <span className="title">{value}</span>;
            case 'views':
                return (
                    <span className={`views ${getStatClass(value, 'views')} animated-stat`}>
                        {formatNumber(value)}
                    </span>
                );
            case 'comments':
                return (
                    <span className={`comments ${getStatClass(value, 'comments')} animated-stat`}>
                        {value}
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
                        {value}
                    </span>
                );
            case 'url':
                return <a href={value || '#'} className="watch-btn">Watch</a>;
            default:
                return value;
        }
    };

    if (isLoading) {
        return (
            <div className="table-wrapper">
                <table ref={tableRef}>
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} style={{ width: columnWidths[column.key] || 'auto' }}>
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
                                        <div className={`skeleton ${column.key}`}></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
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
                                    width: columnWidths[column.key] || 'auto',
                                    textAlign: column.align,
                                    cursor: column.sortable !== false ? 'pointer' : 'default'
                                }}
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
                    {sortedData.map((row, index) => (
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
    );
};

export default ResizableTable;