import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useDialog } from '../contexts/DialogContext';
import SearchService from '../services/searchService';

const searchService = new SearchService();

const useSearch = (platformData) => {
    const { setLoading, setVideosData, setUserVideosData, setUsersData, setUserPostsData } = platformData;
    const { showSuccessToast, showErrorToast } = useToast();
    const { showAlert } = useDialog();

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
                
                // Show success toast with result count
                const resultCount = Array.isArray(data) ? data.length : 0;
                showSuccessToast(resultCount);
            } catch (error) {
                console.error(`${platform} search error:`, error);
                
                // Check if it's an API key error
                if (error.message.includes('API key not found') || 
                    error.message.includes('RapidAPI key not found')) {
                    showErrorToast(error.message);
                } else if (activeTab === 'userPosts' || activeTab === 'userVideos') {
                    // Show user-friendly error message for other errors
                    const tabName = activeTab === 'userVideos' ? 'User Videos' : 'User Posts';
                    if (error.message.includes('json')) {
                        showAlert(`${tabName}: This user may have a private account or no popular posts available.`, 'OK');
                    } else {
                        showAlert(`${tabName} Error: ${error.message}`, 'OK');
                    }
                } else {
                    // For general video/user search errors that aren't API key related
                    showErrorToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} search failed: ${error.message}`);
                }
            } finally {
                setLoading(platform, false);
            }
        };
    }, [setLoading, setVideosData, setUserVideosData, setUsersData, setUserPostsData, showSuccessToast, showErrorToast, showAlert]);

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