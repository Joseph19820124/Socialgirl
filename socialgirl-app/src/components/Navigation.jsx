import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components/Navigation.css';

const Navigation = ({ closeMenu }) => {
    const location = useLocation();

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

    return (
        <>
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item-v2 ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={handleClick}
                >
                    <span>{item.label}</span>
                </Link>
            ))}
        </>
    );
};

export default Navigation;