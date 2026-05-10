"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Activity, RotateCcw } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

// ---- MediaPipe Types (loaded via CDN) ----
interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface PoseResults {
  poseLandmarks?: PoseLandmark[];
}

// MediaPipe connection pairs for skeleton drawing
const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
  [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32],
];

export default function LiveTrainerPage() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const poseRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const lastSendRef = useRef<number>(0);

  const [isRunning, setIsRunning] = useState(false);
  const [connected, setConnected] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [formScore, setFormScore] = useState(0);
  const [feedback, setFeedback] = useState("Press Start to begin your session.");
  const [cameraReady, setCameraReady] = useState(false);
  const [poseLoaded, setPoseLoaded] = useState(false);

  // Load MediaPipe Pose from CDN
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      setPoseLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      socketRef.current?.close();
    };
  }, []);

  // Draw skeleton on canvas
  const drawSkeleton = useCallback((landmarks: PoseLandmark[], canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 3;
    for (const [start, end] of POSE_CONNECTIONS) {
      if (start < landmarks.length && end < landmarks.length) {
        const a = landmarks[start];
        const b = landmarks[end];
        if (a.visibility > 0.5 && b.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
          ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
          ctx.stroke();
        }
      }
    }

    // Draw landmark dots
    for (const lm of landmarks) {
      if (lm.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#f43f5e";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }, []);

  const startSession = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Connect WebSocket
    const ws = new WebSocket(`ws://localhost:8000/api/websockets/workout/ws?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = (e) => console.error("Workout WS Error:", e);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          setFeedback(data.error);
          return;
        }
        setRepCount(data.rep_count ?? 0);
        setFormScore(data.current_score ?? 0);
        setFeedback(data.feedback ?? "");
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    // Initialize MediaPipe Pose
    const win = window as any;
    if (!win.Pose) {
      setFeedback("MediaPipe is still loading. Please wait...");
      return;
    }

    const pose = new win.Pose({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results: PoseResults) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (results.poseLandmarks) {
        drawSkeleton(results.poseLandmarks, canvas);

        // Throttle sends to ~10fps (100ms interval)
        const now = Date.now();
        if (now - lastSendRef.current >= 100) {
          lastSendRef.current = now;

          if (socketRef.current?.readyState === WebSocket.OPEN) {
            const payload = {
              landmarks: results.poseLandmarks.map((lm) => ({
                x: lm.x,
                y: lm.y,
                z: lm.z,
                visibility: lm.visibility,
              })),
              exercise_type: "squat",
            };
            socketRef.current.send(JSON.stringify(payload));
          }
        }
      }
    });

    poseRef.current = pose;
    setIsRunning(true);
    setFeedback("Analyzing your form... Perform squats facing the camera.");

    // Start frame loop
    const processFrame = async () => {
      if (webcamRef.current?.video && webcamRef.current.video.readyState === 4) {
        await poseRef.current?.send({ image: webcamRef.current.video });
      }
      animFrameRef.current = requestAnimationFrame(processFrame);
    };
    processFrame();
  }, [drawSkeleton]);

  const stopSession = useCallback(() => {
    setIsRunning(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    socketRef.current?.close();
    poseRef.current?.close();
    poseRef.current = null;
    setConnected(false);
    setFeedback("Session stopped. Press Start to begin a new session.");
  }, []);

  const resetCounters = useCallback(() => {
    setRepCount(0);
    setFormScore(0);
    setFeedback("Counters reset. Keep going!");
  }, []);

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">AI Camera Trainer</h2>
            <p className="text-muted-foreground">
              Real-time pose analysis &amp; rep counting powered by MediaPipe + DTW.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm text-muted-foreground">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Metrics strip */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reps</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tabular-nums">{repCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Form Score</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold tabular-nums ${getScoreColor(formScore)}`}>
                {formScore.toFixed(1)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{feedback}</p>
            </CardContent>
          </Card>
        </div>

        {/* Camera viewport */}
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative aspect-video bg-black">
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              videoConstraints={{ facingMode: "user", width: 1280, height: 720 }}
              onUserMedia={() => setCameraReady(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="absolute inset-0 w-full h-full"
              style={{ transform: "scaleX(-1)" }}
            />

            {/* Overlay controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              {!isRunning ? (
                <Button
                  size="lg"
                  onClick={startSession}
                  disabled={!cameraReady || !poseLoaded}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-lg"
                >
                  <Camera className="h-5 w-5" />
                  {!poseLoaded ? "Loading AI..." : "Start Session"}
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={stopSession}
                    className="gap-2 shadow-lg"
                  >
                    <CameraOff className="h-5 w-5" />
                    Stop
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={resetCounters}
                    className="gap-2 shadow-lg"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Reset
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
