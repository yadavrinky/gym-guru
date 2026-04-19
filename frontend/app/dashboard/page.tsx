"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import WebcamTracker from '@/components/camera/WebcamTracker';
import ChatBox from '@/components/chat/ChatBox';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Camera, Utensils, LayoutDashboard, Settings as SettingsIcon, Upload } from 'lucide-react';
import { API_ENDPOINTS } from '@/utils/api';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'trainer' | 'dietician' | 'analytics' | 'settings'>('trainer');
  
  // Real Analytics State
  const [plotData, setPlotData] = useState<{x: string[], y: number[]}>({ x: [], y: [] });
  const [totalWeeklyReps, setTotalWeeklyReps] = useState(0);

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
          setPlotData({ x: data.x_axis, y: data.y_axis });
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
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-dark">
                RY
              </div>
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
                   <div id="analytics-chart" className="w-full relative overflow-hidden rounded-xl bg-white/5 p-4 flex justify-center min-h-[350px]">
                      {plotData.x.length > 0 ? (
                        <Plot
                          data={[
                            {
                              x: plotData.x,
                              y: plotData.y,
                              type: 'scatter',
                              mode: 'lines+markers',
                              fill: 'tozeroy',
                              line: { color: '#34d399', width: 3 },
                              marker: { color: '#059669', size: 8 }
                            }
                          ]}
                          layout={{
                            width: 600,
                            height: 350,
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: 'rgba(255,255,255,0.6)' },
                            margin: { t: 20, r: 20, l: 40, b: 40 },
                            xaxis: { showgrid: false },
                            yaxis: { showgrid: true, gridcolor: 'rgba(255,255,255,0.1)' }
                          }}
                          config={{ displayModeBar: false }}
                        />
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
                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                       <div className="flex flex-col items-center">
                         <Upload size={24} className="mb-2" />
                         <span className="text-xs text-center font-semibold uppercase tracking-wider">Change<br/>Photo</span>
                       </div>
                    </div>
                    <p className="text-white/40 text-sm">Uploading will sync to your Firebase Cloud Storage (Setup Pending)</p>
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
