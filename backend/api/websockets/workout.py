import math
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from core.security import get_current_user_ws
from services.pose_analyzer import pose_analyzer

router = APIRouter()


def calculate_angle(a, b, c):
    """Calculate the angle (degrees) at point b given three 2D points [x, y]."""
    radians = math.atan2(c[1] - b[1], c[0] - b[0]) - math.atan2(a[1] - b[1], a[0] - b[0])
    angle = abs(radians * 180.0 / math.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle


# MediaPipe Pose landmark indices
LANDMARKS = {
    "LEFT_SHOULDER": 11,
    "LEFT_HIP": 23,
    "LEFT_KNEE": 25,
    "LEFT_ANKLE": 27,
}


def extract_knee_angle(landmarks: list) -> float | None:
    """Extract left knee angle from MediaPipe 33-landmark array.
    Each landmark is expected as { x, y, z, visibility }."""
    try:
        hip = landmarks[LANDMARKS["LEFT_HIP"]]
        knee = landmarks[LANDMARKS["LEFT_KNEE"]]
        ankle = landmarks[LANDMARKS["LEFT_ANKLE"]]

        hip_pt = [hip["x"], hip["y"]]
        knee_pt = [knee["x"], knee["y"]]
        ankle_pt = [ankle["x"], ankle["y"]]

        return calculate_angle(hip_pt, knee_pt, ankle_pt)
    except (IndexError, KeyError, TypeError):
        return None


def generate_feedback(knee_angle: float, score: float) -> str:
    """Generate real-time coaching feedback based on current pose."""
    if knee_angle < 80:
        return "Too deep! You're going past safe range. Rise up a bit."
    elif knee_angle < 100:
        return "Great depth! Hold your core tight."
    elif knee_angle < 130:
        return "Good descent. Keep your back straight."
    elif score > 85:
        return "Excellent form! Keep it up!"
    elif score > 60:
        return "Good effort. Focus on controlled movement."
    else:
        return "Watch your form. Try to match the ideal squat pattern."


@router.websocket("/ws")
async def workout_ws_endpoint(websocket: WebSocket, token: str = None):
    await websocket.accept()

    if not token:
        await websocket.send_text(json.dumps({"error": "Missing token"}))
        await websocket.close(code=1008)
        return

    user = await get_current_user_ws(token)
    if not user:
        await websocket.send_text(json.dumps({"error": "Invalid token"}))
        await websocket.close(code=1008)
        return

    # ---- Session state ----
    rep_count = 0
    angle_history: list[float] = []
    # State machine: "UP" means standing, "DOWN" means in squat position
    rep_state = "UP"
    SQUAT_THRESHOLD = 120.0  # Angle must drop below this to count as "down"
    STAND_THRESHOLD = 160.0  # Angle must rise above this to count as "up" (= 1 rep)

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)

            landmarks = data.get("landmarks")
            exercise_type = data.get("exercise_type", "squat")

            if not landmarks or len(landmarks) < 33:
                await websocket.send_text(json.dumps({
                    "rep_count": rep_count,
                    "current_score": 0.0,
                    "feedback": "No pose detected. Make sure your full body is visible."
                }))
                continue

            knee_angle = extract_knee_angle(landmarks)
            if knee_angle is None:
                await websocket.send_text(json.dumps({
                    "rep_count": rep_count,
                    "current_score": 0.0,
                    "feedback": "Could not calculate joint angle. Adjust position."
                }))
                continue

            # Accumulate angles for DTW scoring
            angle_history.append(knee_angle)

            # Rep counting state machine
            if rep_state == "UP" and knee_angle < SQUAT_THRESHOLD:
                rep_state = "DOWN"
            elif rep_state == "DOWN" and knee_angle > STAND_THRESHOLD:
                rep_state = "UP"
                rep_count += 1

            # Calculate form score using the existing PoseAnalyzer (DTW)
            # Use a sliding window of the last full rep or recent history
            window = angle_history[-20:] if len(angle_history) >= 20 else angle_history
            current_score = pose_analyzer.calculate_form_score(exercise_type, window)

            feedback = generate_feedback(knee_angle, current_score)

            await websocket.send_text(json.dumps({
                "rep_count": rep_count,
                "current_score": round(current_score, 1),
                "feedback": feedback
            }))

    except WebSocketDisconnect:
        print(f"Workout WS client disconnected (user: {user.email})")
    except Exception as e:
        print(f"Workout WS error: {e}")
        try:
            await websocket.close(code=1011)
        except Exception:
            pass
