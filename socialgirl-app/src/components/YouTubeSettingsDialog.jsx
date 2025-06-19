import React, { useState, useEffect } from 'react';
import { 
    getYouTubeSettings, 
    saveYouTubeSettings, 
    REGION_CODES, 
    PUBLISHED_FILTERS 
} from '../utils/youtubeSettings';
import '../styles/components/YouTubeSettingsDialog.css';

const YouTubeSettingsDialog = ({ isOpen, onClose, onSettingsChange }) => {
    const [settings, setSettings] = useState(getYouTubeSettings());

    useEffect(() => {
        if (isOpen) {
            setSettings(getYouTubeSettings());
        }
    }, [isOpen]);

    const handleRegionChange = (e) => {
        setSettings({ ...settings, regionCode: e.target.value });
    };

    const handlePublishedChange = (e) => {
        setSettings({ ...settings, publishedFilter: e.target.value });
    };

    const handleSave = () => {
        saveYouTubeSettings(settings);
        onSettingsChange(settings);
        onClose();
    };

    const handleCancel = () => {
        setSettings(getYouTubeSettings());
        onClose();
    };

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    };

    return (
        <div className="dialog-overlay" onClick={handleOverlayClick}>
            <div className="dialog fractal-dialog youtube-settings-dialog">
                <h3>YouTube Search Settings</h3>
                
                <div className="settings-form">
                    <div className="setting-group">
                        <label htmlFor="region-select">Region Code</label>
                        <select 
                            id="region-select"
                            value={settings.regionCode} 
                            onChange={handleRegionChange}
                            className="aurora-select"
                        >
                            {REGION_CODES.map(region => (
                                <option key={region.code} value={region.code}>
                                    {region.name} ({region.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="setting-group">
                        <label htmlFor="published-select">Published Within</label>
                        <select 
                            id="published-select"
                            value={settings.publishedFilter} 
                            onChange={handlePublishedChange}
                            className="aurora-select"
                        >
                            {PUBLISHED_FILTERS.map(filter => (
                                <option key={filter.value} value={filter.value}>
                                    {filter.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="aurora-btn-group dialog-btn-group">
                    <button className="aurora-btn aurora-btn-primary" onClick={handleSave}>
                        SAVE SETTINGS
                    </button>
                    <button className="aurora-btn aurora-btn-ghost-secondary" onClick={handleCancel}>
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default YouTubeSettingsDialog;