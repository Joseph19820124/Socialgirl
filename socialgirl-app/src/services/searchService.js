import { searchVideos as searchYouTube, getVideosStatistics, getChannelVideosByHandle } from '../apis/youtube';
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
        const searchResponse = await searchYouTube(query, 50);
        
        const videoIds = searchResponse.items
            .map(item => item.id?.videoId)
            .filter(id => id);
        
        const videosWithStats = await getVideosStatistics(videoIds);
        
        return extractYouTubeData(videosWithStats);
    }
    
    async searchChannelVideos(handle) {
        try {
            const channelVideos = await getChannelVideosByHandle(handle, 20);
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
    async search(query) {
        const response = await searchTikTok(query);
        return extractTikTokData(response);
    }

}

class InstagramSearchStrategy {
    async search(query) {
        console.log('Instagram search for:', query);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return [];
    }

}

export default SearchService;