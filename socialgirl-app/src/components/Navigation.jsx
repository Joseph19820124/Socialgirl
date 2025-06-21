import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthDialog from './AuthDialog';
import '../styles/components/Navigation.css';

const Navigation = ({ closeMenu }) => {
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuth();
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    const navItems = [
        { path: '/youtube', label: 'YouTube' },
        { path: '/instagram', label: 'Instagram' },
        { path: '/tiktok', label: 'TikTok' },
        { path: '/settings', label: 'Settings' }
    ];

    const handleClick = () => {
        // Close mobile menu when a link is clicked
        if (closeMenu) {
            closeMenu();
        }
    };

    const handleAuthClick = (mode) => {
        setAuthMode(mode);
        setShowAuthDialog(true);
        if (closeMenu) {
            closeMenu();
        }
    };

    const handleLogout = () => {
        logout();
        if (closeMenu) {
            closeMenu();
        }
    };

    return (
        <>
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item-v2 particle-menu ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={handleClick}
                >
                    {item.label}
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </Link>
            ))}
            
            {/* Authentication section */}
            <div className="nav-auth-section">
                {isAuthenticated ? (
                    <>
                        <div className="nav-user-info">
                            <span className="nav-username">{user?.username}</span>
                        </div>
                        <button 
                            className="nav-item-v2 particle-menu auth-button"
                            onClick={handleLogout}
                        >
                            退出登录
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </>
                ) : (
                    <>
                        <button 
                            className="nav-item-v2 particle-menu auth-button"
                            onClick={() => handleAuthClick('login')}
                        >
                            登录
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                        <button 
                            className="nav-item-v2 particle-menu auth-button"
                            onClick={() => handleAuthClick('register')}
                        >
                            注册
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </>
                )}
            </div>

            <AuthDialog 
                isOpen={showAuthDialog}
                onClose={() => setShowAuthDialog(false)}
                initialMode={authMode}
            />
        </>
    );
};

export default Navigation;