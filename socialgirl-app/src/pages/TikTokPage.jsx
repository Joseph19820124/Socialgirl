import React from 'react';
import TableContainer from '../components/TableContainer';

const TikTokPage = ({ videosData, usersData, isLoading }) => {
    return (
        <div className="platform-page">
            <TableContainer 
                videosData={videosData} 
                usersData={usersData} 
                isLoading={isLoading} 
                platform="tiktok"
            />
        </div>
    );
};

export default TikTokPage;