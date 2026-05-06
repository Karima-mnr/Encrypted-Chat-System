// src/utils/rsaKeys.ts
// COMPLETE WORKING RSA ENCRYPTION

// Safe Base64 encoding
function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Safe Base64 decoding
function fromBase64(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate RSA key pair
export async function generateKeyPair(keySize: number = 1024) {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKey: toBase64(publicKey),
    privateKey: toBase64(privateKey),
  };
}

// Store private key (encrypted with password)
export async function storePrivateKey(privateKey: string, password: string): Promise<void> {
  // Simple XOR encryption for localStorage (reversible)
  let encrypted = '';
  for (let i = 0; i < privateKey.length; i++) {
    encrypted += String.fromCharCode(privateKey.charCodeAt(i) ^ password.charCodeAt(i % password.length));
  }
  localStorage.setItem('cryptchat_private_key', btoa(encrypted));
}

// Get private key from storage
export async function getPrivateKey(password: string): Promise<string> {
  const encrypted = localStorage.getItem('cryptchat_private_key');
  if (!encrypted) throw new Error('No private key found');
  
  const decoded = atob(encrypted);
  let privateKey = '';
  for (let i = 0; i < decoded.length; i++) {
    privateKey += String.fromCharCode(decoded.charCodeAt(i) ^ password.charCodeAt(i % password.length));
  }
  return privateKey;
}

// Encrypt message
export async function encryptMessage(message: string, publicKeyBase64: string): Promise<string> {
  if (!publicKeyBase64 || publicKeyBase64 === 'null' || publicKeyBase64.length < 50) {
    throw new Error('Invalid public key');
  }
  
  const publicKeyData = fromBase64(publicKeyBase64);
  const publicCryptoKey = await crypto.subtle.importKey(
    'spki',
    publicKeyData,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicCryptoKey,
    new TextEncoder().encode(message)
  );
  
  return toBase64(encrypted);
}

// Decrypt message
export async function decryptMessage(encryptedBase64: string, privateKeyBase64: string): Promise<string> {
  if (!encryptedBase64 || !privateKeyBase64) {
    throw new Error('Missing encrypted message or private key');
  }
  
  const privateKeyData = fromBase64(privateKeyBase64);
  const privateCryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyData,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );
  
  const encryptedData = fromBase64(encryptedBase64);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateCryptoKey,
    encryptedData
  );
  
  return new TextDecoder().decode(decrypted);
}