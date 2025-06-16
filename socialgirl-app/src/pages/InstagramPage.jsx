import React from 'react';
import TableContainer from '../components/TableContainer';

const InstagramPage = ({ videosData, usersData, isLoading }) => {
    return (
        <div className="platform-page">
            <TableContainer 
                videosData={videosData} 
                usersData={usersData} 
                isLoading={isLoading} 
                platform="instagram"
            />
        </div>
    );
};

export default InstagramPage;