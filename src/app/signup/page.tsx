'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, User, ArrowRight, Eye, EyeOff, Terminal, KeyRound, Mail, CheckCircle, AlertCircle } from 'lucide-react';

const COLOR = '#b8d490';

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        
        // Generate RSA keys automatically after signup
        try {
          const { generateKeyPair, storePrivateKey } = await import('@/src/utils/rsaKeys');
          const { publicKey, privateKey } = await generateKeyPair(1024);
          await storePrivateKey(privateKey, password);
          
          // Save public key to backend
          await fetch('/api/auth/generate-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: username,
              publicKey: publicKey,
              keySize: 1024
            })
          });
        } catch (keyErr) {
          console.error('Key generation error:', keyErr);
        }
        
        // Auto redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
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
          <p className="text-white/40 text-sm mt-1">Create Secure Account</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16" style={{ color: COLOR }} />
              </div>
              <h2 className="text-xl font-bold text-white">Account Created!</h2>
              <p className="text-white/60 text-sm">Redirecting to login...</p>
              <p className="text-white/30 text-xs mt-4">Your RSA keys have been generated securely.</p>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div>
                <label className="block text-sm text-white/60 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#b8d490]/50 transition"
                    placeholder="Choose a username"
                    required
                    minLength={3}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#b8d490]/50 transition"
                    placeholder="your@email.com"
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
                    placeholder="••••••••"
                    required
                    minLength={4}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#b8d490]/50 transition"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff className="w-4 h-4 text-white/40" /> : <Eye className="w-4 h-4 text-white/40" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: COLOR, color: '#0d1117' }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <div className="text-center text-sm text-white/40">
                Already have an account?{' '}
                <Link href="/login" className="hover:underline" style={{ color: COLOR }}>
                  Login
                </Link>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 text-[10px] text-white/30">
              <KeyRound className="w-3 h-3" />
              <span>RSA keys generated on signup • End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}