const RAPIDAPI_KEY = import.meta.env.VITE_TIKTOK_RAPIDAPI_KEY;
const RAPIDAPI_HOST = import.meta.env.VITE_TIKTOK_RAPIDAPI_HOST;
const BASE_URL = `https://${RAPIDAPI_HOST}/api`;

/**
 * Fetch TikTok user info by username
 * @param {string} uniqueId - TikTok username (uniqueId)
 * @returns {Promise<Object>} User data response
 */
async function getUserData(uniqueId) {
    const url = `${BASE_URL}/user/info?uniqueId=${uniqueId}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        });
        
        if (!response.ok) {
            throw new Error(`TikTok API error: ${response.status}`);
        }
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
    const url = `${BASE_URL}/search/video?keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&search_id=${searchId}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        });
        
        if (!response.ok) {
            throw new Error(`TikTok API error: ${response.status}`);
        }
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
    const url = `${BASE_URL}/user/videos?uniqueId=${uniqueId}&count=${count}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        });
        
        if (!response.ok) {
            throw new Error(`TikTok API error: ${response.status}`);
        }
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