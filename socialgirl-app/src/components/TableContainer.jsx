import React, { useState } from 'react';
import Tabs from './Tabs';
import GenericResizableTable from './GenericResizableTable';
import { videosColumns, usersColumns, youtubeColumns, instagramColumns, tiktokColumns } from '../config/tableColumns';

const TableContainer = ({ videosData, usersData, isLoading, platform = 'default' }) => {
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
            <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
            {renderTable()}
        </div>
    );
};

export default TableContainer;