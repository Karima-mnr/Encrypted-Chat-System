'use client';

import { useState, useEffect } from 'react';
import { generateRSAKeyPair, encryptPrivateKey, decryptPrivateKey } from '@/src/utils/rsaKeys';

interface User {
  userId: string;
  username: string;
  role: string;
}

export function useKeys(user: User | null, password: string) {
  const [hasKeys, setHasKeys] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  // Check if user has keys on login
  useEffect(() => {
    if (!user) return;

    const checkKeys = async () => {
      setIsLoading(true);
      
      // Check localStorage for encrypted private key
      const storedPrivateKey = localStorage.getItem(`${user.username}_privateKey`);
      
      if (storedPrivateKey && password) {
        try {
          // Decrypt private key with password
          const decrypted = await decryptPrivateKey(storedPrivateKey, password);
          setPrivateKey(decrypted);
          setHasKeys(true);
        } catch (err) {
          console.error('Failed to decrypt private key');
          setHasKeys(false);
        }
      } else {
        // Check if user has public key in database
        try {
          const res = await fetch(`/api/auth/get-public-key?username=${user.username}`);
          const data = await res.json();
          setHasKeys(!!data.hasKeys);
        } catch (err) {
          console.error('Failed to check keys:', err);
          setHasKeys(false);
        }
      }
      
      setIsLoading(false);
    };

    checkKeys();
  }, [user, password]);

  // Generate new key pair
  const generateKeys = async () => {
    if (!user || !password) return false;

    try {
      // Generate RSA key pair (4096 bits)
      const { publicKey, privateKey: newPrivateKey } = await generateRSAKeyPair(4096);
      
      // Encrypt private key with password
      const encryptedPrivateKey = await encryptPrivateKey(newPrivateKey, password);
      
      // Store encrypted private key in localStorage
      localStorage.setItem(`${user.username}_privateKey`, encryptedPrivateKey);
      
      // Send public key to backend
      const res = await fetch('/api/auth/generate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          publicKey: publicKey
        })
      });
      
      if (res.ok) {
        setPrivateKey(newPrivateKey);
        setHasKeys(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Key generation failed:', err);
      return false;
    }
  };

  return { hasKeys, isLoading, generateKeys, privateKey };
}