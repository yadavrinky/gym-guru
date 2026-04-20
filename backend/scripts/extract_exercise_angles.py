import cv2
import mediapipe as mp
import json
import math
import sys
import os

mp_pose = mp.solutions.pose

def calculate_angle(a, b, c):
    """Calculate 2D angle between three points (x, y)"""
    radians = math.atan2(c[1] - b[1], c[0] - b[0]) - math.atan2(a[1] - b[1], a[0] - b[0])
    angle = abs(radians * 180.0 / math.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle

def process_video(video_path, output_json):
    print(f"Processing local video: {video_path}")
    if not os.path.exists(video_path):
        print("Error: Video file not found.")
        return

    cap = cv2.VideoCapture(video_path)
    pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    timeline_data = []
    frame_idx = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Convert BGR to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = pose.process(image)

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            # Map index
            hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
            knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
            ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
            shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
            wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]

            # Angles
            knee_angle = calculate_angle(hip, knee, ankle)
            hip_angle = calculate_angle(shoulder, hip, knee)
            elbow_angle = calculate_angle(shoulder, elbow, wrist)

            timeline_data.append({
                "frame": frame_idx,
                "knee_angle": round(knee_angle, 2),
                "hip_angle": round(hip_angle, 2),
                "elbow_angle": round(elbow_angle, 2)
            })
        
        frame_idx += 1

    cap.release()
    pose.close()

    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    with open(output_json, 'w') as f:
        json.dump({"exercise_type": "generic", "data": timeline_data}, f, indent=4)
        
    print(f"Processed {frame_idx} frames. Data saved to {output_json} locally via WebAssembly/Python!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_exercise_angles.py <video_path>")
    else:
        out_path = os.path.join(os.path.dirname(__file__), "..", "data", "exercise_angles.json")
        process_video(sys.argv[1], out_path)
