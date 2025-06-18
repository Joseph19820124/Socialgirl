import React, { createContext, useContext, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

const DialogContext = createContext();

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};

export const DialogProvider = ({ children }) => {
    const [dialog, setDialog] = useState(null);

    const showConfirm = (title, confirmText = "CONFIRM", cancelText = "CANCEL") => {
        return new Promise((resolve) => {
            setDialog({
                title,
                confirmText,
                cancelText,
                onConfirm: () => {
                    setDialog(null);
                    resolve(true);
                },
                onCancel: () => {
                    setDialog(null);
                    resolve(false);
                }
            });
        });
    };

    const showAlert = (title, okText = "OK") => {
        return new Promise((resolve) => {
            setDialog({
                title,
                confirmText: okText,
                cancelText: null,
                onConfirm: () => {
                    setDialog(null);
                    resolve(true);
                },
                onCancel: () => {
                    setDialog(null);
                    resolve(true);
                }
            });
        });
    };

    return (
        <DialogContext.Provider value={{ showConfirm, showAlert }}>
            {children}
            {dialog && (
                <ConfirmDialog
                    isOpen={true}
                    title={dialog.title}
                    confirmText={dialog.confirmText}
                    cancelText={dialog.cancelText}
                    onConfirm={dialog.onConfirm}
                    onCancel={dialog.onCancel}
                />
            )}
        </DialogContext.Provider>
    );
};

export default DialogContext;