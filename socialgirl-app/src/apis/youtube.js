import { getApiKey } from '../utils/apiKeyManager';

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
        return await response.json();
    } catch (error) {
        console.error('Error fetching YouTube videos statistics:', error);
        throw error;
    }
}

export {
    getVideoData,
    getChannelData,
    searchVideos,
    getVideosStatistics
};