export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

// Generate RSA key pair using Web Crypto API
export async function generateRSAKeyPair(keySize: number = 4096): Promise<KeyPair> {
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

  // Export public key
  const publicKeyExported = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyExported)));

  // Export private key
  const privateKeyExported = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyExported)));

  return {
    publicKey: publicKeyBase64,
    privateKey: privateKeyBase64,
  };
}

// Encrypt private key with user password for localStorage
export async function encryptPrivateKey(privateKey: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(privateKey)
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

// Decrypt private key from localStorage
export async function decryptPrivateKey(encryptedData: string, password: string): Promise<string> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return decoder.decode(decrypted);
}

// Import private key for decryption
export async function importPrivateKey(privateKeyBase64: string): Promise<CryptoKey> {
  const privateKeyData = Uint8Array.from(atob(privateKeyBase64), c => c.charCodeAt(0));
  
  return await crypto.subtle.importKey(
    'pkcs8',
    privateKeyData,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['decrypt']
  );
}

// Import public key for encryption
export async function importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
  const publicKeyData = Uint8Array.from(atob(publicKeyBase64), c => c.charCodeAt(0));
  
  return await crypto.subtle.importKey(
    'spki',
    publicKeyData,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );
}

// Encrypt message with recipient's public key
export async function encryptMessage(message: string, publicKeyBase64: string): Promise<string> {
  const publicKey = await importPublicKey(publicKeyBase64);
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    encoder.encode(message)
  );
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// Decrypt message with private key
export async function decryptMessage(encryptedBase64: string, privateKeyBase64: string): Promise<string> {
  const privateKey = await importPrivateKey(privateKeyBase64);
  const encryptedData = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    encryptedData
  );
  return new TextDecoder().decode(decrypted);
}