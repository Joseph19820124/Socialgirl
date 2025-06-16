import React, { useState } from 'react';
import Tabs from './Tabs';
import SearchBar from './SearchBar';
import GenericResizableTable from './GenericResizableTable';
import { videosColumns, usersColumns, userVideosColumns, youtubeColumns, instagramColumns, tiktokColumns } from '../config/tableColumns';
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
                        columns={userVideosColumns}
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
                {onSearch && <SearchBar onSearch={onSearch} />}
                <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
            {renderTable()}
        </div>
    );
};

export default TableContainer;