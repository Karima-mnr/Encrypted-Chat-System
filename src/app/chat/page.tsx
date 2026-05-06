'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Send, Lock, KeyRound, Users, LogOut, CheckCheck, Loader2, Moon, Sun, Menu, X, MessageSquare, History } from 'lucide-react';

const COLOR = '#b8d490';
const BACKEND_URL = 'http://localhost:3001';

interface Message {
  messageId: string;
  fromUsername: string;
  toUsername: string;
  encryptedMessage: string;
  decryptedText?: string;
  keySize: number;
  timestamp: string;
}

interface User {
  userId: string;
  username: string;
  role: string;
  publicKey?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHistoryNotice, setShowHistoryNotice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(userStr);
    setCurrentUser(userData);
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Load users and initialize
  useEffect(() => {
    if (!currentUser) return;
    loadUsers();
    initKeysAndSocket();
  }, [currentUser]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUsers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/users`);
      const data = await res.json();
      const others = data.filter((u: User) => u.username !== currentUser?.username);
      setUsers(others);
      
      const userId = searchParams.get('id');
      if (userId && others.length > 0) {
        const selected = others.find((u: User) => u.userId === userId || u.username === userId);
        if (selected) {
          setOtherUser(selected);
          loadMessages(selected.username);
        } else if (others.length > 0) {
          setOtherUser(others[0]);
          loadMessages(others[0].username);
        }
      } else if (others.length > 0) {
        setOtherUser(others[0]);
        loadMessages(others[0].username);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Load users error:', err);
      setIsLoading(false);
    }
  };

  const loadMessages = async (withUser: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/messages/${currentUser?.username}/${withUser}`);
      const data = await res.json();
      
      // Check if there are old messages
      if (data.length > 0) {
        setShowHistoryNotice(true);
        // Clear old messages from database to start fresh
        await fetch(`${BACKEND_URL}/api/messages/clear/${currentUser?.username}/${withUser}`, {
          method: 'DELETE',
        });
      }
      
      // Only show new messages from this session
      setMessages([]);
      
      // Auto-hide history notice after 3 seconds
      setTimeout(() => {
        setShowHistoryNotice(false);
      }, 300000);
      
    } catch (err) {
      console.error('Load messages error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const initKeysAndSocket = async () => {
    const existingPrivateKey = localStorage.getItem('cryptchat_private_key');
    if (!existingPrivateKey) {
      try {
        const { generateKeyPair, storePrivateKey } = await import('@/src/utils/rsaKeys');
        const { publicKey, privateKey } = await generateKeyPair(1024);
        await storePrivateKey(privateKey, 'kali');
        
        await fetch(`${BACKEND_URL}/api/auth/generate-keys`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUser?.username,
            publicKey: publicKey,
            keySize: 1024
          })
        });
        console.log('Keys generated');
      } catch (err) {
        console.error('Key generation error:', err);
      }
    }

    const io = require('socket.io-client');
    const sock = io(BACKEND_URL);
    
    sock.on('connect', () => {
      setIsConnected(true);
      sock.emit('join', currentUser?.username);
    });
    
    sock.on('receive_message', async (data: any) => {
      try {
        const { decryptMessage, getPrivateKey } = await import('@/src/utils/rsaKeys');
        const privateKey = await getPrivateKey('kali');
        const decryptedText = await decryptMessage(data.encryptedMessage, privateKey);
        
        setMessages(prev => [...prev, {
          messageId: data.messageId,
          fromUsername: data.from,
          toUsername: currentUser?.username || '',
          encryptedMessage: data.encryptedMessage,
          decryptedText,
          keySize: data.keySize,
          timestamp: data.timestamp
        }]);
      } catch (err) {
        console.error('Receive error:', err);
      }
    });
    
    setSocket(sock);
    
    return () => sock.disconnect();
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !otherUser || !socket || !isConnected || isSending) return;
    
    setIsSending(true);
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/get-public-key?username=${otherUser.username}`);
      const { publicKey } = await res.json();
      
      if (!publicKey) {
        alert('Recipient not ready. Please wait.');
        setIsSending(false);
        return;
      }
      
      const { encryptMessage } = await import('@/src/utils/rsaKeys');
      const encrypted = await encryptMessage(inputMessage, publicKey);
      
      socket.emit('send_message', {
        from: currentUser?.username,
        to: otherUser.username,
        encryptedMessage: encrypted,
        keySize: 1024,
        messageNumber: messages.length + 1,
        encryptionTime: 0
      });
      
      setMessages(prev => [...prev, {
        messageId: `local_${Date.now()}`,
        fromUsername: currentUser?.username || '',
        toUsername: otherUser.username,
        encryptedMessage: encrypted,
        decryptedText: inputMessage,
        keySize: 1024,
        timestamp: new Date().toISOString()
      }]);
      
      setInputMessage('');
    } catch (err) {
      console.error('Send error:', err);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const switchUser = async (user: User) => {
    setOtherUser(user);
    router.push(`/chat?id=${user.userId}`);
    await loadMessages(user.username);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLOR }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
      <style jsx global>{`
        .light-scrollbar::-webkit-scrollbar { width: 6px; }
        .light-scrollbar::-webkit-scrollbar-track { background: #e5e7eb; border-radius: 10px; }
        .light-scrollbar::-webkit-scrollbar-thumb { background: ${COLOR}; border-radius: 10px; }
        .dark-scrollbar::-webkit-scrollbar { width: 6px; }
        .dark-scrollbar::-webkit-scrollbar-track { background: #1f2a3a; border-radius: 10px; }
        .dark-scrollbar::-webkit-scrollbar-thumb { background: ${COLOR}; border-radius: 10px; }
      `}</style>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg transition-all"
        style={{ 
          background: isDarkMode ? '#1a1a1a' : '#ffffff', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'
        }}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg transition-all"
        style={{ 
          background: isDarkMode ? '#1a1a1a' : '#ffffff', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'
        }}
      >
        {isDarkMode ? <Sun className="w-5 h-5" style={{ color: '#fbbf24' }} /> : <Moon className="w-5 h-5" style={{ color: '#374151' }} />}
      </button>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`
          fixed md:relative z-40 w-80 h-full transition-transform duration-300
          ${isDarkMode ? 'bg-[#0d1117] border-r border-white/10' : 'bg-white border-r border-gray-200'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className={`p-5 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${COLOR}15`, border: `1px solid ${isDarkMode ? `${COLOR}30` : COLOR}` }}>
                <Shield className="w-5 h-5" style={{ color: COLOR }} />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{currentUser?.username}</p>
                <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>RSA Secured</p>
              </div>
              <button onClick={handleLogout} className={`transition-colors ${isDarkMode ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'}`}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={`text-[10px] ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                {isConnected ? 'Encrypted Channel Active' : 'Connecting...'}
              </span>
            </div>
          </div>
          
          <div className={`flex-1 p-3 overflow-y-auto h-[calc(100%-120px)] ${isDarkMode ? 'dark-scrollbar' : 'light-scrollbar'}`}>
            <p className={`text-xs font-semibold ${isDarkMode ? 'text-white/40' : 'text-gray-400'} mb-3 px-2 tracking-wider`}>CONTACTS</p>
            {users.map((user) => (
              <button
                key={user.userId}
                onClick={() => switchUser(user)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${
                  otherUser?.username === user.username
                    ? isDarkMode 
                      ? 'bg-[#b8d490]/15 border border-[#b8d490]/30'
                      : 'bg-[#b8d490]/10 border border-[#b8d490]/40 shadow-sm'
                    : isDarkMode 
                      ? 'hover:bg-white/5' 
                      : 'hover:bg-gray-100'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{user.username[0]}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>{user.username}</p>
                  <p className={`text-[10px] ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                    {user.publicKey ? 'RSA Ready' : 'Initializing'}
                  </p>
                </div>
                {user.publicKey && <Lock className="w-3 h-3" style={{ color: `${COLOR}60` }} />}
              </button>
            ))}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {otherUser ? (
            <>
              {/* Chat Header */}
              <div className={`px-6 py-4 border-b flex-shrink-0 ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <span className={`font-semibold ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{otherUser.username[0]}</span>
                  </div>
                  <div>
                    <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{otherUser.username}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <p className={`text-[10px] ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>RSA Encrypted Session</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* History Notice */}
              {showHistoryNotice && (
                <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center justify-center gap-2 ${
                  isDarkMode ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500' : 'bg-yellow-50 border border-yellow-200 text-yellow-600'
                }`}>
                  <History className="w-4 h-4" />
                  <span className="text-xs font-medium">Previous messages are encrypted and cannot be recovered. New session started.</span>
                </div>
              )}
              
              {/* Messages Container */}
              <div 
                className={`flex-1 overflow-y-auto p-6 space-y-4 ${isDarkMode ? 'dark-scrollbar' : 'light-scrollbar'}`}
                style={{ scrollBehavior: 'smooth' }}
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                      <MessageSquare className="w-8 h-8" style={{ color: `${COLOR}50` }} />
                    </div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>No messages yet</p>
                    <p className={`text-xs ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`}>Send an encrypted message to start</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.fromUsername === currentUser?.username;
                    const displayText = msg.decryptedText || (isOwn ? msg.decryptedText : 'Encrypted message');
                    
                    return (
                      <div key={msg.messageId} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          {!isOwn && (
                            <span className={`text-[10px] px-1 ${isDarkMode ? 'text-[#b8d490]/70' : 'text-[#b8d490]'}`}>
                              {msg.fromUsername}
                            </span>
                          )}
                          <div className={`rounded-2xl px-4 py-2.5 ${
                            isOwn 
                              ? 'text-black' 
                              : isDarkMode 
                                ? 'bg-white/10 border border-white/20 text-white'
                                : 'bg-gray-200 border border-gray-300 text-gray-800'
                          }`} style={isOwn ? { background: COLOR } : {}}>
                            <p className="text-sm break-words">{displayText}</p>
                          </div>
                          <div className="flex items-center gap-1.5 px-1">
                            <Lock className="w-2.5 h-2.5" style={{ color: `${COLOR}50` }} />
                            <span className={`text-[9px] font-mono ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                              RSA-{msg.keySize || 1024}
                            </span>
                            {isOwn && <CheckCheck className="w-2.5 h-2.5" style={{ color: `${COLOR}50` }} />}
                            <span className={`text-[9px] ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className={`p-4 border-t flex-shrink-0 ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={`Type RSA encrypted message to ${otherUser?.username}...`}
                    disabled={!isConnected || isSending}
                    className={`flex-1 rounded-xl px-4 py-3 outline-none transition-all disabled:opacity-50 ${
                      isDarkMode 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#b8d490]/50' 
                        : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#b8d490] focus:bg-white'
                    }`}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || !isConnected || isSending}
                    className="px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition hover:scale-105 disabled:opacity-50"
                    style={{ background: COLOR, color: '#0d1117' }}
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send
                  </button>
                </div>
                <p className={`text-[9px] text-center mt-2 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`}>
                  End-to-end encrypted with RSA-1024
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-3" style={{ color: `${COLOR}40` }} />
                <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>Select a contact to start</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}