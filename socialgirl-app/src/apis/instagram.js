import { getApiKey } from '../utils/apiKeyManager';
import { trackOperation, canPerformOperation } from '../utils/quotaManager';

// Get API key from storage or environment  
async function getRapidApiKey() {
    return await getApiKey('rapidApiKey', 'VITE_RAPIDAPI_KEY');
}

// Instagram RapidAPI configuration - using Vite proxy to bypass CORS
const RAPIDAPI_HOST = import.meta.env.VITE_INSTAGRAM_RAPIDAPI_HOST || 'instagram-scraper-20251.p.rapidapi.com';
const BASE_URL = `/api/instagram`; // Vite proxy will route to https://instagram-scraper-20251.p.rapidapi.com

/**
 * Search for Instagram reels by keyword
 * @param {string} keyword - Search keyword
 * @returns {Promise<Object>} Search results response
 */
async function searchReels(keyword) {
    // console.log(`[Instagram API] Starting searchReels for keyword: ${keyword}`);
    
    if (!canPerformOperation('instagram', 'request')) {
        const errorMsg = 'Instagram API quota exceeded. Please try again next month.';
        console.error(`Instagram API: Quota check failed: ${errorMsg}`);
        throw new Error(errorMsg);
    }
    
    const apiKey = await getRapidApiKey();
    if (!apiKey) {
        const errorMsg = 'RapidAPI key not found. Please configure it in Settings.';
        console.error(`Instagram API: API key missing: ${errorMsg}`);
        throw new Error(errorMsg);
    }
    
    // console.log(`[Instagram API] API key retrieved successfully (length: ${apiKey.length})`);
    
    const url = `${BASE_URL}/searchreels/?keyword=${encodeURIComponent(keyword)}`;
    // console.log(`[Instagram API] Making request to: ${url}`);
    
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey
            // x-rapidapi-host header is added by Vite proxy
        }
    };
    
    // console.log(`[Instagram API] Request headers:`, {
    //     'x-rapidapi-key': `${apiKey.substring(0, 8)}...`, // Log only first 8 chars for security
    //     'x-rapidapi-host': `${RAPIDAPI_HOST} (added by Vite proxy)`
    // });
    
    try {
        const response = await fetch(url, options);
        
        // console.log(`[Instagram API] Response status: ${response.status} ${response.statusText}`);
        // console.log(`[Instagram API] Response headers:`, Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Instagram API: Error response body:`, errorText);
            throw new Error(`Instagram API error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        // console.log(`[Instagram API] Success! Response data structure:`, {
        //     hasData: !!result,
        //     dataType: typeof result,
        //     hasDataObject: !!result.data,
        //     itemCount: result.data?.items?.length || 0
        // });
        
        trackOperation('instagram', 'request');
        // console.log(`[Instagram API] Operation tracked successfully`);
        
        return result;
    } catch (error) {
        console.error(`Instagram API: Error in searchReels:`, error.message);
        throw error;
    }
}

/**
 * Fetch user reels/posts from Instagram
 * @param {string} usernameOrId - Instagram username or user ID
 * @returns {Promise<Object>} User reels data response
 */
async function getUserReels(usernameOrId) {
    // console.log(`[Instagram API] Starting getUserReels for username: ${usernameOrId}`);
    
    if (!canPerformOperation('instagram', 'request')) {
        const errorMsg = 'Instagram API quota exceeded. Please try again next month.';
        console.error(`Instagram API: Quota check failed: ${errorMsg}`);
        throw new Error(errorMsg);
    }
    
    const apiKey = await getRapidApiKey();
    if (!apiKey) {
        const errorMsg = 'RapidAPI key not found. Please configure it in Settings.';
        console.error(`Instagram API: API key missing: ${errorMsg}`);
        throw new Error(errorMsg);
    }
    
    // console.log(`[Instagram API] API key retrieved successfully (length: ${apiKey.length})`);
    
    const url = `${BASE_URL}/userreels/?username_or_id=${encodeURIComponent(usernameOrId)}`;
    // console.log(`[Instagram API] Making request to: ${url}`);
    
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey
            // x-rapidapi-host header is added by Vite proxy
        }
    };
    
    // console.log(`[Instagram API] Request headers:`, {
    //     'x-rapidapi-key': `${apiKey.substring(0, 8)}...`, // Log only first 8 chars for security
    //     'x-rapidapi-host': `${RAPIDAPI_HOST} (added by Vite proxy)`
    // });
    
    try {
        const response = await fetch(url, options);
        
        // console.log(`[Instagram API] Response status: ${response.status} ${response.statusText}`);
        // console.log(`[Instagram API] Response headers:`, Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Instagram API: Error response body:`, errorText);
            throw new Error(`Instagram API error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        // console.log(`[Instagram API] Success! Response data structure:`, {
        //     hasData: !!result,
        //     dataType: typeof result,
        //     isArray: Array.isArray(result),
        //     keys: result && typeof result === 'object' ? Object.keys(result) : null,
        //     itemCount: Array.isArray(result) ? result.length : (result && result.items ? result.items.length : 'unknown')
        // });
        
        trackOperation('instagram', 'request');
        // console.log(`[Instagram API] Operation tracked successfully`);
        
        return result;
    } catch (error) {
        console.error(`Instagram API: Error in getUserReels:`, error.message);
        throw error;
    }
}

export {
    searchReels,
    getUserReels
};