import React from 'react';
import TableContainer from '../components/TableContainer';

const YouTubePage = ({ videosData, usersData, userVideosData, isLoading, onSearch }) => {
    return (
        <div className="platform-page">
            <TableContainer 
                videosData={videosData} 
                usersData={usersData} 
                userVideosData={userVideosData}
                isLoading={isLoading} 
                platform="youtube"
                onSearch={onSearch}
            />
        </div>
    );
};

export default YouTubePage;