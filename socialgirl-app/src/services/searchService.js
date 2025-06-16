import { searchVideos as searchYouTube, getVideosStatistics } from '../apis/youtube';
import { searchVideos as searchTikTok } from '../apis/tiktok';
import { extractVideoData as extractYouTubeData } from '../mappers/youtube';
import { extractVideoData as extractTikTokData } from '../mappers/tiktok';

class SearchService {
    constructor() {
        this.strategies = {
            youtube: new YouTubeSearchStrategy(),
            tiktok: new TikTokSearchStrategy(),
            instagram: new InstagramSearchStrategy()
        };
    }

    async search(platform, query) {
        if (!query.trim()) return [];
        
        const strategy = this.strategies[platform];
        if (!strategy) {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        return await strategy.search(query);
    }

    async searchUserVideos(platform, query) {
        if (!query.trim()) return [];
        
        const strategy = this.strategies[platform];
        if (!strategy) {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        return await strategy.searchUserVideos(query);
    }
}

class YouTubeSearchStrategy {
    async search(query) {
        const searchResponse = await searchYouTube(query, 50);
        
        const videoIds = searchResponse.items
            .map(item => item.id?.videoId)
            .filter(id => id);
        
        const videosWithStats = await getVideosStatistics(videoIds);
        
        return extractYouTubeData(videosWithStats);
    }

    async searchUserVideos(query) {
        // Get video data first
        const videos = await this.search(query);
        
        // Aggregate videos by creator/channel
        const userVideosMap = new Map();
        
        videos.forEach(video => {
            const username = video.username;
            if (!userVideosMap.has(username)) {
                userVideosMap.set(username, {
                    username: username,
                    followers: video.followers || 0,
                    videoCount: 0,
                    totalViews: 0,
                    totalLikes: 0,
                    totalComments: 0,
                    videos: [],
                    url: video.channelUrl || '#'
                });
            }
            
            const userEntry = userVideosMap.get(username);
            userEntry.videoCount++;
            userEntry.totalViews += parseInt(video.views) || 0;
            userEntry.totalLikes += parseInt(video.likes) || 0;
            userEntry.totalComments += parseInt(video.comments) || 0;
            userEntry.videos.push(video);
        });
        
        // Convert map to array and calculate averages
        return Array.from(userVideosMap.values()).map(user => ({
            ...user,
            avgViews: user.videoCount > 0 ? Math.round(user.totalViews / user.videoCount) : 0,
            avgLikes: user.videoCount > 0 ? Math.round(user.totalLikes / user.videoCount) : 0,
            avgPerformance: user.videoCount > 0 ? Math.round((user.totalLikes / Math.max(user.totalViews, 1)) * 100) : 0
        })).sort((a, b) => b.totalViews - a.totalViews);
    }
}

class TikTokSearchStrategy {
    async search(query) {
        const response = await searchTikTok(query);
        return extractTikTokData(response);
    }

    async searchUserVideos(query) {
        // Get video data first
        const videos = await this.search(query);
        
        // Aggregate videos by creator
        const userVideosMap = new Map();
        
        videos.forEach(video => {
            const username = video.username;
            if (!userVideosMap.has(username)) {
                userVideosMap.set(username, {
                    username: username,
                    followers: video.followers || 0,
                    videoCount: 0,
                    totalViews: 0,
                    totalLikes: 0,
                    totalComments: 0,
                    videos: [],
                    url: video.profileUrl || '#'
                });
            }
            
            const userEntry = userVideosMap.get(username);
            userEntry.videoCount++;
            userEntry.totalViews += parseInt(video.views) || 0;
            userEntry.totalLikes += parseInt(video.likes) || 0;
            userEntry.totalComments += parseInt(video.comments) || 0;
            userEntry.videos.push(video);
        });
        
        // Convert map to array and calculate averages
        return Array.from(userVideosMap.values()).map(user => ({
            ...user,
            avgViews: user.videoCount > 0 ? Math.round(user.totalViews / user.videoCount) : 0,
            avgLikes: user.videoCount > 0 ? Math.round(user.totalLikes / user.videoCount) : 0,
            avgPerformance: user.videoCount > 0 ? Math.round((user.totalLikes / Math.max(user.totalViews, 1)) * 100) : 0
        })).sort((a, b) => b.totalViews - a.totalViews);
    }
}

class InstagramSearchStrategy {
    async search(query) {
        console.log('Instagram search for:', query);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return [];
    }

    async searchUserVideos(query) {
        console.log('Instagram user videos search for:', query);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return [];
    }
}

export default SearchService;