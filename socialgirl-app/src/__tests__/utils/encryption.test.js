import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
    encryptData, 
    decryptData, 
    saveEncryptedSettings, 
    loadEncryptedSettings, 
    clearStoredSettings 
} from '../../utils/encryption';

// Mock crypto API
const mockCrypto = {
    getRandomValues: (array) => {
        // Fill with predictable values for testing
        for (let i = 0; i < array.length; i++) {
            array[i] = i % 256;
        }
        return array;
    },
    subtle: {
        importKey: vi.fn(),
        deriveKey: vi.fn(),
        encrypt: vi.fn(),
        decrypt: vi.fn()
    }
};

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
};

Object.defineProperty(window, 'crypto', {
    value: mockCrypto,
    writable: true
});

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
});

describe('encryption utilities', () => {
    let originalConsoleError;

    beforeEach(() => {
        originalConsoleError = console.error;
        console.error = vi.fn();
        vi.clearAllMocks();
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    describe('encryptData', () => {
        it('should encrypt data successfully', async () => {
            const testData = { apiKey: 'test-key-123' };
            const password = 'test-password';
            
            // Mock the crypto operations
            const mockKeyMaterial = 'mock-key-material';
            const mockKey = 'mock-derived-key';
            const mockEncrypted = new Uint8Array([1, 2, 3, 4, 5]);
            
            mockCrypto.subtle.importKey.mockResolvedValue(mockKeyMaterial);
            mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
            mockCrypto.subtle.encrypt.mockResolvedValue(mockEncrypted.buffer);

            const result = await encryptData(testData, password);

            expect(result).toHaveProperty('encrypted');
            expect(result).toHaveProperty('salt');
            expect(result).toHaveProperty('iv');
            expect(result.encrypted).toEqual([1, 2, 3, 4, 5]);
            expect(result.salt).toHaveLength(16);
            expect(result.iv).toHaveLength(12);

            // Verify crypto calls
            expect(mockCrypto.subtle.importKey).toHaveBeenCalled();
            const importKeyCall = mockCrypto.subtle.importKey.mock.calls[0];
            expect(importKeyCall[0]).toBe('raw');
            expect(importKeyCall[1]).toBeDefined();
            expect(importKeyCall[1].constructor.name).toBe('Uint8Array');
            expect(importKeyCall[2]).toEqual({ name: 'PBKDF2' });
            expect(importKeyCall[3]).toBe(false);
            expect(importKeyCall[4]).toEqual(['deriveBits', 'deriveKey']);
            expect(mockCrypto.subtle.deriveKey).toHaveBeenCalled();
            const deriveKeyCall = mockCrypto.subtle.deriveKey.mock.calls[0];
            expect(deriveKeyCall[0].name).toBe('PBKDF2');
            expect(deriveKeyCall[0].salt).toBeDefined();
            expect(deriveKeyCall[0].salt.constructor.name).toBe('Uint8Array');
            expect(deriveKeyCall[0].iterations).toBe(100000);
            expect(deriveKeyCall[0].hash).toBe('SHA-256');
            expect(deriveKeyCall[1]).toBe(mockKeyMaterial);
            expect(deriveKeyCall[2]).toEqual({ name: 'AES-GCM', length: 256 });
            expect(deriveKeyCall[3]).toBe(true);
            expect(deriveKeyCall[4]).toEqual(['encrypt', 'decrypt']);
            expect(mockCrypto.subtle.encrypt).toHaveBeenCalled();
            const encryptCall = mockCrypto.subtle.encrypt.mock.calls[0];
            expect(encryptCall[0].name).toBe('AES-GCM');
            expect(encryptCall[0].iv).toBeDefined();
            expect(encryptCall[0].iv.constructor.name).toBe('Uint8Array');
            expect(encryptCall[1]).toBe(mockKey);
            expect(encryptCall[2]).toBeDefined();
            expect(encryptCall[2].constructor.name).toBe('Uint8Array');
        });

        it('should handle encryption errors', async () => {
            mockCrypto.subtle.importKey.mockRejectedValue(new Error('Crypto error'));

            await expect(encryptData({ test: 'data' }, 'password'))
                .rejects.toThrow('Failed to encrypt data');

            expect(console.error).toHaveBeenCalledWith('Encryption failed:', expect.any(Error));
        });
    });

    describe('decryptData', () => {
        it('should decrypt data successfully', async () => {
            const encryptedData = {
                encrypted: [1, 2, 3, 4, 5],
                salt: new Array(16).fill(0).map((_, i) => i),
                iv: new Array(12).fill(0).map((_, i) => i)
            };
            const password = 'test-password';
            const originalData = { apiKey: 'test-key-123' };
            
            // Mock the crypto operations
            const mockKeyMaterial = 'mock-key-material';
            const mockKey = 'mock-derived-key';
            const encoder = new TextEncoder();
            const encodedData = encoder.encode(JSON.stringify(originalData));
            
            mockCrypto.subtle.importKey.mockResolvedValue(mockKeyMaterial);
            mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
            mockCrypto.subtle.decrypt.mockResolvedValue(encodedData.buffer);

            const result = await decryptData(encryptedData, password);

            expect(result).toEqual(originalData);

            // Verify crypto calls
            expect(mockCrypto.subtle.importKey).toHaveBeenCalled();
            const importKeyCall = mockCrypto.subtle.importKey.mock.calls[0];
            expect(importKeyCall[0]).toBe('raw');
            expect(importKeyCall[1]).toBeDefined();
            expect(importKeyCall[1].constructor.name).toBe('Uint8Array');
            expect(importKeyCall[2]).toEqual({ name: 'PBKDF2' });
            expect(importKeyCall[3]).toBe(false);
            expect(importKeyCall[4]).toEqual(['deriveBits', 'deriveKey']);
            expect(mockCrypto.subtle.deriveKey).toHaveBeenCalled();
            const deriveKeyCall = mockCrypto.subtle.deriveKey.mock.calls[0];
            expect(deriveKeyCall[0].name).toBe('PBKDF2');
            expect(deriveKeyCall[0].salt).toBeDefined();
            expect(deriveKeyCall[0].salt.constructor.name).toBe('Uint8Array');
            expect(deriveKeyCall[0].iterations).toBe(100000);
            expect(deriveKeyCall[0].hash).toBe('SHA-256');
            expect(deriveKeyCall[1]).toBe(mockKeyMaterial);
            expect(deriveKeyCall[2]).toEqual({ name: 'AES-GCM', length: 256 });
            expect(deriveKeyCall[3]).toBe(true);
            expect(deriveKeyCall[4]).toEqual(['encrypt', 'decrypt']);
            expect(mockCrypto.subtle.decrypt).toHaveBeenCalled();
            const decryptCall = mockCrypto.subtle.decrypt.mock.calls[0];
            expect(decryptCall[0].name).toBe('AES-GCM');
            expect(decryptCall[0].iv).toBeDefined();
            expect(decryptCall[0].iv.constructor.name).toBe('Uint8Array');
            expect(decryptCall[1]).toBe(mockKey);
            expect(decryptCall[2]).toBeDefined();
            expect(decryptCall[2].constructor.name).toBe('Uint8Array');
        });

        it('should handle decryption errors', async () => {
            const encryptedData = {
                encrypted: [1, 2, 3],
                salt: [1, 2, 3],
                iv: [1, 2, 3]
            };

            mockCrypto.subtle.importKey.mockRejectedValue(new Error('Wrong password'));

            await expect(decryptData(encryptedData, 'wrong-password'))
                .rejects.toThrow('Failed to decrypt data - check password');

            expect(console.error).toHaveBeenCalledWith('Decryption failed:', expect.any(Error));
        });
    });

    describe('localStorage helpers', () => {
        it('should save encrypted settings to localStorage', () => {
            const encryptedData = {
                encrypted: [1, 2, 3],
                salt: [4, 5, 6],
                iv: [7, 8, 9]
            };

            saveEncryptedSettings(encryptedData);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'socialgirl_settings',
                JSON.stringify(encryptedData)
            );
        });

        it('should load encrypted settings from localStorage', () => {
            const encryptedData = {
                encrypted: [1, 2, 3],
                salt: [4, 5, 6],
                iv: [7, 8, 9]
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(encryptedData));

            const result = loadEncryptedSettings();

            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('socialgirl_settings');
            expect(result).toEqual(encryptedData);
        });

        it('should return null when no settings in localStorage', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const result = loadEncryptedSettings();

            expect(result).toBe(null);
        });

        it('should clear stored settings from localStorage', () => {
            clearStoredSettings();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('socialgirl_settings');
        });
    });
});