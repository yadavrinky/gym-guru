from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import timedelta
from db.models.users import User
from core.security import get_password_hash, verify_password, create_access_token, get_current_user
from core.config import settings
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
import os

# Initialize Firebase Admin
try:
    cred_path = os.path.join(os.path.dirname(__file__), "..", "..", "firebase-credentials.json")
    cred = credentials.Certificate(cred_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Failed to initialize Firebase Admin: {e}")

router = APIRouter()

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    fitness_goal: Optional[str] = None
    experience_level: Optional[str] = None
    workouts_per_week: Optional[int] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2 or len(v) > 100:
            raise ValueError("Name must be between 2 and 100 characters")
        return v

class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    id_token: str
    email: str
    name: str

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        password_hash=hashed_password,
        name=user_data.name,
        profile={
            "age": user_data.age,
            "weight_kg": user_data.weight_kg,
            "height_cm": user_data.height_cm,
            "fitness_goal": user_data.fitness_goal,
            "experience_level": user_data.experience_level,
            "workouts_per_week": user_data.workouts_per_week
        }
    )
    await user.insert()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await User.find_one(User.email == user_data.email)
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=Token)
async def google_auth(req: GoogleAuthRequest):
    try:
        # Verify Token via Firebase
        decoded_token = firebase_auth.verify_id_token(req.id_token)
        if decoded_token['email'] != req.email:
            raise HTTPException(status_code=401, detail="Email mismatch")
            
        user = await User.find_one(User.email == req.email)
        
        # Auto-register if new user
        if not user:
            import secrets
            random_pass = get_password_hash(secrets.token_hex(16))
            user = User(
                email=req.email,
                password_hash=random_pass,
                name=req.name
            )
            await user.insert()
            
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google authentication failed. Please try again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ── User Profile Endpoints ──────────────────────────────────────

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Return current authenticated user's profile."""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "avatar_url": current_user.avatar_url,
        "profile": current_user.profile.model_dump() if current_user.profile else {},
        "created_at": current_user.created_at.isoformat(),
    }

class NameUpdate(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2 or len(v) > 100:
            raise ValueError("Name must be between 2 and 100 characters")
        return v

@router.put("/update-name")
async def update_name(
    payload: NameUpdate,
    current_user: User = Depends(get_current_user)
):
    current_user.name = payload.name
    await current_user.save()
    return {"status": "success", "name": current_user.name}

class ProfileUpdate(BaseModel):
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    fitness_goal: Optional[str] = None
    experience_level: Optional[str] = None
    workouts_per_week: Optional[int] = None

@router.put("/update-profile")
async def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update onboarding/profile fields for the current user."""
    update_data = payload.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(current_user.profile, key, value)
    await current_user.save()
    return {"status": "success", "profile": current_user.profile.model_dump()}

class ProfilePictureUpdate(BaseModel):
    avatar_url: str

@router.put("/profile-picture")
async def update_profile_picture(
    payload: ProfilePictureUpdate,
    current_user: User = Depends(get_current_user)
):
    current_user.avatar_url = payload.avatar_url
    await current_user.save()
    return {"status": "success", "avatar_url": current_user.avatar_url}
