import { useState, useCallback, useRef, useEffect } from 'react';

export const useColumnResize = (columns) => {
    const [columnWidths, setColumnWidths] = useState({});
    const [isResizing, setIsResizing] = useState(false);
    const [resizedColumns, setResizedColumns] = useState(new Set());
    
    // Performance optimization refs
    const rafId = useRef(null);
    const resizeData = useRef(null);
    const minWidthsCache = useRef({});
    const tableRef = useRef(null);

    // Predefined column widths that match our updated CSS
    const getPredefinedWidth = (columnKey) => {
        const widthMap = {
            // Shared columns (consistent across both tables)
            'username': 120,
            'followers': 100,
            'url': 85,
            
            // Videos table specific columns
            'title': 126, // Reduced by 30% from 180
            'views': 70,
            'comments': 70,
            'likes': 70,
            'shares': 70,
            'performance': 70,
            
            // Users table specific columns
            'about': 350,
            'media': 70,
            
            // User Videos aggregated columns
            'videoCount': 100,
            'totalViews': 120,
            'avgViews': 120,
            'totalLikes': 120,
            'avgPerformance': 100
        };
        return widthMap[columnKey] || 100; // Default to 100px if not defined
    };

    const getMinimumWidth = (columnKey) => {
        const minWidthMap = {
            // Shared columns
            'username': 90,
            'followers': 70,
            'url': 70,
            
            // Videos table specific columns
            'title': 126, // Reduced minimum to match new width
            'views': 70,
            'comments': 70,
            'likes': 70,
            'shares': 70,
            'performance': 70,
            
            // Users table specific columns
            'about': 250,
            'media': 70,
            
            // User Videos aggregated columns
            'videoCount': 70,
            'totalViews': 80,
            'avgViews': 80,
            'totalLikes': 80,
            'avgPerformance': 80
        };
        return minWidthMap[columnKey] || 60; // Default minimum
    };

    // Initialize minimum widths cache only, no initial widths
    useEffect(() => {
        const minWidths = {};
        
        columns.forEach(col => {
            minWidths[col.key] = getMinimumWidth(col.key);
        });
        
        minWidthsCache.current = minWidths;
        // Don't set initial columnWidths - let CSS handle default widths
        setColumnWidths({});
        setResizedColumns(new Set());
    }, [columns]);

    const handleMouseDown = useCallback((e, columnKey) => {
        e.preventDefault();
        setIsResizing(true);
        
        // Get current width from element, column config, or predefined width
        const column = columns.find(col => col.key === columnKey);
        const currentWidth = columnWidths[columnKey] || column?.width || getPredefinedWidth(columnKey);
        
        // Cache resize data
        resizeData.current = {
            columnKey,
            startX: e.clientX,
            startWidth: currentWidth,
            minWidth: minWidthsCache.current[columnKey]
        };

        // Immediate visual feedback
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        
        // Add resizing class for CSS optimizations
        if (tableRef.current) {
            tableRef.current.classList.add('resizing');
        }
    }, [columnWidths, columns]);

    const handleMouseMove = useCallback((e) => {
        if (!isResizing || !resizeData.current) return;

        // Cancel previous animation frame
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
        }

        // Throttle updates using requestAnimationFrame
        rafId.current = requestAnimationFrame(() => {
            const { columnKey, startX, startWidth, minWidth } = resizeData.current;
            const deltaX = e.clientX - startX;
            const newWidth = Math.max(startWidth + deltaX, minWidth);

            // Apply width immediately via CSS custom property for instant feedback
            if (tableRef.current) {
                const header = tableRef.current.querySelector(`th[data-column="${columnKey}"]`);
                if (header) {
                    header.style.width = `${newWidth}px`;
                }
            }

            // Update cached width for smooth continuation
            resizeData.current.currentWidth = newWidth;
        });
    }, [isResizing]);

    const handleMouseUp = useCallback(() => {
        if (!isResizing || !resizeData.current) return;

        // Cancel any pending animation frames
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
        }

        // Commit final width to React state
        const { columnKey, currentWidth } = resizeData.current;
        if (currentWidth !== undefined) {
            setColumnWidths(prev => ({
                ...prev,
                [columnKey]: currentWidth
            }));
            // Mark this column as manually resized
            setResizedColumns(prev => new Set([...prev, columnKey]));
        }

        // Cleanup
        setIsResizing(false);
        resizeData.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        if (tableRef.current) {
            tableRef.current.classList.remove('resizing');
        }
    }, [isResizing]);

    // Event listeners management
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove, { passive: true });
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
            }
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return {
        columnWidths,
        resizedColumns,
        isResizing,
        tableRef,
        handleMouseDown,
        minWidthsCache: minWidthsCache.current
    };
};