import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    extractVideoData,
    extractUserPostsData
} from '../../mappers/instagram';

describe('Instagram Mapper', () => {
    beforeEach(() => {
        // Mock console methods
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('extractVideoData', () => {
        it('should extract video data with all fields', () => {
            const mockData = {
                data: {
                    items: [
                        {
                            user: {
                                username: 'testuser',
                                follower_count: 5000
                            },
                            caption: {
                                text: 'Test caption #hashtag'
                            },
                            play_count: 1000,
                            like_count: 100,
                            comment_count: 50,
                            share_count: 20,
                            code: 'ABC123'
                        }
                    ]
                }
            };

            const result = extractVideoData(mockData);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                username: 'testuser',
                followers: 5000,
                title: 'Test caption #hashtag',
                views: 1000,
                likes: 100,
                comments: 50,
                shares: 20,
                performance: 100, // (100/1000) * 1000 = 100
                url: 'https://www.instagram.com/reel/ABC123/'
            });
        });

        it('should handle missing optional fields', () => {
            const mockData = {
                data: {
                    items: [
                        {
                            user: {
                                username: 'user2'
                            },
                            code: 'XYZ789'
                        }
                    ]
                }
            };

            const result = extractVideoData(mockData);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                username: 'user2',
                followers: 0,
                title: 'No caption',
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                performance: 0,
                url: 'https://www.instagram.com/reel/XYZ789/'
            });
        });

        it('should handle ig_play_count as alternative to play_count', () => {
            const mockData = {
                data: {
                    items: [
                        {
                            user: { username: 'test' },
                            ig_play_count: 2000,
                            like_count: 200,
                            code: 'TEST'
                        }
                    ]
                }
            };

            const result = extractVideoData(mockData);
            expect(result[0].views).toBe(2000);
            expect(result[0].performance).toBe(100);
        });

        it('should truncate long captions', () => {
            const longCaption = 'A'.repeat(150);
            const mockData = {
                data: {
                    items: [
                        {
                            user: { username: 'test' },
                            caption: { text: longCaption },
                            code: 'TEST'
                        }
                    ]
                }
            };

            const result = extractVideoData(mockData);
            expect(result[0].title.length).toBeLessThanOrEqual(103); // 100 + '...'
        });

        it('should handle empty data array', () => {
            const mockData = { data: { items: [] } };
            const result = extractVideoData(mockData);
            expect(result).toEqual([]);
        });

        it('should handle null/undefined data', () => {
            expect(extractVideoData(null)).toEqual([]);
            expect(extractVideoData(undefined)).toEqual([]);
            expect(extractVideoData({})).toEqual([]);
            expect(extractVideoData({ data: null })).toEqual([]);
            expect(extractVideoData({ data: {} })).toEqual([]);
        });

        it('should calculate performance correctly', () => {
            const mockData = {
                data: {
                    items: [
                        {
                            user: { username: 'test' },
                            play_count: 10000,
                            like_count: 500, // 5% engagement
                            code: 'TEST'
                        }
                    ]
                }
            };

            const result = extractVideoData(mockData);
            expect(result[0].performance).toBe(50); // (500/10000) * 1000 = 50
        });

        it('should handle error in processing individual items', () => {
            const mockData = {
                data: {
                    items: [
                        {
                            user: null,
                            caption: null,
                            code: 'ERROR'
                        }
                    ]
                }
            };

            const result = extractVideoData(mockData);
            expect(result).toHaveLength(1);
            expect(result[0].username).toBe('Unknown');
        });
    });

    describe('extractUserPostsData', () => {
        it('should extract user posts data correctly', () => {
            const mockData = {
                data: {
                    items: [
                        {
                            caption: {
                                created_at: 1234567890,
                                text: 'User post caption'
                            },
                            like_count: 200,
                            play_count: 2000,
                            comment_count: 100,
                            reshare_count: 50,
                            video_duration: 45.2,
                            code: 'POST123',
                            username: 'postuser',
                            follower_count: 10000
                        }
                    ]
                },
                username: 'postuser'
            };

            const result = extractUserPostsData(mockData);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                username: 'postuser',
                followers: 10000,
                title: 'User post caption',
                likes: 200,
                views: 2000,
                comments: 100,
                shares: 50,
                performance: 100,
                url: 'https://www.instagram.com/p/POST123/'
            });
        });

        it('should handle items without user data', () => {
            const mockData = {
                data: {
                    items: [
                        {
                            code: 'TEST123',
                            caption: { text: 'Test' },
                            play_count: 100,
                            like_count: 10
                        }
                    ]
                }
            };

            const result = extractUserPostsData(mockData);
            expect(result[0].username).toBe('Unknown');
        });

        it('should handle missing caption', () => {
            const mockData = {
                data: {
                    items: [
                        {
                            code: 'TEST',
                            like_count: 100,
                            user: {
                                username: 'user'
                            }
                        }
                    ]
                }
            };

            const result = extractUserPostsData(mockData);
            expect(result[0].title).toBe('No caption');
        });

        it('should handle empty response', () => {
            expect(extractUserPostsData(null)).toEqual([]);
            expect(extractUserPostsData({})).toEqual([]);
            expect(extractUserPostsData({ data: { items: [] } })).toEqual([]);
        });
    });
});