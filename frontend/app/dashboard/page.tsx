/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from 'react';
import WebcamTracker from '@/components/camera/WebcamTracker';
import ChatBox from '@/components/chat/ChatBox';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Camera, Utensils, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';
import { API_ENDPOINTS } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { user, logout, refreshUser, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'trainer' | 'dietician' | 'analytics' | 'settings'>('trainer');
  const [repCount, setRepCount] = useState(0);
  
  const quotes = [
    "Sunday: Rest, recover, and prepare to dominate.",
    "Monday: Never skip a Monday. Set the tone for the week.",
    "Tuesday: Discipline is choosing between what you want now, and what you want most.",
    "Wednesday: Halfway there. Keep pushing.",
    "Thursday: Sweat is just fat crying.",
    "Friday: Finish strong. Earn your weekend.",
    "Saturday: Dedication doesn't have an off-switch."
  ];
  const todayQuote = quotes[new Date().getDay()];

  // Real Analytics State
  const [chartData, setChartData] = useState<{name: string, reps: number}[]>([]);
  const [totalWeeklyReps, setTotalWeeklyReps] = useState(0);
  const [summary, setSummary] = useState({ total_sessions: 0, total_reps: 0, avg_form_score: 0, calories_burned_total: 0 });
  const [name, setName] = useState(user?.name || '');

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const handleUpdateName = async () => {
    if (!token || !name.trim()) return;
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.UPDATE_NAME, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim() })
      });
      if (res.ok) {
        await refreshUser();
        alert('Name updated successfully!');
      } else {
        alert('Failed to update name');
      }
    } catch (error) {
      console.error('Update failed', error);
      alert('Failed to update name');
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics' || activeTab === 'trainer' || activeTab === 'dietician') {
      fetchAnalytics();
      fetchSummary();
    }
  }, [activeTab, token]);

  const fetchAnalytics = async () => {
    try {
      if (!token) return;
      const res = await fetch(API_ENDPOINTS.ANALYTICS.WEEKLY, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.x_axis.map((x: string, i: number) => ({
          name: x,
          reps: data.y_axis[i]
        }));
        setChartData(formatted);
        setTotalWeeklyReps(data.total_weekly_reps);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    }
  };

  const fetchSummary = async () => {
    try {
      if (!token) return;
      const res = await fetch(API_ENDPOINTS.ANALYTICS.SUMMARY, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error("Failed to load summary", err);
    }
  };

  const handleSessionComplete = async (sessionData: any) => {
    if (!token) return;
    try {
      const res = await fetch(API_ENDPOINTS.WORKOUT.SESSION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sessionData)
      });
      if (res.ok) {
        // Refresh all data
        await fetchAnalytics();
        await fetchSummary();
        alert('Workout session saved successfully!');
      } else {
        const error = await res.json();
        console.error('Failed to save session', error);
        alert('Failed to save session. Check console for details.');
      }
    } catch (err) {
      console.error('Failed to save session', err);
    }
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-dark text-slate-900 bg-gradient-to-br from-slate-50 to-gray-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-4">
          <div className="p-6 mb-8 text-2xl font-black italic tracking-tighter text-emerald-400">GYM GURU</div>
          
          <nav className="space-y-2">
            <SidebarItem 
              active={activeTab === 'trainer'} 
              onClick={() => setActiveTab('trainer')}
              icon={<Camera size={20} />} 
              label="AI Trainer" 
            />
            <SidebarItem 
              active={activeTab === 'dietician'} 
              onClick={() => setActiveTab('dietician')}
              icon={<Utensils size={20} />} 
              label="Diet Coach" 
            />
            <SidebarItem 
              active={activeTab === 'analytics'} 
              onClick={() => setActiveTab('analytics')}
              icon={<LayoutDashboard size={20} />} 
              label="Analytics" 
            />
            <SidebarItem 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
              icon={<SettingsIcon size={20} />} 
              label="Settings" 
            />
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <header className="flex justify-between items-center mb-12 mt-8 md:mt-0">
            <div>
              <p className="text-rose-500 font-semibold italic mb-3">{todayQuote}</p>
              <h1 className="text-4xl font-bold mb-2">
                {activeTab === 'trainer' ? 'Real-time Training' : 
                 activeTab === 'dietician' ? 'Dietary Insights' :
                 activeTab === 'analytics' ? 'Performance Analytics' :
                 'Account Settings'}
              </h1>
              <p className="text-slate-900/60">Powered by GYM GURU AI Engine</p>
            </div>
            <div className="flex items-center gap-4">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-dark">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'GYM'}
                </div>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-slate-900/40 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="transition-all duration-500">
            {activeTab === 'trainer' ? (
              <div className="space-y-6">
                <WebcamTracker exercise="squat" onRepCountChange={setRepCount} onSessionComplete={handleSessionComplete} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Form Accuracy" value={`${summary.avg_form_score}%`} color="text-emerald-400" />
                  <StatCard label="Total Reps Today" value={repCount.toString()} color="text-blue-400" />
                  <StatCard label="Calories Burned" value={(repCount * 7.5).toFixed(0)} color="text-rose-400" />
                </div>
              </div>
            ) : activeTab === 'dietician' ? (
              <div className="space-y-6">
                <ChatBox />
                <div className="glass-dark p-8 rounded-3xl">
                  <h3 className="text-xl font-bold mb-4">Your Daily Nutrition Target</h3>
                  <div className="flex gap-8">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-slate-900/40 mb-1">Calories</div>
                      <div className="text-2xl font-bold">{summary.calories_burned_total.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-slate-900/40 mb-1">Protein</div>
                      <div className="text-2xl font-bold text-emerald-400">160g</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-slate-900/40 mb-1">Carbs</div>
                      <div className="text-2xl font-bold text-blue-400">250g</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'analytics' ? (
              <div className="space-y-6">
                <div className="glass-dark p-8 rounded-3xl">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-bold">Weekly Reps Volume</h3>
                     <div className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                       {totalWeeklyReps} Total Reps
                     </div>
                   </div>
                   <div id="analytics-chart" className="w-full relative overflow-hidden rounded-xl bg-white/5 p-4 flex justify-center h-[350px]">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorReps" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" vertical={false} />
                            <XAxis dataKey="name" stroke="rgba(0,0,0,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(0,0,0,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', color: '#0f172a' }}
                              itemStyle={{ color: '#10b981' }}
                            />
                            <Area type="monotone" dataKey="reps" stroke="#10b981" fillOpacity={1} fill="url(#colorReps)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-900/40">
                          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                 <div className="glass-dark p-8 rounded-3xl flex flex-col items-center justify-center min-h-[300px]">
                    <h3 className="text-2xl font-bold mb-8">Profile Settings</h3>
                    <div className="w-full max-w-sm space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-900/60 block">Full Name</label>
                        <input 
                          type="text" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none rounded-xl px-4 py-3 text-slate-900 transition-colors"
                          placeholder="Your new name"
                        />
                      </div>
                      <button 
                        onClick={handleUpdateName} 
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-xl transition-all"
                      >
                        Save Changes
                      </button>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${active ? 'bg-emerald-500 text-dark font-bold' : 'text-slate-900/60 hover:text-slate-900 hover:bg-white/5'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="glass-dark p-6 rounded-3xl">
      <div className="text-sm text-slate-900/40 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
