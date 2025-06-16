import React from 'react';
import TableContainer from '../components/TableContainer';

const YouTubePage = ({ videosData, usersData, isLoading, onSearch }) => {
    return (
        <div className="platform-page">
            <TableContainer 
                videosData={videosData} 
                usersData={usersData} 
                isLoading={isLoading} 
                platform="youtube"
                onSearch={onSearch}
            />
        </div>
    );
};

export default YouTubePage;