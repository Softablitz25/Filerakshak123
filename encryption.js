// encryption.js

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;
const ITERATIONS = 100000;

function getKeyFromPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

function encrypt(dataToEncrypt, password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = getKeyFromPassword(password, salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encryptedData = Buffer.concat([cipher.update(dataToEncrypt), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, authTag, encryptedData]);
}

function decrypt(encryptedData, password) {
  const salt = encryptedData.slice(0, SALT_LENGTH);
  const iv = encryptedData.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = encryptedData.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  const data = encryptedData.slice(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  
  const key = getKeyFromPassword(password, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decryptedData = Buffer.concat([decipher.update(data), decipher.final()]);
  
  return decryptedData;
}

module.exports = { encrypt, decrypt };