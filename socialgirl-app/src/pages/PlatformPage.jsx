import React from 'react';
import TableContainer from '../components/TableContainer';

const PlatformPage = ({ 
    videosData, 
    usersData, 
    userVideosData, 
    isLoading, 
    platform,
    onSearch, 
    onClearData,
    onSettingsChange 
}) => {
    return (
        <div className="platform-page">
            <TableContainer 
                videosData={videosData} 
                usersData={usersData} 
                userVideosData={userVideosData}
                isLoading={isLoading} 
                platform={platform}
                onSearch={onSearch}
                onClearData={onClearData}
                onSettingsChange={onSettingsChange}
            />
        </div>
    );
};

export default PlatformPage;