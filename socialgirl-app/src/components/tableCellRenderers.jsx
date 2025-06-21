/**
 * Table cell rendering utilities for GenericResizableTable
 * Extracted for better code organization and maintainability
 */
import React from 'react';
import { formatNumber, getStatClass } from '../utils/formatters';
import { ProgressBar, StatBadge, PerformanceRing } from './DataVisualization';
import AuroraTooltip from './AuroraTooltip';

/**
 * Render cell content based on column type and data
 * @param {Object} row - Data row object
 * @param {Object} column - Column configuration
 * @param {Array} columns - All columns (for context-dependent rendering)
 * @param {Object} cellRenderers - Custom cell renderers
 * @returns {JSX.Element|string} Rendered cell content
 */
export const renderCellContent = (row, column, columns, cellRenderers) => {
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
            return (
                <AuroraTooltip content={value}>
                    <span className="username">{value || ''}</span>
                </AuroraTooltip>
            );
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
            return (
                <AuroraTooltip content={value}>
                    <span className="title">{value || ''}</span>
                </AuroraTooltip>
            );
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
            return (
                <AuroraTooltip content={value}>
                    <span className="about">{value || ''}</span>
                </AuroraTooltip>
            );
        case 'published': {
            // Format the published date
            if (!value) return '';
            const date = new Date(value);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let displayText;
            if (diffDays === 1) {
                displayText = '1 day ago';
            } else if (diffDays < 7) {
                displayText = `${diffDays} days ago`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                displayText = weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
            } else if (diffDays < 365) {
                const months = Math.floor(diffDays / 30);
                displayText = months === 1 ? '1 month ago' : `${months} months ago`;
            } else {
                const years = Math.floor(diffDays / 365);
                displayText = years === 1 ? '1 year ago' : `${years} years ago`;
            }

            return (
                <AuroraTooltip content={date.toLocaleDateString()}>
                    <span className="published">{displayText}</span>
                </AuroraTooltip>
            );
        }
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
