import { getApiKey } from '../utils/apiKeyManager';
import { trackOperation, canPerformOperation } from '../utils/quotaManager';

// Get API key from storage or environment  
async function getRapidApiKey() {
    return await getApiKey('rapidApiKey', 'VITE_INSTAGRAM_ACCESS_TOKEN');
}

// Instagram RapidAPI configuration
const RAPIDAPI_HOST = 'instagram-api23.p.rapidapi.com'; // Update this to actual Instagram RapidAPI host
const BASE_URL = `https://${RAPIDAPI_HOST}`;

/**
 * Fetch Instagram media data
 * @param {string} mediaId - Instagram media ID
 * @returns {Promise<Object>} Media data response
 */
async function getMediaData(mediaId) {
    if (!canPerformOperation('instagram', 'request')) {
        throw new Error('Instagram API quota exceeded. Please try again next month.');
    }
    
    const apiKey = await getRapidApiKey();
    if (!apiKey) {
        throw new Error('RapidAPI key not found. Please configure it in Settings.');
    }
    const url = `${BASE_URL}/media/${mediaId}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        });
        if (!response.ok) {
            throw new Error(`Instagram API error: ${response.status}`);
        }
        
        trackOperation('instagram', 'request');
        return await response.json();
    } catch (error) {
        console.error('Error fetching Instagram media data:', error);
        throw error;
    }
}

/**
 * Fetch Instagram user data
 * @param {string} userId - Instagram user ID
 * @returns {Promise<Object>} User data response
 */
async function getUserData(userId) {
    if (!canPerformOperation('instagram', 'request')) {
        throw new Error('Instagram API quota exceeded. Please try again next month.');
    }
    
    const apiKey = await getRapidApiKey();
    if (!apiKey) {
        throw new Error('RapidAPI key not found. Please configure it in Settings.');
    }
    const url = `${BASE_URL}/user/${userId}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        });
        if (!response.ok) {
            throw new Error(`Instagram API error: ${response.status}`);
        }
        
        trackOperation('instagram', 'request');
        return await response.json();
    } catch (error) {
        console.error('Error fetching Instagram user data:', error);
        throw error;
    }
}

/**
 * Fetch user's media posts
 * @param {string} userId - Instagram user ID
 * @param {number} limit - Number of posts to fetch (default: 10)
 * @returns {Promise<Object>} User media response
 */
async function getUserMedia(userId, limit = 10) {
    if (!canPerformOperation('instagram', 'request')) {
        throw new Error('Instagram API quota exceeded. Please try again next month.');
    }
    
    const apiKey = await getRapidApiKey();
    if (!apiKey) {
        throw new Error('RapidAPI key not found. Please configure it in Settings.');
    }
    
    const url = `${BASE_URL}/${userId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${apiKey}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Instagram API error: ${response.status}`);
        }
        
        trackOperation('instagram', 'request');
        return await response.json();
    } catch (error) {
        console.error('Error fetching Instagram user media:', error);
        throw error;
    }
}

export {
    getMediaData,
    getUserData,
    getUserMedia
};