'use client';

import { useEffect, useRef } from 'react';
import { Lock, CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  from: string;
  text: string;
  encrypted: string;
  keySize: number;
  timestamp: Date;
  delivered?: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUser: string;
}

const COLOR = '#b8d490';

export default function MessageList({ messages, currentUser }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Lock className="w-12 h-12 mb-4" style={{ color: `${COLOR}40` }} />
          <p className="text-white/40 text-sm">End-to-end encrypted</p>
          <p className="text-white/20 text-xs mt-1">Send a message to start the conversation</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isOwn = msg.from === currentUser;
          
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isOwn && (
                  <span className="text-[10px] font-mono px-1" style={{ color: `${COLOR}70` }}>
                    {msg.from}
                  </span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    isOwn
                      ? 'bg-[#b8d490] text-black'
                      : 'bg-white/10 border border-white/20 text-white'
                  }`}
                >
                  <p className="text-sm break-words">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1.5 px-1">
                  <Lock className="w-2.5 h-2.5" style={{ color: `${COLOR}50` }} />
                  <span className="text-[9px] font-mono" style={{ color: `${COLOR}50` }}>
                    RSA-{msg.keySize}
                  </span>
                  {isOwn && msg.delivered && (
                    <CheckCheck className="w-2.5 h-2.5 ml-1" style={{ color: `${COLOR}50` }} />
                  )}
                  <span className="text-[9px] text-white/30 ml-1">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}