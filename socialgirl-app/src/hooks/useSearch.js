import { useCallback } from 'react';
import SearchService from '../services/searchService';

const searchService = new SearchService();

const useSearch = (platformData) => {
    const { setLoading, setVideosData, setUserVideosData, setUsersData } = platformData;

    const createSearchHandler = useCallback((platform, activeTab = 'videos') => {
        return async (query) => {
            if (!query.trim()) return;
            
            setLoading(platform, true);
            try {
                const context = { activeTab };
                const data = await searchService.search(platform, query, context);
                
                if (activeTab === 'userVideos') {
                    setUserVideosData(platform, data);
                } else if (activeTab === 'users') {
                    setUsersData(platform, data);
                } else {
                    setVideosData(platform, data);
                }
            } catch (error) {
                console.error(`${platform} search error:`, error);
            } finally {
                setLoading(platform, false);
            }
        };
    }, [setLoading, setVideosData, setUserVideosData, setUsersData]);

    // Create separate handlers for videos, users, and user videos
    const createPlatformHandlers = useCallback((platform) => {
        return {
            videos: createSearchHandler(platform, 'videos'),
            users: createSearchHandler(platform, 'users'),
            userVideos: createSearchHandler(platform, 'userVideos')
        };
    }, [createSearchHandler]);

    return {
        handleYouTubeSearch: createPlatformHandlers('youtube'),
        handleTikTokSearch: createPlatformHandlers('tiktok'),
        handleInstagramSearch: createPlatformHandlers('instagram')
    };
};

export default useSearch;