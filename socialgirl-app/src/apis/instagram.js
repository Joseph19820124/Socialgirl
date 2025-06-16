const ACCESS_TOKEN = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN;
const BASE_URL = 'https://graph.instagram.com';

/**
 * Fetch Instagram media data
 * @param {string} mediaId - Instagram media ID
 * @returns {Promise<Object>} Media data response
 */
async function getMediaData(mediaId) {
    const url = `${BASE_URL}/${mediaId}?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${ACCESS_TOKEN}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Instagram API error: ${response.status}`);
        }
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
    const url = `${BASE_URL}/${userId}?fields=id,username,account_type,media_count,followers_count&access_token=${ACCESS_TOKEN}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Instagram API error: ${response.status}`);
        }
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
    const url = `${BASE_URL}/${userId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${ACCESS_TOKEN}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Instagram API error: ${response.status}`);
        }
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