// utils/crypto.js
const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const IV_BYTES = 12;
const KEY_LEN = 32; // 256-bit

function deriveKey(passphrase, salt = null) {
  salt = salt || crypto.randomBytes(16);
  // scrypt sync for simplicity; async variant exists
  const key = crypto.scryptSync(passphrase, salt, KEY_LEN);
  return { key, salt };
}

function encryptString(plaintext, passphrase) {
  const { key, salt } = deriveKey(passphrase);
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();
  // package: salt | iv | tag | ciphertext (all base64)
  const out = Buffer.concat([salt, iv, tag, ciphertext]).toString('base64');
  return out;
}

function decryptString(payloadBase64, passphrase) {
  const data = Buffer.from(payloadBase64, 'base64');
  // offsets: salt(16) iv(12) tag(16) rest=ciphertext
  const salt = data.slice(0,16);
  const iv = data.slice(16, 16 + IV_BYTES);
  const tag = data.slice(16 + IV_BYTES, 16 + IV_BYTES + 16);
  const ciphertext = data.slice(16 + IV_BYTES + 16);
  const key = crypto.scryptSync(passphrase, salt, KEY_LEN);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encryptString, decryptString };