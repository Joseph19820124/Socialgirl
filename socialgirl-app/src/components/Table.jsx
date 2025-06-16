import React, { useState, useEffect } from 'react';
import '../styles/components/Table.css';
import { formatNumber, getStatClass } from '../utils/formatters';

const Table = ({ data, isLoading }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [sortedData, setSortedData] = useState(data);

    useEffect(() => {
        setSortedData(data);
    }, [data]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        const sorted = [...sortedData].sort((a, b) => {
            if (typeof a[key] === 'string') {
                return direction === 'asc' 
                    ? a[key].toLowerCase().localeCompare(b[key].toLowerCase())
                    : b[key].toLowerCase().localeCompare(a[key].toLowerCase());
            }
            return direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
        });

        setSortedData(sorted);
        setSortConfig({ key, direction });
    };

    const getHeaderClass = (key) => {
        if (sortConfig.key === key) {
            return `sort-active sort-${sortConfig.direction}`;
        }
        return '';
    };

    if (isLoading) {
        return (
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>👤 Username</th>
                            <th>👥 Followers</th>
                            <th>📝 Title</th>
                            <th>👁️ Views</th>
                            <th>💬 Comments</th>
                            <th>🔄 Shares</th>
                            <th>🔗 URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, index) => (
                            <tr key={index}>
                                <td><div className="skeleton username"></div></td>
                                <td><div className="skeleton followers"></div></td>
                                <td><div className="skeleton title"></div></td>
                                <td><div className="skeleton views"></div></td>
                                <td><div className="skeleton comments"></div></td>
                                <td><div className="skeleton shares"></div></td>
                                <td><div className="skeleton url"></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th className={`username-col ${getHeaderClass('username')}`} onClick={() => handleSort('username')}>
                            👤 Username
                        </th>
                        <th className={`followers-col ${getHeaderClass('followers')}`} onClick={() => handleSort('followers')}>
                            👥 Followers
                        </th>
                        <th className={`title-col ${getHeaderClass('title')}`} onClick={() => handleSort('title')}>
                            📝 Title
                        </th>
                        <th className={`views-col ${getHeaderClass('views')}`} onClick={() => handleSort('views')}>
                            👁️ Views
                        </th>
                        <th className={`comments-col ${getHeaderClass('comments')}`} onClick={() => handleSort('comments')}>
                            💬 Comments
                        </th>
                        <th className={`shares-col ${getHeaderClass('shares')}`} onClick={() => handleSort('shares')}>
                            🔄 Shares
                        </th>
                        <th className="url-col">🔗 URL</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, index) => (
                        <tr key={index}>
                            <td className="username-col">
                                <span className="username">{row.username}</span>
                            </td>
                            <td className="followers-col">
                                <span className={`followers ${getStatClass(row.followers, 'followers')} animated-stat stat-highlight`}>
                                    {formatNumber(row.followers)}
                                </span>
                            </td>
                            <td className="title-col">
                                <span className="title">{row.title}</span>
                            </td>
                            <td className="views-col">
                                <span className={`views ${getStatClass(row.views, 'views')} animated-stat`}>
                                    {formatNumber(row.views)}
                                </span>
                            </td>
                            <td className="comments-col">
                                <span className={`comments ${getStatClass(row.comments, 'comments')} animated-stat`}>
                                    {row.comments}
                                </span>
                            </td>
                            <td className="shares-col">
                                <span className={`shares ${getStatClass(row.shares, 'shares')} animated-stat`}>
                                    {row.shares}
                                </span>
                            </td>
                            <td className="url-col">
                                <a href={row.url || '#'} className="watch-btn">Watch</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;