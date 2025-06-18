import React from 'react';
import '../styles/components/Tabs.css';

const Tabs = ({ activeTab, onTabChange, platform = 'default' }) => {
    const getTabsForPlatform = (platform) => {
        const baseTabs = [
            { id: 'videos', label: 'Videos' },
            { id: 'userVideos', label: 'User Videos' }
        ];

        if (platform === 'tiktok' || platform === 'instagram' || platform === 'youtube') {
            return baseTabs;
        }

        return [
            ...baseTabs,
            { id: 'users', label: 'Users' }
        ];
    };

    const tabs = getTabsForPlatform(platform);

    return (
        <div className="tabs-container">
            <div className="tabs-wrapper">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Tabs;