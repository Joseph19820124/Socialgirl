import React, { createContext, useContext, useState } from 'react';
import ToastNotification from '../components/ToastNotification';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success', duration = 4000) => {
        const id = Date.now();
        const newToast = { id, message, type, duration };
        
        setToasts(prev => [...prev, newToast]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const showSuccessToast = (resultCount) => {
        const message = `I have found ${resultCount} results.`;
        showToast(message, 'success');
    };

    const showErrorToast = (message, duration = 4000) => {
        showToast(message, 'error', duration);
    };

    return (
        <ToastContext.Provider value={{ showToast, showSuccessToast, showErrorToast, removeToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <ToastNotification
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                        duration={toast.duration}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastContext;