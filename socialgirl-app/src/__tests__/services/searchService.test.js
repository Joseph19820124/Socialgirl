import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchService from '../../services/searchService';
import * as youtubeApi from '../../apis/youtube';
import * as tiktokApi from '../../apis/tiktok';
import * as instagramApi from '../../apis/instagram';
import * as youtubeMapper from '../../mappers/youtube';
import * as tiktokMapper from '../../mappers/tiktok';
import * as instagramMapper from '../../mappers/instagram';
import * as youtubeSettings from '../../utils/youtubeSettings';

// Mock all dependencies
vi.mock('../../apis/youtube');
vi.mock('../../apis/tiktok');
vi.mock('../../apis/instagram');
vi.mock('../../mappers/youtube');
vi.mock('../../mappers/tiktok');
vi.mock('../../mappers/instagram');
vi.mock('../../utils/youtubeSettings');

describe('SearchService', () => {
    let searchService;

    beforeEach(() => {
        searchService = new SearchService();
        vi.clearAllMocks();
        
        // Setup default mocks
        youtubeSettings.getYouTubeSettings.mockReturnValue({
            publishedFilter: 'anytime',
            regionCode: 'US'
        });
        youtubeSettings.getPublishedAfterDate.mockReturnValue(null);
    });

    describe('search method', () => {
        it('should return empty array for empty query', async () => {
            const result = await searchService.search('youtube', '  ', {});
            expect(result).toEqual([]);
        });

        it('should throw error for unsupported platform', async () => {
            await expect(searchService.search('unsupported', 'query', {}))
                .rejects.toThrow('Unsupported platform: unsupported');
        });
    });

    describe('YouTube search', () => {
        it('should search YouTube videos', async () => {
            const mockSearchResponse = {
                items: [
                    { id: { videoId: 'video1' } },
                    { id: { videoId: 'video2' } }
                ]
            };
            const mockVideosWithStats = [
                { id: 'video1', statistics: { viewCount: '1000' } },
                { id: 'video2', statistics: { viewCount: '2000' } }
            ];
            const mockExtractedData = [
                { id: 'video1', views: 1000 },
                { id: 'video2', views: 2000 }
            ];

            youtubeApi.searchVideos.mockResolvedValue(mockSearchResponse);
            youtubeApi.getVideosStatistics.mockResolvedValue(mockVideosWithStats);
            youtubeMapper.extractVideoData.mockReturnValue(mockExtractedData);

            const result = await searchService.search('youtube', 'test query', { activeTab: 'videos' });

            expect(youtubeApi.searchVideos).toHaveBeenCalledWith('test query', 50, {
                publishedAfter: null,
                regionCode: 'US'
            });
            expect(youtubeApi.getVideosStatistics).toHaveBeenCalledWith(['video1', 'video2']);
            expect(youtubeMapper.extractVideoData).toHaveBeenCalledWith(mockVideosWithStats);
            expect(result).toEqual(mockExtractedData);
        });

        it('should search YouTube channel videos', async () => {
            const mockChannelVideos = [
                { id: 'video1', snippet: { title: 'Video 1' } },
                { id: 'video2', snippet: { title: 'Video 2' } }
            ];
            const mockExtractedData = [
                { id: 'video1', title: 'Video 1' },
                { id: 'video2', title: 'Video 2' }
            ];

            youtubeApi.getChannelVideosByHandle.mockResolvedValue(mockChannelVideos);
            youtubeMapper.extractVideoData.mockReturnValue(mockExtractedData);

            const result = await searchService.search('youtube', '@channelhandle', { activeTab: 'userVideos' });

            expect(youtubeApi.getChannelVideosByHandle).toHaveBeenCalledWith('@channelhandle', 50);
            expect(youtubeMapper.extractVideoData).toHaveBeenCalledWith(mockChannelVideos);
            expect(result).toEqual(mockExtractedData);
        });

        it('should return empty array when channel not found', async () => {
            youtubeApi.getChannelVideosByHandle.mockRejectedValue(new Error('Channel not found'));

            const result = await searchService.search('youtube', '@unknownchannel', { activeTab: 'userVideos' });

            expect(result).toEqual([]);
        });
    });

    describe('TikTok search', () => {
        it('should search TikTok videos', async () => {
            const mockResponse = { data: { videos: [] } };
            const mockExtractedData = [{ id: '1', title: 'Video 1' }];

            tiktokApi.searchVideos.mockResolvedValue(mockResponse);
            tiktokMapper.extractVideoData.mockReturnValue(mockExtractedData);

            const result = await searchService.search('tiktok', 'test query', { activeTab: 'videos' });

            expect(tiktokApi.searchVideos).toHaveBeenCalledWith('test query');
            expect(tiktokMapper.extractVideoData).toHaveBeenCalledWith(mockResponse);
            expect(result).toEqual(mockExtractedData);
        });

        it('should search TikTok users', async () => {
            const mockResponse = { data: { users: [] } };
            const mockExtractedData = [{ id: '1', username: 'user1' }];

            tiktokApi.searchVideos.mockResolvedValue(mockResponse);
            tiktokMapper.extractUsersDataFromSearch.mockReturnValue(mockExtractedData);

            const result = await searchService.search('tiktok', 'test query', { activeTab: 'users' });

            expect(tiktokApi.searchVideos).toHaveBeenCalledWith('test query');
            expect(tiktokMapper.extractUsersDataFromSearch).toHaveBeenCalledWith(mockResponse);
            expect(result).toEqual(mockExtractedData);
        });

        it('should search TikTok user posts', async () => {
            const mockUserInfo = {
                userInfo: { user: { secUid: 'secuid123' } }
            };
            const mockPosts = { data: { posts: [] } };
            const mockExtractedData = [{ id: '1', title: 'Post 1' }];

            tiktokApi.getUserInfo.mockResolvedValue(mockUserInfo);
            tiktokApi.getUserPopularPosts.mockResolvedValue(mockPosts);
            tiktokMapper.extractUserPostsData.mockReturnValue(mockExtractedData);

            const result = await searchService.search('tiktok', 'username', { activeTab: 'userPosts' });

            expect(tiktokApi.getUserInfo).toHaveBeenCalledWith('username');
            expect(tiktokApi.getUserPopularPosts).toHaveBeenCalledWith('secuid123');
            expect(tiktokMapper.extractUserPostsData).toHaveBeenCalledWith(mockPosts);
            expect(result).toEqual(mockExtractedData);
        });

        it('should throw error when TikTok user not found', async () => {
            tiktokApi.getUserInfo.mockResolvedValue({ userInfo: null });

            await expect(searchService.search('tiktok', 'unknownuser', { activeTab: 'userPosts' }))
                .rejects.toThrow("TikTok user 'unknownuser' not found. Please check the username.");
        });

        it('should throw user-friendly error for TikTok user not found', async () => {
            tiktokApi.getUserInfo.mockRejectedValue(new Error('User not found'));

            await expect(searchService.search('tiktok', 'unknownuser', { activeTab: 'userPosts' }))
                .rejects.toThrow("TikTok user 'unknownuser' not found. Please check the username.");
        });
    });

    describe('Instagram search', () => {
        it('should search Instagram videos', async () => {
            const mockResponse = { data: { reels: [] } };
            const mockExtractedData = [{ id: '1', title: 'Reel 1' }];

            instagramApi.searchReels.mockResolvedValue(mockResponse);
            instagramMapper.extractVideoData.mockReturnValue(mockExtractedData);

            const result = await searchService.search('instagram', 'test query', { activeTab: 'videos' });

            expect(instagramApi.searchReels).toHaveBeenCalledWith('test query');
            expect(instagramMapper.extractVideoData).toHaveBeenCalledWith(mockResponse);
            expect(result).toEqual(mockExtractedData);
        });

        it('should search Instagram user posts', async () => {
            const mockResponse = { data: { posts: [] } };
            const mockExtractedData = [{ id: '1', title: 'Post 1' }];

            instagramApi.getUserReels.mockResolvedValue(mockResponse);
            instagramMapper.extractUserPostsData.mockReturnValue(mockExtractedData);

            const result = await searchService.search('instagram', '@username', { activeTab: 'userVideos' });

            expect(instagramApi.getUserReels).toHaveBeenCalledWith('username');
            expect(instagramMapper.extractUserPostsData).toHaveBeenCalledWith(mockResponse);
            expect(result).toEqual(mockExtractedData);
        });

        it('should validate username for Instagram user posts', async () => {
            // Test with empty string - the search will return empty array for empty query
            const result = await searchService.search('instagram', '', { activeTab: 'userVideos' });
            expect(result).toEqual([]);
            
            // Test with whitespace only
            const result2 = await searchService.search('instagram', '   ', { activeTab: 'userVideos' });
            expect(result2).toEqual([]);
        });

        it('should handle Instagram API key error', async () => {
            instagramApi.searchReels.mockRejectedValue(new Error('API key missing'));

            await expect(searchService.search('instagram', 'test', { activeTab: 'videos' }))
                .rejects.toThrow('Instagram API key not configured. Please check your settings.');
        });

        it('should handle Instagram quota exceeded error', async () => {
            instagramApi.searchReels.mockRejectedValue(new Error('quota exceeded'));

            await expect(searchService.search('instagram', 'test', { activeTab: 'videos' }))
                .rejects.toThrow('Instagram API quota exceeded. Please try again later.');
        });

        it('should handle Instagram user not found error', async () => {
            instagramApi.getUserReels.mockRejectedValue(new Error('404 not found'));

            await expect(searchService.search('instagram', 'unknownuser', { activeTab: 'userVideos' }))
                .rejects.toThrow('Instagram user "unknownuser" not found. Please check the username.');
        });

        it('should return empty array for unimplemented Instagram tabs', async () => {
            const result = await searchService.search('instagram', 'test', { activeTab: 'users' });
            expect(result).toEqual([]);
        });
    });
});