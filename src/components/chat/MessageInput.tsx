'use client';

import { useState } from 'react';
import { Send, Lock, KeyRound } from 'lucide-react';

const COLOR = '#b8d490';

interface MessageInputProps {
  onSend: (message: string) => void;
  isConnected: boolean;
  encrypting: boolean;
}

export default function MessageInput({ onSend, isConnected, encrypting }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && isConnected && !encrypting) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/30">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isConnected 
                ? encrypting 
                  ? "Encrypting message..." 
                  : "Type your message... (end-to-end encrypted)"
                : "Connecting to secure channel..."
            }
            disabled={!isConnected || encrypting}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#b8d490]/50 transition disabled:opacity-50"
          />
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || !isConnected || encrypting}
          className="px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          style={{ background: COLOR, color: '#0d1117' }}
        >
          {encrypting ? (
            <KeyRound className="w-4 h-4 animate-pulse" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send
        </button>
      </div>
    </form>
  );
}