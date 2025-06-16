import { getApiKey } from '../utils/apiKeyManager';
import { trackOperation, canPerformOperation } from '../utils/quotaManager';

// Get API key from storage or environment
async function getRapidApiKey() {
    return await getApiKey('rapidApiKey', 'VITE_TIKTOK_RAPIDAPI_KEY');
}

// Hardcoded RapidAPI host for TikTok
const RAPIDAPI_HOST = 'tiktok-api23.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}/api`;

/**
 * Fetch TikTok user info by username
 * @param {string} uniqueId - TikTok username (uniqueId)
 * @returns {Promise<Object>} User data response
 */
async function getUserData(uniqueId) {
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
            throw new Error(`TikTok API error: ${response.status}`);
        }
        
        trackOperation('tiktok', 'request');
        return await response.json();
    } catch (error) {
        console.error('Error fetching TikTok user data:', error);
        throw error;
    }
}

/**
 * Search TikTok videos by keyword
 * @param {string} keyword - Search keyword
 * @param {number} cursor - Pagination cursor (default: 0)
 * @param {number} searchId - Search ID (default: 0)
 * @returns {Promise<Object>} Video search response
 */
async function searchVideos(keyword, cursor = 0, searchId = 0) {
    if (!canPerformOperation('tiktok', 'request')) {
        throw new Error('TikTok API quota exceeded. Please try again next month.');
    }
    
    const apiKey = await getRapidApiKey();
    
    if (!apiKey) {
        throw new Error('RapidAPI key not found. Please configure it in Settings.');
    }
    
    const url = `${BASE_URL}/search/video?keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&search_id=${searchId}`;
    
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
        console.error('Error searching TikTok videos:', error);
        throw error;
    }
}

/**
 * Fetch user's TikTok videos
 * @param {string} uniqueId - TikTok username (uniqueId)  
 * @param {number} count - Number of videos to fetch (default: 10)
 * @returns {Promise<Object>} User videos response
 */
async function getUserVideos(uniqueId, count = 10) {
    if (!canPerformOperation('tiktok', 'request')) {
        throw new Error('TikTok API quota exceeded. Please try again next month.');
    }
    
    const apiKey = await getRapidApiKey();
    
    if (!apiKey) {
        throw new Error('RapidAPI key not found. Please configure it in Settings.');
    }
    
    const url = `${BASE_URL}/user/videos?uniqueId=${uniqueId}&count=${count}`;
    
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
        console.error('Error fetching TikTok user videos:', error);
        throw error;
    }
}

export {
    getUserData,
    getUserVideos,
    searchVideos
};