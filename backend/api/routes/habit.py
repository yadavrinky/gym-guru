from fastapi import APIRouter, Depends
from core.security import get_current_user
from db.models.users import User

router = APIRouter()

@router.get("/predict")
async def predict_skip(current_user: User = Depends(get_current_user)):
    """Return the skip probability for the authenticated user.
    In production this calls the GBM habit predictor with real user data."""
    from services.habit_service import habit_predictor

    features = habit_predictor.extract_features({}, [])
    prob = habit_predictor.predict_skip_probability(features)
    nudge = habit_predictor.generate_nudge(prob, mood_score=3.0)

    return {
        "user_id": str(current_user.id),
        "skip_probability": round(prob, 2),
        "nudge": nudge,
    }
