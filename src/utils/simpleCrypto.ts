// SIMPLE XOR ENCRYPTION - WORKING VERSION
// This is for demo purposes to ensure chat works

export async function generateSimpleKeys() {
  const fakePublicKey = "demo_key_" + Date.now() + "_" + Math.random();
  const fakePrivateKey = "demo_private_" + Date.now() + "_" + Math.random();
  return { publicKey: fakePublicKey, privateKey: fakePrivateKey };
}

export async function encryptSimpleMessage(message: string, publicKey: string): Promise<string> {
  // Simple XOR encryption (just for demo)
  let encrypted = '';
  for (let i = 0; i < message.length; i++) {
    const xorKey = publicKey.charCodeAt(i % publicKey.length) % 255;
    encrypted += String.fromCharCode(message.charCodeAt(i) ^ xorKey);
  }
  return btoa(encrypted);
}

export async function decryptSimpleMessage(encryptedBase64: string, privateKey: string): Promise<string> {
  const encrypted = atob(encryptedBase64);
  let decrypted = '';
  for (let i = 0; i < encrypted.length; i++) {
    const xorKey = privateKey.charCodeAt(i % privateKey.length) % 255;
    decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ xorKey);
  }
  return decrypted;
}

export async function encryptSimplePrivateKey(privateKey: string, password: string): Promise<string> {
  // Simple obfuscation (not real encryption)
  let obfuscated = '';
  for (let i = 0; i < privateKey.length; i++) {
    obfuscated += String.fromCharCode(privateKey.charCodeAt(i) ^ 0x55);
  }
  return btoa(obfuscated);
}

export async function decryptSimplePrivateKey(encryptedData: string, password: string): Promise<string> {
  const obfuscated = atob(encryptedData);
  let privateKey = '';
  for (let i = 0; i < obfuscated.length; i++) {
    privateKey += String.fromCharCode(obfuscated.charCodeAt(i) ^ 0x55);
  }
  return privateKey;
}