import numpy as np
from typing import List, Dict, Optional

class HabitPredictor:
    def __init__(self):
        # In a real app: self.model = joblib.load('ai_modules/habit_predictor/gbm_model.pkl')
        pass

    def extract_features(self, user_profile: dict, recent_logs: List[dict]) -> np.ndarray:
        """
        Features: [day_of_week, days_since_last_workout, streak_length, 
                   avg_session_duration_7d, mood_score_avg_3d, last_form_score, 
                   workouts_completed_this_week, fcm_open_rate_7d]
        """
        # Mock feature extraction
        return np.array([[1, 2, 5, 45.0, 3.5, 88.0, 3, 0.8]])

    def predict_skip_probability(self, features: np.ndarray) -> float:
        # Mock prediction model logic
        # 1 means they will skip, 0 means they will workout
        mock_skip_prob = 0.68 
        return mock_skip_prob

    def generate_nudge(self, probability: float, mood_score: float) -> Optional[str]:
        if probability > 0.65:
            if mood_score < 2.5:
                return "I know you're feeling down. Let's just do a 5-minute stretch today."
            else:
                return "Don't break your streak! A quick 15-minute bodyweight circuit is all you need."
        return None

habit_predictor = HabitPredictor()
