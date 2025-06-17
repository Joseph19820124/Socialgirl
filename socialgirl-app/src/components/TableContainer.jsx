import React, { useState } from 'react';
import Tabs from './Tabs';
import SearchBar from './SearchBar';
import GenericResizableTable from './GenericResizableTable';
import { videosColumns, usersColumns, youtubeColumns, instagramColumns, tiktokColumns } from '../config/tableColumns';
import './TableContainer.css';

const TableContainer = ({ videosData, usersData, userVideosData = [], isLoading, platform = 'default', onSearch, onClearData }) => {
    const [activeTab, setActiveTab] = useState('videos');

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    const getVideoColumns = () => {
        switch (platform) {
            case 'youtube':
                return youtubeColumns;
            case 'instagram':
                return instagramColumns;
            case 'tiktok':
                return tiktokColumns;
            default:
                return videosColumns;
        }
    };

    const getSearchPlaceholder = () => {
        switch (activeTab) {
            case 'userVideos':
                return "Search user";
            case 'users':
                return "Search user";
            case 'videos':
            default:
                return "Search query";
        }
    };

    const renderTable = () => {
        switch (activeTab) {
            case 'videos':
                return (
                    <GenericResizableTable 
                        data={videosData} 
                        isLoading={isLoading} 
                        columns={getVideoColumns()}
                        tableId={`${platform}-videos`}
                    />
                );
            case 'userVideos':
                return (
                    <GenericResizableTable 
                        data={userVideosData} 
                        isLoading={isLoading} 
                        columns={getVideoColumns()}
                        tableId={`${platform}-userVideos`}
                    />
                );
            case 'users':
                return (
                    <GenericResizableTable 
                        data={usersData} 
                        isLoading={isLoading} 
                        columns={usersColumns}
                        tableId={`${platform}-users`}
                    />
                );
            default:
                return (
                    <GenericResizableTable 
                        data={videosData} 
                        isLoading={isLoading} 
                        columns={getVideoColumns()}
                        tableId={`${platform}-videos`}
                    />
                );
        }
    };

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            if (onClearData) {
                onClearData();
            }
        }
    };

    const getCurrentData = () => {
        switch (activeTab) {
            case 'videos':
                return videosData;
            case 'userVideos':
                return userVideosData;
            case 'users':
                return usersData;
            default:
                return videosData;
        }
    };

    const currentData = getCurrentData();
    const hasData = currentData && currentData.length > 0;

    return (
        <div className="table-container">
            <div className="search-tabs-row">
                {onSearch && <SearchBar onSearch={(query) => {
                    // Use the appropriate search handler based on active tab
                    if (activeTab === 'userVideos' && onSearch.userVideos) {
                        onSearch.userVideos(query);
                    } else if (onSearch.videos) {
                        onSearch.videos(query);
                    } else if (typeof onSearch === 'function') {
                        // Fallback for backwards compatibility
                        onSearch(query);
                    }
                }} placeholder={getSearchPlaceholder()} />}
                <div className="table-actions">
                    {hasData && onClearData && (
                        <button 
                            className="clear-btn"
                            onClick={handleClear}
                            title="Clear all data"
                        >
                            Clear
                        </button>
                    )}
                    <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
                </div>
            </div>
            {renderTable()}
        </div>
    );
};

export default TableContainer;