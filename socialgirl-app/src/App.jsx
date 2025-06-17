import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import YouTubePage from './pages/YouTubePage';
import InstagramPage from './pages/InstagramPage';
import TikTokPage from './pages/TikTokPage';
import SettingsPage from './pages/SettingsPage';
import usePlatformData from './hooks/usePlatformData';
import useSearch from './hooks/useSearch';
import { PLATFORMS, DEFAULT_PLATFORM } from './config/platforms';
import { ApiKeyProvider, useApiKeys } from './contexts/ApiKeyContext';
import { setApiKeyContextGetter } from './utils/apiKeyManager';
import './App.css';

function AppContent() {
    const platformData = usePlatformData();
    const { handleYouTubeSearch, handleTikTokSearch, handleInstagramSearch } = useSearch(platformData);
    const location = useLocation();
    const { getApiKey } = useApiKeys();

    // Set up the API key context getter for the apiKeyManager
    useEffect(() => {
        console.log('[App] Setting up API key context getter for apiKeyManager');
        setApiKeyContextGetter(getApiKey);
    }, [getApiKey]);

    const getPageTitle = () => {
        const platformId = location.pathname.slice(1);
        const platform = PLATFORMS[platformId];
        
        if (platform) {
            return platform.title;
        } else if (location.pathname === '/settings') {
            return 'Settings';
        } else {
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
                                onClearData={() => platformData.clearPlatformData('youtube')}
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
                                userPostsData={platformData.getPlatformData('instagram').userPostsData}
                                isLoading={platformData.getPlatformData('instagram').isLoading}
                                onSearch={handleInstagramSearch}
                                onClearData={() => platformData.clearPlatformData('instagram')}
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
                                userPostsData={platformData.getPlatformData('tiktok').userPostsData}
                                isLoading={platformData.getPlatformData('tiktok').isLoading}
                                onSearch={handleTikTokSearch}
                                onClearData={() => platformData.clearPlatformData('tiktok')}
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
        <ApiKeyProvider>
            <Router>
                <AppContent />
            </Router>
        </ApiKeyProvider>
    );
}

export default App