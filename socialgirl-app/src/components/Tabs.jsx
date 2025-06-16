import React from 'react';
import '../styles/components/Tabs.css';

const Tabs = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'videos', label: 'Videos', icon: '🎬' },
        { id: 'users', label: 'Users', icon: '👥' }
    ];

    return (
        <div className="tabs-container">
            <div className="tabs-wrapper">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Tabs;