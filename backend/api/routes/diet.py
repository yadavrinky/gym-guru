from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Request
import json
from typing import List
from openai import AsyncOpenAI
from core.config import settings
from core.security import get_current_user, get_current_user_ws
from db.models.users import User
from db.models.food import FoodEntry
from datetime import datetime, timezone

router = APIRouter()

# Initialize Groq Client (OpenAI-compatible API)
client = AsyncOpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

# Phase 3: Strict AI Persona Separation - Dietitian
DIETITIAN_SYSTEM_PROMPT = (
    "You are 'Gym Guru Dietitian', an expert clinical nutritionist. Your ONLY job is meal planning, macros, calories, and healthy eating. "
    "CRITICAL RULE: You are NOT a personal trainer. If asked about lifting weights, workout routines, exercise form, or cardio, "
    "REFUSE to answer and reply exactly with: 'I handle the kitchen, not the gym! For questions about workouts, please switch over to the Gym Buddy AI tab.'"
)

@router.websocket("/chat")
async def diet_chat_endpoint(websocket: WebSocket, token: str = None):
    """WebSocket diet chat. Full path: /api/diet/chat"""
    await websocket.accept()
    if not token:
        await websocket.close(code=1008)
        return
    user = await get_current_user_ws(token)
    if not user:
        await websocket.close(code=1008)
        return
    
    # Store conversation history for memory
    MAX_HISTORY = 20  # Prevent unbounded memory growth
    chat_history = [
        {"role": "system", "content": DIETITIAN_SYSTEM_PROMPT}
    ]

    try:
        while True:
            data = await websocket.receive_text()
            chat_history.append({"role": "user", "content": data})

            # Call Groq if key exists, otherwise fallback to mock
            if settings.GROQ_API_KEY:
                try:
                    response = await client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=chat_history,
                        max_tokens=150
                    )
                    ai_reply = response.choices[0].message.content
                except Exception:
                    ai_reply = "I'm having trouble connecting right now. Please try again in a moment."
            else:
                 ai_reply = "Ensure high protein intake (1.6g/kg) and stay hydrated. (Add GROQ_API_KEY to .env)"

            chat_history.append({"role": "assistant", "content": ai_reply})

            # Keep only system prompt + last N messages to prevent memory leak
            if len(chat_history) > MAX_HISTORY + 1:
                chat_history = [chat_history[0]] + chat_history[-(MAX_HISTORY):]

            payload = {
                "message": ai_reply,
            }

            await websocket.send_text(json.dumps(payload))
    except WebSocketDisconnect:
        pass

@router.post("/food", response_model=dict)
async def create_food_entry(
    request: Request,
    payload: FoodEntry,
    current_user: User = Depends(get_current_user)
):
    """
    Log a food entry. user_id is injected from current_user.
    """
    db = request.app.state.db
    entry_dict = payload.model_dump(by_alias=True, exclude={"id"})
    entry_dict["user_id"] = str(current_user.id)
    
    result = await db.foods.insert_one(entry_dict)
    return {"id": str(result.inserted_id), "status": "success"}

@router.get("/today", response_model=List[FoodEntry])
async def get_today_foods(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Get all food entries for today for the current user.
    """
    db = request.app.state.db
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    cursor = db.foods.find({
        "user_id": str(current_user.id),
        "entry_date": {"$gte": today_start}
    })
    
    entries = []
    async for doc in cursor:
        entries.append(FoodEntry(**doc))
    return entries

@router.get("/plan")
async def get_diet_plan(current_user: User = Depends(get_current_user)):
    """
    Generates a dynamic diet plan based on user profile using Groq.
    """
    if not settings.GROQ_API_KEY:
        return {
            "daily_targets": {"calories": 2200, "protein_g": 160, "carbs_g": 250, "fat_g": 70},
            "meals": [{"meal_type": "Mock", "items": [{"name": "Add Groq Key for real plan", "calories": 0}]}]
        }

    profile = current_user.profile
    prompt = f"""
    Generate a highly personalized fitness metabolic diet plan in JSON format.
    User Profile:
    - Weight: {profile.weight_kg}kg
    - Height: {profile.height_cm}cm
    - Fitness Goal: {profile.fitness_goal}
    - Dietary Preference: {profile.dietary_preference}
    - Activity Level: {profile.activity_level}

    Requirements:
    1. Output MUST be valid JSON.
    2. Include 'daily_targets' with 'calories', 'protein_g', 'carbs_g', 'fat_g'.
    3. Include 'meals' array with 'meal_type' and 'items' (name, calories).
    4. Keep it professional and nutritional.
    """

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a professional JSON generator for fitness nutrition."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        plan_data = json.loads(response.choices[0].message.content)
        return plan_data
    except Exception as e:
        return {"error": f"Failed to generate plan: {str(e)}"}
