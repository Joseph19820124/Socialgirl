import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import YouTubePage from './pages/YouTubePage';
import InstagramPage from './pages/InstagramPage';
import TikTokPage from './pages/TikTokPage';
import { mockTableData } from './data/mockData';
import { mockUsersData } from './data/mockUsersData';
import './App.css';

function AppContent() {
    const [videosData, setVideosData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/youtube':
                return 'YouTube Analytics';
            case '/instagram':
                return 'Instagram Analytics';
            case '/tiktok':
                return 'TikTok Analytics';
            default:
                return 'Content Analytics Dashboard';
        }
    };

    useEffect(() => {
        // Simulate data loading
        setTimeout(() => {
            setVideosData(mockTableData);
            setUsersData(mockUsersData);
            setIsLoading(false);
        }, 1500);
    }, []);

    return (
        <div className="container">
            <Header />
            <div className="section">
                <div className="section-title-v1">{getPageTitle()}</div>
                <Routes>
                    <Route path="/" element={<Navigate to="/youtube" replace />} />
                    <Route path="/youtube" element={<YouTubePage videosData={videosData} usersData={usersData} isLoading={isLoading} />} />
                    <Route path="/instagram" element={<InstagramPage videosData={videosData} usersData={usersData} isLoading={isLoading} />} />
                    <Route path="/tiktok" element={<TikTokPage videosData={videosData} usersData={usersData} isLoading={isLoading} />} />
                    <Route path="/settings" element={<div>Settings page coming soon...</div>} />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App
