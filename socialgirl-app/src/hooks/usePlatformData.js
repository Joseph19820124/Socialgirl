import { useState } from 'react';

const usePlatformData = () => {
    const [platformData, setPlatformData] = useState({
        youtube: {
            videosData: [],
            usersData: [],
            userVideosData: [],
            isLoading: false
        },
        instagram: {
            videosData: [],
            usersData: [],
            userVideosData: [],
            isLoading: false
        },
        tiktok: {
            videosData: [],
            usersData: [],
            userVideosData: [],
            isLoading: false
        }
    });

    const updatePlatformData = (platform, updates) => {
        setPlatformData(prev => ({
            ...prev,
            [platform]: {
                ...prev[platform],
                ...updates
            }
        }));
    };

    const setLoading = (platform, isLoading) => {
        updatePlatformData(platform, { isLoading });
    };

    const setVideosData = (platform, videosData) => {
        updatePlatformData(platform, { videosData });
    };

    const setUsersData = (platform, usersData) => {
        updatePlatformData(platform, { usersData });
    };

    const setUserVideosData = (platform, userVideosData) => {
        updatePlatformData(platform, { userVideosData });
    };

    const getPlatformData = (platform) => {
        return platformData[platform] || { videosData: [], usersData: [], userVideosData: [], isLoading: false };
    };

    const clearPlatformData = (platform) => {
        updatePlatformData(platform, {
            videosData: [],
            usersData: [],
            userVideosData: []
        });
    };

    return {
        platformData,
        updatePlatformData,
        setLoading,
        setVideosData,
        setUsersData,
        setUserVideosData,
        getPlatformData,
        clearPlatformData
    };
};

export default usePlatformData;