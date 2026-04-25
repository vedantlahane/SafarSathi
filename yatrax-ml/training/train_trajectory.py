"""
Model 2: Safety Score Trajectory Forecaster

Predicts how safety score will change over the next few hours.

LITE VERSION: Uses gradient boosting on windowed features instead of LSTM.
Full LSTM version requires sequential training data from real users.

This model answers: "Will conditions get worse in the next 1-3 hours?"
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split

from config.settings import TRAINING_DIR, MODELS_DIR, RANDOM_SEED

MODEL_DIR = MODELS_DIR / "trajectory"


def generate_trajectory_data(n_sequences: int = 20000) -> pd.DataFrame:
    """
    Generate synthetic trajectory sequences.

    Each sequence: 6 hourly snapshots → predict score at hour 7, 8, 9.

    Features per timestep:
    - safety_score at time t
    - weather_severity at time t
    - hour at time t
    - is_night at time t
    - rainfall_mmph at time t

    Window features (computed from 6-step history):
    - score_mean, score_std, score_trend (slope)
    - weather_mean, weather_trend
    - rain_max, rain_trend
    """
    rng = np.random.default_rng(RANDOM_SEED)
    rows = []

    for _ in range(n_sequences):
        # Generate a plausible 9-hour score trajectory
        base_score = rng.uniform(30, 90)
        trend = rng.choice([-1, -0.5, 0, 0.5, 1], p=[0.15, 0.2, 0.3, 0.2, 0.15])
        volatility = rng.uniform(1, 8)

        start_hour = rng.integers(0, 24)

        scores = []
        weathers = []
        rains = []
        for t in range(9):
            hour = (start_hour + t) % 24
            night_penalty = 5 if (hour >= 22 or hour < 5) else 0

            # Weather can shift during sequence
            weather_base = rng.uniform(10, 60)
            weather_shift = rng.normal(0, 3) * t
            weather = max(0, min(100, weather_base + weather_shift))

            rain = max(0, rng.exponential(3) if rng.random() < 0.3 else 0)

            score = base_score + trend * t + rng.normal(0, volatility) - night_penalty - rain * 0.3
            score = float(np.clip(score, 0, 100))

            scores.append(score)
            weathers.append(weather)
            rains.append(rain)

        # History window: first 6 steps
        hist_scores = scores[:6]
        hist_weather = weathers[:6]
        hist_rain = rains[:6]

        # Compute window features
        score_mean = np.mean(hist_scores)
        score_std = np.std(hist_scores)
        score_slope = np.polyfit(range(6), hist_scores, 1)[0]  # linear trend

        weather_mean = np.mean(hist_weather)
        weather_slope = np.polyfit(range(6), hist_weather, 1)[0]

        rain_max = max(hist_rain)
        rain_mean = np.mean(hist_rain)

        current_score = scores[5]
        current_hour = (start_hour + 5) % 24
        current_night = 1 if (current_hour >= 22 or current_hour < 5) else 0

        # Targets: score at +1h, +2h, +3h
        for horizon, target_idx in [(1, 6), (2, 7), (3, 8)]:
            rows.append({
                "current_score": current_score,
                "score_mean_6h": score_mean,
                "score_std_6h": score_std,
                "score_slope_6h": score_slope,
                "weather_mean_6h": weather_mean,
                "weather_slope_6h": weather_slope,
                "rain_max_6h": rain_max,
                "rain_mean_6h": rain_mean,
                "current_hour": current_hour,
                "is_night": current_night,
                "forecast_horizon_h": horizon,
                "target_score": scores[target_idx],
            })

    return pd.DataFrame(rows)


def train_trajectory_model() -> dict:
    """Train the trajectory forecaster."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    print("Generating trajectory training data...")
    df = generate_trajectory_data(n_sequences=20000)
    print(f"Generated {len(df)} samples")

    feature_cols = [
        "current_score", "score_mean_6h", "score_std_6h", "score_slope_6h",
        "weather_mean_6h", "weather_slope_6h",
        "rain_max_6h", "rain_mean_6h",
        "current_hour", "is_night", "forecast_horizon_h",
    ]

    X = df[feature_cols].values
    y = df["target_score"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED,
    )

    print("Training Gradient Boosting trajectory model...")
    model = GradientBoostingRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        min_samples_leaf=20,
        random_state=RANDOM_SEED,
    )
    model.fit(X_train, y_train)

    y_pred = np.clip(model.predict(X_test), 0, 100)
    mae = float(mean_absolute_error(y_test, y_pred))

    print(f"\nTrajectory Model Results:")
    print(f"  MAE: {mae:.2f} points")
    print(f"  Within ±5: {(np.abs(y_test - y_pred) <= 5).mean()*100:.1f}%")
    print(f"  Within ±10: {(np.abs(y_test - y_pred) <= 10).mean()*100:.1f}%")

    # Save
    joblib.dump(model, MODEL_DIR / "trajectory_model.joblib")
    joblib.dump(feature_cols, MODEL_DIR / "feature_columns.joblib")

    metadata = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "n_samples": len(df),
        "n_features": len(feature_cols),
        "feature_columns": feature_cols,
        "mae": mae,
        "within_5": float((np.abs(y_test - y_pred) <= 5).mean()),
        "within_10": float((np.abs(y_test - y_pred) <= 10).mean()),
    }

    with open(MODEL_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved to {MODEL_DIR}")
    return metadata


if __name__ == "__main__":
    train_trajectory_model()