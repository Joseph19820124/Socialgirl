import React from 'react';
import TableContainer from '../components/TableContainer';

const YouTubePage = ({ videosData, usersData, isLoading }) => {
    return (
        <div className="platform-page">
            <TableContainer 
                videosData={videosData} 
                usersData={usersData} 
                isLoading={isLoading} 
                platform="youtube"
            />
        </div>
    );
};

export default YouTubePage;