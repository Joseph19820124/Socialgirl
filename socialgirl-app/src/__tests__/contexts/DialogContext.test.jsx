import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, renderHook, act, fireEvent, waitFor } from '@testing-library/react';
import { DialogProvider, useDialog } from '../../contexts/DialogContext';
import React from 'react';

// Mock ConfirmDialog component
vi.mock('../../components/ConfirmDialog', () => ({
    default: ({ isOpen, title, confirmText, cancelText, onConfirm, onCancel }) => {
        if (!isOpen) return null;
        return (
            <div data-testid="confirm-dialog">
                <h2>{title}</h2>
                <button onClick={onConfirm}>{confirmText}</button>
                {cancelText && <button onClick={onCancel}>{cancelText}</button>}
            </div>
        );
    }
}));

describe('DialogContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('useDialog hook', () => {
        it('should throw error when used outside DialogProvider', () => {
            // Suppress console.error for this test
            const originalError = console.error;
            console.error = vi.fn();

            expect(() => {
                renderHook(() => useDialog());
            }).toThrow('useDialog must be used within a DialogProvider');

            console.error = originalError;
        });

        it('should provide dialog functions when used within DialogProvider', () => {
            const wrapper = ({ children }) => <DialogProvider>{children}</DialogProvider>;
            const { result } = renderHook(() => useDialog(), { wrapper });

            expect(result.current).toHaveProperty('showConfirm');
            expect(result.current).toHaveProperty('showAlert');
        });
    });

    describe('DialogProvider', () => {
        it('should render children', () => {
            render(
                <DialogProvider>
                    <div data-testid="child">Test Child</div>
                </DialogProvider>
            );

            expect(screen.getByTestId('child')).toBeInTheDocument();
        });

        it('should not show dialog initially', () => {
            render(
                <DialogProvider>
                    <div>Content</div>
                </DialogProvider>
            );

            expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
        });
    });

    describe('showConfirm', () => {
        it('should show confirm dialog with custom text', async () => {
            const TestComponent = () => {
                const { showConfirm } = useDialog();
                return (
                    <button onClick={() => showConfirm('Delete item?', 'DELETE', 'KEEP')}>
                        Show Confirm
                    </button>
                );
            };

            render(
                <DialogProvider>
                    <TestComponent />
                </DialogProvider>
            );

            // Show dialog
            fireEvent.click(screen.getByText('Show Confirm'));

            // Check dialog is displayed
            expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
            expect(screen.getByText('Delete item?')).toBeInTheDocument();
            expect(screen.getByText('DELETE')).toBeInTheDocument();
            expect(screen.getByText('KEEP')).toBeInTheDocument();
        });

        it('should resolve true when confirmed', async () => {
            let resolvedValue;
            const TestComponent = () => {
                const { showConfirm } = useDialog();
                const handleClick = async () => {
                    resolvedValue = await showConfirm('Confirm?');
                };
                return <button onClick={handleClick}>Show Confirm</button>;
            };

            render(
                <DialogProvider>
                    <TestComponent />
                </DialogProvider>
            );

            // Show dialog
            fireEvent.click(screen.getByText('Show Confirm'));

            // Click confirm
            fireEvent.click(screen.getByText('CONFIRM'));

            await waitFor(() => {
                expect(resolvedValue).toBe(true);
                expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
            });
        });

        it('should resolve false when cancelled', async () => {
            let resolvedValue;
            const TestComponent = () => {
                const { showConfirm } = useDialog();
                const handleClick = async () => {
                    resolvedValue = await showConfirm('Confirm?');
                };
                return <button onClick={handleClick}>Show Confirm</button>;
            };

            render(
                <DialogProvider>
                    <TestComponent />
                </DialogProvider>
            );

            // Show dialog
            fireEvent.click(screen.getByText('Show Confirm'));

            // Click cancel
            fireEvent.click(screen.getByText('CANCEL'));

            await waitFor(() => {
                expect(resolvedValue).toBe(false);
                expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
            });
        });

        it('should use default button texts', async () => {
            const TestComponent = () => {
                const { showConfirm } = useDialog();
                return (
                    <button onClick={() => showConfirm('Use defaults?')}>
                        Show Confirm
                    </button>
                );
            };

            render(
                <DialogProvider>
                    <TestComponent />
                </DialogProvider>
            );

            fireEvent.click(screen.getByText('Show Confirm'));

            expect(screen.getByText('CONFIRM')).toBeInTheDocument();
            expect(screen.getByText('CANCEL')).toBeInTheDocument();
        });
    });

    describe('showAlert', () => {
        it('should show alert dialog with custom OK text', async () => {
            const TestComponent = () => {
                const { showAlert } = useDialog();
                return (
                    <button onClick={() => showAlert('Operation complete!', 'DONE')}>
                        Show Alert
                    </button>
                );
            };

            render(
                <DialogProvider>
                    <TestComponent />
                </DialogProvider>
            );

            // Show dialog
            fireEvent.click(screen.getByText('Show Alert'));

            // Check dialog is displayed
            expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
            expect(screen.getByText('Operation complete!')).toBeInTheDocument();
            expect(screen.getByText('DONE')).toBeInTheDocument();
            // No cancel button for alerts
            expect(screen.queryByText('CANCEL')).not.toBeInTheDocument();
        });

        it('should resolve true when OK clicked', async () => {
            let resolvedValue;
            const TestComponent = () => {
                const { showAlert } = useDialog();
                const handleClick = async () => {
                    resolvedValue = await showAlert('Info');
                };
                return <button onClick={handleClick}>Show Alert</button>;
            };

            render(
                <DialogProvider>
                    <TestComponent />
                </DialogProvider>
            );

            // Show dialog
            fireEvent.click(screen.getByText('Show Alert'));

            // Click OK
            fireEvent.click(screen.getByText('OK'));

            await waitFor(() => {
                expect(resolvedValue).toBe(true);
                expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
            });
        });

        it('should use default OK text', async () => {
            const TestComponent = () => {
                const { showAlert } = useDialog();
                return (
                    <button onClick={() => showAlert('Default alert')}>
                        Show Alert
                    </button>
                );
            };

            render(
                <DialogProvider>
                    <TestComponent />
                </DialogProvider>
            );

            fireEvent.click(screen.getByText('Show Alert'));

            expect(screen.getByText('OK')).toBeInTheDocument();
        });
    });

    describe('Multiple dialogs', () => {
        it('should replace existing dialog when new one is shown', async () => {
            const TestComponent = () => {
                const { showConfirm, showAlert } = useDialog();
                return (
                    <>
                        <button onClick={() => showConfirm('First dialog')}>
                            Show First
                        </button>
                        <button onClick={() => showAlert('Second dialog')}>
                            Show Second
                        </button>
                    </>
                );
            };

            render(
                <DialogProvider>
                    <TestComponent />
                </DialogProvider>
            );

            // Show first dialog
            fireEvent.click(screen.getByText('Show First'));
            expect(screen.getByText('First dialog')).toBeInTheDocument();

            // Show second dialog (should replace first)
            fireEvent.click(screen.getByText('Show Second'));
            expect(screen.queryByText('First dialog')).not.toBeInTheDocument();
            expect(screen.getByText('Second dialog')).toBeInTheDocument();
        });
    });
});