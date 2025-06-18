import { useCallback } from 'react';
import SearchService from '../services/searchService';

const searchService = new SearchService();

const useSearch = (platformData) => {
    const { setLoading, setVideosData, setUserVideosData, setUsersData, setUserPostsData } = platformData;

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
                } else if (activeTab === 'userPosts') {
                    setUserPostsData(platform, data);
                } else {
                    setVideosData(platform, data);
                }
            } catch (error) {
                console.error(`${platform} search error:`, error);
                
                // Show user-friendly error message
                if (activeTab === 'userPosts' || activeTab === 'userVideos') {
                    const tabName = activeTab === 'userVideos' ? 'User Videos' : 'User Posts';
                    if (error.message.includes('json')) {
                        alert(`${tabName}: This user may have a private account or no popular posts available.`);
                    } else {
                        alert(`${tabName} Error: ${error.message}`);
                    }
                }
            } finally {
                setLoading(platform, false);
            }
        };
    }, [setLoading, setVideosData, setUserVideosData, setUsersData, setUserPostsData]);

    // Create separate handlers for videos, users, user videos, and user posts
    const createPlatformHandlers = useCallback((platform) => {
        return {
            videos: createSearchHandler(platform, 'videos'),
            users: createSearchHandler(platform, 'users'),
            userVideos: createSearchHandler(platform, 'userVideos'),
            userPosts: createSearchHandler(platform, 'userPosts')
        };
    }, [createSearchHandler]);

    return {
        handleYouTubeSearch: createPlatformHandlers('youtube'),
        handleTikTokSearch: createPlatformHandlers('tiktok'),
        handleInstagramSearch: createPlatformHandlers('instagram')
    };
};

export default useSearch;