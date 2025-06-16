import React, { useState, useEffect } from 'react';
import '../styles/components/Table.css';
import '../styles/components/UsersTable.css';
import { formatNumber, getStatClass } from '../utils/formatters';

const UsersTable = ({ data, isLoading }) => {
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
                            <th>📝 About</th>
                            <th>📱 Media</th>
                            <th>🔗 URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, index) => (
                            <tr key={index}>
                                <td><div className="skeleton username"></div></td>
                                <td><div className="skeleton followers"></div></td>
                                <td><div className="skeleton about"></div></td>
                                <td><div className="skeleton media"></div></td>
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
                        <th className={`about-col ${getHeaderClass('about')}`} onClick={() => handleSort('about')}>
                            📝 About
                        </th>
                        <th className={`media-col ${getHeaderClass('media')}`} onClick={() => handleSort('media')}>
                            📱 Media
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
                            <td className="about-col">
                                <span className="about" title={row.about}>{row.about}</span>
                            </td>
                            <td className="media-col">
                                <span className={`media ${getStatClass(row.media, 'media')} animated-stat`}>
                                    {formatNumber(row.media)}
                                </span>
                            </td>
                            <td className="url-col">
                                <a href={row.url || '#'} className="visit-btn">Visit</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsersTable;