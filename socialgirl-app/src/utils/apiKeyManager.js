import { loadEncryptedSettings } from './encryption';
import { getEnvVar } from './env';

// Global variable to store API key context getter
// This will be set by the ApiKeyProvider when the app initializes
let getApiKeyFromContext = null;

/**
 * Set the API key context getter function
 * This is called by the ApiKeyProvider to make context available to this utility
 * @param {Function} contextGetter - Function to get API keys from context
 */
export function setApiKeyContextGetter(contextGetter) {
    console.log('[API Key Manager] Setting context getter function');
    getApiKeyFromContext = contextGetter;
}

/**
 * Get API key from context, encrypted storage, or environment variable
 * @param {string} keyName - Name of the key in stored settings
 * @param {string} envVar - Environment variable name as fallback
 * @returns {Promise<string|null>} API key or null if not found
 */
export async function getApiKey(keyName, envVar) {
    console.log(`[API Key Manager] Getting API key for: ${keyName}`);
    
    try {
        // First priority: Check memory context (decrypted keys from current session)
        if (getApiKeyFromContext) {
            console.log('[API Key Manager] Checking context for decrypted keys...');
            const contextKey = getApiKeyFromContext(keyName);
            if (contextKey) {
                console.log(`[API Key Manager] Found key in context: ${keyName} (length: ${contextKey.length})`);
                return contextKey;
            } else {
                console.log(`[API Key Manager] Key not found in context: ${keyName}`);
            }
        } else {
            console.log('[API Key Manager] Context getter not available');
        }

        // Second priority: Try encrypted storage (but we can't decrypt without password)
        const encryptedSettings = loadEncryptedSettings();
        if (encryptedSettings) {
            console.log('[API Key Manager] Encrypted settings found but no password available for decryption');
            console.log('[API Key Manager] User needs to load settings from Settings page first');
        } else {
            console.log('[API Key Manager] No encrypted settings found in localStorage');
        }
        
        // Third priority: Fall back to environment variable (runtime or buildtime)
        console.log(`[API Key Manager] Checking environment variable: ${envVar}`);
        const envValue = getEnvVar(envVar);
        if (envValue) {
            console.log(`[API Key Manager] Found key in environment: ${envVar} (length: ${envValue.length})`);
            return envValue;
        } else {
            console.log(`[API Key Manager] Environment variable not set: ${envVar}`);
        }
        
        console.log(`[API Key Manager] API key not found anywhere for: ${keyName}`);
        return null;
    } catch (error) {
        console.error(`[API Key Manager] Error getting API key for ${keyName}:`, error);
        return null;
    }
}

