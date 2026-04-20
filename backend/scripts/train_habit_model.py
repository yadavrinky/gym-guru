import numpy as np
import os
import joblib
from sklearn.ensemble import GradientBoostingClassifier

# [day_of_week, days_since_last_workout, streak_length, avg_session_duration_7d, mood_score_avg_3d, last_form_score, workouts_completed_this_week, fcm_open_rate_7d]
np.random.seed(42)

# Generate 500 dummy records
n_samples = 500

X = np.zeros((n_samples, 8))
X[:, 0] = np.random.randint(0, 7, n_samples) # day of week
X[:, 1] = np.random.randint(0, 10, n_samples) # days since last workout
X[:, 2] = np.random.randint(0, 30, n_samples) # streak length
X[:, 3] = np.random.uniform(10, 90, n_samples) # avg session duration
X[:, 4] = np.random.uniform(1, 5, n_samples) # mood score (1-5)
X[:, 5] = np.random.uniform(50, 100, n_samples) # form score
X[:, 6] = np.random.randint(0, 7, n_samples) # workouts week
X[:, 7] = np.random.uniform(0, 1, n_samples) # open rate

# Generate targets based on logic
# Higher streak, more recent workout -> likely to workout (0)
# Longer since last workout, lower mood -> likely to skip (1)
y = np.zeros(n_samples)
for i in range(n_samples):
    risk_score = (X[i, 1] * 2) - X[i, 2] - X[i, 4] * 5
    if risk_score > 0:
        y[i] = 1 # Skip
    else:
        y[i] = 0 # Workout
        
# Add some noise
flips = np.random.choice(n_samples, size=int(n_samples*0.1), replace=False)
y[flips] = 1 - y[flips]

print("Training GradientBoostingClassifier...")
clf = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
clf.fit(X, y)

print(f"Training accuracy: {clf.score(X, y):.3f}")

out_path = os.path.join(os.path.dirname(__file__), "..", "services", "gbm_model.pkl")
os.makedirs(os.path.dirname(out_path), exist_ok=True)
joblib.dump(clf, out_path)
print(f"Model saved locally to {out_path} (No cloud cost!)")
