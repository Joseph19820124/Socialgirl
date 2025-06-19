import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
    searchVideos, 
    getVideosStatistics,
    getChannelVideosByHandle,
    getChannelByHandle
} from '../../apis/youtube';
import * as apiKeyManager from '../../utils/apiKeyManager';
import * as quotaManager from '../../utils/quotaManager';

// Mock dependencies
vi.mock('../../utils/apiKeyManager');
vi.mock('../../utils/quotaManager');

// Mock fetch
global.fetch = vi.fn();

describe('YouTube API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mocks
        apiKeyManager.getApiKey.mockResolvedValue('test-api-key');
        quotaManager.canPerformOperation.mockReturnValue(true);
        quotaManager.trackOperation.mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('searchVideos', () => {
        it('should search videos successfully', async () => {
            const mockResponse = {
                items: [
                    { id: { videoId: 'video1' }, snippet: { title: 'Video 1' } },
                    { id: { videoId: 'video2' }, snippet: { title: 'Video 2' } }
                ]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await searchVideos('test query', 10);

            expect(apiKeyManager.getApiKey).toHaveBeenCalledWith('youtubeApiKey', 'VITE_YOUTUBE_API_KEY');
            expect(quotaManager.canPerformOperation).toHaveBeenCalledWith('youtube', 'search');
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('https://www.googleapis.com/youtube/v3/search')
            );
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('q=test%20query')
            );
            expect(result).toEqual(mockResponse);
            expect(quotaManager.trackOperation).toHaveBeenCalledWith('youtube', 'search');
        });

        it('should use custom options', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ items: [] })
            });

            await searchVideos('test', 20, {
                order: 'date',
                publishedAfter: '2024-01-01T00:00:00Z',
                regionCode: 'US'
            });

            const url = fetch.mock.calls[0][0];
            expect(url).toContain('order=date');
            expect(url).toContain('publishedAfter=2024-01-01T00:00:00Z');
            expect(url).toContain('regionCode=US');
            expect(url).toContain('maxResults=20');
        });

        it('should throw error when quota exceeded', async () => {
            quotaManager.canPerformOperation.mockReturnValue(false);

            await expect(searchVideos('test'))
                .rejects.toThrow('YouTube API quota exceeded. Please try again tomorrow.');
        });

        it('should throw error when API key not found', async () => {
            apiKeyManager.getApiKey.mockResolvedValue(null);

            await expect(searchVideos('test'))
                .rejects.toThrow('YouTube API key not found. Please configure it in Settings.');
        });

        it('should throw error on API error response', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 403
            });

            await expect(searchVideos('test'))
                .rejects.toThrow('YouTube API error: 403');
        });
    });

    describe('getVideosStatistics', () => {
        it('should get video statistics for multiple videos', async () => {
            const mockResponse = {
                items: [
                    { 
                        id: 'video1',
                        statistics: { viewCount: '1000', likeCount: '100' }
                    },
                    { 
                        id: 'video2',
                        statistics: { viewCount: '2000', likeCount: '200' }
                    }
                ]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await getVideosStatistics(['video1', 'video2']);

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('id=video1,video2')
            );
            expect(result).toEqual(mockResponse);
        });

        it('should handle empty video IDs array', async () => {
            const result = await getVideosStatistics([]);
            expect(result).toEqual({ items: [] });
            expect(fetch).not.toHaveBeenCalled();
        });

        it('should handle large video ID arrays', async () => {
            // Create array of 60 video IDs
            const videoIds = Array(60).fill(null).map((_, i) => `video${i}`);
            
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ items: Array(60).fill({ id: 'video' }) })
            });

            const result = await getVideosStatistics(videoIds);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(result.items).toHaveLength(60);
        });
    });

    describe('getChannelByHandle', () => {
        it('should get channel ID from handle', async () => {
            const mockResponse = {
                items: [{
                    id: { channelId: 'channel123' },
                    snippet: { title: 'Test Channel' }
                }]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await getChannelByHandle('@testchannel');

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('q=testchannel')
            );
            expect(result).toBe('channel123');
        });

        it('should throw error when channel not found', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ items: [] })
            });

            // getChannelByHandle returns null when not found, doesn't throw
            const result = await getChannelByHandle('@unknown');
            expect(result).toBe(null);
        });
    });

    describe('getChannelVideosByHandle', () => {
        it('should get channel videos by handle', async () => {
            // Mock channel lookup
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    items: [{ id: { channelId: 'channel123' } }]
                })
            });

            // Mock search results
            const mockVideos = {
                items: [
                    { id: { videoId: 'video1' } },
                    { id: { videoId: 'video2' } }
                ]
            };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockVideos
            });

            // Mock video statistics
            const mockStats = [
                { id: 'video1', statistics: { viewCount: '1000' } },
                { id: 'video2', statistics: { viewCount: '2000' } }
            ];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ items: mockStats })
            });

            const result = await getChannelVideosByHandle('@testchannel', 10);

            expect(fetch).toHaveBeenCalledTimes(3);
            expect(result).toEqual({ items: mockStats });
        });

        it('should filter out videos without videoId', async () => {
            // Mock channel lookup
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    items: [{ id: { channelId: 'channel123' } }]
                })
            });

            // Mock search results with some invalid items
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    items: [
                        { id: { videoId: 'video1' } },
                        { id: {} }, // No videoId
                        { id: { videoId: 'video2' } }
                    ]
                })
            });

            // Mock video statistics
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    items: [
                        { id: 'video1', statistics: {} },
                        { id: 'video2', statistics: {} }
                    ]
                })
            });

            const result = await getChannelVideosByHandle('@testchannel');

            // Should only request stats for valid video IDs
            expect(fetch.mock.calls[2][0]).toContain('id=video1,video2');
            expect(result.items).toHaveLength(2);
        });
    });
});