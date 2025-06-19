import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, renderHook, act, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '../../contexts/ToastContext';
import React from 'react';

// Mock ToastNotification component
vi.mock('../../components/ToastNotification', () => ({
    default: ({ message, onClose, duration }) => {
        // Auto-close after duration
        React.useEffect(() => {
            if (duration) {
                const timer = setTimeout(onClose, duration);
                return () => clearTimeout(timer);
            }
        }, [duration, onClose]);
        
        return (
            <div data-testid="toast-notification">
                <span>{message}</span>
                <button onClick={onClose}>Close</button>
            </div>
        );
    }
}));

describe('ToastContext', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    describe('useToast hook', () => {
        it('should throw error when used outside ToastProvider', () => {
            // Suppress console.error for this test
            const originalError = console.error;
            console.error = vi.fn();

            expect(() => {
                renderHook(() => useToast());
            }).toThrow('useToast must be used within a ToastProvider');

            console.error = originalError;
        });

        it('should provide toast functions when used within ToastProvider', () => {
            const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;
            const { result } = renderHook(() => useToast(), { wrapper });

            expect(result.current).toHaveProperty('showToast');
            expect(result.current).toHaveProperty('showSuccessToast');
            expect(result.current).toHaveProperty('removeToast');
        });
    });

    describe('ToastProvider', () => {
        afterEach(() => {
            // Clean up any remaining timers
            vi.clearAllTimers();
        });

        it('should render children', () => {
            render(
                <ToastProvider>
                    <div data-testid="child">Test Child</div>
                </ToastProvider>
            );

            expect(screen.getByTestId('child')).toBeInTheDocument();
        });

        it('should show toast notification when showToast is called', () => {
            const TestComponent = () => {
                const { showToast } = useToast();
                return (
                    <button onClick={() => showToast('Test message')}>
                        Show Toast
                    </button>
                );
            };

            render(
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            );

            // Initially no toasts
            expect(screen.queryByTestId('toast-notification')).not.toBeInTheDocument();

            // Show toast
            act(() => {
                screen.getByText('Show Toast').click();
            });

            expect(screen.getByTestId('toast-notification')).toBeInTheDocument();
            expect(screen.getByText('Test message')).toBeInTheDocument();
        });

        it('should show success toast with result count', () => {
            const TestComponent = () => {
                const { showSuccessToast } = useToast();
                return (
                    <button onClick={() => showSuccessToast(10)}>
                        Show Success
                    </button>
                );
            };

            render(
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            );

            act(() => {
                screen.getByText('Show Success').click();
            });

            expect(screen.getByText('I have found 10 results.')).toBeInTheDocument();
        });

        it('should remove toast when removeToast is called', () => {
            const TestComponent = () => {
                const { showToast, removeToast } = useToast();
                const [toastId, setToastId] = React.useState(null);

                const handleShow = () => {
                    const id = Date.now();
                    setToastId(id);
                    // Manually create toast with specific ID
                    showToast('Test message');
                };

                return (
                    <>
                        <button onClick={handleShow}>Show Toast</button>
                        <button onClick={() => removeToast(toastId)}>Remove Toast</button>
                    </>
                );
            };

            render(
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            );

            // Show toast
            act(() => {
                screen.getByText('Show Toast').click();
            });

            expect(screen.getByTestId('toast-notification')).toBeInTheDocument();

            // Remove toast using close button
            act(() => {
                screen.getByText('Close').click();
            });

            expect(screen.queryByTestId('toast-notification')).not.toBeInTheDocument();
        });

        it('should auto-remove toast after duration', async () => {
            const TestComponent = () => {
                const { showToast } = useToast();
                return (
                    <button onClick={() => showToast('Auto remove', 100)}>
                        Show Toast
                    </button>
                );
            };

            render(
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            );

            // Show toast
            act(() => {
                screen.getByText('Show Toast').click();
            });

            expect(screen.getByTestId('toast-notification')).toBeInTheDocument();

            // Fast-forward time and wait for removal
            await act(async () => {
                vi.advanceTimersByTime(100);
            });

            // Toast should be removed
            expect(screen.queryByTestId('toast-notification')).not.toBeInTheDocument();
        }, 10000);

        it('should handle multiple toasts', () => {
            const TestComponent = () => {
                const { showToast } = useToast();
                return (
                    <button onClick={() => {
                        // Add small delays to ensure unique timestamps
                        showToast('Toast 1');
                        setTimeout(() => showToast('Toast 2'), 1);
                        setTimeout(() => showToast('Toast 3'), 2);
                    }}>
                        Show Multiple
                    </button>
                );
            };

            render(
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            );

            act(() => {
                screen.getByText('Show Multiple').click();
                // Advance timers to trigger the timeouts
                vi.advanceTimersByTime(2);
            });

            const toasts = screen.getAllByTestId('toast-notification');
            expect(toasts).toHaveLength(3);
            expect(screen.getByText('Toast 1')).toBeInTheDocument();
            expect(screen.getByText('Toast 2')).toBeInTheDocument();
            expect(screen.getByText('Toast 3')).toBeInTheDocument();
        });

        it('should use default duration of 4000ms when not specified', () => {
            const TestComponent = () => {
                const { showToast } = useToast();
                return (
                    <button onClick={() => showToast('Default duration')}>
                        Show Toast
                    </button>
                );
            };

            render(
                <ToastProvider>
                    <TestComponent />
                </ToastProvider>
            );

            act(() => {
                screen.getByText('Show Toast').click();
            });

            expect(screen.getByTestId('toast-notification')).toBeInTheDocument();

            // Advance time less than default duration
            act(() => {
                vi.advanceTimersByTime(3999);
            });

            // Toast should still be visible
            expect(screen.getByTestId('toast-notification')).toBeInTheDocument();

            // Advance to default duration
            act(() => {
                vi.advanceTimersByTime(1);
            });

            // Toast should be removed
            waitFor(() => {
                expect(screen.queryByTestId('toast-notification')).not.toBeInTheDocument();
            });
        });
    });
});