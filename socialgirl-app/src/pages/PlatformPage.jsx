import React from 'react';
import TableContainer from '../components/TableContainer';

const PlatformPage = ({ 
    videosData, 
    usersData, 
    userVideosData, 
    userPostsData,
    isLoading, 
    platform,
    onSearch, 
    onClearData 
}) => {
    return (
        <div className="platform-page">
            <TableContainer 
                videosData={videosData} 
                usersData={usersData} 
                userVideosData={userVideosData}
                userPostsData={userPostsData}
                isLoading={isLoading} 
                platform={platform}
                onSearch={onSearch}
                onClearData={onClearData}
            />
        </div>
    );
};

export default PlatformPage;