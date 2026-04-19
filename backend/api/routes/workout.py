from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from db.models.workout import WorkoutSession, SkeletalKeyFrame
from datetime import datetime

router = APIRouter()

class WorkoutSessionCreate(BaseModel):
    """Input schema — separate from the Beanie Document so FastAPI
    can parse the JSON body without needing a Mongo _id."""
    user_id: str
    exercise_type: str
    started_at: datetime
    ended_at: datetime
    duration_seconds: int
    reps: int
    sets: int
    form_score: float = 0.0
    skeletal_log: List[SkeletalKeyFrame] = []
    feedback: List[str] = []
    calories_burned: float = 0.0

@router.post("/session")
async def create_session(payload: WorkoutSessionCreate):
    session = WorkoutSession(**payload.model_dump())
    await session.insert()
    return {"id": str(session.id), "status": "saved"}

@router.get("/history/{user_id}")
async def get_history(user_id: str, limit: int = 20):
    sessions = (
        await WorkoutSession
        .find(WorkoutSession.user_id == user_id)
        .sort(-WorkoutSession.started_at)
        .limit(limit)
        .to_list()
    )
    return sessions
