import React, { createContext, useContext, useState } from 'react';

/**
 * Context for managing decrypted API keys in memory during the session
 * This allows API keys to be accessed by API functions after user loads them in Settings
 */
const ApiKeyContext = createContext({
    setApiKeys: () => {},
    getApiKey: () => null,
    clearApiKeys: () => {}
});

export const useApiKeys = () => {
    const context = useContext(ApiKeyContext);
    if (!context) {
        throw new Error('useApiKeys must be used within an ApiKeyProvider');
    }
    return context;
};

export const ApiKeyProvider = ({ children }) => {
    // Initialize state from sessionStorage if available
    const [apiKeys, setApiKeysState] = useState(() => {
        try {
            const stored = sessionStorage.getItem('socialgirl_session_keys');
            if (stored) {
                console.log('[API Key Context] Loading API keys from session storage');
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('[API Key Context] Failed to load from session storage:', error);
        }
        return {};
    });

    const setApiKeys = (keys) => {
        console.log('[API Key Context] Setting API keys:', {
            keyNames: Object.keys(keys),
            hasRapidApi: !!keys.rapidApiKey,
            rapidApiLength: keys.rapidApiKey?.length || 0
        });
        setApiKeysState(keys);
        
        // Also save to sessionStorage for persistence during the session
        try {
            sessionStorage.setItem('socialgirl_session_keys', JSON.stringify(keys));
            console.log('[API Key Context] Saved API keys to session storage');
        } catch (error) {
            console.error('[API Key Context] Failed to save to session storage:', error);
        }
    };

    const getApiKey = (keyName) => {
        const key = apiKeys[keyName];
        console.log('[API Key Context] Getting API key:', {
            keyName,
            hasKey: !!key,
            keyLength: key?.length || 0
        });
        return key || null;
    };

    const clearApiKeys = () => {
        console.log('[API Key Context] Clearing all API keys');
        setApiKeysState({});
        
        // Also clear from sessionStorage
        try {
            sessionStorage.removeItem('socialgirl_session_keys');
            console.log('[API Key Context] Cleared API keys from session storage');
        } catch (error) {
            console.error('[API Key Context] Failed to clear session storage:', error);
        }
    };

    const contextValue = {
        setApiKeys,
        getApiKey,
        clearApiKeys
    };

    return (
        <ApiKeyContext.Provider value={contextValue}>
            {children}
        </ApiKeyContext.Provider>
    );
};

export default ApiKeyContext;