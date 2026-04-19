from beanie import Document
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class SkeletalKeyFrame(BaseModel):
    timestamp: float
    angles: Dict[str, float]

class WorkoutSession(Document):
    user_id: str
    exercise_type: str
    started_at: datetime
    ended_at: datetime
    duration_seconds: int
    reps: int
    sets: int
    form_score: float = 0.0
    performance_score: float = 0.0
    skeletal_log: List[SkeletalKeyFrame]  # Store only key angles per rep
    feedback: List[str] = []
    calories_burned: float = 0.0

    class Settings:
        name = "workout_sessions"
        indexes = [
            [("user_id", 1), ("started_at", -1)]
        ]
