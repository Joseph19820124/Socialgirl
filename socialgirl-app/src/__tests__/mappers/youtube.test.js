import { describe, it, expect } from 'vitest';
import {
    extractVideoData,
    extractChannelData
} from '../../mappers/youtube';

describe('YouTube Mapper', () => {
    describe('extractVideoData', () => {
        it('should extract video data with all fields', () => {
            const mockData = {
                items: [
                    {
                        id: 'videoId123',
                        snippet: {
                            title: 'Amazing YouTube Video',
                            channelTitle: 'Test Channel',
                            publishedAt: '2024-01-01T00:00:00Z'
                        },
                        statistics: {
                            viewCount: '1000000',
                            likeCount: '50000',
                            commentCount: '10000'
                        }
                    }
                ]
            };

            const result = extractVideoData(mockData);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                username: 'Test Channel',
                title: 'Amazing YouTube Video',
                views: 1000000,
                likes: 50000,
                comments: 10000,
                performance: 50, // (50000/1000000) * 1000 = 50
                url: 'https://youtube.com/watch?v=videoId123',
                publishedAt: '2024-01-01T00:00:00Z'
            });
        });

        it('should handle video ID in search result format', () => {
            const mockData = {
                items: [
                    {
                        id: { videoId: 'searchResultId' },
                        snippet: {
                            title: 'Search Result Video',
                            channelTitle: 'Channel',
                            publishedAt: '2024-01-01T00:00:00Z'
                        }
                    }
                ]
            };

            const result = extractVideoData(mockData);
            expect(result[0].url).toBe('https://youtube.com/watch?v=searchResultId');
        });

        it('should handle missing statistics', () => {
            const mockData = {
                items: [
                    {
                        id: 'video456',
                        snippet: {
                            title: 'Video without stats',
                            channelTitle: 'Test Channel',
                            publishedAt: '2024-01-01T00:00:00Z'
                        }
                    }
                ]
            };

            const result = extractVideoData(mockData);
            expect(result[0]).toEqual({
                username: 'Test Channel',
                title: 'Video without stats',
                views: 0,
                likes: 0,
                comments: 0,
                performance: 0,
                url: 'https://youtube.com/watch?v=video456',
                publishedAt: '2024-01-01T00:00:00Z'
            });
        });

        it('should handle empty items array', () => {
            const mockData = { items: [] };
            const result = extractVideoData(mockData);
            expect(result).toEqual([]);
        });

        it('should handle null/undefined data', () => {
            expect(extractVideoData(null)).toEqual([]);
            expect(extractVideoData(undefined)).toEqual([]);
            expect(extractVideoData({})).toEqual([]);
        });

        it('should calculate performance correctly', () => {
            const mockData = {
                items: [
                    {
                        id: 'video111',
                        snippet: {
                            title: 'Test',
                            channelTitle: 'Channel',
                            publishedAt: '2024-01-01T00:00:00Z'
                        },
                        statistics: {
                            viewCount: '10000',
                            likeCount: '1000', // 10% engagement
                            commentCount: '100'
                        }
                    }
                ]
            };

            const result = extractVideoData(mockData);
            expect(result[0].performance).toBe(100); // (1000/10000) * 1000 = 100
        });

        it('should cap performance at 100', () => {
            const mockData = {
                items: [
                    {
                        id: 'video222',
                        snippet: {
                            title: 'High Engagement',
                            channelTitle: 'Channel',
                            publishedAt: '2024-01-01T00:00:00Z'
                        },
                        statistics: {
                            viewCount: '100',
                            likeCount: '50' // 50% engagement
                        }
                    }
                ]
            };

            const result = extractVideoData(mockData);
            expect(result[0].performance).toBe(100); // Should be capped at 100
        });
    });

    describe('extractChannelData', () => {
        it('should extract channel data with all fields', () => {
            const mockData = {
                items: [
                    {
                        id: 'channel123',
                        snippet: {
                            title: 'Amazing Channel',
                            description: 'This is a test channel',
                            customUrl: 'amazingchannel'
                        },
                        statistics: {
                            subscriberCount: '100000',
                            videoCount: '500'
                        }
                    }
                ]
            };

            const result = extractChannelData(mockData);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                username: 'Amazing Channel',
                followers: 100000,
                about: 'This is a test channel',
                media: 500,
                url: 'https://youtube.com/@amazingchannel'
            });
        });

        it('should handle missing statistics', () => {
            const mockData = {
                items: [
                    {
                        id: 'channel456',
                        snippet: {
                            title: 'Channel without stats',
                            description: 'Test'
                        },
                        statistics: {}
                    }
                ]
            };

            const result = extractChannelData(mockData);
            expect(result[0]).toEqual({
                username: 'Channel without stats',
                followers: 0,
                about: 'Test',
                media: 0,
                url: 'https://youtube.com/channel/channel456'
            });
        });

        it('should handle channel without customUrl', () => {
            const mockData = {
                items: [
                    {
                        id: 'channelABC',
                        snippet: {
                            title: 'Channel',
                            description: 'Test'
                        },
                        statistics: {
                            subscriberCount: '1000',
                            videoCount: '10'
                        }
                    }
                ]
            };

            const result = extractChannelData(mockData);
            expect(result[0].url).toBe('https://youtube.com/channel/channelABC');
        });

        it('should handle empty items array', () => {
            const mockData = { items: [] };
            const result = extractChannelData(mockData);
            expect(result).toEqual([]);
        });

        it('should handle null/undefined data', () => {
            expect(extractChannelData(null)).toEqual([]);
            expect(extractChannelData(undefined)).toEqual([]);
            expect(extractChannelData({})).toEqual([]);
        });
    });
});