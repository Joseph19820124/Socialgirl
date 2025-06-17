import React, { useState } from 'react';
import '../styles/components/SearchBar.css';

const SearchBar = ({ onSearch, placeholder = "Search Database" }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <div className="search-v2">
            <div className="search-icon-v2">⚡</div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="search-input-v2"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </form>
        </div>
    );
};

export default SearchBar;