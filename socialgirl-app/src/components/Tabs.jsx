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
                        className={`aurora-btn ${activeTab === tab.id ? 'aurora-btn-primary' : 'aurora-btn-ghost'} aurora-btn-sm tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Tabs;