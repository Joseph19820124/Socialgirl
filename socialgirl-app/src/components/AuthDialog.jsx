import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import '../styles/components/AuthDialog.css';

const AuthDialog = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);

    if (!isOpen) return null;

    const handleSwitchToLogin = () => setMode('login');
    const handleSwitchToRegister = () => setMode('register');

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="auth-dialog-overlay" onClick={handleOverlayClick}>
            <div className="auth-dialog">
                <button className="auth-dialog-close" onClick={onClose}>
                    ×
                </button>
                
                {mode === 'login' ? (
                    <LoginForm 
                        onSwitchToRegister={handleSwitchToRegister}
                        onClose={onClose}
                    />
                ) : (
                    <RegisterForm 
                        onSwitchToLogin={handleSwitchToLogin}
                        onClose={onClose}
                    />
                )}
            </div>
        </div>
    );
};

export default AuthDialog;