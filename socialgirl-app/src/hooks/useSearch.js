import { useCallback } from 'react';
import SearchService from '../services/searchService';

const searchService = new SearchService();

const useSearch = (platformData) => {
    const { setLoading, setVideosData, setUserVideosData } = platformData;

    const createSearchHandler = useCallback((platform) => {
        return async (query) => {
            if (!query.trim()) return;
            
            setLoading(platform, true);
            try {
                const videos = await searchService.search(platform, query);
                setVideosData(platform, videos);
                
                // Also generate user videos data by aggregating video data by creator
                const userVideos = await searchService.searchUserVideos(platform, query);
                setUserVideosData(platform, userVideos);
            } catch (error) {
                console.error(`${platform} search error:`, error);
            } finally {
                setLoading(platform, false);
            }
        };
    }, [setLoading, setVideosData, setUserVideosData]);

    return {
        handleYouTubeSearch: createSearchHandler('youtube'),
        handleTikTokSearch: createSearchHandler('tiktok'),
        handleInstagramSearch: createSearchHandler('instagram')
    };
};

export default useSearch;