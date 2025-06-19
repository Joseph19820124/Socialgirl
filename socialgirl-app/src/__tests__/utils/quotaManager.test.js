import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    trackOperation,
    canPerformOperation,
    getRemainingQuota,
    getQuotaUsage,
    getQuotaUsagePercentage,
    resetQuota,
    getQuotaStatus,
    getAllQuotaStatus
} from '../../utils/quotaManager';

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
});

describe('quotaManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock Date to ensure consistent testing
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('canPerformOperation', () => {
        it('should allow operation when quota is available', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                youtube: {
                    'Mon Jan 15 2024': {
                        period: 'Mon Jan 15 2024',
                        used: 50,
                        operations: []
                    }
                }
            }));

            const result = canPerformOperation('youtube', 'search');
            expect(result).toBe(true);
        });

        it('should deny operation when quota would be exceeded', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                youtube: {
                    'Mon Jan 15 2024': {
                        period: 'Mon Jan 15 2024',
                        used: 9950,
                        operations: []
                    }
                }
            }));

            const result = canPerformOperation('youtube', 'search');
            expect(result).toBe(false);
        });

        it('should handle missing platform data', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                tiktok: { 
                    '2024-1': {
                        period: '2024-1',
                        used: 0,
                        operations: []
                    }
                }
            }));

            const result = canPerformOperation('youtube', 'search');
            expect(result).toBe(true);
        });

        it('should handle invalid localStorage data', () => {
            mockLocalStorage.getItem.mockReturnValue('invalid json');
            // When JSON.parse fails, getQuotaUsage creates new data
            // which returns used: 0, so the operation would be allowed
            const result = canPerformOperation('youtube', 'search');
            expect(result).toBe(true);
        });

        it('should handle custom count parameter', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                youtube: {
                    'Mon Jan 15 2024': {
                        period: 'Mon Jan 15 2024',
                        used: 9900,
                        operations: []
                    }
                }
            }));

            // 50 videos * 1 cost = 50, total would be 9950, still under limit
            const result = canPerformOperation('youtube', 'videos', 50);
            expect(result).toBe(true);

            // 101 videos would exceed
            const result2 = canPerformOperation('youtube', 'videos', 101);
            expect(result2).toBe(false);
        });

        it('should throw error for invalid platform', () => {
            expect(() => canPerformOperation('invalid', 'search')).toThrow('Unsupported platform: invalid');
        });
    });

    describe('trackOperation', () => {
        it('should track operation and update quota', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                youtube: {
                    'Mon Jan 15 2024': {
                        period: 'Mon Jan 15 2024',
                        used: 100,
                        operations: []
                    }
                }
            }));

            const result = trackOperation('youtube', 'search');

            const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
            expect(savedData.youtube['Mon Jan 15 2024'].used).toBe(200); // 100 + 100
            expect(savedData.youtube['Mon Jan 15 2024'].operations).toHaveLength(1);
            expect(result.used).toBe(200);
        });

        it('should track operation with custom count', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({}));

            trackOperation('youtube', 'videos', 5);

            const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
            expect(savedData.youtube['Mon Jan 15 2024'].used).toBe(5); // 5 * 1
        });

        it('should initialize platform quota if missing', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({}));

            trackOperation('youtube', 'search');

            const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
            expect(savedData.youtube).toBeDefined();
            expect(savedData.youtube['Mon Jan 15 2024'].used).toBe(100);
        });

        it('should throw error for invalid platform', () => {
            expect(() => trackOperation('invalid', 'search')).toThrow('Unsupported platform: invalid');
        });
    });

    describe('getRemainingQuota', () => {
        it('should return remaining quota for platform', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                youtube: {
                    'Mon Jan 15 2024': {
                        period: 'Mon Jan 15 2024',
                        used: 3000,
                        operations: []
                    }
                }
            }));

            const remaining = getRemainingQuota('youtube');
            expect(remaining).toBe(7000);
        });

        it('should return full quota when no usage', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({}));

            const remaining = getRemainingQuota('youtube');
            expect(remaining).toBe(10000);
        });

        it('should return 0 when quota exceeded', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                youtube: {
                    'Mon Jan 15 2024': {
                        period: 'Mon Jan 15 2024',
                        used: 15000,
                        operations: []
                    }
                }
            }));

            const remaining = getRemainingQuota('youtube');
            expect(remaining).toBe(0);
        });
    });

    describe('getQuotaUsage', () => {
        it('should return current usage data for platform', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                youtube: {
                    'Mon Jan 15 2024': {
                        period: 'Mon Jan 15 2024',
                        used: 5000,
                        operations: []
                    }
                }
            }));

            const usage = getQuotaUsage('youtube');
            expect(usage.used).toBe(5000);
            expect(usage.period).toBe('Mon Jan 15 2024');
        });

        it('should initialize and return empty usage when no data', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({}));

            const usage = getQuotaUsage('youtube');
            expect(usage.used).toBe(0);
            expect(usage.operations).toEqual([]);
        });
    });

    describe('getQuotaUsagePercentage', () => {
        it('should calculate percentage correctly', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                youtube: {
                    'Mon Jan 15 2024': {
                        period: 'Mon Jan 15 2024',
                        used: 2500,
                        operations: []
                    }
                }
            }));

            const percentage = getQuotaUsagePercentage('youtube');
            expect(percentage).toBe(25);
        });

        it('should return 0 when no usage', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({}));

            const percentage = getQuotaUsagePercentage('youtube');
            expect(percentage).toBe(0);
        });
    });

    describe('resetQuota', () => {
        it('should reset quota for platform', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                youtube: {
                    'Mon Jan 15 2024': {
                        period: 'Mon Jan 15 2024',
                        used: 9999,
                        operations: []
                    }
                }
            }));

            const result = resetQuota('youtube');

            const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
            expect(savedData.youtube['Mon Jan 15 2024'].used).toBe(0);
            expect(savedData.youtube['Mon Jan 15 2024'].operations).toEqual([]);
            expect(result.used).toBe(0);
        });
    });

    describe('getQuotaStatus', () => {
        it('should return complete quota status', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                youtube: {
                    'Mon Jan 15 2024': {
                        period: 'Mon Jan 15 2024',
                        used: 3000,
                        operations: [
                            { operation: 'search', count: 10, cost: 1000, timestamp: '2024-01-15T10:00:00Z' }
                        ]
                    }
                }
            }));

            const status = getQuotaStatus('youtube');
            
            expect(status).toEqual({
                platform: 'youtube',
                used: 3000,
                remaining: 7000,
                total: 10000,
                percentage: 30,
                period: 'daily',
                operationsCount: 1,
                lastReset: 'Mon Jan 15 2024'
            });
        });
    });

    describe('getAllQuotaStatus', () => {
        it('should return status for all platforms', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                youtube: {
                    'Mon Jan 15 2024': {
                        period: 'Mon Jan 15 2024',
                        used: 3000,
                        operations: []
                    }
                },
                tiktok: {
                    '2024-1': {
                        period: '2024-1',
                        used: 5000,
                        operations: []
                    }
                }
            }));

            const allStatus = getAllQuotaStatus();
            
            expect(allStatus.youtube).toBeDefined();
            expect(allStatus.youtube.used).toBe(3000);
            expect(allStatus.tiktok).toBeDefined();
            expect(allStatus.tiktok.used).toBe(5000);
            expect(allStatus.instagram).toBeDefined();
            expect(allStatus.instagram.used).toBe(0); // No data, should be 0
        });
    });
});