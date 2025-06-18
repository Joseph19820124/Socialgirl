import React, { useState } from 'react';
import '../styles/components/SearchBar.css';

const SearchBar = ({ onSearch, placeholder = "Search Database" }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="morph-search">
                <div className="morph-border"></div>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
        </form>
    );
};

export default SearchBar;