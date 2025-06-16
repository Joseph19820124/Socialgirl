import React from 'react';
import Navigation from './Navigation';
import SearchBar from './SearchBar';
import '../styles/components/Header.css';

const Header = () => {
    const handleSearch = (query) => {
        // TODO: Implement search functionality
        console.log('Searching for:', query);
    };

    return (
        <div className="header-v2">
            <div className="logo-v8">SocialGirl</div>
            <nav className="nav-v2">
                <Navigation />
                <SearchBar onSearch={handleSearch} />
            </nav>
        </div>
    );
};

export default Header;