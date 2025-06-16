import { useCallback } from 'react';
import SearchService from '../services/searchService';

const searchService = new SearchService();

const useSearch = (platformData) => {
    const { setLoading, setVideosData, setUserVideosData } = platformData;

    const createSearchHandler = useCallback((platform, activeTab = 'videos') => {
        return async (query) => {
            if (!query.trim()) return;
            
            setLoading(platform, true);
            try {
                const context = { activeTab };
                const videos = await searchService.search(platform, query, context);
                
                if (activeTab === 'userVideos') {
                    setUserVideosData(platform, videos);
                } else {
                    setVideosData(platform, videos);
                }
            } catch (error) {
                console.error(`${platform} search error:`, error);
            } finally {
                setLoading(platform, false);
            }
        };
    }, [setLoading, setVideosData, setUserVideosData]);

    // Create separate handlers for videos and user videos
    const createPlatformHandlers = useCallback((platform) => {
        return {
            videos: createSearchHandler(platform, 'videos'),
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