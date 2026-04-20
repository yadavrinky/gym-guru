from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
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
        name=user_data.name
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
            # Generate random password for google users (since they login via token)
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google Token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

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

