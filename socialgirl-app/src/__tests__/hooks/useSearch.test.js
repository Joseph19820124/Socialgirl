import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useSearch from '../../hooks/useSearch';
import SearchService from '../../services/searchService';

// Mock dependencies
let mockShowSuccessToast = vi.fn();
let mockShowAlert = vi.fn();

vi.mock('../../contexts/ToastContext', () => ({
    useToast: () => ({
        showSuccessToast: mockShowSuccessToast
    })
}));

vi.mock('../../contexts/DialogContext', () => ({
    useDialog: () => ({
        showAlert: mockShowAlert
    })
}));

// Mock SearchService as a class - using factory function to avoid hoisting issues
vi.mock('../../services/searchService', () => {
    const mockService = {
        search: vi.fn()
    };
    
    return {
        default: vi.fn(() => mockService),
        __mockService: mockService  // Export for test access
    };
});

describe('useSearch', () => {
    let mockPlatformData;
    let mockSearchService;

    beforeEach(async () => {
        // Get the mock service from the module
        const searchModule = await import('../../services/searchService');
        mockSearchService = searchModule.__mockService;
        
        // Reset mocks
        vi.clearAllMocks();
        mockShowSuccessToast.mockClear();
        mockShowAlert.mockClear();
        mockSearchService.search.mockClear();

        // Setup platform data mock
        mockPlatformData = {
            setLoading: vi.fn(),
            setVideosData: vi.fn(),
            setUserVideosData: vi.fn(),
            setUsersData: vi.fn(),
            setUserPostsData: vi.fn()
        };
    });

    it('should create platform handlers for all platforms', () => {
        const { result } = renderHook(() => useSearch(mockPlatformData));

        expect(result.current.handleYouTubeSearch).toBeDefined();
        expect(result.current.handleTikTokSearch).toBeDefined();
        expect(result.current.handleInstagramSearch).toBeDefined();

        // Each platform should have handlers for all tabs
        ['handleYouTubeSearch', 'handleTikTokSearch', 'handleInstagramSearch'].forEach(platform => {
            expect(result.current[platform].videos).toBeInstanceOf(Function);
            expect(result.current[platform].users).toBeInstanceOf(Function);
            expect(result.current[platform].userVideos).toBeInstanceOf(Function);
            expect(result.current[platform].userPosts).toBeInstanceOf(Function);
        });
    });

    it('should not search with empty query', async () => {
        const { result } = renderHook(() => useSearch(mockPlatformData));

        await act(async () => {
            await result.current.handleYouTubeSearch.videos('');
            await result.current.handleYouTubeSearch.videos('  ');
        });

        expect(mockSearchService.search).not.toHaveBeenCalled();
        expect(mockPlatformData.setLoading).not.toHaveBeenCalled();
    });

    it('should search videos successfully', async () => {
        const mockData = [{ id: 1, title: 'Test Video' }];
        mockSearchService.search.mockResolvedValue(mockData);

        const { result } = renderHook(() => useSearch(mockPlatformData));

        await act(async () => {
            await result.current.handleYouTubeSearch.videos('test query');
        });

        expect(mockPlatformData.setLoading).toHaveBeenCalledWith('youtube', true);
        expect(mockSearchService.search).toHaveBeenCalledWith('youtube', 'test query', { activeTab: 'videos' });
        expect(mockPlatformData.setVideosData).toHaveBeenCalledWith('youtube', mockData);
        expect(mockShowSuccessToast).toHaveBeenCalledWith(1);
        expect(mockPlatformData.setLoading).toHaveBeenCalledWith('youtube', false);
    });

    it('should search users successfully', async () => {
        const mockData = [{ id: 1, username: 'testuser' }];
        mockSearchService.search.mockResolvedValue(mockData);

        const { result } = renderHook(() => useSearch(mockPlatformData));

        await act(async () => {
            await result.current.handleTikTokSearch.users('testuser');
        });

        expect(mockSearchService.search).toHaveBeenCalledWith('tiktok', 'testuser', { activeTab: 'users' });
        expect(mockPlatformData.setUsersData).toHaveBeenCalledWith('tiktok', mockData);
        expect(mockShowSuccessToast).toHaveBeenCalledWith(1);
    });

    it('should search user videos successfully', async () => {
        const mockData = [{ id: 1, title: 'User Video' }];
        mockSearchService.search.mockResolvedValue(mockData);

        const { result } = renderHook(() => useSearch(mockPlatformData));

        await act(async () => {
            await result.current.handleInstagramSearch.userVideos('username');
        });

        expect(mockSearchService.search).toHaveBeenCalledWith('instagram', 'username', { activeTab: 'userVideos' });
        expect(mockPlatformData.setUserVideosData).toHaveBeenCalledWith('instagram', mockData);
    });

    it('should search user posts successfully', async () => {
        const mockData = [{ id: 1, caption: 'Test Post' }];
        mockSearchService.search.mockResolvedValue(mockData);

        const { result } = renderHook(() => useSearch(mockPlatformData));

        await act(async () => {
            await result.current.handleInstagramSearch.userPosts('username');
        });

        expect(mockSearchService.search).toHaveBeenCalledWith('instagram', 'username', { activeTab: 'userPosts' });
        expect(mockPlatformData.setUserPostsData).toHaveBeenCalledWith('instagram', mockData);
    });

    it('should handle search errors', async () => {
        const error = new Error('Search failed');
        mockSearchService.search.mockRejectedValue(error);

        const { result } = renderHook(() => useSearch(mockPlatformData));

        await act(async () => {
            await result.current.handleYouTubeSearch.videos('test query');
        });

        expect(mockPlatformData.setLoading).toHaveBeenCalledWith('youtube', true);
        expect(mockPlatformData.setLoading).toHaveBeenCalledWith('youtube', false);
        expect(mockPlatformData.setVideosData).not.toHaveBeenCalled();
        expect(mockShowSuccessToast).not.toHaveBeenCalled();
    });

    it('should show alert for user posts json error', async () => {
        const error = new Error('Failed to parse json response');
        mockSearchService.search.mockRejectedValue(error);

        const { result } = renderHook(() => useSearch(mockPlatformData));

        await act(async () => {
            await result.current.handleInstagramSearch.userPosts('username');
        });

        expect(mockShowAlert).toHaveBeenCalledWith(
            'User Posts: This user may have a private account or no popular posts available.',
            'OK'
        );
    });

    it('should show alert for user videos error', async () => {
        const error = new Error('User not found');
        mockSearchService.search.mockRejectedValue(error);

        const { result } = renderHook(() => useSearch(mockPlatformData));

        await act(async () => {
            await result.current.handleTikTokSearch.userVideos('username');
        });

        expect(mockShowAlert).toHaveBeenCalledWith('User Videos Error: User not found', 'OK');
    });

    it('should handle non-array data gracefully', async () => {
        mockSearchService.search.mockResolvedValue(null);

        const { result } = renderHook(() => useSearch(mockPlatformData));

        await act(async () => {
            await result.current.handleYouTubeSearch.videos('test');
        });

        expect(mockShowSuccessToast).toHaveBeenCalledWith(0);
    });
});