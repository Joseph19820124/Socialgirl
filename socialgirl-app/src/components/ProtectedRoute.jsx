import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthDialog from './AuthDialog';
import LoginLandingPage from './LoginLandingPage';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const [showAuthDialog, setShowAuthDialog] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            setShowAuthDialog(true);
        } else {
            setShowAuthDialog(false);
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <div className="aurora-spinner"></div>
                    <div className="loading-text">加载中...</div>
                </div>
                <style jsx>{`
                    .loading-container {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 50vh;
                    }
                    .loading-spinner {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 1rem;
                    }
                    .aurora-spinner {
                        width: 40px;
                        height: 40px;
                        border: 3px solid var(--aurora-border-secondary);
                        border-top: 3px solid var(--aurora-cyan);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    .loading-text {
                        color: var(--aurora-text-secondary);
                        font-family: 'Roboto', sans-serif;
                        font-weight: 500;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <>
                <LoginLandingPage onLoginClick={() => setShowAuthDialog(true)} />
                <AuthDialog 
                    isOpen={showAuthDialog}
                    onClose={() => setShowAuthDialog(false)}
                    initialMode="login"
                />
            </>
        );
    }

    return children;
};

export default ProtectedRoute;