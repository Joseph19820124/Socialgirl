import React from 'react';
import TableContainer from '../components/TableContainer';

const TikTokPage = ({ videosData, usersData, userVideosData, isLoading, onSearch }) => {
    return (
        <div className="platform-page">
            <TableContainer 
                videosData={videosData} 
                usersData={usersData} 
                userVideosData={userVideosData}
                isLoading={isLoading} 
                platform="tiktok"
                onSearch={onSearch}
            />
        </div>
    );
};

export default TikTokPage;