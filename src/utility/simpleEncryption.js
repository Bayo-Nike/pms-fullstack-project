// utils/simpleEncryption.js - Ultra Light Version

const SECRET_KEY = 'SccoPms2024';

export const encrypt = (data) => {
    if (!data) return null;

    const str = typeof data === 'string' ? data : JSON.stringify(data);
    let encrypted = '';

    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        const keyChar = SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
        // Simple XOR and convert to 3-digit string
        const encryptedChar = charCode ^ keyChar;
        encrypted += String(encryptedChar).padStart(3, '0');
    }

    return encrypted;
};

export const decrypt = (encrypted) => {
    if (!encrypted) return null;

    try {
        let decrypted = '';

        // Read 3 digits at a time
        for (let i = 0; i < encrypted.length; i += 3) {
            const charCode = parseInt(encrypted.substr(i, 3), 10);
            const keyChar = SECRET_KEY.charCodeAt((i / 3) % SECRET_KEY.length);
            const decryptedChar = charCode ^ keyChar;
            decrypted += String.fromCharCode(decryptedChar);
        }

        // Try to parse JSON
        try {
            return JSON.parse(decrypted);
        } catch {
            return decrypted;
        }
    } catch (error) {
        return null;
    }
};

// For tokens specifically
export const encryptToken = (token) => encrypt(token);
export const decryptToken = (encryptedToken) => decrypt(encryptedToken);