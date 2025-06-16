import React from 'react';
import TableContainer from '../components/TableContainer';

const InstagramPage = ({ videosData, usersData, isLoading, onSearch }) => {
    return (
        <div className="platform-page">
            <TableContainer 
                videosData={videosData} 
                usersData={usersData} 
                isLoading={isLoading} 
                platform="instagram"
                onSearch={onSearch}
            />
        </div>
    );
};

export default InstagramPage;