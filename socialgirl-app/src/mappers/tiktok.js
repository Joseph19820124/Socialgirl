
/**
 * Extract video data from TikTok general search API response
 * @param {Object} apiResponse - TikTok general search API response
 * @returns {Array} Array of video objects for database insertion
 */
export function extractVideoData(apiResponse) {
    console.log(`[TikTok Mapper] Starting video data extraction from general search`);
    console.log(`[TikTok Mapper] Raw API response:`, {
        hasData: !!apiResponse,
        dataType: typeof apiResponse,
        hasDataArray: Array.isArray(apiResponse?.data),
        dataLength: apiResponse?.data?.length || 0
    });
    
    if (!apiResponse || !apiResponse.data || apiResponse.data.length === 0) {
        console.log(`[TikTok Mapper] No valid data found, returning empty array`);
        return [];
    }

    console.log(`[TikTok Mapper] Processing ${apiResponse.data.length} items from general search`);
    
    const extractedData = apiResponse.data.map((dataItem, index) => {
        console.log(`[TikTok Mapper] Processing item ${index + 1}/${apiResponse.data.length}`);
        const item = dataItem.item;
        
        // Skip if item is undefined or null
        if (!item) {
            console.log(`[TikTok Mapper] Skipping item ${index + 1} - no item data`);
            return null;
        }
        
        const views = parseInt(item.statsV2?.playCount) || 0;
        const likes = parseInt(item.statsV2?.diggCount) || 0;
        
        // Calculate performance score (likes-to-views ratio)
        const calculatePerformance = (likes, views) => {
            if (views === 0) return 0;
            // Scale the ratio to 0-100, where 10% like ratio = 100 score
            const ratio = (likes / views) * 1000;
            return Math.min(100, Math.max(0, Math.round(ratio)));
        };
        
        const performance = calculatePerformance(likes, views);
        
        return {
            username: item.author?.uniqueId || 'Unknown',
            followers: parseInt(item.authorStats?.followerCount) || 0,
            title: item.desc || 'No description',
            views,
            likes,
            comments: parseInt(item.statsV2?.commentCount) || 0,
            shares: parseInt(item.statsV2?.shareCount) || 0,
            performance,
            url: `https://tiktok.com/@${item.author?.uniqueId}/video/${item.id}`,
            publishedAt: item.createTime ? new Date(item.createTime * 1000).toISOString() : new Date().toISOString()
        };
    }).filter(item => item !== null);
    
    console.log(`[TikTok Mapper] Successfully extracted ${extractedData.length} videos from general search`);
    console.log(`[TikTok Mapper] Sample extracted video data:`, extractedData.slice(0, 2));
    
    return extractedData;
}

/**
 * Extract unique users data from TikTok general search API response with follower counts
 * @param {Object} apiResponse - TikTok general search API response
 * @returns {Array} Array of unique user objects for database insertion
 */
export function extractUsersDataFromSearch(apiResponse) {
    if (!apiResponse || !apiResponse.data || apiResponse.data.length === 0) {
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

/**
 * Extract user posts data from TikTok user popular posts API response
 * @param {Object} apiResponse - TikTok user popular posts API response
 * @returns {Array} Array of user post objects for database insertion
 */
export function extractUserPostsData(apiResponse) {
    console.log(`[TikTok Mapper] Starting user posts data extraction`);
    console.log(`[TikTok Mapper] Raw API response:`, {
        hasData: !!apiResponse,
        dataType: typeof apiResponse,
        hasDataObject: !!apiResponse?.data,
        hasItemList: !!apiResponse?.data?.itemList,
        itemListLength: apiResponse?.data?.itemList?.length || 0
    });
    
    if (!apiResponse || !apiResponse.data || !apiResponse.data.itemList || apiResponse.data.itemList.length === 0) {
        console.log(`[TikTok Mapper] No valid data found, returning empty array`);
        return [];
    }

    console.log(`[TikTok Mapper] Processing ${apiResponse.data.itemList.length} items`);
    
    const extractedData = apiResponse.data.itemList.map((item, index) => {
        console.log(`[TikTok Mapper] Processing item ${index + 1}/${apiResponse.data.itemList.length}`);
        if (index < 2) {
            console.log(`[TikTok Mapper] Sample item ${index + 1} structure:`, {
                hasItem: !!item,
                itemId: item?.id,
                hasAuthor: !!item?.author,
                username: item?.author?.uniqueId,
                hasStats: !!item?.stats || !!item?.statsV2
            });
        }
        const views = parseInt(item.statsV2?.playCount) || parseInt(item.stats?.playCount) || 0;
        const likes = parseInt(item.statsV2?.diggCount) || parseInt(item.stats?.diggCount) || 0;
        
        // Calculate performance score (likes-to-views ratio)
        const calculatePerformance = (likes, views) => {
            if (views === 0) return 0;
            // Scale the ratio to 0-100, where 10% like ratio = 100 score
            const ratio = (likes / views) * 1000;
            return Math.min(100, Math.max(0, Math.round(ratio)));
        };
        
        const performance = calculatePerformance(likes, views);
        
        return {
            username: item.author?.uniqueId || 'Unknown',
            followers: parseInt(item.authorStats?.followerCount) || 0,
            title: item.desc || 'No description',
            views,
            likes,
            comments: parseInt(item.statsV2?.commentCount) || parseInt(item.stats?.commentCount) || 0,
            shares: parseInt(item.statsV2?.shareCount) || parseInt(item.stats?.shareCount) || 0,
            performance,
            url: `https://tiktok.com/@${item.author?.uniqueId}/video/${item.id}`,
            publishedAt: item.createTime ? new Date(item.createTime * 1000).toISOString() : new Date().toISOString()
        };
    });
    
    console.log(`[TikTok Mapper] Successfully extracted ${extractedData.length} items`);
    console.log(`[TikTok Mapper] Sample extracted data:`, extractedData.slice(0, 2));
    
    return extractedData;
}