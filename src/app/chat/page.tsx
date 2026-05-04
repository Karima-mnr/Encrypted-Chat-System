'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, KeyRound, CheckCircle, AlertCircle, LogOut, Terminal, Lock } from 'lucide-react';
import { useSocket } from '@/src/hooks/useSocket';
import MessageList from '@/src/components/chat/MessageList';
import MessageInput from '@/src/components/chat/MessageInput';

const COLOR = '#b8d490';

interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  encrypted: string;
  keySize: number;
  timestamp: Date;
  delivered?: boolean;
}

interface User {
  userId: string;
  username: string;
  role: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [encrypting, setEncrypting] = useState(false);
  const [messageCounter, setMessageCounter] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  
  const { socket, isConnected } = useSocket(currentUser?.userId || null);

  // Load current user and other users
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(userStr);
    setCurrentUser(userData);
    
    // Load all users
    const loadUsers = async () => {
      try {
        const res = await fetch('/api/auth/users');
        const data = await res.json();
        const otherUsers = data.filter((u: User) => u.username !== userData.username);
        setUsers(otherUsers);
        if (otherUsers.length > 0) {
          setOtherUser(otherUsers[0]);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
        // Fallback users
        const fallbackUsers = [
          { userId: 'USER_002', username: 'Nour', role: 'user' }
        ];
        setUsers(fallbackUsers);
        setOtherUser(fallbackUsers[0]);
      }
    };
    
    loadUsers();
    setIsLoading(false);
  }, []);

  // Generate private key if not exists
  useEffect(() => {
    const initKeys = async () => {
      if (!currentUser) return;
      
      const existingKey = localStorage.getItem(`${currentUser.username}_privateKey`);
      if (!existingKey) {
        const { generateRSAKeyPair, encryptPrivateKey } = await import('@/src/utils/rsaKeys');
        const { publicKey, privateKey } = await generateRSAKeyPair(1024);
        const encrypted = await encryptPrivateKey(privateKey, 'kali');
        localStorage.setItem(`${currentUser.username}_privateKey`, encrypted);
        
        // Try to save public key to backend
        try {
          await fetch('/api/auth/generate-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.userId,
              username: currentUser.username,
              publicKey: publicKey,
              keySize: 1024
            })
          });
        } catch (err) {
          console.error('Failed to save public key:', err);
        }
      }
    };
    
    initKeys();
  }, [currentUser]);

// In the socket effect, make sure room is joined properly
useEffect(() => {
  if (!socket || !currentUser) return;

  // Join room with userId
  socket.emit('join', currentUser.userId);
  console.log('Joined room:', currentUser.userId);

  socket.on('receive_message', async (data) => {
    console.log('📩 Message received via socket:', data);
    
    // Decrypt message
    try {
      const { decryptMessage, decryptPrivateKey } = await import('@/src/utils/rsaKeys');
      const encryptedPrivateKey = localStorage.getItem(`${currentUser.username}_privateKey`);
      
      if (encryptedPrivateKey) {
        const privateKey = await decryptPrivateKey(encryptedPrivateKey, 'kali');
        const decryptedText = await decryptMessage(data.encryptedMessage, privateKey);
        
        setMessages(prev => [...prev, {
          id: data.messageId || `msg_${Date.now()}`,
          from: data.from,
          to: currentUser.username,
          text: decryptedText,
          encrypted: data.encryptedMessage,
          keySize: data.keySize,
          timestamp: new Date(data.timestamp),
          delivered: true
        }]);
      }
    } catch (err) {
      console.error('Decryption error:', err);
    }
  });

  return () => {
    socket.off('receive_message');
  };
}, [socket, currentUser]);

  // Send message
  const sendMessage = async (plainText: string) => {
    if (!otherUser || !currentUser || !socket || !isConnected) return;
    
    setEncrypting(true);
    
    try {
      // Get recipient's public key
      const res = await fetch(`/api/auth/get-public-key?username=${otherUser.username}`);
      const data = await res.json();
      
      let recipientPublicKey = data.publicKey;
      
      // If no public key in DB, use a fallback
      if (!recipientPublicKey) {
        console.warn('No public key found for recipient');
        recipientPublicKey = "MIIBCgKCAQEAx2X9pL8mN4oR6sT1uV3wX5yZ7aB8cD0eF2gH4iJ6kL8mN0oP2qR4sT6uV8wX0yZ2aB4cD6eF8gH0iJ2kL4mN6oP8qR0sT2uV4wX6yZ8aB0cD2eF4gH6iJ8kL0mN2oP4qR6sT8uV0wX";
      }
      
      // Calculate progressive key size
      const newMessageNumber = messageCounter + 1;
      const keySize = Math.min(128 * newMessageNumber, 4096);
      
      // Encrypt message
      const { encryptMessage } = await import('@/src/utils/rsaKeys');
      const encryptedMessage = await encryptMessage(plainText, recipientPublicKey);
      
      // Send via socket
      const messageData = {
        from: currentUser.username,
        to: otherUser.username,
        encryptedMessage,
        keySize,
        encryptionTime: 0,
        messageNumber: newMessageNumber
      };
      
      socket.emit('send_message', messageData);
      
      // Add to local messages
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_${Math.random()}`,
        from: currentUser.username,
        to: otherUser.username,
        text: plainText,
        encrypted: encryptedMessage,
        keySize,
        timestamp: new Date(),
        delivered: true
      }]);
      
      setMessageCounter(newMessageNumber);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setEncrypting(false);
    }
  };

  // Switch conversation partner
  const switchUser = (user: User) => {
    setOtherUser(user);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#b8d490] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex">
      {/* Sidebar */}
      <div className="w-72 border-r border-white/10 bg-black/30 flex flex-col">
        {/* User Info */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#b8d490]/10 border border-[#b8d490]/30 flex items-center justify-center">
              <Shield className="w-5 h-5" style={{ color: COLOR }} />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{currentUser.username}</p>
              <p className="text-xs text-white/40">{currentUser.role}</p>
            </div>
            <button onClick={handleLogout} className="text-white/40 hover:text-white/70 transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          {/* Connection Status */}
          <div className="mt-3 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] text-white/40">
              {isConnected ? 'Secure channel active' : 'Connecting...'}
            </span>
          </div>
        </div>
        
        {/* Users List */}
        <div className="flex-1 p-3">
          <p className="text-xs text-white/40 mb-3 px-2">CONTACTS</p>
          <div className="space-y-1">
            {users.map((user) => (
              <button
                key={user.userId}
                onClick={() => switchUser(user)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  otherUser?.username === user.username
                    ? 'bg-[#b8d490]/10 border border-[#b8d490]/30'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-xs text-white/60">{user.username[0]}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm text-white/80">{user.username}</p>
                  <p className="text-[10px] text-white/30">online</p>
                </div>
                <Lock className="w-3 h-3 text-white/30" />
              </button>
            ))}
          </div>
        </div>
        
        {/* Encryption Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-[10px] text-white/30">
            <KeyRound className="w-3 h-3" style={{ color: COLOR }} />
            <span>End-to-end encrypted</span>
          </div>
          <p className="text-[9px] text-white/20 mt-1">RSA-{Math.min(128 * (messageCounter + 1) || 1024, 4096)}-bit</p>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white/60 font-medium">{otherUser?.username?.[0] || '?'}</span>
            </div>
            <div>
              <h2 className="text-white font-medium">{otherUser?.username || 'Select a contact'}</h2>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] text-white/40">Encrypted session ready</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        {otherUser ? (
          <>
            <MessageList messages={messages} currentUser={currentUser.username} />
            <MessageInput onSend={sendMessage} isConnected={isConnected} encrypting={encrypting} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-white/20" />
              <p className="text-white/40 text-sm">No contacts available</p>
              <p className="text-white/20 text-xs mt-1">Users will appear here when they register</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}