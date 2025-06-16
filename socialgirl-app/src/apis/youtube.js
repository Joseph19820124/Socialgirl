const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Fetch video data from YouTube API
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} Video data response
 */
async function getVideoData(videoId) {
    const url = `${BASE_URL}/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`;
    
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
    const url = `${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`;
    
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
    // Calculate date 7 days ago
    const publishedAfter = new Date();
    publishedAfter.setDate(publishedAfter.getDate() - 7);
    const publishedAfterISO = publishedAfter.toISOString();
    
    const url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=viewCount&publishedAfter=${publishedAfterISO}&maxResults=${maxResults}&key=${API_KEY}`;
    
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
    
    const url = `${BASE_URL}/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${API_KEY}`;
    
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