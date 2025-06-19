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
    console.log(`[YouTube API] Starting getVideoData for video ID: ${videoId}`);
    
    if (!canPerformOperation('youtube', 'videos')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    const apiKey = await getYouTubeApiKey();
    if (!apiKey) {
        throw new Error('YouTube API key not found. Please configure it in Settings.');
    }
    const url = `${BASE_URL}/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
    console.log(`[YouTube API] Making request to: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    const response = await fetch(url);
    console.log(`[YouTube API] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[YouTube API] Error response body:`, errorText);
        throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`[YouTube API] Video data retrieved:`, {
        hasItems: !!result.items,
        itemCount: result.items?.length || 0,
        videoTitle: result.items?.[0]?.snippet?.title
    });
    
    trackOperation('youtube', 'videos');
    return result;
}

/**
 * Fetch channel data from YouTube API
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<Object>} Channel data response
 */
async function getChannelData(channelId) {
    console.log(`[YouTube API] Starting getChannelData for channel ID: ${channelId}`);
    
    if (!canPerformOperation('youtube', 'channels')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    const apiKey = await getYouTubeApiKey();
    if (!apiKey) {
        throw new Error('YouTube API key not found. Please configure it in Settings.');
    }
    const url = `${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
    console.log(`[YouTube API] Making request to: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    const response = await fetch(url);
    console.log(`[YouTube API] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[YouTube API] Error response body:`, errorText);
        throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`[YouTube API] Channel data retrieved:`, {
        hasItems: !!result.items,
        itemCount: result.items?.length || 0,
        channelTitle: result.items?.[0]?.snippet?.title
    });
    
    trackOperation('youtube', 'channels');
    return result;
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
    console.log(`[YouTube API] Starting searchVideos for query: "${query}", maxResults: ${maxResults}`);
    console.log(`[YouTube API] Search options:`, options);
    
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
    
    console.log(`[YouTube API] Making request to: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    const response = await fetch(url);
    console.log(`[YouTube API] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[YouTube API] Error response body:`, errorText);
        throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`[YouTube API] Search response:`, {
        hasItems: !!result.items,
        itemCount: result.items?.length || 0,
        nextPageToken: result.nextPageToken,
        totalResults: result.pageInfo?.totalResults
    });
    
    trackOperation('youtube', 'search');
    return result;
}

/**
 * Fetch statistics for multiple videos
 * @param {Array<string>} videoIds - Array of video IDs
 * @returns {Promise<Object>} Videos with statistics
 */
async function getVideosStatistics(videoIds) {
    console.log(`[YouTube API] Starting getVideosStatistics for ${videoIds?.length || 0} videos`);
    
    if (!videoIds || videoIds.length === 0) {
        console.log(`[YouTube API] No video IDs provided, returning empty result`);
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
    console.log(`[YouTube API] Making request to: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
    console.log(`[YouTube API] Fetching statistics for video IDs:`, videoIds.slice(0, 5), videoIds.length > 5 ? `... and ${videoIds.length - 5} more` : '');
    
    const response = await fetch(url);
    console.log(`[YouTube API] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[YouTube API] Error response body:`, errorText);
        throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`[YouTube API] Videos statistics retrieved:`, {
        hasItems: !!result.items,
        itemCount: result.items?.length || 0,
        requestedCount: videoIds.length,
        matchRate: `${((result.items?.length || 0) / videoIds.length * 100).toFixed(1)}%`
    });
    
    trackOperation('youtube', 'videos', videoIds.length);
    return result;
}

/**
 * Get channel ID from channel handle (@username)
 * @param {string} handle - Channel handle (with or without @)
 * @returns {Promise<string|null>} Channel ID or null if not found
 */
async function getChannelByHandle(handle) {
    console.log(`[YouTube API] Starting getChannelByHandle for handle: ${handle}`);
    
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
    console.log(`[YouTube API] Cleaned handle: ${cleanHandle}`);
    
    // Search for the channel by handle
    const url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(cleanHandle)}&type=channel&maxResults=1&key=${apiKey}`;
    console.log(`[YouTube API] Making request to: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    const response = await fetch(url);
    console.log(`[YouTube API] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[YouTube API] Error response body:`, errorText);
        throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
    }
    
    trackOperation('youtube', 'search');
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
        const channelId = data.items[0].id.channelId;
        console.log(`[YouTube API] Channel found:`, {
            channelId: channelId,
            channelTitle: data.items[0].snippet?.title,
            channelHandle: data.items[0].snippet?.customUrl
        });
        return channelId;
    }
    
    console.log(`[YouTube API] No channel found for handle: ${cleanHandle}`);
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
    console.log(`[YouTube API] Starting getChannelVideos for channel ID: ${channelId}, maxResults: ${maxResults}`);
    console.log(`[YouTube API] Options:`, options);
    
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
    console.log(`[YouTube API] Making request to: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    const response = await fetch(url);
    console.log(`[YouTube API] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[YouTube API] Error response body:`, errorText);
        throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
    }
    
    trackOperation('youtube', 'search');
    const searchData = await response.json();
    console.log(`[YouTube API] Channel search results:`, {
        hasItems: !!searchData.items,
        itemCount: searchData.items?.length || 0,
        channelTitle: searchData.items?.[0]?.snippet?.channelTitle
    });
    
    // Get video IDs to fetch statistics
    const videoIds = searchData.items
        .map(item => item.id?.videoId)
        .filter(id => id);
    
    if (videoIds.length === 0) {
        console.log(`[YouTube API] No video IDs found in search results`);
        return { items: [] };
    }
    
    console.log(`[YouTube API] Fetching statistics for ${videoIds.length} videos from channel`);
    
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
    console.log(`[YouTube API] Starting getChannelVideosByHandle for handle: ${handle}`);
    
    const channelId = await getChannelByHandle(handle);
    if (!channelId) {
        console.error(`[YouTube API] Channel not found for handle: ${handle}`);
        throw new Error(`Channel not found for handle: ${handle}`);
    }
    
    console.log(`[YouTube API] Found channel ID: ${channelId}, fetching videos...`);
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