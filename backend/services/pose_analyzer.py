import numpy as np
from tslearn.metrics import dtw
from typing import List, Dict

class PoseAnalyzer:
    def __init__(self):
        # In a real app, load benchmark poses from data/benchmark_poses/
        self.benchmarks = {
            "squat": [180, 160, 140, 120, 100, 90, 100, 120, 140, 160, 180]
        }

    def calculate_form_score(self, exercise_type: str, user_angles: List[float]) -> float:
        if exercise_type not in self.benchmarks:
            return 80.0 # Default fallback
            
        benchmark = self.benchmarks[exercise_type]
        
        # DTW calculation
        distance = dtw(user_angles, benchmark)
        
        # Normalize distance to 0-100 score (heuristic)
        # Closer to 0 distance means higher similarity
        max_dist = 100.0 # Heuristic max distance
        score = max(0, 100 - (distance / max_dist) * 100)
        
        return float(score)

pose_analyzer = PoseAnalyzer()
