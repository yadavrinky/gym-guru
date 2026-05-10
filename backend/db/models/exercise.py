from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from .base import PyObjectId

class ExerciseEntry(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    exercise_name: str
    duration_minutes: float
    calories_burned: float
    entry_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    category: Optional[str] = None
    primary_muscles: Optional[str] = None
    avg_heart_rate: Optional[float] = None
    notes: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PyObjectId: str},
    )
