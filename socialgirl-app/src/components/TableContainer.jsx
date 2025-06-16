import React, { useState } from 'react';
import Tabs from './Tabs';
import SearchBar from './SearchBar';
import GenericResizableTable from './GenericResizableTable';
import { videosColumns, usersColumns, youtubeColumns, instagramColumns, tiktokColumns } from '../config/tableColumns';
import './TableContainer.css';

const TableContainer = ({ videosData, usersData, userVideosData = [], isLoading, platform = 'default', onSearch }) => {
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
                    />
                );
            case 'userVideos':
                return (
                    <GenericResizableTable 
                        data={userVideosData} 
                        isLoading={isLoading} 
                        columns={getVideoColumns()}
                    />
                );
            case 'users':
                return (
                    <GenericResizableTable 
                        data={usersData} 
                        isLoading={isLoading} 
                        columns={usersColumns}
                    />
                );
            default:
                return (
                    <GenericResizableTable 
                        data={videosData} 
                        isLoading={isLoading} 
                        columns={getVideoColumns()}
                    />
                );
        }
    };

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
                <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
            {renderTable()}
        </div>
    );
};

export default TableContainer;