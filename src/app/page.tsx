'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = '>_ SECURE_CHAT_SYSTEM_v2.0';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div className="min-h-screen matrix-bg scan-line">
      {/* Navigation Bar */}
      <nav className="border-b border-green-500/30 bg-black/80 backdrop-blur-sm fixed w-full z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-2xl">🔐</span>
              <span className="text-green-500 font-mono font-bold tracking-wider">
                CRYPT<span className="text-green-400">CHAT</span>
              </span>
            </div>
            <div className="flex gap-4">
              <Link href="/login">
                <button className="btn-terminal">
                  login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="terminal-window max-w-6xl mx-auto">
          <div className="terminal-header">
            <div className="terminal-dot terminal-dot-red"></div>
            <div className="terminal-dot terminal-dot-yellow"></div>
            <div className="terminal-dot terminal-dot-green"></div>
            <span className="text-green-500 text-sm ml-2 font-mono">root@security:~/chat-system</span>
          </div>
          
          <div className="p-8 md:p-12">
            {/* Typing Animation */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-5xl font-mono font-bold">
                <span className="text-green-500">{typedText}</span>
                <span className={`text-green-500 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>_</span>
              </h1>
              <p className="text-green-400/70 font-mono mt-4 text-sm">
                [ENTERPRISE_GRADE_ENCRYPTION] [REAL_TIME] [ZERO_TRUST_ARCHITECTURE]
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="border border-green-500/30 rounded-lg p-4 bg-black/50">
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-green-500 font-mono text-sm">ENCRYPTION</div>
                <div className="text-green-400/70 font-mono text-xs mt-1">AES-256 | RSA-4096 | RC4</div>
              </div>
              <div className="border border-green-500/30 rounded-lg p-4 bg-black/50">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-green-500 font-mono text-sm">PERFORMANCE</div>
                <div className="text-green-400/70 font-mono text-xs mt-1">&lt;50ms latency | Real-time</div>
              </div>
              <div className="border border-green-500/30 rounded-lg p-4 bg-black/50">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-green-500 font-mono text-sm">METRICS</div>
                <div className="text-green-400/70 font-mono text-xs mt-1">Key size vs Time analysis</div>
              </div>
            </div>

            {/* Matrix Code Animation */}
            <div className="mb-12 font-mono text-xs text-green-500/40 overflow-hidden h-20">
              <div className="animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <p key={i} className="whitespace-nowrap">
                    {Math.random().toString(2).padStart(64, '0').slice(0, 64)}
                  </p>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="border-l-2 border-green-500 pl-4">
                <h3 className="text-green-500 font-mono font-bold mb-2"> end_to_end_encryption</h3>
                <p className="text-green-400/70 text-sm font-mono">
                  Messages encrypted on sender, decrypted only by receiver. Server never sees plain text.
                </p>
              </div>
              <div className="border-l-2 border-green-500 pl-4">
                <h3 className="text-green-500 font-mono font-bold mb-2"> dynamic_key_progression</h3>
                <p className="text-green-400/70 text-sm font-mono">
                  Each message uses progressively larger keys (128 → 256 → 384... bits)
                </p>
              </div>
              <div className="border-l-2 border-green-500 pl-4">
                <h3 className="text-green-500 font-mono font-bold mb-2"> real_time_analytics</h3>
                <p className="text-green-400/70 text-sm font-mono">
                  Live graphs showing encryption time vs key size performance
                </p>
              </div>
              <div className="border-l-2 border-green-500 pl-4">
                <h3 className="text-green-500 font-mono font-bold mb-2"> dual_encryption_methods</h3>
                <p className="text-green-400/70 text-sm font-mono">
                  Toggle between RCA and AES encryption for comparison
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <button className="btn-terminal-primary text-lg px-8 py-3">
                  ⚡ INITIALIZE SECURE SESSION
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="btn-terminal text-lg px-8 py-3">
                  📊 VIEW METRICS DASHBOARD
                </button>
              </Link>
            </div>

            {/* Security Badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-4 text-center">
              <div className="text-green-500/50 font-mono text-xs">[RSA_2048]</div>
              <div className="text-green-500/50 font-mono text-xs">[AES_256_GCM]</div>
              <div className="text-green-500/50 font-mono text-xs">[SOCKET_IO]</div>
              <div className="text-green-500/50 font-mono text-xs">[ZERO_KNOWLEDGE]</div>
              <div className="text-green-500/50 font-mono text-xs">[PERFECT_FORWARD_SECRECY]</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center border-t border-green-500/20 pt-8">
          <p className="text-green-500/40 font-mono text-xs">
             © 2024 CRYPTCHAT | SECURITY AUDIT READY | PENETRATION TESTING GRADE
          </p>
          <p className="text-green-500/30 font-mono text-xs mt-2">
            [BUILT_WITH_NEXT.JS] [MONGODB] [SOCKET.IO] [WEB_CRYPTO_API]
          </p>
        </footer>
      </div>
    </div>
  );
}