import React from 'react';
import '../styles/components/DataVisualization.css';

// Progress Bar Component
export const ProgressBar = ({ value, max = 100, className = '' }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const getPerformanceClass = (percent) => {
        if (percent >= 80) return 'performance-high';
        if (percent >= 60) return 'performance-medium-high';
        if (percent >= 40) return 'performance-medium';
        if (percent >= 20) return 'performance-low';
        return 'performance-very-low';
    };
    
    return (
        <div className={`progress-bar-container ${className}`}>
            <div 
                className={`progress-bar-fill ${getPerformanceClass(percentage)}`}
                style={{ width: `${percentage}%` }}
            />
            <span className="progress-value">{Math.round(percentage)}%</span>
        </div>
    );
};

// Stat Badge Component
export const StatBadge = ({ value, isHigh = false, showTrend = false, trend = 'neutral' }) => {
    return (
        <div className={`stat-badge ${isHigh ? 'high-value' : ''}`}>
            <span className="stat-badge-icon" />
            <span className="stat-badge-value">{value}</span>
            {showTrend && <TrendSparkline trend={trend} />}
        </div>
    );
};

// Trend Sparkline Component
export const TrendSparkline = ({ trend = 'neutral' }) => {
    const paths = {
        up: 'M2,14 L8,10 L14,12 L20,6 L26,8 L32,2 L38,4',
        down: 'M2,4 L8,6 L14,4 L20,10 L26,8 L32,14 L38,12',
        neutral: 'M2,8 L8,7 L14,9 L20,8 L26,9 L32,7 L38,8'
    };
    
    return (
        <div className={`trend-sparkline trend-${trend}`}>
            <svg viewBox="0 0 40 16">
                <path d={paths[trend] || paths.neutral} />
            </svg>
        </div>
    );
};

// Performance Ring Component
export const PerformanceRing = ({ value, max = 100, size = 40 }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - 4) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    
    const getStrokeColor = (percent) => {
        if (percent >= 80) return 'url(#gradient-high)';
        if (percent >= 60) return 'url(#gradient-medium-high)';
        if (percent >= 40) return 'url(#gradient-medium)';
        if (percent >= 20) return 'url(#gradient-low)';
        return 'url(#gradient-very-low)';
    };
    
    return (
        <div className="performance-ring" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <defs>
                    <linearGradient id="gradient-high" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00ff88" />
                        <stop offset="100%" stopColor="#92fe9d" />
                    </linearGradient>
                    <linearGradient id="gradient-medium-high" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#92fe9d" />
                        <stop offset="100%" stopColor="#ffb800" />
                    </linearGradient>
                    <linearGradient id="gradient-medium" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffb800" />
                        <stop offset="100%" stopColor="#ff8000" />
                    </linearGradient>
                    <linearGradient id="gradient-low" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff8000" />
                        <stop offset="100%" stopColor="#ff6b6b" />
                    </linearGradient>
                    <linearGradient id="gradient-very-low" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff6b6b" />
                        <stop offset="100%" stopColor="#ff0000" />
                    </linearGradient>
                </defs>
                <circle
                    className="performance-ring-bg"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                />
                <circle
                    className="performance-ring-progress"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getStrokeColor(percentage)}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <span className="performance-ring-value">{Math.round(percentage)}</span>
        </div>
    );
};