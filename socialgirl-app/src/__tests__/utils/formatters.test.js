import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatNumber, calculateMinWidth, getStatClass } from '../../utils/formatters';

// Mock canvas context
const mockMeasureText = vi.fn();
const mockContext = {
    measureText: mockMeasureText,
    font: ''
};

// Mock document.createElement
vi.stubGlobal('document', {
    createElement: vi.fn(() => ({
        getContext: vi.fn(() => mockContext)
    }))
});

describe('formatters', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMeasureText.mockReturnValue({ width: 50 });
    });

    describe('formatNumber', () => {
        it('should format numbers with locale string', () => {
            expect(formatNumber(1000)).toBe('1,000');
            expect(formatNumber(1000000)).toBe('1,000,000');
            expect(formatNumber(123.45)).toBe('123.45');
        });

        it('should handle zero', () => {
            expect(formatNumber(0)).toBe('0');
        });

        it('should handle null and undefined', () => {
            expect(formatNumber(null)).toBe('0');
            expect(formatNumber(undefined)).toBe('0');
        });

        it('should handle NaN', () => {
            expect(formatNumber(NaN)).toBe('0');
            expect(formatNumber('not a number')).toBe('0');
        });

        it('should handle negative numbers', () => {
            expect(formatNumber(-1000)).toBe('-1,000');
        });

        it('should handle string numbers', () => {
            expect(formatNumber('1000')).toBe('1,000');
        });
    });

    describe('calculateMinWidth', () => {
        it('should calculate width based on text', () => {
            mockMeasureText.mockReturnValue({ width: 100 });
            
            const width = calculateMinWidth('Test Text');
            
            expect(mockContext.font).toBe('10px Roboto, sans-serif');
            expect(mockMeasureText).toHaveBeenCalledWith('Test Text');
            expect(width).toBe(130); // 100 + 30 padding
        });

        it('should use custom font size', () => {
            mockMeasureText.mockReturnValue({ width: 120 });
            
            const width = calculateMinWidth('Test Text', 14);
            
            expect(mockContext.font).toBe('14px Roboto, sans-serif');
            expect(width).toBe(150); // 120 + 30 padding
        });

        it('should enforce minimum width of 80px', () => {
            mockMeasureText.mockReturnValue({ width: 20 });
            
            const width = calculateMinWidth('X');
            
            expect(width).toBe(80); // Minimum width
        });

        it('should handle empty text', () => {
            mockMeasureText.mockReturnValue({ width: 0 });
            
            const width = calculateMinWidth('');
            
            expect(width).toBe(80); // Minimum width
        });
    });

    describe('getStatClass', () => {
        it('should classify followers correctly', () => {
            expect(getStatClass(20000, 'followers')).toBe('high-stats');
            expect(getStatClass(12000, 'followers')).toBe('medium-stats');
            expect(getStatClass(5000, 'followers')).toBe('low-stats');
        });

        it('should classify views correctly', () => {
            expect(getStatClass(5000, 'views')).toBe('high-stats');
            expect(getStatClass(3000, 'views')).toBe('medium-stats');
            expect(getStatClass(1000, 'views')).toBe('low-stats');
        });

        it('should classify comments correctly', () => {
            expect(getStatClass(300, 'comments')).toBe('high-stats');
            expect(getStatClass(150, 'comments')).toBe('medium-stats');
            expect(getStatClass(50, 'comments')).toBe('low-stats');
        });

        it('should classify likes correctly', () => {
            expect(getStatClass(5000, 'likes')).toBe('high-stats');
            expect(getStatClass(3000, 'likes')).toBe('medium-stats');
            expect(getStatClass(1000, 'likes')).toBe('low-stats');
        });

        it('should classify shares correctly', () => {
            expect(getStatClass(200, 'shares')).toBe('high-stats');
            expect(getStatClass(75, 'shares')).toBe('medium-stats');
            expect(getStatClass(25, 'shares')).toBe('low-stats');
        });

        it('should classify media correctly', () => {
            expect(getStatClass(400, 'media')).toBe('high-stats');
            expect(getStatClass(200, 'media')).toBe('medium-stats');
            expect(getStatClass(100, 'media')).toBe('low-stats');
        });

        it('should handle edge cases at thresholds', () => {
            expect(getStatClass(15000, 'followers')).toBe('high-stats');
            expect(getStatClass(10000, 'followers')).toBe('medium-stats');
            expect(getStatClass(9999, 'followers')).toBe('low-stats');
        });

        it('should handle null and undefined values', () => {
            expect(getStatClass(null, 'views')).toBe('low-stats');
            expect(getStatClass(undefined, 'likes')).toBe('low-stats');
        });

        it('should handle NaN values', () => {
            expect(getStatClass(NaN, 'comments')).toBe('low-stats');
            expect(getStatClass('not a number', 'shares')).toBe('low-stats');
        });

        it('should handle unknown types', () => {
            expect(getStatClass(10000, 'unknown')).toBe('low-stats');
        });

        it('should handle string numbers', () => {
            expect(getStatClass('20000', 'followers')).toBe('high-stats');
            expect(getStatClass('3000', 'views')).toBe('medium-stats');
        });

        it('should handle zero values', () => {
            expect(getStatClass(0, 'likes')).toBe('low-stats');
        });

        it('should handle negative values', () => {
            expect(getStatClass(-1000, 'views')).toBe('low-stats');
        });
    });
});