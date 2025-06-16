import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import YouTubePage from './pages/YouTubePage';
import InstagramPage from './pages/InstagramPage';
import TikTokPage from './pages/TikTokPage';
import './App.css';

// Import API functions and mappers
import { searchVideos as searchYouTube, getVideosStatistics } from './apis/youtube';
import { searchVideos as searchTikTok } from './apis/tiktok';
import { extractVideoData as extractYouTubeData } from './mappers/youtube';
import { extractVideoData as extractTikTokData } from './mappers/tiktok';

function AppContent() {
    // Separate data states for each platform
    const [youtubeVideosData, setYoutubeVideosData] = useState([]);
    const [youtubeUsersData, setYoutubeUsersData] = useState([]);
    const [instagramVideosData, setInstagramVideosData] = useState([]);
    const [instagramUsersData, setInstagramUsersData] = useState([]);
    const [tiktokVideosData, setTiktokVideosData] = useState([]);
    const [tiktokUsersData, setTiktokUsersData] = useState([]);
    
    // Loading states for each platform
    const [youtubeLoading, setYoutubeLoading] = useState(false);
    const [instagramLoading, setInstagramLoading] = useState(false);
    const [tiktokLoading, setTiktokLoading] = useState(false);
    
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

    // Tables start empty - data populates only from API searches

    // YouTube search handler
    const handleYouTubeSearch = async (query) => {
        if (!query.trim()) return;
        
        setYoutubeLoading(true);
        try {
            // First, search for videos
            const searchResponse = await searchYouTube(query, 50);
            
            // Extract video IDs from search results
            const videoIds = searchResponse.items
                .map(item => item.id?.videoId)
                .filter(id => id);
            
            // Fetch full statistics for these videos
            const videosWithStats = await getVideosStatistics(videoIds);
            
            // Extract and set the video data
            const videos = extractYouTubeData(videosWithStats);
            setYoutubeVideosData(videos);
        } catch (error) {
            console.error('YouTube search error:', error);
            // Keep existing data on error
        } finally {
            setYoutubeLoading(false);
        }
    };

    // TikTok search handler
    const handleTikTokSearch = async (query) => {
        if (!query.trim()) return;
        
        setTiktokLoading(true);
        try {
            const response = await searchTikTok(query);
            const videos = extractTikTokData(response);
            setTiktokVideosData(videos);
        } catch (error) {
            console.error('TikTok search error:', error);
            // Keep existing data on error
        } finally {
            setTiktokLoading(false);
        }
    };

    // Instagram search handler (placeholder for now)
    const handleInstagramSearch = async (query) => {
        if (!query.trim()) return;
        
        setInstagramLoading(true);
        try {
            // Instagram API search implementation would go here
            console.log('Instagram search for:', query);
            // For now, just simulate a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Instagram search error:', error);
        } finally {
            setInstagramLoading(false);
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
                                videosData={youtubeVideosData} 
                                usersData={youtubeUsersData} 
                                isLoading={youtubeLoading}
                                onSearch={handleYouTubeSearch}
                            />
                        } 
                    />
                    <Route 
                        path="/instagram" 
                        element={
                            <InstagramPage 
                                videosData={instagramVideosData} 
                                usersData={instagramUsersData} 
                                isLoading={instagramLoading}
                                onSearch={handleInstagramSearch}
                            />
                        } 
                    />
                    <Route 
                        path="/tiktok" 
                        element={
                            <TikTokPage 
                                videosData={tiktokVideosData} 
                                usersData={tiktokUsersData} 
                                isLoading={tiktokLoading}
                                onSearch={handleTikTokSearch}
                            />
                        } 
                    />
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