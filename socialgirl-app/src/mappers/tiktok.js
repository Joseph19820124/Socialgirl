/**
 * Extract user data from TikTok API response
 * @param {Object} apiResponse - TikTok user API response
 * @returns {Object} User object for database insertion
 */
export function extractUserData(apiResponse) {
    if (!apiResponse.userInfo || !apiResponse.userInfo.user) {
        return null;
    }

    const user = apiResponse.userInfo.user;
    const stats = apiResponse.userInfo.stats;

    return {
        username: user.uniqueId,
        followers: parseInt(stats.followerCount) || 0,
        about: user.signature || '',
        media: parseInt(stats.videoCount) || 0,
        url: `https://tiktok.com/@${user.uniqueId}`
    };
}

/**
 * Extract video data from TikTok general search API response
 * @param {Object} apiResponse - TikTok general search API response
 * @returns {Array} Array of video objects for database insertion
 */
export function extractVideoData(apiResponse) {
    if (!apiResponse.data || apiResponse.data.length === 0) {
        return [];
    }

    return apiResponse.data.map(dataItem => {
        const item = dataItem.item;
        return {
            username: item.author?.uniqueId || 'Unknown',
            followers: parseInt(item.authorStats?.followerCount) || 0,
            title: item.desc || 'No description',
            views: parseInt(item.statsV2?.playCount) || 0,
            likes: parseInt(item.statsV2?.diggCount) || 0,
            comments: parseInt(item.statsV2?.commentCount) || 0,
            shares: parseInt(item.statsV2?.shareCount) || 0,
            url: `https://tiktok.com/@${item.author?.uniqueId}/video/${item.id}`,
            publishedAt: new Date(item.createTime * 1000).toISOString()
        };
    });
}

/**
 * Extract unique users data from TikTok general search API response with follower counts
 * @param {Object} apiResponse - TikTok general search API response
 * @returns {Array} Array of unique user objects for database insertion
 */
export function extractUsersDataFromSearch(apiResponse) {
    if (!apiResponse.data || apiResponse.data.length === 0) {
        return [];
    }

    const userMap = new Map();
    
    apiResponse.data.forEach(dataItem => {
        const item = dataItem.item;
        const author = item.author;
        const authorStats = item.authorStats;
        
        if (author && author.uniqueId && !userMap.has(author.uniqueId)) {
            userMap.set(author.uniqueId, {
                username: author.uniqueId,
                followers: parseInt(authorStats?.followerCount) || 0,
                about: author.signature || '',
                media: parseInt(authorStats?.videoCount) || 0,
                url: `https://tiktok.com/@${author.uniqueId}`
            });
        }
    });

    return Array.from(userMap.values());
}