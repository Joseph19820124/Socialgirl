/**
 * Table helper utilities for GenericResizableTable
 * Extracted for better code organization and maintainability
 */
import React from 'react';

/**
 * Get CSS classes for table header based on sort state
 * @param {string} key - Column key
 * @param {Object} sortConfig - Current sort configuration
 * @param {boolean} isSorting - Whether sorting is in progress
 * @returns {string} CSS class string
 */
export const getHeaderClass = (key, sortConfig, isSorting) => {
    let classes = '';
    if (sortConfig.key === key) {
        classes = `sort-active sort-${sortConfig.direction}`;
    }
    if (isSorting && sortConfig.key === key) {
        classes += ' sorting';
    }
    return classes;
};

/**
 * Render skeleton cell for loading state
 * @param {Object} column - Column configuration
 * @param {Object} skeletonComponents - Custom skeleton components
 * @returns {JSX.Element} Skeleton cell element
 */
export const renderSkeletonCell = (column, skeletonComponents) => {
    if (skeletonComponents && skeletonComponents[column.key]) {
        return skeletonComponents[column.key]();
    }
    return <div className={`skeleton ${column.key}`}></div>;
};
