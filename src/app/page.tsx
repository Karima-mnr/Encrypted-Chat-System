'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Terminal,
  KeyRound,
  ChevronRight,
  Cpu,
  Database,
  Zap,
  BarChart3,
  CheckCircle2,
  Menu,
  X,
  Send,
  Activity,
  Globe,
  Layers,
  Fingerprint,
  ArrowRight,
  MessageSquare,
  Sun,
  Moon,
} from 'lucide-react';

const COLOR = '#b8d490';

function AnimatedBackground({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className={`absolute inset-0 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-[#0a0c0f] via-[#0d1117] to-[#0a0c0f]' 
          : 'bg-gradient-to-br from-[#f5f5f0] via-[#fafaf5] to-[#f0f0e8]'
      }`} />
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        isDarkMode 
          ? 'bg-[radial-gradient(ellipse_at_20%_30%,rgba(184,212,144,0.08),transparent_50%),radial-gradient(ellipse_at_80%_70%,rgba(184,212,144,0.05),transparent_50%)]'
          : 'bg-[radial-gradient(ellipse_at_20%_30%,rgba(184,212,144,0.12),transparent_50%),radial-gradient(ellipse_at_80%_70%,rgba(184,212,144,0.08),transparent_50%)]'
      }`} />
      <motion.div
        className="absolute -top-96 -left-96 h-[600px] w-[600px] rounded-full blur-[100px]"
        style={{ background: `radial-gradient(circle, ${COLOR}${isDarkMode ? '08' : '15'}, transparent)` }}
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-96 -right-96 h-[600px] w-[600px] rounded-full blur-[100px]"
        style={{ background: `radial-gradient(circle, ${COLOR}${isDarkMode ? '05' : '10'}, transparent)` }}
        animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        isDarkMode 
          ? 'bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]'
          : 'bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:60px_60px]'
      }`} />
    </div>
  );
}

function LiveChatDemo({ isDarkMode }: { isDarkMode: boolean }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const sequence = [
    { from: 'alice', text: 'Initiating secure handshake. Exchanging public keys.', keySize: '512', phase: 'handshake' },
    { from: 'bob', text: 'Handshake verified. Session established.', keySize: '1024', phase: 'established' },
    { from: 'alice', text: 'Encrypting payload with upgraded key.', keySize: '2048', phase: 'encrypting' },
    { from: 'bob', text: 'Payload decrypted successfully. Channel secure.', keySize: '4096', phase: 'secure' },
  ];

  useEffect(() => {
    if (step >= sequence.length) return;
    
    const timer = setTimeout(() => {
      setIsEncrypting(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { ...sequence[step], id: Date.now() }]);
        setIsEncrypting(false);
        setStep(prev => prev + 1);
      }, 800);
    }, 1800);
    
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300 ${
      isDarkMode 
        ? 'border-white/10 bg-[#0d1117]/80 backdrop-blur-sm' 
        : 'border-[#b8d490]/30 bg-white/90 backdrop-blur-sm'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b transition-all duration-300 ${
        isDarkMode ? 'border-white/10 bg-black/30' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className={`flex items-center gap-2 text-xs font-mono ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
            <Terminal className="w-3.5 h-3.5" style={{ color: COLOR }} />
            secure-channel://cryptchat
          </div>
        </div>
        <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${isDarkMode ? 'bg-white/5' : 'bg-[#b8d490]/10'}`}>
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: COLOR }} />
          <span className="text-[10px] font-mono" style={{ color: COLOR }}>ACTIVE SESSION</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="grid lg:grid-cols-[1.5fr_0.5fr]">
        <div className="p-5 min-h-[480px] flex flex-col">
          <div className="flex-1 space-y-4">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.from === 'bob' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] space-y-1 ${msg.from === 'bob' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <span className={`text-[10px] font-mono px-1 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>{msg.from}</span>
                    <div
                      className={`rounded-xl px-4 py-2.5 text-sm border ${
                        msg.from === 'bob'
                          ? isDarkMode 
                            ? 'border-[#b8d490]/30 bg-[#b8d490]/10'
                            : 'border-[#b8d490]/50 bg-[#b8d490]/20'
                          : isDarkMode 
                            ? 'border-white/10 bg-white/5'
                            : 'border-gray-200 bg-gray-100'
                      }`}
                      style={{ color: msg.from === 'bob' ? (isDarkMode ? '#eaf7d2' : '#2d5a2d') : (isDarkMode ? '#c9d1d9' : '#374151') }}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1.5 px-1 text-[9px] font-mono" style={{ color: `${COLOR}60` }}>
                      <Lock className="w-2.5 h-2.5" />
                      RSA-{msg.keySize} • Encrypted
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isEncrypting && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-[11px] font-mono animate-pulse" style={{ color: `${COLOR}70` }}>
                  <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: COLOR }} />
                  Processing encryption...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
            <div className={`flex items-center gap-2 rounded-xl border p-2 ${isDarkMode ? 'border-white/10 bg-black/30' : 'border-gray-200 bg-gray-100'}`}>
              <div className={`flex-1 px-3 py-2 text-xs font-mono ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                Type your secure message...
              </div>
              <button className="rounded-lg px-4 py-2 text-xs font-medium flex items-center gap-2 transition hover:scale-105" style={{ background: COLOR, color: '#0d1117' }}>
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Encryption Pipeline */}
        <div className={`border-l p-5 ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-gray-50'}`}>
          <h3 className={`text-xs font-semibold mb-4 flex items-center gap-2 uppercase tracking-wider ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
            <KeyRound className="w-3.5 h-3.5" style={{ color: COLOR }} />
            Encryption Pipeline
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Key Exchange', value: 'RSA Progressive', progress: step * 25 },
              { label: 'Session Cipher', value: 'AES-256-GCM', progress: 100 },
              { label: 'Transport', value: 'TLS 1.3 + WSS', progress: 100 },
              { label: 'Integrity', value: 'HMAC-SHA512', progress: 100 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className={isDarkMode ? 'text-white/40' : 'text-gray-500'}>{item.label}</span>
                  <span className="font-mono" style={{ color: COLOR }}>{item.value}</span>
                </div>
                <div className={`h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: COLOR }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className={`mt-5 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between text-[11px]">
              <span className={isDarkMode ? 'text-white/40' : 'text-gray-500'}>Current Key Size</span>
              <span className="font-mono font-bold" style={{ color: COLOR }}>
                {messages.length > 0 ? messages[messages.length - 1]?.keySize || '512' : '512'}-bit
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Menu - Adapts to theme
function MobileMenu({ isOpen, setIsOpen, isDarkMode }: { isOpen: boolean; setIsOpen: (v: boolean) => void; isDarkMode: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 backdrop-blur-md ${isDarkMode ? 'bg-black/80' : 'bg-white/80'}`}
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className={`fixed right-0 top-0 z-50 h-full w-72 border-l p-6 ${isDarkMode ? 'border-white/10 bg-[#0d1117]' : 'border-gray-200 bg-white'}`}
          >
            <button onClick={() => setIsOpen(false)} className={`mb-8 ml-auto block ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col gap-5">
              <a href="#features" className={`transition ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Features</a>
              <a href="#security" className={`transition ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Security</a>
              <a href="#architecture" className={`transition ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Architecture</a>
              <a href="#metrics" className={`transition ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Metrics</a>
              <Link href="/login" className="mt-4 rounded-xl px-4 py-3 text-center font-medium" style={{ background: COLOR, color: '#0d1117' }}>
                Launch Secure Chat
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Main Component
export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('landing_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('landing_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const features = [
    { icon: Lock, title: 'Zero-Knowledge Architecture', desc: 'Private keys never leave your device. Server routes ciphertext only.' },
    { icon: Zap, title: 'Progressive Key Escalation', desc: 'Each message automatically escalates from 512 to 4096 bits.' },
    { icon: Cpu, title: 'Hardware-Accelerated', desc: 'Optimized AES and RSA operations in your browser.' },
    { icon: Database, title: 'Ciphertext-Only Storage', desc: 'Database stores only encrypted, unreadable payloads.' },
    { icon: Fingerprint, title: 'Identity Verification', desc: 'Strong authenticity for every session and message.' },
    { icon: Globe, title: 'Real-Time Delivery', desc: 'Global low-latency secure messaging via WebSockets.' },
  ];

  const stats = [
    { value: '512→4096', label: 'Progressive Key Range' },
    { value: '&lt;20ms', label: 'Average Latency' },
    { value: '100%', label: 'Zero-Trust Architecture' },
    { value: '99.98%', label: 'Platform Uptime' },
  ];

  return (
    <main className={`min-h-screen transition-colors duration-300 overflow-x-hidden ${isDarkMode ? 'text-white bg-[#0d1117]' : 'text-gray-800 bg-gray-50'}`}>
      <AnimatedBackground isDarkMode={isDarkMode} />
      <MobileMenu isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} isDarkMode={isDarkMode} />

      {/* Navigation */}
      <nav className={`fixed top-0 z-40 w-full transition-all duration-300 ${
        isScrolled 
          ? isDarkMode 
            ? 'bg-[#0d1117]/90 backdrop-blur-xl border-b border-white/10' 
            : 'bg-white/90 backdrop-blur-xl border-b border-gray-200'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div>
              <span className="font-bold text-lg tracking-tight">CRYPT<span style={{ color: COLOR }}>CHAT</span></span>
              <p className={`text-[9px] -mt-0.5 tracking-wide ${isDarkMode ? 'text-white/35' : 'text-gray-500'}`}>SECURE COMMUNICATION</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-sm">
            <a href="#features" className={`transition ${isDarkMode ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>Features</a>
            <a href="#security" className={`transition ${isDarkMode ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>Security</a>
            <a href="#architecture" className={`transition ${isDarkMode ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>Architecture</a>
            <a href="#metrics" className={`transition ${isDarkMode ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>Metrics</a>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/login">
              <button className="px-5 py-2 rounded-xl font-medium transition-all hover:scale-105" style={{ background: COLOR, color: '#0d1117' }}>
                Launch Secure Chat
              </button>
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className={`p-2 rounded-lg ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`} onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-mono mb-6 ${
                isDarkMode 
                  ? 'border-white/10 bg-white/5 text-white/70' 
                  : 'border-gray-200 bg-gray-100 text-gray-600'
              }`} style={{ color: COLOR }}>
                <Activity className="w-3.5 h-3.5" />
                END-TO-END ENCRYPTION
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                Secure Messaging,
                <span className="block mt-2" style={{ color: COLOR }}>Encrypted Before You Send.</span>
              </h1>
              <p className={`mt-6 text-base leading-relaxed max-w-lg ${isDarkMode ? 'text-white/45' : 'text-gray-500'}`}>
                Real-time encrypted chat with progressive RSA key expansion. Messages encrypted in-browser, transmitted as ciphertext, decrypted only by recipient.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link href="/login">
                  <button className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition hover:scale-105" style={{ background: COLOR, color: '#0d1117' }}>
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/dashboard">
                  <button className={`px-6 py-3 rounded-xl border transition hover:bg-white/10 ${
                    isDarkMode 
                      ? 'border-white/10 bg-white/5 text-white/70' 
                      : 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                    View Metrics
                  </button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <LiveChatDemo isDarkMode={isDarkMode} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-20 px-6 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Security <span style={{ color: COLOR }}>Without Compromise</span></h2>
            <p className={`mt-3 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>Every layer engineered for confidentiality and performance.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`group p-5 rounded-xl border transition-all hover:-translate-y-0.5 ${
                  isDarkMode 
                    ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]' 
                    : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100'
                }`}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${COLOR}12` }}>
                  <feature.icon className="w-5 h-5" style={{ color: COLOR }} />
                </div>
                <h3 className="font-semibold mb-1.5">{feature.title}</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className={`py-20 px-6 border-t ${isDarkMode ? 'border-white/5 bg-white/[0.01]' : 'border-gray-200 bg-gray-50/30'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Cryptographically <span style={{ color: COLOR }}>Blind</span> Infrastructure</h2>
              <p className={`mb-6 leading-relaxed ${isDarkMode ? 'text-white/45' : 'text-gray-500'}`}>
                Your plaintext never touches our servers. Messages are encrypted locally, transmitted securely, and decrypted only by intended recipients.
              </p>
              <div className="space-y-3">
                {[
                  'Client-side RSA keypair generation (WebCrypto API)',
                  'Ephemeral AES-256 session encryption per message',
                  'Progressive key escalation: 512 → 4096 bits',
                  'HMAC-SHA512 integrity verification',
                  'Perfect forward secrecy by design',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4" style={{ color: COLOR }} />
                    <span className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`rounded-xl border p-5 font-mono text-xs overflow-x-auto ${isDarkMode ? 'border-white/10 bg-black/30' : 'border-gray-200 bg-gray-100'}`}>
              <pre style={{ color: `${COLOR}80` }} className="leading-relaxed">
{`async function encryptMessage(message, recipientPubKey) {
  // Generate ephemeral AES-256 key
  const sessionKey = crypto.getRandomValues(new Uint8Array(32));
  
  // Encrypt message with AES-256-GCM
  const ciphertext = await aesGcmEncrypt(message, sessionKey);
  
  // Wrap session key with RSA public key
  const wrappedKey = await rsaEncrypt(sessionKey, recipientPubKey);
  
  // Sign with HMAC-SHA512
  const signature = await hmacSha512(ciphertext);
  
  return { ciphertext, wrappedKey, signature };
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className={`py-20 px-6 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Platform <span style={{ color: COLOR }}>Architecture</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { title: 'Client Layer', desc: 'Key generation, encryption, decryption', icon: Layers },
              { title: 'Gateway', desc: 'TLS termination and routing', icon: Globe },
              { title: 'Realtime Engine', desc: 'WebSocket event orchestration', icon: MessageSquare },
              { title: 'Storage', desc: 'Encrypted payload persistence', icon: Database },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`p-5 rounded-xl border text-center ${
                  isDarkMode 
                    ? 'border-white/10 bg-white/[0.02]' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${COLOR}12` }}>
                  <item.icon className="w-5 h-5" style={{ color: COLOR }} />
                </div>
                <h3 className="font-medium text-sm">{item.title}</h3>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="metrics" className={`py-16 px-6 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-xl border text-center ${
                  isDarkMode 
                    ? 'border-white/10 bg-white/[0.02]' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="text-2xl font-bold" style={{ color: COLOR }} dangerouslySetInnerHTML={{ __html: stat.value }} />
                <div className={`text-xs mt-1 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 px-6 text-center border-t ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready for <span style={{ color: COLOR }}>Fortress-Level</span> Security?</h2>
          <p className={`mb-8 ${isDarkMode ? 'text-white/45' : 'text-gray-500'}`}>Start encrypting your conversations with zero-knowledge architecture.</p>
          <Link href="/login">
            <button className="px-8 py-3 rounded-xl font-semibold transition hover:scale-105" style={{ background: COLOR, color: '#0d1117' }}>
              Get Started Now
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-6 px-6 border-t text-center ${isDarkMode ? 'border-white/5 text-white/25' : 'border-gray-200 text-gray-400'}`}>
        <p className="text-xs">© 2026 CRYPTCHAT — Zero-Knowledge Encrypted Messaging System</p>
      </footer>
    </main>
  );
}