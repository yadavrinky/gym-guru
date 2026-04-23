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

PROMPT_TEMPLATES = {
    "motivated": "Match their energy. Celebrate wins. Suggest a slight increase in challenge.",
    "neutral": "Be encouraging and informative. Keep tone friendly and supportive.",
    "tired": "Be gentle. Acknowledge effort. Suggest lighter alternatives or rest.",
    "frustrated": "Be calm and validating. Reduce pressure. Focus on progress, not perfection.",
    "anxious": "Be reassuring. Break goals into tiny steps. Avoid performance pressure.",
}

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
            
            # Now an async call
            sentiment = await classify_sentiment(data)
            template_instruction = PROMPT_TEMPLATES.get(sentiment, PROMPT_TEMPLATES["neutral"])
            
            # Build system prompt dynamically based on sentiment
            system_prompt = f"You are GYM GURU Buddy, an emotionally intelligent fitness companion. The user seems {sentiment}. {template_instruction} Keep responses concise, warm, and under 60 words."
            
            messages = [
                {"role": "system", "content": system_prompt},
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
                    ai_reply = f"I sense you are feeling {sentiment}. {template_instruction} What can I help with?"
            else:
                ai_reply = f"I sense you are feeling {sentiment}. {template_instruction} What can I help with?"
            
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

