import { getApiKey } from '../utils/apiKeyManager';
import { trackOperation, canPerformOperation } from '../utils/quotaManager';

// Get API key from storage or environment
async function getRapidApiKey() {
    return await getApiKey('rapidApiKey', 'VITE_RAPIDAPI_KEY');
}

// TikTok RapidAPI configuration
const RAPIDAPI_HOST = 'tiktok-api23.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}/api`;

/**
 * Search TikTok content by keyword using general search
 * @param {string} keyword - Search keyword
 * @param {number} cursor - Pagination cursor (default: 0)
 * @param {number} searchId - Search ID (default: 0)
 * @returns {Promise<Object>} General search response with follower counts
 */
async function searchVideos(keyword, cursor = 0, searchId = 0) {
    console.log(`[TikTok API] Starting searchVideos for keyword: "${keyword}", cursor: ${cursor}`);
    
    if (!canPerformOperation('tiktok', 'request')) {
        throw new Error('TikTok API quota exceeded. Please try again next month.');
    }
    
    const apiKey = await getRapidApiKey();
    
    if (!apiKey) {
        throw new Error('RapidAPI key not found. Please configure it in Settings.');
    }
    
    const url = `${BASE_URL}/search/general?keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&search_id=${searchId}`;
    console.log(`[TikTok API] Making request to: ${url}`);
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    });
    
    console.log(`[TikTok API] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TikTok API] Error response body:`, errorText);
        throw new Error(`TikTok API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`[TikTok API] Search response structure:`, {
        hasData: !!result,
        dataType: typeof result,
        hasDataArray: Array.isArray(result.data),
        dataLength: result.data?.length || 0,
        sampleKeys: result && typeof result === 'object' ? Object.keys(result).slice(0, 5) : null
    });
    
    if (result.data) {
        console.log(`[TikTok API] Found ${result.data.length} items in search response`);
        if (result.data.length > 0 && result.data[0]) {
            console.log(`[TikTok API] Sample item structure:`, {
                hasItem: !!result.data[0].item,
                itemKeys: result.data[0].item ? Object.keys(result.data[0].item).slice(0, 5) : null
            });
        }
    }
    
    trackOperation('tiktok', 'request');
    return result;
}

/**
 * Get TikTok user info including secUid
 * @param {string} uniqueId - TikTok username (uniqueId)
 * @returns {Promise<Object>} User info response with secUid
 */
async function getUserInfo(uniqueId) {
    console.log(`[TikTok API] Starting getUserInfo for username: ${uniqueId}`);
    
    if (!canPerformOperation('tiktok', 'request')) {
        throw new Error('TikTok API quota exceeded. Please try again next month.');
    }
    
    const apiKey = await getRapidApiKey();
    
    if (!apiKey) {
        throw new Error('RapidAPI key not found. Please configure it in Settings.');
    }
    
    const url = `${BASE_URL}/user/info?uniqueId=${uniqueId}`;
    console.log(`[TikTok API] Making request to: ${url}`);
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    });
    
    console.log(`[TikTok API] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TikTok API] Error response body:`, errorText);
        throw new Error(`TikTok API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`[TikTok API] User info retrieved:`, {
        hasUserInfo: !!result.userInfo,
        hasUser: !!result.userInfo?.user,
        username: result.userInfo?.user?.uniqueId,
        secUid: result.userInfo?.user?.secUid
    });
    
    trackOperation('tiktok', 'request');
    return result;
}

/**
 * Get TikTok user's popular posts
 * @param {string} secUid - User's secure ID from getUserInfo
 * @param {number} count - Number of posts to fetch (default: 35)
 * @param {number} cursor - Pagination cursor (default: 0)
 * @returns {Promise<Object>} User popular posts response
 */
async function getUserPopularPosts(secUid, count = 35, cursor = 0) {
    console.log(`[TikTok API] Starting getUserPopularPosts for secUid: ${secUid}, count: ${count}`);
    
    if (!canPerformOperation('tiktok', 'request')) {
        throw new Error('TikTok API quota exceeded. Please try again next month.');
    }
    
    const apiKey = await getRapidApiKey();
    
    if (!apiKey) {
        throw new Error('RapidAPI key not found. Please configure it in Settings.');
    }
    
    const url = `${BASE_URL}/user/popular-posts?secUid=${secUid}&count=${count}&cursor=${cursor}`;
    console.log(`[TikTok API] Making request to: ${url}`);
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    });
    
    console.log(`[TikTok API] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TikTok API] Error response body:`, errorText);
        throw new Error(`TikTok API error: ${response.status} - ${errorText}`);
    }
    
    // Handle 204 No Content response (user has no popular posts)
    if (response.status === 204) {
        console.log(`[TikTok API] No content (204) - user has no popular posts`);
        trackOperation('tiktok', 'request');
        return { data: { itemList: [] } }; // Return empty list structure
    }
    
    const result = await response.json();
    console.log(`[TikTok API] Success! Response data structure:`, {
        hasData: !!result,
        dataType: typeof result,
        hasDataObject: !!result.data,
        hasItemList: !!result.data?.itemList,
        itemListLength: result.data?.itemList?.length || 0,
        sampleKeys: result && typeof result === 'object' ? Object.keys(result).slice(0, 5) : null
    });
    
    if (result.data?.itemList) {
        console.log(`[TikTok API] Found ${result.data.itemList.length} items in response`);
    }
    
    trackOperation('tiktok', 'request');
    return result;
}

/**
 * Search TikTok videos with pagination support to get more results
 * @param {string} keyword - Search keyword
 * @param {number} maxResults - Maximum number of results to fetch (default: 36)
 * @returns {Promise<Object>} Combined search results with all items
 */
async function searchVideosWithPagination(keyword, maxResults = 36) {
    console.log(`[TikTok API] Starting paginated search for keyword: "${keyword}", max results: ${maxResults}`);
    
    const allItems = [];
    const uniqueIds = new Set();
    let cursor = 0;
    let searchId = 0;
    let requestCount = 0;
    const maxRequests = 3; // Limit to prevent excessive API calls
    
    try {
        while (requestCount < maxRequests && allItems.length < maxResults) {
            requestCount++;
            console.log(`[TikTok API] Request ${requestCount} of ${maxRequests}, cursor: ${cursor}, searchId: ${searchId}`);
            
            const response = await searchVideos(keyword, cursor, searchId);
            
            if (!response.data || response.data.length === 0) {
                console.log(`[TikTok API] No items in response, stopping pagination`);
                break;
            }
            
            // Extract items and filter duplicates
            let newItemsCount = 0;
            for (const dataItem of response.data) {
                const item = dataItem.item;
                if (item && item.id && !uniqueIds.has(item.id) && allItems.length < maxResults) {
                    uniqueIds.add(item.id);
                    allItems.push(dataItem);
                    newItemsCount++;
                }
            }
            
            console.log(`[TikTok API] Added ${newItemsCount} new unique items, total: ${allItems.length}`);
            
            // Check if we should continue
            if (!response.cursor || !response.log_pb?.impr_id) {
                console.log(`[TikTok API] No pagination info in response, stopping`);
                break;
            }
            
            // Check if cursor hasn't changed (end of results)
            if (response.cursor === cursor && requestCount > 1) {
                console.log(`[TikTok API] Same cursor returned, stopping`);
                break;
            }
            
            if (newItemsCount === 0 && requestCount > 1) {
                console.log(`[TikTok API] No new items found, stopping`);
                break;
            }
            
            // Update pagination parameters for next request
            cursor = response.cursor;
            searchId = response.log_pb.impr_id;
            
            console.log(`[TikTok API] Next pagination - cursor: ${cursor}, searchId: ${searchId}`);
        }
        
        console.log(`[TikTok API] Pagination complete. Total unique items: ${allItems.length}`);
        
        // Return in the same format as the original API response
        return {
            data: allItems,
            cursor: cursor,
            log_pb: { impr_id: searchId }
        };
        
    } catch (error) {
        console.error(`[TikTok API] Error in searchVideosWithPagination:`, error.message);
        throw error;
    }
}

export {
    searchVideos,
    searchVideosWithPagination,
    getUserInfo,
    getUserPopularPosts
};