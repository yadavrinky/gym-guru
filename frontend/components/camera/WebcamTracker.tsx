"use client";

import React, { useRef, useState, useCallback } from 'react';
import { Results } from '@mediapipe/pose';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import CanvasOverlay from './CanvasOverlay';
import { RepCounter } from '@/utils/stateMachine';
import { calculateAngle } from '@/utils/angles';

interface WebcamTrackerProps {
  exercise: string;
}

const WebcamTracker: React.FC<WebcamTrackerProps> = ({ exercise }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [repCount, setRepCount] = useState(0);
  const repCounterRef = useRef(new RepCounter(exercise));

  const onPoseResults = useCallback((poseResults: Results) => {
    setResults(poseResults);

    if (poseResults.poseLandmarks) {
      const landmarks = poseResults.poseLandmarks;
      const hip = landmarks[24];
      const knee = landmarks[26];
      const ankle = landmarks[28];

      if (hip && knee && ankle) {
        const angle = calculateAngle(hip, knee, ankle);
        const count = repCounterRef.current.update(angle);
        setRepCount(count);
      }
    }
  }, []);

  const { isLoaded, error } = useMediaPipe(videoRef, onPoseResults);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden glass shadow-2xl">
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <div className="text-emerald-400 font-bold">Initializing AI Trainer...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-20">
          <div className="text-center max-w-md px-6">
            <div className="text-red-400 font-bold text-lg mb-2">Camera Error</div>
            <p className="text-white/60 text-sm">{error}</p>
            <p className="text-white/40 text-xs mt-2">Make sure your camera is connected and you have granted permission.</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-auto transform scale-x-[-1]"
        autoPlay
        playsInline
        muted
      />

      <CanvasOverlay results={results} repCount={repCount} />

      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-10">
        <div className="glass-dark px-6 py-3 rounded-2xl">
          <span className="text-emerald-400 font-bold text-2xl">{repCount}</span>
          <span className="text-white/60 ml-2 text-sm uppercase tracking-widest">Reps</span>
        </div>
        <div className="glass-dark px-4 py-2 rounded-xl text-xs text-white/50 uppercase tracking-widest">
          {exercise}
        </div>
        <button
          onClick={() => {
            repCounterRef.current.reset();
            setRepCount(0);
          }}
          className="glass-dark hover:bg-white/10 px-6 py-3 rounded-2xl text-white font-medium transition-all"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default WebcamTracker;
