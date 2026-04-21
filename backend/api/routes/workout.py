from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from db.models.workout import WorkoutSession, SkeletalKeyFrame
from db.models.users import User
from core.security import get_current_user
from datetime import datetime

router = APIRouter()

class WorkoutSessionCreate(BaseModel):
    """Input schema — separate from the Beanie Document so FastAPI
    can parse the JSON body without needing a Mongo _id."""
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
async def create_session(
    payload: WorkoutSessionCreate,
    current_user: User = Depends(get_current_user)
):
    """Save a workout session — user_id is derived from the JWT, not the payload."""
    session = WorkoutSession(
        user_id=str(current_user.id),
        **payload.model_dump()
    )
    await session.insert()
    return {"id": str(session.id), "status": "saved"}

@router.get("/history")
async def get_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """Get workout history for the authenticated user only."""
    sessions = (
        await WorkoutSession
        .find(WorkoutSession.user_id == str(current_user.id))
        .sort(-WorkoutSession.started_at)
        .limit(min(limit, 100))  # cap max to prevent abuse
        .to_list()
    )
    return sessions
