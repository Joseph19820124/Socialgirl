import { apiClient, API_CONFIG } from '../config/api';
import { trackOperation, canPerformOperation } from '../utils/quotaManager';

/**
 * Search for Instagram reels by keyword via backend
 * @param {string} keyword - Search keyword
 * @param {string} paginationToken - Optional pagination token for fetching more results
 * @returns {Promise<Object>} Search results response
 */
async function searchReels(keyword, paginationToken = null) {
    console.log(`[Instagram API] Starting searchReels for keyword: ${keyword}`);
    
    if (!canPerformOperation('instagram', 'request')) {
        const errorMsg = 'Instagram API quota exceeded. Please try again next month.';
        console.error(`Instagram API: Quota check failed: ${errorMsg}`);
        throw new Error(errorMsg);
    }
    
    try {
        const params = { keyword };
        if (paginationToken) {
            params.pagination_token = paginationToken;
            console.log(`[Instagram API] Using pagination token`);
        }
        
        const result = await apiClient.get(API_CONFIG.ENDPOINTS.INSTAGRAM.SEARCH_REELS, {
            params
        });
        
        console.log(`[Instagram API] Success! Response data structure:`, {
            hasData: !!result,
            dataType: typeof result,
            hasDataObject: !!result.data,
            itemCount: result.data?.items?.length || 0,
            hasPaginationToken: !!result.pagination_token
        });
        
        trackOperation('instagram', 'request');
        console.log(`[Instagram API] Operation tracked successfully`);
        
        return result;
    } catch (error) {
        console.error(`Instagram API: Error in searchReels:`, error.message);
        throw error;
    }
}

/**
 * Fetch user reels/posts from Instagram via backend
 * @param {string} usernameOrId - Instagram username or user ID
 * @param {string} paginationToken - Optional pagination token for fetching more results
 * @returns {Promise<Object>} User reels data response
 */
async function getUserReels(usernameOrId, paginationToken = null) {
    console.log(`[Instagram API] Starting getUserReels for username: ${usernameOrId}`);
    
    if (!canPerformOperation('instagram', 'request')) {
        const errorMsg = 'Instagram API quota exceeded. Please try again next month.';
        console.error(`Instagram API: Quota check failed: ${errorMsg}`);
        throw new Error(errorMsg);
    }
    
    try {
        const params = {};
        if (paginationToken) {
            params.pagination_token = paginationToken;
            console.log(`[Instagram API] Using pagination token`);
        }
        
        const result = await apiClient.get(API_CONFIG.ENDPOINTS.INSTAGRAM.USER_REELS, {
            pathParams: { username: usernameOrId },
            params
        });
        
        console.log(`[Instagram API] Success! Response data structure:`, {
            hasData: !!result,
            dataType: typeof result,
            isArray: Array.isArray(result),
            keys: result && typeof result === 'object' ? Object.keys(result) : null,
            itemCount: Array.isArray(result) ? result.length : (result && result.items ? result.items.length : 'unknown')
        });
        
        trackOperation('instagram', 'request');
        console.log(`[Instagram API] Operation tracked successfully`);
        
        return result;
    } catch (error) {
        console.error(`Instagram API: Error in getUserReels:`, error.message);
        throw error;
    }
}

/**
 * Search for Instagram reels with pagination support to get more results via backend
 * @param {string} keyword - Search keyword
 * @param {number} maxResults - Maximum number of results to fetch (default: 24)
 * @returns {Promise<Object>} Combined search results with all items and pagination info
 */
async function searchReelsWithPagination(keyword, maxResults = 24) {
    console.log(`[Instagram API] Starting paginated search for keyword: ${keyword}, max results: ${maxResults}`);
    
    const allItems = [];
    const uniqueCodes = new Set();
    let paginationToken = null;
    let requestCount = 0;
    const maxRequests = 3; // Limit to prevent excessive API calls
    
    try {
        while (requestCount < maxRequests && allItems.length < maxResults) {
            requestCount++;
            console.log(`[Instagram API] Request ${requestCount} of ${maxRequests}`);
            
            const response = await searchReels(keyword, paginationToken);
            
            if (!response.data?.items || response.data.items.length === 0) {
                console.log(`[Instagram API] No items in response, stopping pagination`);
                break;
            }
            
            // Filter out duplicates and add new items
            let newItemsCount = 0;
            for (const item of response.data.items) {
                if (!uniqueCodes.has(item.code) && allItems.length < maxResults) {
                    uniqueCodes.add(item.code);
                    allItems.push(item);
                    newItemsCount++;
                }
            }
            
            console.log(`[Instagram API] Added ${newItemsCount} new unique items, total: ${allItems.length}`);
            
            // Check if we should continue
            if (!response.pagination_token) {
                console.log(`[Instagram API] No pagination token in response, stopping`);
                break;
            }
            
            if (response.pagination_token === paginationToken) {
                console.log(`[Instagram API] Same pagination token returned, stopping`);
                break;
            }
            
            if (newItemsCount === 0 && requestCount > 1) {
                console.log(`[Instagram API] No new items found, stopping`);
                break;
            }
            
            paginationToken = response.pagination_token;
        }
        
        console.log(`[Instagram API] Pagination complete. Total unique items: ${allItems.length}`);
        
        // Return in the same format as the original API response
        return {
            data: {
                items: allItems,
                count: allItems.length
            },
            pagination_token: paginationToken // Include last pagination token if user wants to continue
        };
        
    } catch (error) {
        console.error(`[Instagram API] Error in searchReelsWithPagination:`, error.message);
        throw error;
    }
}

/**
 * Fetch user reels with pagination support to get more results via backend
 * @param {string} usernameOrId - Instagram username or user ID
 * @param {number} maxResults - Maximum number of results to fetch (default: 24)
 * @returns {Promise<Object>} Combined user reels with all items and pagination info
 */
async function getUserReelsWithPagination(usernameOrId, maxResults = 24) {
    console.log(`[Instagram API] Starting paginated user reels for username: ${usernameOrId}, max results: ${maxResults}`);
    
    const allItems = [];
    const uniqueIds = new Set();
    let paginationToken = null;
    let requestCount = 0;
    const maxRequests = 2; // Limit to 2 requests as requested
    
    try {
        while (requestCount < maxRequests && allItems.length < maxResults) {
            requestCount++;
            console.log(`[Instagram API] Request ${requestCount} of ${maxRequests}`);
            
            const response = await getUserReels(usernameOrId, paginationToken);
            
            // Handle different response structures
            let items = [];
            if (Array.isArray(response)) {
                items = response;
            } else if (response.data) {
                if (Array.isArray(response.data)) {
                    items = response.data;
                } else if (response.data.items) {
                    items = response.data.items;
                } else if (response.data.reels) {
                    items = response.data.reels;
                }
            } else if (response.items) {
                items = response.items;
            } else if (response.reels) {
                items = response.reels;
            }
            
            if (items.length === 0) {
                console.log(`[Instagram API] No items in response, stopping pagination`);
                break;
            }
            
            // Filter out duplicates and add new items
            let newItemsCount = 0;
            for (const item of items) {
                // Use code, id, or pk as unique identifier
                const uniqueId = item.code || item.id || item.pk || JSON.stringify(item);
                if (!uniqueIds.has(uniqueId) && allItems.length < maxResults) {
                    uniqueIds.add(uniqueId);
                    allItems.push(item);
                    newItemsCount++;
                }
            }
            
            console.log(`[Instagram API] Added ${newItemsCount} new unique items, total: ${allItems.length}`);
            
            // Check if we should continue
            if (!response.pagination_token) {
                console.log(`[Instagram API] No pagination token in response, stopping`);
                break;
            }
            
            if (response.pagination_token === paginationToken) {
                console.log(`[Instagram API] Same pagination token returned, stopping`);
                break;
            }
            
            if (newItemsCount === 0 && requestCount > 1) {
                console.log(`[Instagram API] No new items found, stopping`);
                break;
            }
            
            paginationToken = response.pagination_token;
        }
        
        console.log(`[Instagram API] Pagination complete. Total unique items: ${allItems.length}`);
        
        // Return in the same format as the original API response
        return {
            data: {
                items: allItems,
                count: allItems.length
            },
            pagination_token: paginationToken
        };
        
    } catch (error) {
        console.error(`[Instagram API] Error in getUserReelsWithPagination:`, error.message);
        throw error;
    }
}

export {
    searchReels,
    searchReelsWithPagination,
    getUserReels,
    getUserReelsWithPagination
};