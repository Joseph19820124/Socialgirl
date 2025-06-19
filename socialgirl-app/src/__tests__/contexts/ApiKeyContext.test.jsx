import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import { ApiKeyProvider, useApiKeys } from '../../contexts/ApiKeyContext';
import React from 'react';

// Mock sessionStorage
const mockSessionStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};

Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true
});

describe('ApiKeyContext', () => {
    let originalConsoleLog;
    let originalConsoleError;

    beforeEach(() => {
        // Mock console methods
        originalConsoleLog = console.log;
        originalConsoleError = console.error;
        console.log = vi.fn();
        console.error = vi.fn();
        
        // Clear mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
    });

    describe('useApiKeys hook', () => {
        it('should return default context when used outside ApiKeyProvider', () => {
            // The hook doesn't actually throw when used outside provider
            // because ApiKeyContext has default values
            const { result } = renderHook(() => useApiKeys());
            
            expect(result.current).toBeDefined();
            expect(typeof result.current.setApiKeys).toBe('function');
            expect(typeof result.current.getApiKey).toBe('function');
            expect(typeof result.current.clearApiKeys).toBe('function');
            
            // The default functions are no-ops
            expect(result.current.getApiKey('test')).toBe(null);
        });

        it('should provide context functions when used within ApiKeyProvider', () => {
            const wrapper = ({ children }) => <ApiKeyProvider>{children}</ApiKeyProvider>;
            const { result } = renderHook(() => useApiKeys(), { wrapper });

            expect(result.current).toHaveProperty('setApiKeys');
            expect(result.current).toHaveProperty('getApiKey');
            expect(result.current).toHaveProperty('clearApiKeys');
        });
    });

    describe('ApiKeyProvider', () => {
        it('should render children', () => {
            render(
                <ApiKeyProvider>
                    <div data-testid="child">Test Child</div>
                </ApiKeyProvider>
            );

            expect(screen.getByTestId('child')).toBeInTheDocument();
        });

        it('should initialize with empty state when no session storage', () => {
            mockSessionStorage.getItem.mockReturnValue(null);

            const wrapper = ({ children }) => <ApiKeyProvider>{children}</ApiKeyProvider>;
            const { result } = renderHook(() => useApiKeys(), { wrapper });

            expect(mockSessionStorage.getItem).toHaveBeenCalledWith('socialgirl_session_keys');
            expect(result.current.getApiKey('anyKey')).toBe(null);
        });

        it('should initialize from session storage when available', () => {
            const storedKeys = { rapidApiKey: 'test-key-123' };
            mockSessionStorage.getItem.mockReturnValue(JSON.stringify(storedKeys));

            const wrapper = ({ children }) => <ApiKeyProvider>{children}</ApiKeyProvider>;
            const { result } = renderHook(() => useApiKeys(), { wrapper });

            expect(mockSessionStorage.getItem).toHaveBeenCalledWith('socialgirl_session_keys');
            expect(result.current.getApiKey('rapidApiKey')).toBe('test-key-123');
            expect(console.log).toHaveBeenCalledWith('[API Key Context] Loading API keys from session storage');
        });

        it('should handle session storage load error gracefully', () => {
            mockSessionStorage.getItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            const wrapper = ({ children }) => <ApiKeyProvider>{children}</ApiKeyProvider>;
            const { result } = renderHook(() => useApiKeys(), { wrapper });

            expect(console.error).toHaveBeenCalledWith('[API Key Context] Failed to load from session storage:', expect.any(Error));
            expect(result.current.getApiKey('anyKey')).toBe(null);
        });

        it('should set API keys and save to session storage', () => {
            const wrapper = ({ children }) => <ApiKeyProvider>{children}</ApiKeyProvider>;
            const { result } = renderHook(() => useApiKeys(), { wrapper });

            const newKeys = {
                rapidApiKey: 'new-rapid-key',
                instagramKey: 'new-instagram-key'
            };

            act(() => {
                result.current.setApiKeys(newKeys);
            });

            expect(result.current.getApiKey('rapidApiKey')).toBe('new-rapid-key');
            expect(result.current.getApiKey('instagramKey')).toBe('new-instagram-key');
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
                'socialgirl_session_keys',
                JSON.stringify(newKeys)
            );
            expect(console.log).toHaveBeenCalledWith('[API Key Context] Setting API keys:', {
                keyNames: ['rapidApiKey', 'instagramKey'],
                hasRapidApi: true,
                rapidApiLength: 13
            });
        });

        it('should handle session storage save error gracefully', () => {
            mockSessionStorage.setItem.mockImplementation(() => {
                throw new Error('Storage full');
            });

            const wrapper = ({ children }) => <ApiKeyProvider>{children}</ApiKeyProvider>;
            const { result } = renderHook(() => useApiKeys(), { wrapper });

            act(() => {
                result.current.setApiKeys({ testKey: 'value' });
            });

            expect(console.error).toHaveBeenCalledWith('[API Key Context] Failed to save to session storage:', expect.any(Error));
            // Keys should still be set in state even if storage fails
            expect(result.current.getApiKey('testKey')).toBe('value');
        });

        it('should get API key with logging', () => {
            const wrapper = ({ children }) => <ApiKeyProvider>{children}</ApiKeyProvider>;
            const { result } = renderHook(() => useApiKeys(), { wrapper });

            act(() => {
                result.current.setApiKeys({ myKey: 'my-value' });
            });

            const key = result.current.getApiKey('myKey');

            expect(key).toBe('my-value');
            expect(console.log).toHaveBeenCalledWith('[API Key Context] Getting API key:', {
                keyName: 'myKey',
                hasKey: true,
                keyLength: 8
            });
        });

        it('should return null for non-existent key', () => {
            const wrapper = ({ children }) => <ApiKeyProvider>{children}</ApiKeyProvider>;
            const { result } = renderHook(() => useApiKeys(), { wrapper });

            const key = result.current.getApiKey('nonExistentKey');

            expect(key).toBe(null);
            expect(console.log).toHaveBeenCalledWith('[API Key Context] Getting API key:', {
                keyName: 'nonExistentKey',
                hasKey: false,
                keyLength: 0
            });
        });

        it('should clear all API keys and session storage', () => {
            const wrapper = ({ children }) => <ApiKeyProvider>{children}</ApiKeyProvider>;
            const { result } = renderHook(() => useApiKeys(), { wrapper });

            // Set some keys first
            act(() => {
                result.current.setApiKeys({ key1: 'value1', key2: 'value2' });
            });

            // Clear all keys
            act(() => {
                result.current.clearApiKeys();
            });

            expect(result.current.getApiKey('key1')).toBe(null);
            expect(result.current.getApiKey('key2')).toBe(null);
            expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('socialgirl_session_keys');
            expect(console.log).toHaveBeenCalledWith('[API Key Context] Clearing all API keys');
            expect(console.log).toHaveBeenCalledWith('[API Key Context] Cleared API keys from session storage');
        });

        it('should handle session storage clear error gracefully', () => {
            mockSessionStorage.removeItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            const wrapper = ({ children }) => <ApiKeyProvider>{children}</ApiKeyProvider>;
            const { result } = renderHook(() => useApiKeys(), { wrapper });

            act(() => {
                result.current.setApiKeys({ key1: 'value1' });
            });

            act(() => {
                result.current.clearApiKeys();
            });

            expect(console.error).toHaveBeenCalledWith('[API Key Context] Failed to clear session storage:', expect.any(Error));
            // Keys should still be cleared from state
            expect(result.current.getApiKey('key1')).toBe(null);
        });
    });
});