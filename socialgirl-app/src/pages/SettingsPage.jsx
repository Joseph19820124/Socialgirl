import React, { useState, useEffect } from 'react';
import { encryptData, decryptData, saveEncryptedSettings, loadEncryptedSettings, clearStoredSettings } from '../utils/encryption';
import './SettingsPage.css';

const SettingsPage = () => {
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
    const [hasStoredSettings, setHasStoredSettings] = useState(false);

    useEffect(() => {
        const stored = loadEncryptedSettings();
        setHasStoredSettings(!!stored);
    }, []);

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
            const encrypted = await encryptData(apiKeys, password);
            saveEncryptedSettings(encrypted);
            setHasStoredSettings(true);
            showMessage('Settings saved successfully!', 'success');
            setPassword('');
        } catch (error) {
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
            const decrypted = await decryptData(stored, password);
            setApiKeys(decrypted);
            showMessage('Settings loaded successfully!', 'success');
            setPassword('');
        } catch (error) {
            showMessage('Failed to load settings: ' + error.message, 'error');
        }
    };

    const handleExport = async () => {
        if (!password.trim()) {
            showMessage('Please enter a password to encrypt the export file', 'error');
            return;
        }

        const hasKeys = Object.values(apiKeys).some(key => key.trim());
        if (!hasKeys) {
            showMessage('No API keys to export', 'error');
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

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear all stored settings? This cannot be undone.')) {
            clearStoredSettings();
            setApiKeys({
                youtubeApiKey: '',
                rapidApiKey: ''
            });
            setHasStoredSettings(false);
            showMessage('All settings cleared', 'success');
        }
    };

    return (
        <div className="platform-page">
            <div className="settings-container">
                
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

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
                        <button onClick={handleExport} className="btn-secondary">
                            Export Settings
                        </button>
                        
                        <label className="btn-secondary file-input-label">
                            Import Settings
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                style={{ display: 'none' }}
                            />
                        </label>
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
        </div>
    );
};

export default SettingsPage;