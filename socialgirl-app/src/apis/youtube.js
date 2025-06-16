import { getApiKey } from '../utils/apiKeyManager';
import { trackOperation, canPerformOperation } from '../utils/quotaManager';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Get API key from storage or environment
async function getYouTubeApiKey() {
    return await getApiKey('youtubeApiKey', 'VITE_YOUTUBE_API_KEY');
}

/**
 * Fetch video data from YouTube API
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} Video data response
 */
async function getVideoData(videoId) {
    if (!canPerformOperation('youtube', 'videos')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    const apiKey = await getYouTubeApiKey();
    if (!apiKey) {
        throw new Error('YouTube API key not found. Please configure it in Settings.');
    }
    const url = `${BASE_URL}/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        trackOperation('youtube', 'videos');
        return await response.json();
    } catch (error) {
        console.error('Error fetching YouTube video data:', error);
        throw error;
    }
}

/**
 * Fetch channel data from YouTube API
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<Object>} Channel data response
 */
async function getChannelData(channelId) {
    if (!canPerformOperation('youtube', 'channels')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    const apiKey = await getYouTubeApiKey();
    if (!apiKey) {
        throw new Error('YouTube API key not found. Please configure it in Settings.');
    }
    const url = `${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        trackOperation('youtube', 'channels');
        return await response.json();
    } catch (error) {
        console.error('Error fetching YouTube channel data:', error);
        throw error;
    }
}

/**
 * Search for videos by query
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum results to return (default: 10)
 * @returns {Promise<Object>} Search results
 */
async function searchVideos(query, maxResults = 10) {
    if (!canPerformOperation('youtube', 'search')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    const apiKey = await getYouTubeApiKey();
    if (!apiKey) {
        throw new Error('YouTube API key not found. Please configure it in Settings.');
    }
    
    // Calculate date 7 days ago
    const publishedAfter = new Date();
    publishedAfter.setDate(publishedAfter.getDate() - 7);
    const publishedAfterISO = publishedAfter.toISOString();
    
    const url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=viewCount&publishedAfter=${publishedAfterISO}&maxResults=${maxResults}&key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        trackOperation('youtube', 'search');
        return await response.json();
    } catch (error) {
        console.error('Error searching YouTube videos:', error);
        throw error;
    }
}

/**
 * Fetch statistics for multiple videos
 * @param {Array<string>} videoIds - Array of video IDs
 * @returns {Promise<Object>} Videos with statistics
 */
async function getVideosStatistics(videoIds) {
    if (!videoIds || videoIds.length === 0) {
        return { items: [] };
    }
    
    if (!canPerformOperation('videos')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    const apiKey = await getYouTubeApiKey();
    if (!apiKey) {
        throw new Error('YouTube API key not found. Please configure it in Settings.');
    }
    
    const url = `${BASE_URL}/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        trackOperation('youtube', 'videos');
        return await response.json();
    } catch (error) {
        console.error('Error fetching YouTube videos statistics:', error);
        throw error;
    }
}

/**
 * Get channel ID from channel handle (@username)
 * @param {string} handle - Channel handle (with or without @)
 * @returns {Promise<string|null>} Channel ID or null if not found
 */
async function getChannelByHandle(handle) {
    if (!canPerformOperation('youtube', 'search')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    const apiKey = await getYouTubeApiKey();
    if (!apiKey) {
        throw new Error('YouTube API key not found. Please configure it in Settings.');
    }
    
    // Clean handle - remove @ if present and trim whitespace
    const cleanHandle = handle.replace('@', '').trim();
    if (!cleanHandle) {
        throw new Error('Invalid channel handle provided.');
    }
    
    // Search for the channel by handle
    const url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(cleanHandle)}&type=channel&maxResults=1&key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        trackOperation('youtube', 'search');
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            return data.items[0].id.channelId;
        }
        
        return null;
    } catch (error) {
        console.error('Error finding YouTube channel:', error);
        throw error;
    }
}

/**
 * Fetch recent videos from a channel
 * @param {string} channelId - YouTube channel ID
 * @param {number} maxResults - Maximum results to return (default: 20)
 * @returns {Promise<Object>} Channel videos response
 */
async function getChannelVideos(channelId, maxResults = 20) {
    if (!canPerformOperation('youtube', 'search')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    const apiKey = await getYouTubeApiKey();
    if (!apiKey) {
        throw new Error('YouTube API key not found. Please configure it in Settings.');
    }
    
    // Search for videos from the specific channel, ordered by date (most recent first)
    const url = `${BASE_URL}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        trackOperation('youtube', 'search');
        const searchData = await response.json();
        
        // Get video IDs to fetch statistics
        const videoIds = searchData.items
            .map(item => item.id?.videoId)
            .filter(id => id);
        
        if (videoIds.length === 0) {
            return { items: [] };
        }
        
        // Fetch detailed statistics for the videos
        const videosWithStats = await getVideosStatistics(videoIds);
        return videosWithStats;
        
    } catch (error) {
        console.error('Error fetching channel videos:', error);
        throw error;
    }
}

/**
 * Fetch videos from a channel using handle (@username)
 * @param {string} handle - Channel handle (with or without @)
 * @param {number} maxResults - Maximum results to return (default: 20)
 * @returns {Promise<Object>} Channel videos response
 */
async function getChannelVideosByHandle(handle, maxResults = 20) {
    try {
        const channelId = await getChannelByHandle(handle);
        if (!channelId) {
            throw new Error(`Channel not found for handle: ${handle}`);
        }
        
        return await getChannelVideos(channelId, maxResults);
    } catch (error) {
        console.error('Error fetching channel videos by handle:', error);
        throw error;
    }
}

export {
    getVideoData,
    getChannelData,
    searchVideos,
    getVideosStatistics,
    getChannelByHandle,
    getChannelVideos,
    getChannelVideosByHandle
};