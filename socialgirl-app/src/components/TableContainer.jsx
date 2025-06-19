import React, { useState } from 'react';
import Tabs from './Tabs';
import SearchBar from './SearchBar';
import GenericResizableTable from './GenericResizableTable';
import { videosColumns, usersColumns } from '../config/tableColumns';
import { PLATFORMS } from '../config/platforms';
import '../styles/components/TableContainer.css';

const TableContainer = ({ videosData, usersData, userVideosData = [], isLoading, platform = 'default', onSearch, onClearData }) => {
    const [activeTab, setActiveTab] = useState('videos');

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    const getVideoColumns = () => {
        const platformConfig = PLATFORMS[platform];
        return platformConfig?.columns || videosColumns;
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

    const getTableData = () => {
        switch (activeTab) {
            case 'userVideos':
                return userVideosData;
            case 'users':
                return usersData;
            case 'videos':
            default:
                return videosData;
        }
    };

    const getTableColumns = () => {
        return activeTab === 'users' ? usersColumns : getVideoColumns();
    };

    const renderTable = () => {
        return (
            <GenericResizableTable 
                key={activeTab}
                data={getTableData()} 
                isLoading={isLoading} 
                columns={getTableColumns()}
                tableId={`${platform}-${activeTab}`}
            />
        );
    };

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            if (onClearData) {
                onClearData();
            }
        }
    };

    const handleExportJSON = () => {
        const data = getTableData();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `${platform}-${activeTab}-${timestamp}.json`;
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportCSV = () => {
        const data = getTableData();
        const columns = getTableColumns();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `${platform}-${activeTab}-${timestamp}.csv`;
        
        // Create CSV header
        const headers = columns.map(col => col.label).join(',');
        
        // Create CSV rows
        const rows = data.map(item => {
            return columns.map(col => {
                const value = item[col.key];
                // Handle values that might contain commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value || '';
            }).join(',');
        });
        
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const currentData = getTableData();
    const hasData = currentData && currentData.length > 0;

    return (
        <div className="table-container">
            <div className="search-tabs-row">
                {onSearch && <SearchBar onSearch={(query) => {
                    // Use the appropriate search handler based on active tab
                    if (activeTab === 'userVideos' && onSearch.userVideos) {
                        onSearch.userVideos(query);
                    } else if (activeTab === 'users' && onSearch.users) {
                        onSearch.users(query);
                    } else if (onSearch.videos) {
                        onSearch.videos(query);
                    } else if (typeof onSearch === 'function') {
                        // Fallback for backwards compatibility
                        onSearch(query);
                    }
                }} placeholder={getSearchPlaceholder()} />}
                <div className="table-actions">
                    {hasData && (
                        <>
                            <button 
                                className="aurora-btn aurora-btn-primary aurora-btn-sm"
                                onClick={handleExportJSON}
                                title="Export data as JSON"
                            >
                                Export JSON
                            </button>
                            <button 
                                className="aurora-btn aurora-btn-secondary aurora-btn-sm"
                                onClick={handleExportCSV}
                                title="Export data as CSV"
                            >
                                Export CSV
                            </button>
                        </>
                    )}
                    {hasData && onClearData && (
                        <button 
                            className="aurora-btn aurora-btn-danger aurora-btn-sm"
                            onClick={handleClear}
                            title="Clear all data"
                        >
                            Clear
                        </button>
                    )}
                    <Tabs activeTab={activeTab} onTabChange={handleTabChange} platform={platform} />
                </div>
            </div>
            {renderTable()}
        </div>
    );
};

export default TableContainer;