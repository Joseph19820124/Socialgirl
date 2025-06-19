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
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
    }
    
    trackOperation('youtube', 'videos');
    return await response.json();
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
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
    }
    
    trackOperation('youtube', 'channels');
    return await response.json();
}

/**
 * Search for videos by query
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum results to return (default: 10)
 * @param {Object} options - Additional search options
 * @param {string} options.order - Sort order: relevance, date, rating, viewCount, title (default: viewCount)
 * @param {string} options.publishedAfter - ISO date string for filtering recent videos
 * @param {string} options.regionCode - ISO 3166-1 alpha-2 country code
 * @returns {Promise<Object>} Search results
 */
async function searchVideos(query, maxResults = 10, options = {}) {
    if (!canPerformOperation('youtube', 'search')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    const apiKey = await getYouTubeApiKey();
    if (!apiKey) {
        throw new Error('YouTube API key not found. Please configure it in Settings.');
    }
    
    // Default options
    const {
        order = 'viewCount',
        publishedAfter = null,
        regionCode = null
    } = options;
    
    // Calculate date 7 days ago if no publishedAfter is provided
    let publishedAfterISO = publishedAfter;
    if (!publishedAfterISO) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 7);
        publishedAfterISO = pastDate.toISOString();
    }
    
    let url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=${order}&publishedAfter=${publishedAfterISO}&maxResults=${maxResults}&key=${apiKey}`;
    
    // Add regionCode if provided
    if (regionCode) {
        url += `&regionCode=${regionCode}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
    }
    
    trackOperation('youtube', 'search');
    return await response.json();
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
    
    if (!canPerformOperation('youtube', 'videos', videoIds.length)) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    const apiKey = await getYouTubeApiKey();
    if (!apiKey) {
        throw new Error('YouTube API key not found. Please configure it in Settings.');
    }
    
    const url = `${BASE_URL}/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
    }
    
    trackOperation('youtube', 'videos', videoIds.length);
    return await response.json();
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
}

/**
 * Fetch recent videos from a channel
 * @param {string} channelId - YouTube channel ID
 * @param {number} maxResults - Maximum results to return (default: 20)
 * @param {Object} options - Additional options
 * @param {string} options.order - Sort order: date, rating, relevance, title, viewCount (default: date)
 * @returns {Promise<Object>} Channel videos response
 */
async function getChannelVideos(channelId, maxResults = 20, options = {}) {
    if (!canPerformOperation('youtube', 'search')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    const apiKey = await getYouTubeApiKey();
    if (!apiKey) {
        throw new Error('YouTube API key not found. Please configure it in Settings.');
    }
    
    const { order = 'date' } = options;
    
    // Search for videos from the specific channel with specified ordering
    const url = `${BASE_URL}/search?part=snippet&channelId=${channelId}&type=video&order=${order}&maxResults=${maxResults}&key=${apiKey}`;
    
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
}

/**
 * Fetch videos from a channel using handle (@username)
 * @param {string} handle - Channel handle (with or without @)
 * @param {number} maxResults - Maximum results to return (default: 20)
 * @param {Object} options - Additional options passed to getChannelVideos
 * @returns {Promise<Object>} Channel videos response
 */
async function getChannelVideosByHandle(handle, maxResults = 20, options = {}) {
    const channelId = await getChannelByHandle(handle);
    if (!channelId) {
        throw new Error(`Channel not found for handle: ${handle}`);
    }
    
    return await getChannelVideos(channelId, maxResults, options);
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