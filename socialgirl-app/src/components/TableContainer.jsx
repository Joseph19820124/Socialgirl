import React, { useState } from 'react';
import Tabs from './Tabs';
import SearchBar from './SearchBar';
import GenericResizableTable from './GenericResizableTable';
import YouTubeSettingsDialog from './YouTubeSettingsDialog';
import { videosColumns, usersColumns } from '../config/tableColumns';
import { PLATFORMS } from '../config/platforms';
import '../styles/components/TableContainer.css';

const TableContainer = ({ videosData, usersData, userVideosData = [], isLoading, platform = 'default', onSearch, onClearData, onSettingsChange }) => {
    const [activeTab, setActiveTab] = useState('videos');
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);

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
                <div className="search-with-settings">
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
                    {platform === 'youtube' && activeTab === 'videos' && (
                        <button 
                            className="settings-btn"
                            onClick={() => setShowSettingsDialog(true)}
                            title="Search Settings"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M20.5 12C20.5 11.5 20.45 11.05 20.4 10.6L22.25 9.15C22.45 9 22.5 8.7 22.4 8.45L20.6 5.05C20.5 4.85 20.2 4.75 19.95 4.85L17.75 5.7C17.25 5.35 16.7 5.05 16.1 4.85L15.75 2.5C15.7 2.25 15.5 2 15.2 2H11.6C11.35 2 11.1 2.25 11.05 2.5L10.7 4.85C10.15 5.05 9.6 5.35 9.1 5.7L6.9 4.85C6.65 4.75 6.35 4.85 6.25 5.05L4.45 8.45C4.35 8.65 4.4 8.95 4.6 9.1L6.45 10.55C6.4 11.05 6.35 11.5 6.35 12C6.35 12.5 6.4 12.95 6.45 13.45L4.6 14.9C4.4 15.05 4.35 15.35 4.45 15.55L6.25 18.95C6.35 19.15 6.65 19.25 6.9 19.15L9.1 18.3C9.6 18.65 10.15 18.95 10.75 19.15L11.1 21.5C11.15 21.75 11.4 22 11.7 22H15.3C15.55 22 15.8 21.75 15.85 21.5L16.2 19.15C16.75 18.95 17.3 18.65 17.8 18.3L20 19.15C20.25 19.25 20.55 19.15 20.65 18.95L22.45 15.55C22.55 15.35 22.5 15.05 22.3 14.9L20.45 13.45C20.45 12.95 20.5 12.5 20.5 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    )}
                </div>
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
            {platform === 'youtube' && (
                <YouTubeSettingsDialog 
                    isOpen={showSettingsDialog}
                    onClose={() => setShowSettingsDialog(false)}
                    onSettingsChange={(settings) => {
                        if (onSettingsChange) {
                            onSettingsChange(settings);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default TableContainer;