from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
import calendar
from typing import Dict, Any

from core.security import get_current_user
from db.models.users import User
from db.models.workout import WorkoutSession

router = APIRouter()

@router.get("/summary/me")
async def get_summary(current_user: User = Depends(get_current_user)):
    """Dashboard analytics summary. Requires authentication."""
    sessions = await WorkoutSession.find(
        WorkoutSession.user_id == str(current_user.id)
    ).to_list()

    total_reps = sum(s.reps for s in sessions)
    avg_form = round(sum(s.form_score for s in sessions) / max(len(sessions), 1), 1)
    total_cals = round(sum(s.calories_burned for s in sessions), 1)

    return {
        "user_id": str(current_user.id),
        "total_sessions": len(sessions),
        "total_reps": total_reps,
        "avg_form_score": avg_form,
        "calories_burned_total": total_cals,
    }


@router.get("/weekly-report/me")
async def get_weekly_report(current_user: User = Depends(get_current_user)):
    """Weekly performance report mapped directly to Plotly JS axes."""
    
    # Calculate the range for the last 7 days including today
    today = datetime.utcnow().replace(hour=23, minute=59, second=59)
    seven_days_ago = (today - timedelta(days=6)).replace(hour=0, minute=0, second=0)

    # Query MongoDB for sessions explicitly matching this user and date range
    sessions = await WorkoutSession.find(
        WorkoutSession.user_id == str(current_user.id),
        WorkoutSession.started_at >= seven_days_ago,
        WorkoutSession.started_at <= today
    ).to_list()

    # Pre-fill the array structures needed for Plotly X (days) and Y (reps/volume)
    x_days = []
    y_volume = []

    # Map the dates
    daily_volume: Dict[str, int] = {}
    
    for i in range(7):
        target_date = seven_days_ago + timedelta(days=i)
        day_name = calendar.day_name[target_date.weekday()][:3] # e.g., 'Mon'
        date_str = target_date.strftime("%Y-%m-%d")
        x_days.append(f"{day_name} ({date_str[5:]})")
        daily_volume[date_str] = 0

    # Aggregate reps from MongoDB
    for s in sessions:
        date_str = s.started_at.strftime("%Y-%m-%d")
        if date_str in daily_volume:
            daily_volume[date_str] += s.reps

    # Build the final Y axis
    for i in range(7):
        target_date = seven_days_ago + timedelta(days=i)
        date_str = target_date.strftime("%Y-%m-%d")
        y_volume.append(daily_volume[date_str])

    return {
        "x_axis": x_days,
        "y_axis": y_volume,
        "total_weekly_reps": sum(y_volume),
        "total_sessions": len(sessions)
    }
