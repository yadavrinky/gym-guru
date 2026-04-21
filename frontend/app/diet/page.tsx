"use client";

import React from 'react';
import ChatBox from '@/components/chat/ChatBox';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Utensils } from 'lucide-react';
import { API_ENDPOINTS } from '@/utils/api';

export default function DietPage() {
  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-200 text-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Utensils className="text-blue-400" /> AI Dietician
          </h1>
          <p className="text-slate-900/50 mt-1">Personalised nutrition powered by RAG</p>
        </header>

        <ChatBox endpoint={API_ENDPOINTS.DIET.CHAT} botName="GYM GURU Dietician" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NutrientCard label="Daily Calories" value="2,200" unit="kcal" color="text-amber-400" />
          <NutrientCard label="Protein" value="160" unit="g" color="text-emerald-400" />
          <NutrientCard label="Carbs" value="250" unit="g" color="text-blue-400" />
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

function NutrientCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="glass-dark p-6 rounded-3xl">
      <div className="text-xs text-slate-900/40 uppercase tracking-widest mb-2">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${color}`}>{value}</span>
        <span className="text-slate-900/40 text-sm">{unit}</span>
      </div>
    </div>
  );
}
