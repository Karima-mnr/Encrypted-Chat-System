'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, User, ArrowRight, Eye, EyeOff, Terminal, KeyRound } from 'lucide-react';

const COLOR = '#b8d490';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('📤 Sending login request for:', username);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      console.log('📥 Response:', data);

      if (res.ok && data.success) {
        // Store user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Login success, redirecting...');
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/chat');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0c0f] via-[#0d1117] to-[#0a0c0f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(184,212,144,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <Link href="/" className="fixed top-6 left-6 flex items-center gap-2 text-white/50 hover:text-white transition">
        <Terminal className="w-4 h-4" />
        <span className="text-sm">← Back</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center" style={{ borderColor: COLOR }}>
              <Shield className="w-8 h-8" style={{ color: COLOR }} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">CRYPT<span style={{ color: COLOR }}>CHAT</span></h1>
          <p className="text-white/40 text-sm mt-1">Secure Encrypted Messaging</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#b8d490]/50 transition"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#b8d490]/50 transition"
                  placeholder="Enter your password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-4 h-4 text-white/40" /> : <Eye className="w-4 h-4 text-white/40" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            <div className="text-center text-xs text-white/30">
              <p>Demo Users: Karima / Nour / admin</p>
              <p className="text-[10px] mt-1">Password: kali</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: COLOR, color: '#0d1117' }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>Secure Login <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 text-[10px] text-white/30">
              <KeyRound className="w-3 h-3" />
              <span>End-to-End Encrypted Session</span>
            </div>
            <div className="mt-3">
              <Link href="/signup" className="text-xs text-white/40 hover:text-white/60 transition">
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}