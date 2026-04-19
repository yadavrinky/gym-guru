from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

@router.get("/gyms")
async def get_nearby_gyms(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_km: float = Query(10.0, description="Search radius in km"),
):
    """Geo-search for nearby gyms. In production this uses
    MongoDB $near with 2dsphere index on gym_data.location."""
    mock_gyms = [
        {
            "name": "FitZone Premium",
            "distance_km": 1.2,
            "rating": 4.7,
            "facilities": ["cardio", "weights", "sauna", "pool"],
        },
        {
            "name": "IronWorks Gym",
            "distance_km": 2.8,
            "rating": 4.4,
            "facilities": ["weights", "crossfit", "boxing"],
        },
        {
            "name": "Yoga & Beyond",
            "distance_km": 3.5,
            "rating": 4.9,
            "facilities": ["yoga", "pilates", "meditation"],
        },
    ]
    return {"lat": lat, "lng": lng, "radius_km": radius_km, "results": mock_gyms}


@router.get("/programs")
async def get_programs(fitness_goal: Optional[str] = None):
    """Recommend workout programs using collaborative filtering.
    Mock implementation returns static programs."""
    programs = [
        {"name": "Strength Builder", "weeks": 8, "level": "intermediate", "goal": "muscle_gain"},
        {"name": "Fat Burner HIIT", "weeks": 6, "level": "beginner", "goal": "weight_loss"},
        {"name": "Endurance Pro", "weeks": 12, "level": "advanced", "goal": "endurance"},
    ]
    if fitness_goal:
        programs = [p for p in programs if p["goal"] == fitness_goal]
    return {"programs": programs}
