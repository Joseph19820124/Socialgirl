import { getApiKey } from '../utils/apiKeyManager';
import { trackOperation, canPerformOperation } from '../utils/quotaManager';

// Get API key from storage or environment
async function getRapidApiKey() {
    return await getApiKey('rapidApiKey', 'VITE_RAPIDAPI_KEY');
}

// TikTok RapidAPI configuration
const RAPIDAPI_HOST = import.meta.env.VITE_TIKTOK_RAPIDAPI_HOST || 'tiktok-api23.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}/api`;

/**
 * Search TikTok content by keyword using general search
 * @param {string} keyword - Search keyword
 * @param {number} cursor - Pagination cursor (default: 0)
 * @param {number} searchId - Search ID (default: 0)
 * @returns {Promise<Object>} General search response with follower counts
 */
async function searchVideos(keyword, cursor = 0, searchId = 0) {
    if (!canPerformOperation('tiktok', 'request')) {
        throw new Error('TikTok API quota exceeded. Please try again next month.');
    }
    
    const apiKey = await getRapidApiKey();
    
    if (!apiKey) {
        throw new Error('RapidAPI key not found. Please configure it in Settings.');
    }
    
    const url = `${BASE_URL}/search/general?keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&search_id=${searchId}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        });
        
        if (!response.ok) {
            throw new Error(`TikTok API error: ${response.status}`);
        }
        
        trackOperation('tiktok', 'request');
        return await response.json();
    } catch (error) {
        // console.error('Error searching TikTok content:', error);
        throw error;
    }
}

/**
 * Get TikTok user info including secUid
 * @param {string} uniqueId - TikTok username (uniqueId)
 * @returns {Promise<Object>} User info response with secUid
 */
async function getUserInfo(uniqueId) {
    if (!canPerformOperation('tiktok', 'request')) {
        throw new Error('TikTok API quota exceeded. Please try again next month.');
    }
    
    const apiKey = await getRapidApiKey();
    
    if (!apiKey) {
        throw new Error('RapidAPI key not found. Please configure it in Settings.');
    }
    
    const url = `${BASE_URL}/user/info?uniqueId=${uniqueId}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`TikTok API error: ${response.status} - ${errorText}`);
        }
        
        trackOperation('tiktok', 'request');
        return await response.json();
    } catch (error) {
        // console.error('Error fetching TikTok user info:', error);
        throw error;
    }
}

/**
 * Get TikTok user's popular posts
 * @param {string} secUid - User's secure ID from getUserInfo
 * @param {number} count - Number of posts to fetch (default: 35)
 * @param {number} cursor - Pagination cursor (default: 0)
 * @returns {Promise<Object>} User popular posts response
 */
async function getUserPopularPosts(secUid, count = 35, cursor = 0) {
    if (!canPerformOperation('tiktok', 'request')) {
        throw new Error('TikTok API quota exceeded. Please try again next month.');
    }
    
    const apiKey = await getRapidApiKey();
    
    if (!apiKey) {
        throw new Error('RapidAPI key not found. Please configure it in Settings.');
    }
    
    const url = `${BASE_URL}/user/popular-posts?secUid=${secUid}&count=${count}&cursor=${cursor}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`TikTok API error: ${response.status} - ${errorText}`);
        }
        
        // Handle 204 No Content response (user has no popular posts)
        if (response.status === 204) {
            trackOperation('tiktok', 'request');
            return { data: { itemList: [] } }; // Return empty list structure
        }
        
        trackOperation('tiktok', 'request');
        return await response.json();
    } catch (error) {
        // console.error('Error fetching TikTok user popular posts:', error);
        throw error;
    }
}

export {
    searchVideos,
    getUserInfo,
    getUserPopularPosts
};