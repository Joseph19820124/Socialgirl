import { searchVideos as searchYouTube, getVideosStatistics, getChannelVideosByHandle } from '../apis/youtube';
import { searchVideos as searchTikTok, getUserInfo, getUserPopularPosts } from '../apis/tiktok';
import { searchReels, searchReelsWithPagination, getUserReels } from '../apis/instagram';
import { extractVideoData as extractYouTubeData } from '../mappers/youtube';
import { extractVideoData as extractTikTokData, extractUsersDataFromSearch as extractTikTokUsersData, extractUserPostsData as extractTikTokUserPostsData } from '../mappers/tiktok';
import { extractVideoData as extractInstagramVideoData, extractUserPostsData as extractInstagramUserPostsData } from '../mappers/instagram';
import { getYouTubeSettings, getPublishedAfterDate } from '../utils/youtubeSettings';

class SearchService {
    constructor() {
        this.strategies = {
            youtube: new YouTubeSearchStrategy(),
            tiktok: new TikTokSearchStrategy(),
            instagram: new InstagramSearchStrategy()
        };
    }

    async search(platform, query, context = {}) {
        if (!query.trim()) return [];
        
        const strategy = this.strategies[platform];
        if (!strategy) {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        return await strategy.search(query, context);
    }

}

class YouTubeSearchStrategy {
    async search(query, context = {}) {
        const { activeTab } = context;
        
        // For User Videos tab, treat query as a channel handle
        if (activeTab === 'userVideos') {
            return await this.searchChannelVideos(query);
        }
        
        // Regular video search for Videos tab
        return await this.searchVideos(query);
    }
    
    async searchVideos(query) {
        // Get user settings from localStorage
        const settings = getYouTubeSettings();
        const publishedAfter = getPublishedAfterDate(settings.publishedFilter);
        
        // Prepare options with user settings
        const searchOptions = {
            publishedAfter,
            regionCode: settings.regionCode
        };
        
        // Increased from 50 to maximize API efficiency for better sorting
        const searchResponse = await searchYouTube(query, 50, searchOptions);
        
        const videoIds = searchResponse.items
            .map(item => item.id?.videoId)
            .filter(id => id);
        
        const videosWithStats = await getVideosStatistics(videoIds);
        
        return extractYouTubeData(videosWithStats);
    }
    
    async searchChannelVideos(handle) {
        try {
            // Increased from 20 to 50 for better sorting across all channel videos
            const channelVideos = await getChannelVideosByHandle(handle, 50);
            return extractYouTubeData(channelVideos);
        } catch (error) {
            // If channel not found, return empty array with helpful error
            if (error.message.includes('Channel not found')) {
                console.warn(`YouTube channel not found for handle: ${handle}`);
                return [];
            }
            throw error;
        }
    }

}

class TikTokSearchStrategy {
    async search(query, context = {}) {
        const { activeTab } = context;
        
        // For User Videos/User Posts tab, do 2-step flow: username -> secUid -> popular posts
        if (activeTab === 'userVideos' || activeTab === 'userPosts') {
            return await this.searchUserPosts(query);
        }
        
        // For other tabs, use general search
        const response = await searchTikTok(query);
        
        // For Users tab, extract user data; otherwise extract video data
        if (activeTab === 'users') {
            return extractTikTokUsersData(response);
        }
        
        return extractTikTokData(response);
    }

    async searchUserPosts(username) {
        try {
            // Step 1: Get user info to extract secUid
            const userInfoResponse = await getUserInfo(username);
            
            if (!userInfoResponse.userInfo || !userInfoResponse.userInfo.user) {
                throw new Error(`User '${username}' not found`);
            }
            
            const secUid = userInfoResponse.userInfo.user.secUid;
            
            if (!secUid) {
                throw new Error(`Could not get secUid for user '${username}'`);
            }
            
            // Step 2: Get popular posts using secUid
            const postsResponse = await getUserPopularPosts(secUid);
            
            // Step 3: Extract and return user posts data
            const extractedData = extractTikTokUserPostsData(postsResponse);
            
            return extractedData;
            
        } catch (error) {
            console.error('Error in TikTok user posts search:', error);
            
            // Provide more specific error messages
            if (error.message.includes('not found')) {
                throw new Error(`TikTok user '${username}' not found. Please check the username.`);
            } else if (error.message.includes('secUid')) {
                throw new Error(`Unable to get user data for '${username}'. User may not exist or be private.`);
            }
            
            throw error;
        }
    }

}

class InstagramSearchStrategy {
    async search(query, context = {}) {
        console.log(`[Instagram Search] Starting search with query: "${query}"`);
        console.log(`[Instagram Search] Search context:`, context);
        
        const { activeTab } = context;
        
        // For Videos tab, search reels by keyword
        if (activeTab === 'videos') {
            return await this.searchVideos(query);
        }
        
        // For User Videos tab, fetch user reels/posts
        if (activeTab === 'userVideos') {
            return await this.searchUserPosts(query);
        }
        
        // For other tabs, Instagram search is not yet implemented
        console.warn(`[Instagram Search] Tab "${activeTab}" not yet implemented`);
        return [];
    }

    async searchVideos(keyword) {
        console.log(`[Instagram Search] Starting video search for keyword: "${keyword}"`);
        
        try {
            console.log(`[Instagram Search] Calling searchReelsWithPagination API...`);
            const apiResponse = await searchReelsWithPagination(keyword, 24); // Get up to 24 results
            
            console.log(`[Instagram Search] API call successful, processing response...`);
            const extractedData = extractInstagramVideoData(apiResponse);
            
            console.log(`[Instagram Search] Data extraction complete. Found ${extractedData.length} videos`);
            
            return extractedData;
            
        } catch (error) {
            console.error(`[Instagram Search] Error in searchVideos:`, {
                keyword,
                errorMessage: error.message,
                errorType: error.constructor.name,
                stack: error.stack
            });
            
            // Re-throw with more user-friendly message if needed
            if (error.message.includes('RapidAPI key not found')) {
                throw error; // Pass through the original error message
            } else if (error.message.includes('quota exceeded')) {
                throw new Error('Instagram API quota exceeded. Please try again later.');
            } else {
                throw new Error(`Failed to search Instagram videos: ${error.message}`);
            }
        }
    }

    async searchUserPosts(username) {
        console.log(`[Instagram Search] Starting user posts search for username: "${username}"`);
        
        // Validate username
        if (!username || typeof username !== 'string' || !username.trim()) {
            const errorMsg = 'Please provide a valid Instagram username';
            console.error(`[Instagram Search] Validation failed: ${errorMsg}`);
            throw new Error(errorMsg);
        }

        const cleanUsername = username.trim().replace('@', ''); // Remove @ if present
        console.log(`[Instagram Search] Cleaned username: "${cleanUsername}"`);

        try {
            console.log(`[Instagram Search] Calling getUserReels API...`);
            const apiResponse = await getUserReels(cleanUsername);
            
            console.log(`[Instagram Search] API call successful, processing response...`);
            const extractedData = extractInstagramUserPostsData(apiResponse);
            
            console.log(`[Instagram Search] Data extraction complete. Found ${extractedData.length} posts`);
            
            if (extractedData.length === 0) {
                console.warn(`[Instagram Search] No posts found for username: "${cleanUsername}"`);
            } else {
                console.log(`[Instagram Search] Sample extracted post:`, {
                    username: extractedData[0]?.username,
                    title: extractedData[0]?.title?.substring(0, 50) + '...',
                    likes: extractedData[0]?.likes,
                    views: extractedData[0]?.views
                });
            }
            
            return extractedData;
            
        } catch (error) {
            console.error(`[Instagram Search] Error in searchUserPosts:`, {
                username: cleanUsername,
                errorMessage: error.message,
                errorType: error.constructor.name,
                stack: error.stack
            });
            
            // Re-throw with more user-friendly message if needed
            if (error.message.includes('API key')) {
                throw new Error('Instagram API key not configured. Please check your settings.');
            } else if (error.message.includes('quota exceeded')) {
                throw new Error('Instagram API quota exceeded. Please try again later.');
            } else if (error.message.includes('404') || error.message.includes('not found')) {
                throw new Error(`Instagram user "${cleanUsername}" not found. Please check the username.`);
            } else {
                throw new Error(`Failed to fetch Instagram posts: ${error.message}`);
            }
        }
    }

}

export default SearchService;