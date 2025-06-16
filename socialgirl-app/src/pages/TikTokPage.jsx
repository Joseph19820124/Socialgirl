import React from 'react';
import TableContainer from '../components/TableContainer';

const TikTokPage = ({ videosData, usersData, isLoading, onSearch }) => {
    return (
        <div className="platform-page">
            <TableContainer 
                videosData={videosData} 
                usersData={usersData} 
                isLoading={isLoading} 
                platform="tiktok"
                onSearch={onSearch}
            />
        </div>
    );
};

export default TikTokPage;