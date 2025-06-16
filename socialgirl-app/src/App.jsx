import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import YouTubePage from './pages/YouTubePage';
import InstagramPage from './pages/InstagramPage';
import TikTokPage from './pages/TikTokPage';
import SettingsPage from './pages/SettingsPage';
import usePlatformData from './hooks/usePlatformData';
import useSearch from './hooks/useSearch';
import './App.css';

function AppContent() {
    const platformData = usePlatformData();
    const { handleYouTubeSearch, handleTikTokSearch, handleInstagramSearch } = useSearch(platformData);
    const location = useLocation();

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/youtube':
                return 'YouTube Analytics';
            case '/instagram':
                return 'Instagram Analytics';
            case '/tiktok':
                return 'TikTok Analytics';
            case '/settings':
                return 'Settings';
            default:
                return 'Content Analytics Dashboard';
        }
    };


    return (
        <div className="container">
            <Header />
            <div className="section">
                <div className="section-title-v1">{getPageTitle()}</div>
                <Routes>
                    <Route path="/" element={<Navigate to="/youtube" replace />} />
                    <Route 
                        path="/youtube" 
                        element={
                            <YouTubePage 
                                videosData={platformData.getPlatformData('youtube').videosData} 
                                usersData={platformData.getPlatformData('youtube').usersData} 
                                userVideosData={platformData.getPlatformData('youtube').userVideosData}
                                isLoading={platformData.getPlatformData('youtube').isLoading}
                                onSearch={handleYouTubeSearch}
                            />
                        } 
                    />
                    <Route 
                        path="/instagram" 
                        element={
                            <InstagramPage 
                                videosData={platformData.getPlatformData('instagram').videosData} 
                                usersData={platformData.getPlatformData('instagram').usersData} 
                                userVideosData={platformData.getPlatformData('instagram').userVideosData}
                                isLoading={platformData.getPlatformData('instagram').isLoading}
                                onSearch={handleInstagramSearch}
                            />
                        } 
                    />
                    <Route 
                        path="/tiktok" 
                        element={
                            <TikTokPage 
                                videosData={platformData.getPlatformData('tiktok').videosData} 
                                usersData={platformData.getPlatformData('tiktok').usersData} 
                                userVideosData={platformData.getPlatformData('tiktok').userVideosData}
                                isLoading={platformData.getPlatformData('tiktok').isLoading}
                                onSearch={handleTikTokSearch}
                            />
                        } 
                    />
                    <Route path="/settings" element={<SettingsPage />} />
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