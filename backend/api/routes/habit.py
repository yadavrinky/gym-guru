from fastapi import APIRouter

router = APIRouter()

@router.get("/nudge/{user_id}")
async def get_nudge(user_id: str):
    """Return the current nudge status for a user.
    In production this calls the GBM habit predictor."""
    from services.habit_service import habit_predictor

    features = habit_predictor.extract_features({}, [])
    prob = habit_predictor.predict_skip_probability(features)
    nudge = habit_predictor.generate_nudge(prob, mood_score=3.0)

    return {
        "user_id": user_id,
        "skip_probability": round(prob, 2),
        "nudge": nudge,
    }
