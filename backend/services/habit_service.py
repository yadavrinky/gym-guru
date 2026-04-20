import numpy as np
import os
import joblib
from typing import List, Dict, Optional

class HabitPredictor:
    def __init__(self):
        try:
            model_path = os.path.join(os.path.dirname(__file__), 'gbm_model.pkl')
            self.model = joblib.load(model_path)
            self.is_loaded = True
        except FileNotFoundError:
            print("Model not found. Run scripts/train_habit_model.py to generate it natively.")
            self.model = None
            self.is_loaded = False

    def extract_features(self, user_profile: dict, recent_logs: List[dict]) -> np.ndarray:
        """
        Features: [day_of_week, days_since_last_workout, streak_length, 
                   avg_session_duration_7d, mood_score_avg_3d, last_form_score, 
                   workouts_completed_this_week, fcm_open_rate_7d]
        """
        # In a real scenario, map `user_profile` and `recent_logs` accurately
        return np.array([[1, 2, 5, 45.0, 3.5, 88.0, 3, 0.8]])

    def predict_skip_probability(self, features: np.ndarray) -> float:
        if not self.is_loaded:
            return 0.68  # Mock fallback

        # predict_proba returns [[P(class=0), P(class=1)]]
        predict_probs = self.model.predict_proba(features)
        return float(predict_probs[0][1])

    def generate_nudge(self, probability: float, mood_score: float) -> Optional[str]:
        if probability > 0.65:
            if mood_score < 2.5:
                return "I know you're feeling down. Let's just do a 5-minute stretch today."
            else:
                return "Don't break your streak! A quick 15-minute bodyweight circuit is all you need."
        return None

habit_predictor = HabitPredictor()
