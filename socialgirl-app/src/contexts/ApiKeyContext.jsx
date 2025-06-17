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
    const [apiKeys, setApiKeysState] = useState({});

    const setApiKeys = (keys) => {
        console.log('[API Key Context] Setting API keys:', {
            keyNames: Object.keys(keys),
            hasRapidApi: !!keys.rapidApiKey,
            rapidApiLength: keys.rapidApiKey?.length || 0
        });
        setApiKeysState(keys);
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