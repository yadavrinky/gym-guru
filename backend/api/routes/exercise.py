from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List
from db.models.exercise import ExerciseEntry
from db.models.users import User
from core.security import get_current_user
from datetime import datetime, timezone, timedelta

router = APIRouter()

@router.post("/", response_model=dict)
async def create_exercise_entry(
    request: Request,
    payload: ExerciseEntry,
    current_user: User = Depends(get_current_user)
):
    """
    Log an exercise entry. user_id is injected from current_user.
    """
    db = request.app.state.db
    entry_dict = payload.model_dump(by_alias=True, exclude={"id"})
    entry_dict["user_id"] = str(current_user.id)
    
    result = await db.exercises.insert_one(entry_dict)
    return {"id": str(result.inserted_id), "status": "success"}

@router.get("/today", response_model=List[ExerciseEntry])
async def get_today_exercises(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Get all exercise entries for today for the current user.
    """
    db = request.app.state.db
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    cursor = db.exercises.find({
        "user_id": str(current_user.id),
        "entry_date": {"$gte": today_start}
    })
    
    entries = []
    async for doc in cursor:
        entries.append(ExerciseEntry(**doc))
    return entries
