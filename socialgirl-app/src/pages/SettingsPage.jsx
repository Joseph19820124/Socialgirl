import React, { useState, useEffect } from 'react';
import { useDialog } from '../contexts/DialogContext';
import { encryptData, decryptData, saveEncryptedSettings, loadEncryptedSettings, clearStoredSettings } from '../utils/encryption';
import { getAllQuotaStatus, resetQuota } from '../utils/quotaManager';
import { useApiKeys } from '../contexts/ApiKeyContext';
import './SettingsPage.css';

const SettingsPage = () => {
    const { setApiKeys: setContextApiKeys, clearApiKeys } = useApiKeys();
    const { showConfirm } = useDialog();
    const [apiKeys, setApiKeys] = useState({
        youtubeApiKey: '',
        rapidApiKey: ''
    });
    
    const [password, setPassword] = useState('');
    const [showKeys, setShowKeys] = useState({
        youtubeApiKey: false,
        rapidApiKey: false
    });
    
    const [message, setMessage] = useState({ text: '', type: '' });
    const [exportError, setExportError] = useState('');
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
            showMessage(`${platform.toUpperCase()} quota tracking reset successfully`, 'success');
        }
    };

    const showMessage = (text, type = 'info') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const handleInputChange = (field, value) => {
        setApiKeys(prev => ({ ...prev, [field]: value }));
    };

    const toggleVisibility = (field) => {
        setShowKeys(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSave = async () => {
        if (!password.trim()) {
            showMessage('Please enter a password to encrypt your API keys', 'error');
            return;
        }

        const hasKeys = Object.values(apiKeys).some(key => key.trim());
        if (!hasKeys) {
            showMessage('Please enter at least one API key', 'error');
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
            showMessage('Settings saved successfully!', 'success');
            setPassword('');
        } catch (error) {
            console.error('[Settings] Failed to save settings:', error);
            showMessage('Failed to save settings: ' + error.message, 'error');
        }
    };

    const handleLoad = async () => {
        if (!password.trim()) {
            showMessage('Please enter your password to decrypt settings', 'error');
            return;
        }

        const stored = loadEncryptedSettings();
        if (!stored) {
            showMessage('No stored settings found', 'error');
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
            
            showMessage('Settings loaded successfully!', 'success');
            setPassword('');
        } catch (error) {
            console.error('[Settings] Failed to load settings:', error);
            showMessage('Failed to load settings: ' + error.message, 'error');
        }
    };

    const handleExport = async () => {
        if (!password.trim()) {
            setExportError('Error. Enter password');
            return;
        }
        setExportError('');

        const hasKeys = Object.values(apiKeys).some(key => key.trim());
        if (!hasKeys) {
            setExportError('Error. No API keys to export');
            return;
        }

        try {
            const encrypted = await encryptData(apiKeys, password);
            const blob = new Blob([JSON.stringify(encrypted, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'socialgirl-settings.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showMessage('Settings exported successfully!', 'success');
            setPassword('');
        } catch (error) {
            showMessage('Failed to export settings: ' + error.message, 'error');
        }
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            if (!password.trim()) {
                showMessage('Please enter the password for this settings file', 'error');
                return;
            }

            try {
                const importedData = JSON.parse(e.target.result);
                const decrypted = await decryptData(importedData, password);
                setApiKeys(decrypted);
                saveEncryptedSettings(importedData);
                setHasStoredSettings(true);
                showMessage('Settings imported successfully!', 'success');
                setPassword('');
            } catch (error) {
                showMessage('Failed to import settings: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
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
            showMessage('All settings cleared', 'success');
        }
    };

    return (
        <div className="platform-page">
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}
            
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
                                className="toggle-btn"
                                onClick={() => toggleVisibility('youtubeApiKey')}
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
                                className="toggle-btn"
                                onClick={() => toggleVisibility('rapidApiKey')}
                            >
                                {showKeys.rapidApiKey ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>
                        </div>

                        <div className="settings-section">
                    <h3 className="section-subtitle">Security</h3>
                    <p className="section-description">
                        Set a password to encrypt your API keys. This password is required to save, load, or export your settings.
                    </p>
                    
                    <div className="form-group">
                        <label>Encryption Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password for encryption"
                        />
                    </div>
                </div>

                <div className="settings-section">
                    <h3 className="section-subtitle">Actions</h3>
                    
                    <div className="button-group">
                        <button onClick={handleSave} className="btn-primary">
                            Save Settings
                        </button>
                        
                        {hasStoredSettings && (
                            <button onClick={handleLoad} className="btn-secondary">
                                Load Saved Settings
                            </button>
                        )}
                    </div>

                    <div className="button-group">
                        <div className="export-button-wrapper">
                            <button onClick={handleExport} className="btn-secondary">
                                Export Settings
                            </button>
                            <div className="export-error">{exportError}</div>
                        </div>
                        
                        <button onClick={() => document.getElementById('import-file-input').click()} className="btn-secondary">
                            Import Settings
                        </button>
                        <input
                            id="import-file-input"
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {hasStoredSettings && (
                        <div className="button-group">
                            <button onClick={handleClear} className="btn-danger">
                                Clear All Settings
                            </button>
                        </div>
                    )}
                </div>

                        <div className="settings-info">
                            <h3 className="section-subtitle">How It Works</h3>
                            <ul>
                                <li><strong>Save Settings:</strong> Encrypts and stores your API keys locally in your browser</li>
                                <li><strong>Export Settings:</strong> Downloads an encrypted file you can use on other browsers/devices</li>
                                <li><strong>Import Settings:</strong> Upload a previously exported settings file</li>
                                <li><strong>Security:</strong> All data is encrypted with your password and never leaves your control</li>
                            </ul>
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
                                                    className="quota-progress-fill" 
                                                    style={{ 
                                                        width: `${status.percentage}%`,
                                                        backgroundColor: status.percentage > 90 ? '#e74c3c' : 
                                                                       status.percentage > 70 ? '#f39c12' : '#2ecc71'
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="quota-percentage">{status.percentage}%</span>
                                        </div>
                                        
                                        <div className="quota-card-actions">
                                            <button 
                                                onClick={() => handleResetQuota(platform)} 
                                                className="btn-danger small"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="quota-global-actions">
                                <button onClick={refreshQuotaStatus} className="btn-secondary">
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