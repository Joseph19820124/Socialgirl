import React, { useEffect } from 'react';
import '../styles/components/Toast.css';

const ToastNotification = ({ message, type = 'success', onClose, duration = 4000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const handleClose = () => {
        const toastElement = document.querySelector('.cosmic-toast');
        if (toastElement) {
            toastElement.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => onClose(), 300);
        }
    };

    const isError = type === 'error';
    const title = isError ? 'Error' : 'Success!';
    const iconPath = isError 
        ? "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" // Error icon
        : "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"; // Success checkmark

    return (
        <div className={`toast cosmic-toast ${isError ? 'toast-error' : ''}`}>
            <svg className="toast-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d={iconPath}/>
            </svg>
            <div className="toast-content">
                <div className="toast-title">{title}</div>
                <div className="toast-message">{message}</div>
            </div>
            <div className="close-btn" onClick={handleClose}>✕</div>
            <span className="star"></span>
            <span className="star"></span>
            <span className="star"></span>
            <span className="star"></span>
        </div>
    );
};

export default ToastNotification;