/**
 * Extract video data from YouTube API response
 * @param {Object} apiResponse - YouTube videos API response
 * @returns {Array} Array of video objects for database insertion
 */
export function extractVideoData(apiResponse) {
    if (!apiResponse || !apiResponse.items || apiResponse.items.length === 0) {
        return [];
    }

    return apiResponse.items.map(item => {
        // Handle search results which have id as an object
        const videoId = typeof item.id === 'string' ? item.id : item.id?.videoId;
        
        const views = parseInt(item.statistics?.viewCount) || 0;
        const likes = parseInt(item.statistics?.likeCount) || 0;
        
        // Calculate performance score (likes-to-views ratio)
        const calculatePerformance = (likes, views) => {
            if (views === 0) return 0;
            // Scale the ratio to 0-100, where 10% like ratio = 100 score
            const ratio = (likes / views) * 1000;
            return Math.min(100, Math.max(0, Math.round(ratio)));
        };
        
        const performance = calculatePerformance(likes, views);
        
        return {
            username: item.snippet.channelTitle,
            title: item.snippet.title,
            views: views,
            likes: likes,
            comments: parseInt(item.statistics?.commentCount) || 0,
            performance: performance,
            url: `https://youtube.com/watch?v=${videoId}`,
            publishedAt: item.snippet.publishedAt
        };
    });
}

/**
 * Extract channel data from YouTube API response
 * @param {Object} apiResponse - YouTube channels API response
 * @returns {Array} Array of channel objects for database insertion
 */
export function extractChannelData(apiResponse) {
    if (!apiResponse || !apiResponse.items || apiResponse.items.length === 0) {
        return [];
    }

    return apiResponse.items.map(item => ({
        username: item.snippet.title,
        followers: parseInt(item.statistics?.subscriberCount) || 0,
        about: item.snippet.description,
        media: parseInt(item.statistics?.videoCount) || 0,
        url: item.snippet.customUrl ? 
            `https://youtube.com/@${item.snippet.customUrl}` : 
            `https://youtube.com/channel/${item.id}`
    }));
}