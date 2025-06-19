import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchReels, getUserReels } from '../../apis/instagram';
import { getApiKey } from '../../utils/apiKeyManager';
import { trackOperation, canPerformOperation } from '../../utils/quotaManager';

// Mock dependencies
vi.mock('../../utils/apiKeyManager');
vi.mock('../../utils/quotaManager');

// Mock fetch
global.fetch = vi.fn();

describe('Instagram API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mocks
        getApiKey.mockResolvedValue('test-api-key');
        canPerformOperation.mockReturnValue(true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('searchReels', () => {
        it('should search reels successfully', async () => {
            const mockResponse = {
                data: {
                    items: [
                        { id: 'reel1', caption: { text: 'Test reel' } },
                        { id: 'reel2', caption: { text: 'Another reel' } }
                    ]
                }
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await searchReels('test query');

            expect(canPerformOperation).toHaveBeenCalledWith('instagram', 'request');
            expect(getApiKey).toHaveBeenCalledWith('rapidApiKey', 'VITE_RAPIDAPI_KEY');
            expect(fetch).toHaveBeenCalledWith(
                '/api/instagram/searchreels/?keyword=test%20query',
                expect.objectContaining({
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': 'test-api-key'
                    }
                })
            );
            expect(result).toEqual(mockResponse);
            expect(trackOperation).toHaveBeenCalledWith('instagram', 'request');
        });

        it('should throw error when quota exceeded', async () => {
            canPerformOperation.mockReturnValue(false);

            await expect(searchReels('test'))
                .rejects.toThrow('Instagram API quota exceeded. Please try again next month.');
        });

        it('should throw error when API key not found', async () => {
            getApiKey.mockResolvedValue(null);

            await expect(searchReels('test'))
                .rejects.toThrow('RapidAPI key not found. Please configure it in Settings.');
        });

        it('should throw error on API error response', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                text: async () => 'Forbidden'
            });

            await expect(searchReels('test'))
                .rejects.toThrow('Instagram API error: 403 - Forbidden');
        });

        it('should handle network errors', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(searchReels('test'))
                .rejects.toThrow('Network error');
        });
    });

    describe('getUserReels', () => {
        it('should get user reels successfully', async () => {
            const mockResponse = {
                data: [
                    { code: 'ABC123', user: { username: 'testuser' } }
                ]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await getUserReels('testuser');

            expect(canPerformOperation).toHaveBeenCalledWith('instagram', 'request');
            expect(getApiKey).toHaveBeenCalledWith('rapidApiKey', 'VITE_RAPIDAPI_KEY');
            expect(fetch).toHaveBeenCalledWith(
                '/api/instagram/userreels/?username_or_id=testuser',
                expect.objectContaining({
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': 'test-api-key'
                    }
                })
            );
            expect(result).toEqual(mockResponse);
            expect(trackOperation).toHaveBeenCalledWith('instagram', 'request');
        });

        it('should throw error when quota exceeded', async () => {
            canPerformOperation.mockReturnValue(false);

            await expect(getUserReels('testuser'))
                .rejects.toThrow('Instagram API quota exceeded. Please try again next month.');
        });

        it('should throw error when API key not found', async () => {
            getApiKey.mockResolvedValue(null);

            await expect(getUserReels('testuser'))
                .rejects.toThrow('RapidAPI key not found. Please configure it in Settings.');
        });

        it('should handle API quota errors', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 429,
                text: async () => 'Rate limit exceeded'
            });

            await expect(getUserReels('testuser'))
                .rejects.toThrow('Instagram API error: 429 - Rate limit exceeded');
        });

        it('should handle server errors', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => 'Internal Server Error'
            });

            await expect(getUserReels('testuser'))
                .rejects.toThrow('Instagram API error: 500 - Internal Server Error');
        });
    });
});