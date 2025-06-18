/**
 * Extract video data from Instagram search reels API response
 * @param {Object} apiResponse - Instagram search reels API response
 * @returns {Array} Array of video objects for table display
 */
export function extractVideoData(apiResponse) {
    console.log(`[Instagram Mapper] Starting video data extraction from search results`);
    console.log(`[Instagram Mapper] Raw API response:`, {
        hasData: !!apiResponse,
        dataType: typeof apiResponse,
        hasDataObject: !!apiResponse?.data,
        itemsCount: apiResponse?.data?.items?.length || 0
    });

    // Handle empty or invalid response
    if (!apiResponse || !apiResponse.data || !apiResponse.data.items) {
        console.error(`[Instagram Mapper] Invalid API response structure`);
        return [];
    }

    const items = apiResponse.data.items;
    console.log(`[Instagram Mapper] Processing ${items.length} video items`);

    const extractedData = items.map((item, index) => {
        console.log(`[Instagram Mapper] Processing video ${index + 1}/${items.length}`);
        
        try {
            // Extract user information
            const user = item.user || {};
            const username = user.username || 'Unknown';
            
            // For search results, we don't have follower count in the user object
            // We might need to make additional calls or set to 0
            const followers = user.follower_count || 0;
            
            // Extract caption/title
            const caption = item.caption || {};
            const title = caption.text || 'No caption';
            
            // Extract engagement metrics
            const views = item.play_count || item.ig_play_count || 0;
            const likes = item.like_count || 0;
            const comments = item.comment_count || 0;
            const shares = item.share_count || 0;
            
            // Calculate performance score (likes-to-views ratio)
            const calculatePerformance = (likes, views) => {
                if (views === 0) return 0;
                // Scale the ratio to 0-100, where 10% like ratio = 100 score
                const ratio = (likes / views) * 1000;
                return Math.min(100, Math.max(0, Math.round(ratio)));
            };
            
            const performance = calculatePerformance(likes, views);
            
            // Generate URL from code
            const code = item.code;
            const url = code ? `https://www.instagram.com/reel/${code}/` : 'https://www.instagram.com/';
            
            const extractedItem = {
                username,
                followers,
                title: truncateText(title, 100),
                views,
                likes,
                comments,
                shares,
                performance,
                url
            };

            console.log(`[Instagram Mapper] Extracted video ${index + 1}:`, {
                username: extractedItem.username,
                followers: extractedItem.followers,
                titleLength: extractedItem.title.length,
                views: extractedItem.views,
                likes: extractedItem.likes,
                comments: extractedItem.comments,
                shares: extractedItem.shares,
                hasUrl: !!extractedItem.url
            });

            return extractedItem;

        } catch (error) {
            console.error(`[Instagram Mapper] Error processing video ${index + 1}:`, {
                error: error.message,
                item: item
            });
            
            // Return a fallback item
            return {
                username: 'Error',
                followers: 0,
                title: 'Error processing video',
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                performance: 0,
                url: 'https://www.instagram.com/'
            };
        }
    });

    console.log(`[Instagram Mapper] Successfully extracted ${extractedData.length} videos`);
    return extractedData;
}

/**
 * Extract user posts data from Instagram user reels API response
 * @param {Object} apiResponse - Instagram user reels API response
 * @returns {Array} Array of user post objects for table display
 */
export function extractUserPostsData(apiResponse) {
    console.log(`[Instagram Mapper] Starting data extraction`);
    console.log(`[Instagram Mapper] Raw API response:`, {
        hasData: !!apiResponse,
        dataType: typeof apiResponse,
        isArray: Array.isArray(apiResponse),
        keys: apiResponse && typeof apiResponse === 'object' ? Object.keys(apiResponse) : null
    });

    // Handle different possible response structures
    let itemsArray = null;
    
    if (!apiResponse) {
        console.error(`[Instagram Mapper] No API response provided`);
        return [];
    }

    // Try to find the items array in different possible locations
    if (Array.isArray(apiResponse)) {
        console.log(`[Instagram Mapper] Response is direct array with ${apiResponse.length} items`);
        itemsArray = apiResponse;
    } else if (apiResponse.data) {
        // Check if data is an array
        if (Array.isArray(apiResponse.data)) {
            console.log(`[Instagram Mapper] Found data array with ${apiResponse.data.length} items`);
            itemsArray = apiResponse.data;
        } else if (apiResponse.data.items && Array.isArray(apiResponse.data.items)) {
            console.log(`[Instagram Mapper] Found data.items array with ${apiResponse.data.items.length} items`);
            itemsArray = apiResponse.data.items;
        } else if (apiResponse.data.reels && Array.isArray(apiResponse.data.reels)) {
            console.log(`[Instagram Mapper] Found data.reels array with ${apiResponse.data.reels.length} items`);
            itemsArray = apiResponse.data.reels;
        } else {
            console.log(`[Instagram Mapper] Data object found, checking structure:`, {
                dataType: typeof apiResponse.data,
                dataKeys: apiResponse.data && typeof apiResponse.data === 'object' ? Object.keys(apiResponse.data) : null,
                sampleData: apiResponse.data
            });
            // If data is an object but not an array, it might contain the posts directly
            itemsArray = [apiResponse.data]; // Treat the data object as a single item
        }
    } else if (apiResponse.items && Array.isArray(apiResponse.items)) {
        console.log(`[Instagram Mapper] Found items array with ${apiResponse.items.length} items`);
        itemsArray = apiResponse.items;
    } else if (apiResponse.reels && Array.isArray(apiResponse.reels)) {
        console.log(`[Instagram Mapper] Found reels array with ${apiResponse.reels.length} items`);
        itemsArray = apiResponse.reels;
    } else {
        console.error(`[Instagram Mapper] Could not find items array in response structure:`, Object.keys(apiResponse));
        console.log(`[Instagram Mapper] Full response for debugging:`, apiResponse);
        return [];
    }

    if (!itemsArray || itemsArray.length === 0) {
        console.log(`[Instagram Mapper] No items found in response`);
        return [];
    }

    console.log(`[Instagram Mapper] Processing ${itemsArray.length} items`);

    const extractedData = itemsArray.map((item, index) => {
        console.log(`[Instagram Mapper] Processing item ${index + 1}/${itemsArray.length}`);
        console.log(`[Instagram Mapper] Raw item structure:`, {
            hasItem: !!item,
            itemKeys: item && typeof item === 'object' ? Object.keys(item) : null,
            itemType: typeof item
        });

        try {
            // Extract fields with fallbacks and debug logging
            const username = extractField(item, ['user.username', 'owner.username', 'username', 'author.username'], 'Unknown');
            const followers = extractNumericField(item, ['user.follower_count', 'owner.follower_count', 'follower_count', 'followers'], 0);
            const title = extractField(item, ['caption.text', 'caption', 'description', 'text', 'title'], 'No caption');
            const views = extractNumericField(item, ['play_count', 'view_count', 'views', 'video_view_count'], 0);
            const likes = extractNumericField(item, ['like_count', 'likes'], 0);
            const comments = extractNumericField(item, ['comment_count', 'comments'], 0);
            const shares = extractNumericField(item, ['reshare_count', 'share_count', 'shares'], 0); // API uses reshare_count
            
            // Calculate performance score (likes-to-views ratio)
            const calculatePerformance = (likes, views) => {
                if (views === 0) return 0;
                // Scale the ratio to 0-100, where 10% like ratio = 100 score
                const ratio = (likes / views) * 1000;
                return Math.min(100, Math.max(0, Math.round(ratio)));
            };
            
            const performance = calculatePerformance(likes, views);
            
            // Extract URL using code field for proper Instagram URLs
            let url = extractField(item, ['permalink', 'url', 'link']);
            if (!url) {
                // Use code field to generate Instagram post URL
                const code = extractField(item, ['code', 'shortcode']);
                if (code) {
                    url = `https://www.instagram.com/p/${code}/`;
                    console.log(`[Instagram Mapper] Generated URL from code: ${url}`);
                } else {
                    // Fallback to other ID fields
                    const postId = extractField(item, ['id', 'pk', 'media_id']);
                    if (postId) {
                        url = `https://www.instagram.com/p/${postId}/`;
                        console.log(`[Instagram Mapper] Generated URL from postId: ${url}`);
                    } else if (username !== 'Unknown') {
                        url = `https://www.instagram.com/${username}/`;
                        console.log(`[Instagram Mapper] Generated profile URL: ${url}`);
                    } else {
                        url = 'https://www.instagram.com/';
                        console.log(`[Instagram Mapper] Using fallback URL`);
                    }
                }
            } else {
                console.log(`[Instagram Mapper] Using direct URL from API: ${url}`);
            }

            const extractedItem = {
                username,
                followers,
                title: truncateText(title, 100), // Truncate long captions
                views,
                likes,
                comments,
                shares,
                performance,
                url
            };

            console.log(`[Instagram Mapper] Extracted item ${index + 1}:`, {
                username: extractedItem.username,
                followers: extractedItem.followers,
                titleLength: extractedItem.title.length,
                views: extractedItem.views,
                likes: extractedItem.likes,
                comments: extractedItem.comments,
                shares: extractedItem.shares,
                hasUrl: !!extractedItem.url
            });

            return extractedItem;

        } catch (error) {
            console.error(`[Instagram Mapper] Error processing item ${index + 1}:`, {
                error: error.message,
                item: item
            });
            
            // Return a fallback item
            return {
                username: 'Error',
                followers: 0,
                title: 'Error processing item',
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                performance: 0,
                url: 'https://www.instagram.com/'
            };
        }
    });

    console.log(`[Instagram Mapper] Successfully extracted ${extractedData.length} items`);
    console.log(`[Instagram Mapper] Sample extracted data:`, extractedData.slice(0, 2));

    return extractedData;
}

/**
 * Helper function to extract field value from nested object paths
 * @param {Object} obj - Object to extract from
 * @param {Array<string>} paths - Array of dot-notation paths to try
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Extracted value or default
 */
function extractField(obj, paths, defaultValue = null) {
    for (const path of paths) {
        try {
            const value = path.split('.').reduce((current, key) => current?.[key], obj);
            if (value !== undefined && value !== null && value !== '') {
                console.log(`[Instagram Mapper] Found field at path '${path}':`, typeof value === 'string' ? value.substring(0, 50) + '...' : value);
                return value;
            }
        } catch (error) {
            console.log(`[Instagram Mapper] Failed to extract path '${path}':`, error.message);
        }
    }
    
    console.log(`[Instagram Mapper] Field not found in any path ${JSON.stringify(paths)}, using default:`, defaultValue);
    return defaultValue;
}

/**
 * Helper function to extract and parse numeric field
 * @param {Object} obj - Object to extract from
 * @param {Array<string>} paths - Array of dot-notation paths to try
 * @param {number} defaultValue - Default value if not found
 * @returns {number} Parsed numeric value or default
 */
function extractNumericField(obj, paths, defaultValue = 0) {
    const value = extractField(obj, paths, defaultValue);
    
    if (typeof value === 'number') {
        return Math.max(0, Math.floor(value)); // Ensure non-negative integer
    }
    
    if (typeof value === 'string') {
        const parsed = parseInt(value.replace(/[^0-9]/g, ''), 10);
        return isNaN(parsed) ? defaultValue : Math.max(0, parsed);
    }
    
    console.log(`[Instagram Mapper] Could not parse numeric value:`, value, `using default:`, defaultValue);
    return defaultValue;
}

/**
 * Helper function to truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    
    if (text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength - 3) + '...';
}