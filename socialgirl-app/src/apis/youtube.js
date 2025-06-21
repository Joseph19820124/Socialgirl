import { apiClient, API_CONFIG } from '../config/api';
import { trackOperation, canPerformOperation } from '../utils/quotaManager';

/**
 * Fetch video data from YouTube API via backend
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} Video data response
 */
async function getVideoData(videoId) {
    console.log(`[YouTube API] Starting getVideoData for video ID: ${videoId}`);
    
    if (!canPerformOperation('youtube', 'videos')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    try {
        const result = await apiClient.get(API_CONFIG.ENDPOINTS.YOUTUBE.VIDEO_DETAILS, {
            pathParams: { videoId }
        });
        
        console.log(`[YouTube API] Video data retrieved:`, {
            hasItems: !!result.items,
            itemCount: result.items?.length || 0,
            videoTitle: result.items?.[0]?.snippet?.title
        });
        
        trackOperation('youtube', 'videos');
        return result;
    } catch (error) {
        console.error(`[YouTube API] Error fetching video data:`, error.message);
        throw new Error(`YouTube API error: ${error.message}`);
    }
}

/**
 * Fetch channel data from YouTube API via backend
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<Object>} Channel data response
 */
async function getChannelData(channelId) {
    console.log(`[YouTube API] Starting getChannelData for channel ID: ${channelId}`);
    
    if (!canPerformOperation('youtube', 'channels')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    try {
        const result = await apiClient.get(API_CONFIG.ENDPOINTS.YOUTUBE.SEARCH_CHANNELS, {
            params: { channelId }
        });
        
        console.log(`[YouTube API] Channel data retrieved:`, {
            hasItems: !!result.items,
            itemCount: result.items?.length || 0,
            channelTitle: result.items?.[0]?.snippet?.title
        });
        
        trackOperation('youtube', 'channels');
        return result;
    } catch (error) {
        console.error(`[YouTube API] Error fetching channel data:`, error.message);
        throw new Error(`YouTube API error: ${error.message}`);
    }
}

/**
 * Search for videos by query via backend
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
    
    try {
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
        
        const params = {
            query,
            maxResults,
            order,
            publishedAfter: publishedAfterISO
        };
        
        if (regionCode) {
            params.regionCode = regionCode;
        }
        
        const result = await apiClient.get(API_CONFIG.ENDPOINTS.YOUTUBE.SEARCH_VIDEOS, {
            params
        });
        
        console.log(`[YouTube API] Search response:`, {
            hasItems: !!result.items,
            itemCount: result.items?.length || 0,
            nextPageToken: result.nextPageToken,
            totalResults: result.pageInfo?.totalResults
        });
        
        trackOperation('youtube', 'search');
        return result;
    } catch (error) {
        console.error(`[YouTube API] Error searching videos:`, error.message);
        throw new Error(`YouTube API error: ${error.message}`);
    }
}

/**
 * Fetch statistics for multiple videos via backend
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
    
    try {
        const result = await apiClient.get(API_CONFIG.ENDPOINTS.YOUTUBE.SEARCH_VIDEOS, {
            params: { 
                videoIds: videoIds.join(','),
                part: 'snippet,statistics'
            }
        });
        
        console.log(`[YouTube API] Videos statistics retrieved:`, {
            hasItems: !!result.items,
            itemCount: result.items?.length || 0,
            requestedCount: videoIds.length,
            matchRate: `${((result.items?.length || 0) / videoIds.length * 100).toFixed(1)}%`
        });
        
        trackOperation('youtube', 'videos', videoIds.length);
        return result;
    } catch (error) {
        console.error(`[YouTube API] Error fetching videos statistics:`, error.message);
        throw new Error(`YouTube API error: ${error.message}`);
    }
}

/**
 * Get channel ID from channel handle (@username) via backend
 * @param {string} handle - Channel handle (with or without @)
 * @returns {Promise<string|null>} Channel ID or null if not found
 */
async function getChannelByHandle(handle) {
    console.log(`[YouTube API] Starting getChannelByHandle for handle: ${handle}`);
    
    if (!canPerformOperation('youtube', 'search')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
    }
    
    try {
        // Clean handle - remove @ if present and trim whitespace
        const cleanHandle = handle.replace('@', '').trim();
        if (!cleanHandle) {
            throw new Error('Invalid channel handle provided.');
        }
        console.log(`[YouTube API] Cleaned handle: ${cleanHandle}`);
        
        const result = await apiClient.get(API_CONFIG.ENDPOINTS.YOUTUBE.SEARCH_CHANNELS, {
            params: { handle: cleanHandle }
        });
        
        trackOperation('youtube', 'search');
        
        if (result.items && result.items.length > 0) {
            const channelId = result.items[0].id.channelId;
            console.log(`[YouTube API] Channel found:`, {
                channelId: channelId,
                channelTitle: result.items[0].snippet?.title,
                channelHandle: result.items[0].snippet?.customUrl
            });
            return channelId;
        }
        
        console.log(`[YouTube API] No channel found for handle: ${cleanHandle}`);
        return null;
    } catch (error) {
        console.error(`[YouTube API] Error getting channel by handle:`, error.message);
        throw new Error(`YouTube API error: ${error.message}`);
    }
}

/**
 * Fetch recent videos from a channel via backend
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
    
    try {
        const { order = 'date' } = options;
        
        const result = await apiClient.get(API_CONFIG.ENDPOINTS.YOUTUBE.CHANNEL_VIDEOS, {
            pathParams: { channelId },
            params: { maxResults, order }
        });
        
        console.log(`[YouTube API] Channel videos retrieved:`, {
            hasItems: !!result.items,
            itemCount: result.items?.length || 0
        });
        
        trackOperation('youtube', 'search');
        return result;
    } catch (error) {
        console.error(`[YouTube API] Error fetching channel videos:`, error.message);
        throw new Error(`YouTube API error: ${error.message}`);
    }
}

/**
 * Fetch videos from a channel using handle (@username) via backend
 * @param {string} handle - Channel handle (with or without @)
 * @param {number} maxResults - Maximum results to return (default: 20)
 * @param {Object} options - Additional options passed to getChannelVideos
 * @returns {Promise<Object>} Channel videos response
 */
async function getChannelVideosByHandle(handle, maxResults = 20, options = {}) {
    console.log(`[YouTube API] Starting getChannelVideosByHandle for handle: ${handle}`);
    
    try {
        const channelId = await getChannelByHandle(handle);
        if (!channelId) {
            console.error(`[YouTube API] Channel not found for handle: ${handle}`);
            throw new Error(`Channel not found for handle: ${handle}`);
        }
        
        console.log(`[YouTube API] Found channel ID: ${channelId}, fetching videos...`);
        return await getChannelVideos(channelId, maxResults, options);
    } catch (error) {
        console.error(`[YouTube API] Error fetching channel videos by handle:`, error.message);
        throw new Error(`YouTube API error: ${error.message}`);
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