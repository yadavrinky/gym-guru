from beanie import Document
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime, timezone

class UserProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None
    fitness_goal: Optional[str] = None
    dietary_preference: Optional[str] = None
    activity_level: Optional[str] = None
    experience_level: Optional[str] = None
    workouts_per_week: Optional[int] = None

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Document):
    email: EmailStr
    password_hash: str
    name: str
    avatar_url: Optional[str] = None
    profile: UserProfile = Field(default_factory=UserProfile)
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)

    class Settings:
        name = "users"
