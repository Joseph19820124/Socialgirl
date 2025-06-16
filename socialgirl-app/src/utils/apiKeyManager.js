import { loadEncryptedSettings, decryptData } from './encryption';

/**
 * Get API key from storage or fallback to environment variable
 * @param {string} keyName - Name of the key to retrieve (youtubeApiKey, rapidApiKey)
 * @param {string} envVarName - Environment variable name
 * @param {string} password - Decryption password (optional)
 * @returns {string|null} - API key or null if not found
 */
export async function getApiKey(keyName, envVarName, password = null) {
    try {
        // First try to get from localStorage
        const stored = loadEncryptedSettings();
        if (stored && password) {
            const decrypted = await decryptData(stored, password);
            const storedKey = decrypted[keyName];
            if (storedKey && storedKey.trim()) {
                return storedKey.trim();
            }
        }
    } catch (error) {
        console.warn('Failed to decrypt stored settings:', error);
    }

    // Fallback to environment variable
    const envKey = import.meta.env[envVarName];
    return envKey || null;
}

/**
 * Get all API keys from storage
 * @param {string} password - Decryption password
 * @returns {Object|null} - All API keys or null if not found/decrypted
 */
export async function getAllApiKeys(password) {
    try {
        const stored = loadEncryptedSettings();
        if (stored && password) {
            return await decryptData(stored, password);
        }
    } catch (error) {
        console.warn('Failed to decrypt stored settings:', error);
    }
    return null;
}

/**
 * Check if encrypted settings exist in localStorage
 * @returns {boolean}
 */
export function hasStoredSettings() {
    return !!loadEncryptedSettings();
}