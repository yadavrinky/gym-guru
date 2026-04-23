"use client";

import React, { useRef, useState, useCallback } from 'react';
import { Results } from '@mediapipe/pose';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import CanvasOverlay from './CanvasOverlay';
import { RepCounter } from '@/utils/stateMachine';
import { calculateAngle } from '@/utils/angles';

interface WebcamTrackerProps {
  exercise: string;
  onRepCountChange?: (count: number) => void;
  onSessionComplete?: (sessionData: any) => void;
}

const WebcamTracker: React.FC<WebcamTrackerProps> = ({ exercise, onRepCountChange, onSessionComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [skeletalLog, setSkeletalLog] = useState<{timestamp: number, angles: Record<string, number>}[]>([]);
  const repCounterRef = useRef(new RepCounter(exercise));

  const onPoseResults = useCallback((poseResults: Results) => {
    setResults(poseResults);

    if (poseResults.poseLandmarks) {
      const landmarks = poseResults.poseLandmarks;
      
      // Select joints based on exercise
      let p1, p2, p3;
      
      if (exercise === 'squat') {
        p1 = landmarks[24]; // Right Hip
        p2 = landmarks[26]; // Right Knee
        p3 = landmarks[28]; // Right Ankle
      } else {
        // Bicep Curl or Pushup
        p1 = landmarks[12]; // Right Shoulder
        p2 = landmarks[14]; // Right Elbow
        p3 = landmarks[16]; // Right Wrist
      }

      if (p1 && p2 && p3) {
        const angle = calculateAngle(p1, p2, p3);
        const count = repCounterRef.current.update(angle);
        
        if (isTracking) {
          // Log key angles if we're tracking a session
          setSkeletalLog(prev => [...prev, {
            timestamp: Date.now(),
            angles: { [repCounterRef.current.config.joint]: angle }
          }]);
        }

        if (count !== repCount) {
          setRepCount(count);
          onRepCountChange?.(count);
        }
      }
    }
  }, [exercise, repCount, onRepCountChange]);

  const { isLoaded, error } = useMediaPipe(videoRef, onPoseResults);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden glass shadow-2xl">
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <div className="text-emerald-400 font-bold">Initializing AI Trainer...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/90 z-20">
          <div className="text-center max-w-md px-6">
            <div className="text-red-400 font-bold text-lg mb-2">Camera Error</div>
            <p className="text-slate-900/60 text-sm">{error}</p>
            <p className="text-slate-900/40 text-xs mt-2">Make sure your camera is connected and you have granted permission.</p>
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
        <div className="flex gap-2 items-center">
          <div className="glass-dark px-6 py-3 rounded-2xl">
            <span className="text-emerald-400 font-bold text-2xl">{repCount}</span>
            <span className="text-slate-900/60 ml-2 text-sm uppercase tracking-widest">Reps</span>
          </div>
          <div className="glass-dark px-4 py-2 rounded-xl text-xs text-slate-900/50 uppercase tracking-widest">
            {exercise}
          </div>
        </div>

        <div className="flex gap-2">
          {!isTracking ? (
            <button
              onClick={() => {
                setIsTracking(true);
                setStartTime(new Date());
                setRepCount(0);
                repCounterRef.current.reset();
                setSkeletalLog([]);
              }}
              className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-2xl text-slate-900 font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              Start Session
            </button>
          ) : (
            <button
              onClick={() => {
                setIsTracking(false);
                if (startTime) {
                  const endTime = new Date();
                  onSessionComplete?.({
                    exercise_type: exercise,
                    started_at: startTime.toISOString(),
                    ended_at: endTime.toISOString(),
                    duration_seconds: Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
                    reps: repCount,
                    sets: 1,
                    skeletal_log: skeletalLog.slice(-50), // Only send key samples to avoid payload size issues
                    calories_burned: repCount * 7.5
                  });
                }
              }}
              className="bg-rose-500 hover:bg-rose-600 px-6 py-3 rounded-2xl text-white font-bold transition-all shadow-lg shadow-rose-500/20"
            >
              Finish Session
            </button>
          )}
          
          <button
            onClick={() => {
              repCounterRef.current.reset();
              setRepCount(0);
              setIsTracking(false);
              setSkeletalLog([]);
            }}
            className="glass-dark hover:bg-white/10 px-4 py-3 rounded-2xl text-slate-900 font-medium transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebcamTracker;
