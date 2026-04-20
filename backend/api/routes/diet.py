from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import json
from openai import AsyncOpenAI
from core.config import settings
from core.security import get_current_user
from db.models.users import User

router = APIRouter()

# Initialize Groq Client (OpenAI-compatible API)
client = AsyncOpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

@router.websocket("/chat")
async def diet_chat_endpoint(websocket: WebSocket):
    """WebSocket diet chat. Full path: /api/diet/chat"""
    await websocket.accept()
    
    # Store conversation history for memory
    chat_history = [
        {"role": "system", "content": "You are GYM GURU Dietician, an expert, enthusiastic sports nutritionist and RAG assistant. Keep your responses concise, action-oriented, and fitness-focused under 50 words. Recommend specific food items when relevant."}
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
                except Exception as e:
                    ai_reply = f"Groq Error: {str(e)[:80]}. Check your API Key."
            else:
                 ai_reply = "Ensure high protein intake (1.6g/kg) and stay hydrated. (Add GROQ_API_KEY to .env)"

            chat_history.append({"role": "assistant", "content": ai_reply})

            payload = {
                "message": ai_reply,
            }

            await websocket.send_text(json.dumps(payload))
    except WebSocketDisconnect:
        pass

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
