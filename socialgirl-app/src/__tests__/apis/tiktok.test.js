import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchVideos, getUserInfo, getUserPopularPosts } from '../../apis/tiktok';
import { getApiKey } from '../../utils/apiKeyManager';
import { trackOperation, canPerformOperation } from '../../utils/quotaManager';

// Mock dependencies
vi.mock('../../utils/apiKeyManager');
vi.mock('../../utils/quotaManager');

// Mock fetch
global.fetch = vi.fn();

describe('TikTok API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mocks
        getApiKey.mockResolvedValue('test-api-key');
        canPerformOperation.mockReturnValue(true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('searchVideos', () => {
        it('should search videos successfully', async () => {
            const mockResponse = {
                data: [
                    { item: { id: '123', desc: 'Test video' } },
                    { item: { id: '456', desc: 'Another video' } }
                ]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await searchVideos('test query', 0, 0);

            expect(canPerformOperation).toHaveBeenCalledWith('tiktok', 'request');
            expect(getApiKey).toHaveBeenCalledWith('rapidApiKey', 'VITE_RAPIDAPI_KEY');
            expect(fetch).toHaveBeenCalledWith(
                'https://tiktok-api23.p.rapidapi.com/api/search/general?keyword=test%20query&cursor=0&search_id=0',
                expect.objectContaining({
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': 'test-api-key',
                        'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
                    }
                })
            );
            expect(result).toEqual(mockResponse);
            expect(trackOperation).toHaveBeenCalledWith('tiktok', 'request');
        });

        it('should use default values when not provided', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] })
            });

            await searchVideos('test');

            const url = fetch.mock.calls[0][0];
            expect(url).toContain('cursor=0');
            expect(url).toContain('search_id=0');
        });

        it('should throw error when quota exceeded', async () => {
            canPerformOperation.mockReturnValue(false);

            await expect(searchVideos('test'))
                .rejects.toThrow('TikTok API quota exceeded. Please try again next month.');
        });

        it('should throw error when API key not found', async () => {
            getApiKey.mockResolvedValue(null);

            await expect(searchVideos('test'))
                .rejects.toThrow('RapidAPI key not found. Please configure it in Settings.');
        });

        it('should throw error on API error response', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 403
            });

            await expect(searchVideos('test'))
                .rejects.toThrow('TikTok API error: 403');
        });
    });

    describe('getUserInfo', () => {
        it('should get user info successfully', async () => {
            const mockResponse = {
                userInfo: {
                    user: {
                        id: '123',
                        uniqueId: 'testuser',
                        nickname: 'Test User',
                        secUid: 'ABC123'
                    },
                    stats: {
                        followerCount: 10000,
                        followingCount: 500
                    }
                }
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await getUserInfo('testuser');

            expect(canPerformOperation).toHaveBeenCalledWith('tiktok', 'request');
            expect(fetch).toHaveBeenCalledWith(
                'https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=testuser',
                expect.objectContaining({
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': 'test-api-key',
                        'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
                    }
                })
            );
            expect(result).toEqual(mockResponse);
            expect(trackOperation).toHaveBeenCalledWith('tiktok', 'request');
        });

        it('should throw error when quota exceeded', async () => {
            canPerformOperation.mockReturnValue(false);

            await expect(getUserInfo('testuser'))
                .rejects.toThrow('TikTok API quota exceeded. Please try again next month.');
        });

        it('should handle 404 user not found', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: async () => 'User not found'
            });

            await expect(getUserInfo('unknownuser'))
                .rejects.toThrow('TikTok API error: 404 - User not found');
        });
    });

    describe('getUserPopularPosts', () => {
        it('should get user posts successfully', async () => {
            const mockResponse = {
                data: {
                    itemList: [
                        { id: '789', desc: 'Popular post' }
                    ]
                }
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await getUserPopularPosts('secUid123', 35, 0);

            expect(canPerformOperation).toHaveBeenCalledWith('tiktok', 'request');
            expect(fetch).toHaveBeenCalledWith(
                'https://tiktok-api23.p.rapidapi.com/api/user/popular-posts?secUid=secUid123&count=35&cursor=0',
                expect.objectContaining({
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': 'test-api-key',
                        'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
                    }
                })
            );
            expect(result).toEqual(mockResponse);
            expect(trackOperation).toHaveBeenCalledWith('tiktok', 'request');
        });

        it('should use default values when not provided', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: { itemList: [] } })
            });

            await getUserPopularPosts('secUid123');

            const url = fetch.mock.calls[0][0];
            expect(url).toContain('count=35');
            expect(url).toContain('cursor=0');
        });

        it('should handle 204 No Content response', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                status: 204,
                json: async () => null
            });

            const result = await getUserPopularPosts('secUid123');

            expect(result).toEqual({ data: { itemList: [] } });
            expect(trackOperation).toHaveBeenCalledWith('tiktok', 'request');
        });

        it('should throw error when API key not found', async () => {
            getApiKey.mockResolvedValue(null);

            await expect(getUserPopularPosts('secUid123'))
                .rejects.toThrow('RapidAPI key not found. Please configure it in Settings.');
        });

        it('should handle server errors', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => 'Internal Server Error'
            });

            await expect(getUserPopularPosts('secUid123'))
                .rejects.toThrow('TikTok API error: 500 - Internal Server Error');
        });
    });
});