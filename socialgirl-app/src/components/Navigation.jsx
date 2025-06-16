import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components/Navigation.css';

const Navigation = () => {
    const location = useLocation();

    const navItems = [
        { path: '/youtube', label: 'YouTube' },
        { path: '/instagram', label: 'Instagram' },
        { path: '/tiktok', label: 'TikTok' },
        { path: '/settings', label: 'Settings' }
    ];

    return (
        <>
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item-v2 ${location.pathname === item.path ? 'active' : ''}`}
                >
                    <span>{item.label}</span>
                </Link>
            ))}
        </>
    );
};

export default Navigation;