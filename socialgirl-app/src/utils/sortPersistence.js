/**
 * Utility functions for persisting sort preferences in localStorage
 */

const SORT_STORAGE_KEY_PREFIX = 'tableSortConfig';

/**
 * Get stored sort configuration for a table
 * @param {string} tableId - Unique identifier for the table
 * @returns {Object|null} Sort configuration or null if not found
 */
export function getStoredSortConfig(tableId) {
    try {
        const key = `${SORT_STORAGE_KEY_PREFIX}_${tableId}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.warn('Failed to retrieve stored sort config:', error);
        return null;
    }
}

/**
 * Store sort configuration for a table
 * @param {string} tableId - Unique identifier for the table
 * @param {Object} sortConfig - Sort configuration object
 */
export function storeSortConfig(tableId, sortConfig) {
    try {
        const key = `${SORT_STORAGE_KEY_PREFIX}_${tableId}`;
        localStorage.setItem(key, JSON.stringify(sortConfig));
    } catch (error) {
        console.warn('Failed to store sort config:', error);
    }
}

/**
 * Clear stored sort configuration for a table
 * @param {string} tableId - Unique identifier for the table
 */
export function clearStoredSortConfig(tableId) {
    try {
        const key = `${SORT_STORAGE_KEY_PREFIX}_${tableId}`;
        localStorage.removeItem(key);
    } catch (error) {
        console.warn('Failed to clear stored sort config:', error);
    }
}

/**
 * Get stored page size for a table
 * @param {string} tableId - Unique identifier for the table
 * @returns {number|null} Page size or null if not found
 */
export function getStoredPageSize(tableId) {
    try {
        const key = `${SORT_STORAGE_KEY_PREFIX}_pageSize_${tableId}`;
        const stored = localStorage.getItem(key);
        return stored ? parseInt(stored, 10) : null;
    } catch (error) {
        console.warn('Failed to retrieve stored page size:', error);
        return null;
    }
}

/**
 * Store page size for a table
 * @param {string} tableId - Unique identifier for the table
 * @param {number} pageSize - Page size to store
 */
export function storePageSize(tableId, pageSize) {
    try {
        const key = `${SORT_STORAGE_KEY_PREFIX}_pageSize_${tableId}`;
        localStorage.setItem(key, pageSize.toString());
    } catch (error) {
        console.warn('Failed to store page size:', error);
    }
}