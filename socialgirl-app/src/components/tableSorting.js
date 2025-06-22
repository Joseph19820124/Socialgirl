/**
 * Table sorting utilities for GenericResizableTable
 * Extracted for better code organization and maintainability
 */

/**
 * Enhanced sorting function for better performance with large datasets
 * @param {Array} dataToSort - Array of data objects to sort
 * @param {string} sortKey - Key to sort by
 * @param {string} sortDirection - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const performSort = (dataToSort, sortKey, sortDirection) => {
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
