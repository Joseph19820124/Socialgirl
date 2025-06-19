import { describe, it, expect } from 'vitest';
import {
    extractVideoData,
    extractUsersDataFromSearch,
    extractUserPostsData
} from '../../mappers/tiktok';

describe('TikTok Mapper', () => {
    describe('extractVideoData', () => {
        it('should extract video data with all fields', () => {
            const mockData = {
                data: [
                    {
                        item: {
                            id: 'video123',
                            desc: 'Test TikTok Video #fyp',
                            statsV2: {
                                playCount: '50000',
                                diggCount: '5000',
                                commentCount: '1000',
                                shareCount: '500'
                            },
                            author: {
                                uniqueId: 'tiktokuser'
                            },
                            authorStats: {
                                followerCount: '100000'
                            },
                            createTime: 1234567890
                        }
                    }
                ]
            };

            const result = extractVideoData(mockData);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                username: 'tiktokuser',
                followers: 100000,
                title: 'Test TikTok Video #fyp',
                views: 50000,
                likes: 5000,
                comments: 1000,
                shares: 500,
                performance: 100, // (5000/50000) * 1000 = 100
                url: 'https://tiktok.com/@tiktokuser/video/video123',
                publishedAt: new Date(1234567890 * 1000).toISOString()
            });
        });

        it('should handle missing optional fields', () => {
            const mockData = {
                data: [
                    {
                        item: {
                            id: 'video456',
                            author: {
                                uniqueId: 'user2'
                            }
                        }
                    }
                ]
            };

            const result = extractVideoData(mockData);

            expect(result).toHaveLength(1);
            expect(result[0].username).toBe('user2');
            expect(result[0].followers).toBe(0);
            expect(result[0].title).toBe('No description');
            expect(result[0].views).toBe(0);
            expect(result[0].performance).toBe(0);
        });

        it('should filter out null items', () => {
            const mockData = {
                data: [
                    { item: null },
                    { item: { id: '123', author: { uniqueId: 'test' } } },
                    { /* no item property */ }
                ]
            };

            const result = extractVideoData(mockData);
            expect(result).toHaveLength(1);
            expect(result[0].username).toBe('test');
        });

        it('should handle empty data array', () => {
            const mockData = { data: [] };
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
                data: [
                    {
                        item: {
                            id: 'video789',
                            statsV2: {
                                playCount: '10000',
                                diggCount: '500' // 5% engagement
                            },
                            author: { uniqueId: 'test' }
                        }
                    }
                ]
            };

            const result = extractVideoData(mockData);
            expect(result[0].performance).toBe(50); // (500/10000) * 1000 = 50
        });
    });

    describe('extractUsersDataFromSearch', () => {
        it('should extract unique users from search results', () => {
            const mockData = {
                data: [
                    {
                        item: {
                            author: {
                                id: 'user1',
                                uniqueId: 'testuser1',
                                nickname: 'Test User 1',
                                signature: 'Test bio 1',
                                avatarThumb: 'https://example.com/avatar1.jpg',
                                verified: true
                            },
                            authorStats: {
                                followerCount: '50000',
                                videoCount: '100'
                            }
                        }
                    },
                    {
                        item: {
                            author: {
                                id: 'user1',
                                uniqueId: 'testuser1',
                                nickname: 'Test User 1'
                            },
                            authorStats: {
                                followerCount: '60000' // Duplicate user, should be ignored
                            }
                        }
                    },
                    {
                        item: {
                            author: {
                                id: 'user2',
                                uniqueId: 'testuser2',
                                nickname: 'Test User 2'
                            },
                            authorStats: {
                                followerCount: '30000',
                                videoCount: '50'
                            }
                        }
                    }
                ]
            };

            const result = extractUsersDataFromSearch(mockData);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                username: 'testuser1',
                followers: 50000, // First occurrence is kept
                about: 'Test bio 1',
                media: 100,
                url: 'https://tiktok.com/@testuser1'
            });
            expect(result[1]).toEqual({
                username: 'testuser2',
                followers: 30000,
                about: '',
                media: 50,
                url: 'https://tiktok.com/@testuser2'
            });
        });

        it('should handle missing fields', () => {
            const mockData = {
                data: [
                    {
                        item: {
                            author: {
                                id: 'user1',
                                uniqueId: 'user1'
                            }
                        }
                    }
                ]
            };

            const result = extractUsersDataFromSearch(mockData);
            expect(result[0]).toEqual({
                username: 'user1',
                followers: 0,
                about: '',
                media: 0,
                url: 'https://tiktok.com/@user1'
            });
        });

        it('should handle empty response', () => {
            expect(extractUsersDataFromSearch(null)).toEqual([]);
            expect(extractUsersDataFromSearch({})).toEqual([]);
            expect(extractUsersDataFromSearch({ data: [] })).toEqual([]);
        });
    });

    describe('extractUserPostsData', () => {
        it('should extract user posts data correctly', () => {
            const mockData = {
                data: {
                    itemList: [
                        {
                            id: 'post123',
                            desc: 'User post description',
                            stats: {
                                playCount: 2000,
                                diggCount: 200,
                                commentCount: 100,
                                shareCount: 50
                            },
                            createTime: 1234567890,
                            author: {
                                uniqueId: 'postuser',
                                nickname: 'Post User',
                                avatarThumb: 'https://example.com/avatar.jpg',
                                verified: true
                            },
                            authorStats: {
                                followerCount: 10000
                            }
                        }
                    ]
                }
            };

            const result = extractUserPostsData(mockData);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                username: 'postuser',
                followers: 10000,
                title: 'User post description',
                views: 2000,
                likes: 200,
                comments: 100,
                shares: 50,
                performance: 100,
                publishedAt: new Date(1234567890 * 1000).toISOString(),
                url: 'https://tiktok.com/@postuser/video/post123'
            });
        });

        it('should handle empty item list', () => {
            const mockData = {
                data: {
                    itemList: []
                }
            };

            const result = extractUserPostsData(mockData);
            expect(result).toEqual([]);
        });

        it('should handle null/undefined response', () => {
            expect(extractUserPostsData(null)).toEqual([]);
            expect(extractUserPostsData({})).toEqual([]);
            expect(extractUserPostsData({ data: {} })).toEqual([]);
        });
    });
});