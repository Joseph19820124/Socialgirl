import React, { useState } from 'react';
import Navigation from './Navigation';
import '../styles/components/Header.css';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className={`header-v2 ${isMobileMenuOpen ? 'menu-open' : ''}`}>
            <div className="header-mobile-row">
                <div className="logo-v8">SocialGirl</div>
                <button 
                    className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </div>
            {isMobileMenuOpen && (
                <div 
                    className="mobile-menu-overlay" 
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            <nav className={`nav-v2 ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                <Navigation closeMenu={() => setIsMobileMenuOpen(false)} />
            </nav>
        </div>
    );
};

export default Header;