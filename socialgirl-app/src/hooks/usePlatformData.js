import { useState } from 'react';

import { PLATFORM_LIST } from '../config/platforms';

const createInitialState = () => {
    const initialState = {};
    PLATFORM_LIST.forEach(platform => {
        initialState[platform.id] = {
            videosData: [],
            usersData: [],
            userVideosData: [],
            userPostsData: [],
            isLoading: false
        };
    });
    return initialState;
};

const usePlatformData = () => {
    const [platformData, setPlatformData] = useState(createInitialState());

    const updatePlatformData = (platform, updates) => {
        setPlatformData(prev => ({
            ...prev,
            [platform]: {
                ...prev[platform],
                ...updates
            }
        }));
    };

    const setData = (platform, dataType, data) => {
        updatePlatformData(platform, { [dataType]: data });
    };

    const setLoading = (platform, isLoading) => {
        updatePlatformData(platform, { isLoading });
    };

    const setVideosData = (platform, videosData) => {
        setData(platform, 'videosData', videosData);
    };

    const setUsersData = (platform, usersData) => {
        setData(platform, 'usersData', usersData);
    };

    const setUserVideosData = (platform, userVideosData) => {
        setData(platform, 'userVideosData', userVideosData);
    };

    const setUserPostsData = (platform, userPostsData) => {
        setData(platform, 'userPostsData', userPostsData);
    };

    const getPlatformData = (platform) => {
        return platformData[platform] || {
            videosData: [],
            usersData: [],
            userVideosData: [],
            userPostsData: [],
            isLoading: false
        };
    };

    const clearPlatformData = (platform) => {
        updatePlatformData(platform, {
            videosData: [],
            usersData: [],
            userVideosData: [],
            userPostsData: []
        });
    };

    return {
        platformData,
        updatePlatformData,
        setLoading,
        setVideosData,
        setUsersData,
        setUserVideosData,
        setUserPostsData,
        getPlatformData,
        clearPlatformData
    };
};

export default usePlatformData;