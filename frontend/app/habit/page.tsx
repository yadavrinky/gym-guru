"use client";

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Activity } from 'lucide-react';
import { API_ENDPOINTS } from '@/utils/api';

export default function HabitPage() {
  const [skipProbability, setSkipProbability] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const token = localStorage.getItem('gym_guru_token');
        const baseUrl = API_ENDPOINTS.AUTH.LOGIN.replace('/api/auth/login', '');
        const res = await fetch(`${baseUrl}/api/habit/predict`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSkipProbability(data.skip_probability);
        }
      } catch (error) {
        console.error("Failed to fetch prediction", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-200 text-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Activity className="text-rose-400" /> Habit Tracker
            </h1>
            <p className="text-slate-900/50 mt-1">Predictive AI to keep you on track</p>
          </header>

          <div className="glass-dark p-8 rounded-3xl flex flex-col items-center justify-center min-h-[300px]">
            {loading ? (
              <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            ) : skipProbability !== null ? (
              <div className="text-center space-y-6">
                <div className="relative w-48 h-48 mx-auto flex items-center justify-center bg-slate-800/50 rounded-full border-8 border-rose-500/20">
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-rose-500"
                    style={{
                      clipPath: `polygon(50% 50%, -50% -50%, ${skipProbability * 2}% -50%, ${skipProbability * 2}% 150%, -50% 150%)`,
                      transform: 'rotate(-90deg)'
                    }}
                  />
                  <div className="text-5xl font-black text-rose-500 z-10">
                    {Math.round(skipProbability * 100)}%
                  </div>
                </div>
                <h3 className="text-2xl font-semibold">Chance of skipping today</h3>
                <p className="text-slate-900/50 max-w-md mx-auto">
                  Our AI analyzes your recent activity patterns. High chance of skipping? Let's prove it wrong. Get an easy workout in!
                </p>
              </div>
            ) : (
              <p className="text-slate-900/50">Unable to load prediction data. Need more activity history.</p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
