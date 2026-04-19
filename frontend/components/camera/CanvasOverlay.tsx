"use client";

import React, { useEffect, useRef } from 'react';
import { Results, POSE_CONNECTIONS } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

interface CanvasOverlayProps {
  results: Results | null;
  repCount: number;
}

const CanvasOverlay: React.FC<CanvasOverlayProps> = ({ results, repCount }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!results || !canvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw skeleton
    if (results.poseLandmarks) {
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: '#10b981',
        lineWidth: 4,
      });
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: '#ffffff',
        lineWidth: 2,
        radius: 6,
      });
    }

    // Draw Rep Count
    canvasCtx.fillStyle = 'white';
    canvasCtx.font = 'bold 48px Inter';
    canvasCtx.fillText(`REPS: ${repCount}`, 50, 100);

    canvasCtx.restore();
  }, [results, repCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      width={1280}
      height={720}
    />
  );
};

export default CanvasOverlay;
