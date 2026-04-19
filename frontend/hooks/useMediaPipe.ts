"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Pose, Results } from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';

export const useMediaPipe = (
  videoRef: React.RefObject<HTMLVideoElement>,
  onResults: (results: Results) => void,
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<cam.Camera | null>(null);
  // Store callback in a ref so the effect doesn't re-run when it changes
  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const pose = new Pose({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
          if (!cancelled) {
            onResultsRef.current(results);
          }
        });

        poseRef.current = pose;

        if (videoRef.current) {
          const camera = new cam.Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current && videoRef.current) {
                await poseRef.current.send({ image: videoRef.current });
              }
            },
            width: 1280,
            height: 720,
          });
          cameraRef.current = camera;
          await camera.start();
        }

        if (!cancelled) {
          setIsLoaded(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to initialise MediaPipe');
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [videoRef]); // Only re-run if the video element ref changes

  return { isLoaded, error };
};
