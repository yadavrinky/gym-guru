"use client";

import React from 'react';
import ChatBox from '@/components/chat/ChatBox';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Heart } from 'lucide-react';
import { API_ENDPOINTS } from '@/utils/api';

export default function BuddyPage() {
  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-200 text-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Heart className="text-rose-400" /> Gym Buddy
          </h1>
          <p className="text-slate-900/50 mt-1">Your emotionally intelligent fitness companion</p>
        </header>

        <ChatBox endpoint={API_ENDPOINTS.BUDDY.CHAT} botName="GYM GURU Buddy" />

        <div className="glass-dark p-6 rounded-3xl">
          <h3 className="font-semibold mb-3">How it works</h3>
          <p className="text-slate-900/50 text-sm leading-relaxed">
            Your Buddy detects your emotional state from your messages and adapts
            its coaching style automatically. Feeling tired? It will suggest lighter
            alternatives. Feeling pumped? It will push you to your limits.
          </p>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
