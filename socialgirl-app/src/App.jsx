import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Preloader from './components/Preloader';
import YouTubePage from './pages/YouTubePage';
import InstagramPage from './pages/InstagramPage';
import TikTokPage from './pages/TikTokPage';
import SettingsPage from './pages/SettingsPage';
import usePlatformData from './hooks/usePlatformData';
import useSearch from './hooks/useSearch';
import { PLATFORMS, DEFAULT_PLATFORM } from './config/platforms';
import { ApiKeyProvider, useApiKeys } from './contexts/ApiKeyContext';
import { ToastProvider } from './contexts/ToastContext';
import { DialogProvider } from './contexts/DialogContext';
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
        <div className="aurora-waves">
            <div className="aurora-layer"></div>
            <div className="aurora-layer"></div>
            <div className="aurora-layer"></div>
            <div className="noise-overlay"></div>
            
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
        </div>
    );
}

function App() {
    const [isLoading, setIsLoading] = useState(true);

    const handleLoadComplete = () => {
        setIsLoading(false);
    };

    return (
        <ApiKeyProvider>
            <DialogProvider>
                <ToastProvider>
                    {isLoading && <Preloader onLoadComplete={handleLoadComplete} />}
                    <Router>
                        <AppContent />
                    </Router>
                </ToastProvider>
            </DialogProvider>
        </ApiKeyProvider>
    );
}

export default App