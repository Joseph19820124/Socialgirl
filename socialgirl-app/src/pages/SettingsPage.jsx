import React, { useState, useEffect } from 'react';
import { useDialog } from '../contexts/DialogContext';
import { useToast } from '../contexts/ToastContext';
import { encryptData, decryptData, saveEncryptedSettings, loadEncryptedSettings, clearStoredSettings } from '../utils/encryption';
import { getAllQuotaStatus, resetQuota } from '../utils/quotaManager';
import { useApiKeys } from '../contexts/ApiKeyContext';
import './SettingsPage.css';

const SettingsPage = () => {
    const { setApiKeys: setContextApiKeys, clearApiKeys } = useApiKeys();
    const { showConfirm } = useDialog();
    const { showToast, showErrorToast } = useToast();
    const [apiKeys, setApiKeys] = useState({
        youtubeApiKey: '',
        rapidApiKey: ''
    });
    
    const [password, setPassword] = useState('');
    const [showKeys, setShowKeys] = useState({
        youtubeApiKey: false,
        rapidApiKey: false
    });
    
    const [hasStoredSettings, setHasStoredSettings] = useState(false);
    const [quotaStatus, setQuotaStatus] = useState({});

    useEffect(() => {
        const stored = loadEncryptedSettings();
        setHasStoredSettings(!!stored);
        setQuotaStatus(getAllQuotaStatus());
    }, []);
    
    const refreshQuotaStatus = () => {
        setQuotaStatus(getAllQuotaStatus());
    };
    
    const handleResetQuota = async (platform) => {
        const confirmed = await showConfirm(
            `Are you sure you want to reset the ${platform.toUpperCase()} API quota tracking? This is for testing purposes only.`,
            'RESET QUOTA',
            'CANCEL'
        );
        
        if (confirmed) {
            resetQuota(platform);
            refreshQuotaStatus();
            showToast(`${platform.toUpperCase()} quota tracking reset successfully`, 'success');
        }
    };


    const handleInputChange = (field, value) => {
        setApiKeys(prev => ({ ...prev, [field]: value }));
    };

    const toggleVisibility = (field) => {
        setShowKeys(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSave = async () => {
        if (!password.trim()) {
            showErrorToast('Please enter a password to encrypt your API keys');
            return;
        }

        const hasKeys = Object.values(apiKeys).some(key => key.trim());
        if (!hasKeys) {
            showErrorToast('Please enter at least one API key');
            return;
        }

        try {
            console.log('[Settings] Saving API keys...');
            const encrypted = await encryptData(apiKeys, password);
            saveEncryptedSettings(encrypted);
            
            // Store decrypted keys in context for immediate use
            console.log('[Settings] Storing keys in context for session use');
            setContextApiKeys(apiKeys);
            
            setHasStoredSettings(true);
            showToast('Settings saved successfully!', 'success');
            setPassword('');
        } catch (error) {
            console.error('[Settings] Failed to save settings:', error);
            showErrorToast('Failed to save settings: ' + error.message);
        }
    };

    const handleLoad = async () => {
        if (!password.trim()) {
            showErrorToast('Please enter your password to decrypt settings');
            return;
        }

        const stored = loadEncryptedSettings();
        if (!stored) {
            showErrorToast('No stored settings found');
            return;
        }

        try {
            console.log('[Settings] Loading and decrypting API keys...');
            const decrypted = await decryptData(stored, password);
            
            // Update local state
            setApiKeys(decrypted);
            
            // Store decrypted keys in context for API use
            console.log('[Settings] Storing loaded keys in context for session use');
            setContextApiKeys(decrypted);
            
            showToast('Settings loaded successfully!', 'success');
            setPassword('');
        } catch (error) {
            console.error('[Settings] Failed to load settings:', error);
            showErrorToast('Failed to load settings: ' + error.message);
        }
    };


    const handleClear = async () => {
        const confirmed = await showConfirm(
            'Are you sure you want to clear all stored settings? This cannot be undone.',
            'CLEAR SETTINGS',
            'CANCEL'
        );
        
        if (confirmed) {
            console.log('[Settings] Clearing all stored settings and context');
            clearStoredSettings();
            
            // Clear local state
            setApiKeys({
                youtubeApiKey: '',
                rapidApiKey: ''
            });
            
            // Clear context
            clearApiKeys();
            
            setHasStoredSettings(false);
            showToast('All settings cleared', 'success');
        }
    };

    return (
        <div className="platform-page">
            <div className="settings-grid">
                    <div className="settings-left-column">
                        <div className="settings-section">
                    <h3 className="section-subtitle">API Keys</h3>
                    <p className="section-description">
                        Enter your API keys to enable data fetching from each platform.
                    </p>

                    <div className="form-group">
                        <label>YouTube API Key</label>
                        <div className="input-group">
                            <input
                                type={showKeys.youtubeApiKey ? 'text' : 'password'}
                                value={apiKeys.youtubeApiKey}
                                onChange={(e) => handleInputChange('youtubeApiKey', e.target.value)}
                                placeholder="Enter YouTube API key"
                            />
                            <button 
                                type="button" 
                                className="aurora-btn aurora-btn-subtle aurora-btn-icon aurora-btn-icon-only aurora-btn-sm toggle-btn"
                                onClick={() => toggleVisibility('youtubeApiKey')}
                                aria-label={showKeys.youtubeApiKey ? 'Hide API key' : 'Show API key'}
                            >
                                {showKeys.youtubeApiKey ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>RapidAPI Key (Instagram & TikTok)</label>
                        <div className="input-group">
                            <input
                                type={showKeys.rapidApiKey ? 'text' : 'password'}
                                value={apiKeys.rapidApiKey}
                                onChange={(e) => handleInputChange('rapidApiKey', e.target.value)}
                                placeholder="Enter RapidAPI key for Instagram & TikTok"
                            />
                            <button 
                                type="button" 
                                className="aurora-btn aurora-btn-subtle aurora-btn-icon aurora-btn-icon-only aurora-btn-sm toggle-btn"
                                onClick={() => toggleVisibility('rapidApiKey')}
                                aria-label={showKeys.rapidApiKey ? 'Hide API key' : 'Show API key'}
                            >
                                {showKeys.rapidApiKey ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Encryption Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password for encryption"
                        />
                    </div>
                    
                    <div className="button-group-compact">
                        <button onClick={handleSave} className="aurora-btn aurora-btn-primary aurora-btn-sm">
                            Save
                        </button>
                        
                        <button 
                            onClick={handleLoad} 
                            className="aurora-btn aurora-btn-secondary aurora-btn-sm"
                            disabled={!hasStoredSettings}
                        >
                            Load
                        </button>
                        
                        <span className="button-separator">•</span>
                        
                        <button 
                            onClick={handleClear} 
                            className="aurora-btn aurora-btn-danger aurora-btn-sm"
                            disabled={!hasStoredSettings}
                        >
                            Clear All
                        </button>
                    </div>
                        </div>
                    </div>

                    <div className="settings-right-column">
                        <div className="settings-section">
                            <h3 className="section-subtitle">API Usage & Quotas</h3>
                            <p className="section-description">
                                Monitor your API usage across all platforms. Quotas reset automatically.
                            </p>
                            
                            <div className="quota-dashboard">
                                {Object.entries(quotaStatus).map(([platform, status]) => (
                                    <div key={platform} className="quota-card">
                                        <div className="quota-card-header">
                                            <h4 className="quota-platform-name">
                                                {platform === 'youtube' ? 'YouTube' : 
                                                 platform === 'tiktok' ? 'TikTok' : 
                                                 platform === 'instagram' ? 'Instagram' : platform}
                                            </h4>
                                            <span className="quota-period">
                                                {status.period === 'daily' ? 'Daily' : 'Monthly'}
                                            </span>
                                        </div>
                                        
                                        <div className="quota-stats">
                                            <div className="quota-stat">
                                                <span className="quota-stat-label">Used</span>
                                                <span className="quota-stat-value">{status.used.toLocaleString()}</span>
                                            </div>
                                            <div className="quota-stat">
                                                <span className="quota-stat-label">Remaining</span>
                                                <span className="quota-stat-value">{status.remaining.toLocaleString()}</span>
                                            </div>
                                            <div className="quota-stat">
                                                <span className="quota-stat-label">Total</span>
                                                <span className="quota-stat-value">{status.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="quota-progress">
                                            <div className="quota-progress-bar">
                                                <div 
                                                    className={`quota-progress-fill ${
                                                        status.percentage > 90 ? 'quota-critical' : 
                                                        status.percentage > 70 ? 'quota-warning' : 'quota-healthy'
                                                    }`}
                                                    style={{ 
                                                        width: `${status.percentage}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="quota-percentage">{status.percentage}%</span>
                                        </div>
                                        
                                        <div className="quota-card-actions">
                                            <button 
                                                onClick={() => handleResetQuota(platform)} 
                                                className="aurora-btn aurora-btn-danger aurora-btn-sm"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="quota-global-actions">
                                <button onClick={refreshQuotaStatus} className="aurora-btn aurora-btn-surface">
                                    Refresh All Status
                                </button>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    );
};

export default SettingsPage;