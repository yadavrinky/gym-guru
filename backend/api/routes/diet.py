from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from openai import AsyncOpenAI
from core.config import settings

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
async def get_diet_plan():
    return {
        "daily_targets": {"calories": 2200, "protein_g": 160, "carbs_g": 250, "fat_g": 70},
        "meals": [
            {"meal_type": "Breakfast", "items": [{"name": "Oatmeal", "calories": 300}]}
        ]
    }
