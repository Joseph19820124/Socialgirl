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
 * Extract video data from TikTok search API response
 * @param {Object} apiResponse - TikTok video search API response
 * @returns {Array} Array of video objects for database insertion
 */
export function extractVideoData(apiResponse) {
    if (!apiResponse.item_list || apiResponse.item_list.length === 0) {
        return [];
    }

    return apiResponse.item_list.map(item => ({
        username: item.author?.uniqueId || 'Unknown',
        title: item.desc || 'No description',
        views: parseInt(item.statsV2?.playCount) || 0,
        likes: parseInt(item.statsV2?.diggCount) || 0,
        comments: parseInt(item.statsV2?.commentCount) || 0,
        shares: parseInt(item.statsV2?.shareCount) || 0,
        url: `https://tiktok.com/@${item.author?.uniqueId}/video/${item.id}`,
        publishedAt: new Date(item.createTime * 1000).toISOString()
    }));
}