from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from .base import PyObjectId

class FoodEntry(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    food_name: str
    quantity: float
    entry_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    calories: float
    protein: float
    carbs: float
    fat: float
    serving_size: Optional[float] = None
    serving_unit: Optional[str] = None
    dietary_fiber: Optional[float] = None
    sugars: Optional[float] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={PyObjectId: str},
    )
