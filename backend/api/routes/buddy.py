import httpx
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from openai import AsyncOpenAI
from core.config import settings
from core.security import get_current_user_ws

router = APIRouter()

# Initialize Groq Client (OpenAI-compatible API)
client = AsyncOpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

# Phase 3: Strict AI Persona Separation - Gym Buddy
BUDDY_SYSTEM_PROMPT = (
    "You are 'Gym Guru Buddy', an expert fitness coach. Your ONLY job is workouts, lifting form, exercise science, and recovery. "
    "CRITICAL RULE: You are NOT a nutritionist. If asked about diets, meal plans, calories, recipes, or macros, "
    "REFUSE to answer and reply exactly with: 'I'm your gym buddy, not a chef! For questions about food, please switch over to the Dietitian AI tab.'"
)

async def classify_sentiment(text: str) -> str:
    """
    Uses Hugging Face Inference API (SST-2) to detect sentiment.
    Falls back to keyword matching if API fails or key is missing.
    """
    if not settings.HUGGINGFACE_API_KEY:
        text = text.lower()
        if any(word in text for word in ["tired", "exhausted", "sore"]):
            return "tired"
        if any(word in text for word in ["ready", "pumped", "let's go"]):
            return "motivated"
        return "neutral"

    API_URL = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english"
    headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
    
    try:
        async with httpx.AsyncClient() as h_client:
            response = await h_client.post(API_URL, headers=headers, json={"inputs": text}, timeout=5.0)
            result = response.json()
            # Handle list of results
            top_result = result[0][0] if isinstance(result, list) else result[0]
            label = top_result['label'].upper()
            
            if label == "POSITIVE":
                return "motivated"
            else:
                # Contextual negative detection
                if any(word in text.lower() for word in ["tired", "exhausted", "pain", "sore"]):
                    return "tired"
                return "neutral"
    except Exception as e:
        print(f"HuggingFace Error: {e}")
        return "neutral"

@router.websocket("/chat")
async def buddy_chat_endpoint(websocket: WebSocket, token: str = None):
    await websocket.accept()
    if not token:
        await websocket.close(code=1008)
        return
    user = await get_current_user_ws(token)
    if not user:
        await websocket.close(code=1008)
        return
    
    chat_history = []
    MAX_HISTORY = 20  # Prevent unbounded memory growth
    
    try:
        while True:
            data = await websocket.receive_text()
            
            sentiment = await classify_sentiment(data)
            
            # Use the strict system prompt from requirements
            messages = [
                {"role": "system", "content": BUDDY_SYSTEM_PROMPT},
                *chat_history,
                {"role": "user", "content": data}
            ]
            
            if settings.GROQ_API_KEY:
                try:
                    response = await client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=messages,
                        max_tokens=120
                    )
                    ai_reply = response.choices[0].message.content
                except Exception:
                    ai_reply = "I'm having trouble connecting to my workout brain right now. Let's try again in a bit!"
            else:
                ai_reply = f"I'm here to help with your workout! (Add GROQ_API_KEY to .env for real responses)"
            
            chat_history.append({"role": "user", "content": data})
            chat_history.append({"role": "assistant", "content": ai_reply})

            # Keep only the last N messages to prevent memory leak
            if len(chat_history) > MAX_HISTORY:
                chat_history = chat_history[-MAX_HISTORY:]
            
            response_payload = {
                "message": ai_reply,
                "sentiment": sentiment
            }
            
            await websocket.send_text(json.dumps(response_payload))
    except WebSocketDisconnect:
        print("Buddy client disconnected")
