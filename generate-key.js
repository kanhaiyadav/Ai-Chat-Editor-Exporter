import { generateKeyPairSync } from 'crypto';
import { writeFileSync } from 'fs';

// Generate a key pair
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Convert public key to base64 (for manifest)
const publicKeyBase64 = publicKey
  .replace(/-----BEGIN PUBLIC KEY-----/, '')
  .replace(/-----END PUBLIC KEY-----/, '')
  .replace(/\n/g, '');

console.log('Add this to wxt.config.ts manifest.key:');
console.log(publicKeyBase64);

// Save private key (keep this secret!)
writeFileSync('extension-key.pem', privateKey);
console.log('\nPrivate key saved to extension-key.pem (DO NOT COMMIT THIS!)');