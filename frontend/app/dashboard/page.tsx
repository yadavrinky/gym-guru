/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import WebcamTracker from '@/components/camera/WebcamTracker';
import ChatBox from '@/components/chat/ChatBox';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Camera, Utensils, LayoutDashboard, Settings as SettingsIcon, Upload } from 'lucide-react';
import { API_ENDPOINTS } from '@/utils/api';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'trainer' | 'dietician' | 'analytics' | 'settings'>('trainer');
  
  // Real Analytics State
  const [chartData, setChartData] = useState<{name: string, reps: number}[]>([]);
  const [totalWeeklyReps, setTotalWeeklyReps] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('@/utils/firebase');
      
      const storageRef = ref(storage, `avatars/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update backend
      const token = localStorage.getItem('unlox_token');
      if (token) {
        await fetch(API_ENDPOINTS.AUTH.PROFILE_PICTURE, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ avatar_url: downloadURL })
        });
      }
      setAvatarUrl(downloadURL);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const token = localStorage.getItem('unlox_token');
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
    }
    
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-dark text-white bg-gradient-to-br from-slate-900 to-black p-4 md:p-8">
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
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {activeTab === 'trainer' ? 'Real-time Training' : 
                 activeTab === 'dietician' ? 'Dietary Insights' :
                 activeTab === 'analytics' ? 'Performance Analytics' :
                 'Account Settings'}
              </h1>
              <p className="text-white/60">Powered by GYM GURU AI Engine</p>
            </div>
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-dark">
                  RY
                </div>
              )}
              <button
                onClick={() => {
                  localStorage.removeItem('unlox_token');
                  window.location.href = '/login';
                }}
                className="px-4 py-2 text-sm text-white/40 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="transition-all duration-500">
            {activeTab === 'trainer' ? (
              <div className="space-y-6">
                <WebcamTracker exercise="squat" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Form Accuracy" value="94%" color="text-emerald-400" />
                  <StatCard label="Total Reps Today" value="42" color="text-blue-400" />
                  <StatCard label="Calories Burned" value="320" color="text-rose-400" />
                </div>
              </div>
            ) : activeTab === 'dietician' ? (
              <div className="space-y-6">
                <ChatBox />
                <div className="glass-dark p-8 rounded-3xl">
                  <h3 className="text-xl font-bold mb-4">Your Daily Nutrition Target</h3>
                  <div className="flex gap-8">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-white/40 mb-1">Calories</div>
                      <div className="text-2xl font-bold">2,200</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-white/40 mb-1">Protein</div>
                      <div className="text-2xl font-bold text-emerald-400">160g</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-white/40 mb-1">Carbs</div>
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
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                              itemStyle={{ color: '#10b981' }}
                            />
                            <Area type="monotone" dataKey="reps" stroke="#10b981" fillOpacity={1} fill="url(#colorReps)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40">
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
                    <div className="w-32 h-32 rounded-full border border-white/20 bg-white/5 mb-6 flex items-center justify-center text-white/40 relative overflow-hidden group cursor-pointer hover:border-emerald-400 transition-colors">
                       <input type="file" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                       {uploadingAvatar ? (
                          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                       ) : avatarUrl ? (
                          <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                       ) : (
                          <div className="flex flex-col items-center">
                            <Upload size={24} className="mb-2" />
                            <span className="text-xs text-center font-semibold uppercase tracking-wider">Change<br/>Photo</span>
                          </div>
                       )}
                    </div>
                    <p className="text-white/40 text-sm">Uploading directly to Firebase Cloud Storage & Saving to MongoDB</p>
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
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${active ? 'bg-emerald-500 text-dark font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="glass-dark p-6 rounded-3xl">
      <div className="text-sm text-white/40 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
