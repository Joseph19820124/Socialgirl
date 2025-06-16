/**
 * Encryption utilities for secure API key storage
 */

// Generate a key from password using PBKDF2
async function generateKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

// Encrypt data
export async function encryptData(data, password) {
    try {
        const encoder = new TextEncoder();
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        const key = await generateKey(password, salt);
        const encrypted = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encoder.encode(JSON.stringify(data))
        );

        return {
            encrypted: Array.from(new Uint8Array(encrypted)),
            salt: Array.from(salt),
            iv: Array.from(iv)
        };
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt data');
    }
}

// Decrypt data
export async function decryptData(encryptedData, password) {
    try {
        const { encrypted, salt, iv } = encryptedData;
        
        const key = await generateKey(password, new Uint8Array(salt));
        const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(iv) },
            key,
            new Uint8Array(encrypted)
        );

        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt data - check password');
    }
}

// Storage helpers
export function saveEncryptedSettings(encryptedData) {
    localStorage.setItem('socialgirl_settings', JSON.stringify(encryptedData));
}

export function loadEncryptedSettings() {
    const stored = localStorage.getItem('socialgirl_settings');
    return stored ? JSON.parse(stored) : null;
}

export function clearStoredSettings() {
    localStorage.removeItem('socialgirl_settings');
}