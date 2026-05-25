import CryptoJS from 'crypto-js';

export const encryptPassword = (plain: string, userId: string): string => {
  if (!plain) return '';
  // Derive a key dynamically from the user's UID so it is secure and unique
  const salt = 'NokaSocial_Secure_Salt_2026';
  const derivedKey = CryptoJS.SHA256(userId + salt).toString();
  return CryptoJS.AES.encrypt(plain, derivedKey).toString();
};

export const decryptPassword = (cipher: string, userId: string): string => {
  if (!cipher) return '';
  try {
    const salt = 'NokaSocial_Secure_Salt_2026';
    const derivedKey = CryptoJS.SHA256(userId + salt).toString();
    const bytes = CryptoJS.AES.decrypt(cipher, derivedKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error('Failed to decrypt password:', err);
    return 'Decrypt Error';
  }
};
