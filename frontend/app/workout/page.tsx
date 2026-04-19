"use client";

import React, { useState } from 'react';
import WebcamTracker from '@/components/camera/WebcamTracker';
import { Dumbbell, ChevronDown } from 'lucide-react';

const EXERCISES = [
  { id: 'squat', name: 'Squat', icon: '🏋️' },
  { id: 'pushup', name: 'Push-Up', icon: '💪' },
  { id: 'bicep_curl', name: 'Bicep Curl', icon: '🦾' },
];

export default function WorkoutPage() {
  const [selectedExercise, setSelectedExercise] = useState('squat');
  const [isOpen, setIsOpen] = useState(false);

  const current = EXERCISES.find(e => e.id === selectedExercise) || EXERCISES[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Dumbbell className="text-emerald-400" /> AI Trainer
            </h1>
            <p className="text-white/50 mt-1">100% on-device — zero video upload</p>
          </div>

          {/* Exercise Selector */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="glass-dark px-5 py-3 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all"
            >
              <span className="text-xl">{current.icon}</span>
              <span className="font-semibold">{current.name}</span>
              <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="absolute right-0 top-full mt-2 glass-dark rounded-2xl overflow-hidden z-30 min-w-[200px]">
                {EXERCISES.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => { setSelectedExercise(ex.id); setIsOpen(false); }}
                    className={`w-full px-5 py-3 flex items-center gap-3 hover:bg-white/10 transition-all text-left ${ex.id === selectedExercise ? 'bg-emerald-500/20 text-emerald-400' : ''}`}
                  >
                    <span className="text-xl">{ex.icon}</span>
                    <span>{ex.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <WebcamTracker key={selectedExercise} exercise={selectedExercise} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard label="Exercise" value={current.name} />
          <InfoCard label="Target Muscle" value="Legs & Core" />
          <InfoCard label="Difficulty" value="Intermediate" />
          <InfoCard label="Est. Calories" value="~8 / min" />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-dark p-4 rounded-2xl">
      <div className="text-xs text-white/40 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
