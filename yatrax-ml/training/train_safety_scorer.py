"""
Model 1: Main Safety Score Predictor

Replaces the TensorFlow neural network with LightGBM.

Why LightGBM:
- Tabular data → tree models outperform neural nets
- Faster training (minutes not hours)
- No GPU needed
- Built-in feature importance
- Handles missing values natively
- No preprocessing pipeline needed (no scaler/imputer)
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from config.settings import (
    TRAINING_DIR, MODELS_DIR, SAFETY_SCORER_PARAMS, RANDOM_SEED,
)

MODEL_VERSION = "4.0.0-lgbm"
MODEL_DIR = MODELS_DIR / "safety_scorer"


def _get_feature_columns(df: pd.DataFrame) -> list[str]:
    """
    Select feature columns — everything except target and identifiers.
    """
    exclude = {
        "safety_score_target",
        "grid_lat", "grid_lon", "cell_id",
        "source_file", "date", "city", "state", "district",
        "base_danger",
    }
    return [c for c in df.columns if c not in exclude and df[c].dtype in [np.float64, np.float32, np.int64, np.int32, float, int]]


def train_safety_scorer() -> dict:
    """
    Train the main safety score model on real data.

    Returns metrics dict.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # ─── LOAD DATA ───
    train_path = TRAINING_DIR / "safety_score_train.parquet"
    val_path = TRAINING_DIR / "safety_score_val.parquet"
    test_path = TRAINING_DIR / "safety_score_test.parquet"

    for p in [train_path, val_path, test_path]:
        if not p.exists():
            raise FileNotFoundError(
                f"{p} not found. Run label_generator.py first."
            )

    train_df = pd.read_parquet(train_path)
    val_df = pd.read_parquet(val_path)
    test_df = pd.read_parquet(test_path)

    print(f"Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")

    # ─── PREPARE FEATURES ───
    feature_cols = _get_feature_columns(train_df)
    print(f"Feature columns: {len(feature_cols)}")

    X_train = train_df[feature_cols]
    y_train = train_df["safety_score_target"]

    X_val = val_df[feature_cols]
    y_val = val_df["safety_score_target"]

    X_test = test_df[feature_cols]
    y_test = test_df["safety_score_target"]

    # ─── CREATE LGBM DATASETS ───
    train_data = lgb.Dataset(X_train, label=y_train)
    val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)

    # ─── TRAIN ───
    print("\nTraining LightGBM safety scorer...")

    params = {
        **SAFETY_SCORER_PARAMS,
        "objective": "regression",
        "metric": ["mae", "rmse"],
        "verbose": -1,
    }

    callbacks = [
        lgb.early_stopping(stopping_rounds=50),
        lgb.log_evaluation(period=100),
    ]

    model = lgb.train(
        params=params,
        train_set=train_data,
        valid_sets=[train_data, val_data],
        valid_names=["train", "val"],
        num_boost_round=params.pop("n_estimators", 800),
        callbacks=callbacks,
    )

    # ─── EVALUATE ───
    y_pred = model.predict(X_test)
    y_pred = np.clip(y_pred, 0, 100)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    # ... continuing from EVALUATE

    print(f"\n{'='*50}")
    print(f"  TEST SET RESULTS")
    print(f"{'='*50}")
    print(f"  MAE:  {mae:.2f} points (out of 100)")
    print(f"  RMSE: {rmse:.2f}")
    print(f"  R²:   {r2:.4f}")
    print(f"{'='*50}")

    # ─── FEATURE IMPORTANCE ───
    importance = model.feature_importance(importance_type="gain")
    importance_df = pd.DataFrame({
        "feature": feature_cols,
        "importance": importance,
    }).sort_values("importance", ascending=False)

    print(f"\nTop 15 features:")
    for i, row in importance_df.head(15).iterrows():
        print(f"  {row['feature']:40s} {row['importance']:.1f}")

    # ─── ERROR DISTRIBUTION ───
    errors = y_test.values - y_pred
    print(f"\nError distribution:")
    print(f"  Mean error:   {errors.mean():.2f}")
    print(f"  Std error:    {errors.std():.2f}")
    print(f"  Within ±5:    {(np.abs(errors) <= 5).mean()*100:.1f}%")
    print(f"  Within ±10:   {(np.abs(errors) <= 10).mean()*100:.1f}%")
    print(f"  Worst error:  {np.abs(errors).max():.1f}")

    # ─── SAVE ───
    model_path = MODEL_DIR / "safety_scorer.lgb"
    model.save_model(str(model_path))

    metadata = {
        "model_version": MODEL_VERSION,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "feature_columns": feature_cols,
        "n_features": len(feature_cols),
        "n_train_samples": len(train_df),
        "n_val_samples": len(val_df),
        "n_test_samples": len(test_df),
        "metrics": {
            "mae": mae,
            "rmse": rmse,
            "r2": r2,
            "within_5_pct": float((np.abs(errors) <= 5).mean()),
            "within_10_pct": float((np.abs(errors) <= 10).mean()),
        },
        "params": SAFETY_SCORER_PARAMS,
        "feature_importance": importance_df.head(30).to_dict(orient="records"),
    }

    with open(MODEL_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    importance_df.to_csv(MODEL_DIR / "feature_importance.csv", index=False)

    print(f"\nModel saved: {model_path}")
    print(f"Metadata saved: {MODEL_DIR / 'metadata.json'}")

    return metadata["metrics"]


def load_safety_scorer() -> tuple[lgb.Booster, list[str]]:
    """Load trained model and feature columns."""
    model_path = MODEL_DIR / "safety_scorer.lgb"
    metadata_path = MODEL_DIR / "metadata.json"

    if not model_path.exists():
        raise FileNotFoundError(f"No trained model at {model_path}. Run training first.")

    model = lgb.Booster(model_file=str(model_path))

    with open(metadata_path) as f:
        metadata = json.load(f)

    return model, metadata["feature_columns"]


def predict_safety(
    model: lgb.Booster,
    feature_cols: list[str],
    features: dict[str, float],
) -> dict:
    """
    Predict safety score for a single point.

    Args:
        model: trained LightGBM booster
        feature_cols: ordered feature column names
        features: dict of feature_name → value

    Returns:
        dict with score, level, risk_factors
    """
    vector = np.array([[features.get(col, np.nan) for col in feature_cols]])
    score = float(np.clip(model.predict(vector)[0], 0, 100))

    # Classify
    if score >= 70:
        level = "safe"
    elif score >= 45:
        level = "caution"
    elif score >= 25:
        level = "unsafe"
    else:
        level = "dangerous"

    # Identify top risk factors
    risk_factors = []
    thresholds = {
        "crime_rate_per_100k": (300, "High crime area"),
        "road_accident_hotspot_risk": (0.6, "Accident hotspot"),
        "flood_risk": (0.5, "Flood risk zone"),
        "earthquake_risk": (0.5, "Earthquake risk zone"),
        "aqi": (200, "Unhealthy air quality"),
        "weather_severity": (50, "Severe weather conditions"),
        "nearest_hospital_proxy_km": (20, "Far from hospital"),
        "fire_risk_index": (0.5, "Fire risk area"),
        "water_contamination_risk": (0.5, "Water contamination risk"),
    }

    for feat, (threshold, desc) in thresholds.items():
        val = features.get(feat, 0)
        if val is not None and val > threshold:
            risk_factors.append(f"{desc} ({feat}={val:.1f})")

    # Night risk
    hour = features.get("hour", 12)
    if hour is not None and (hour >= 22 or hour < 5):
        risk_factors.append("Late night hours")

    return {
        "safety_score": round(score, 1),
        "safety_level": level,
        "risk_factors": risk_factors if risk_factors else ["No significant risks detected"],
    }


if __name__ == "__main__":
    metrics = train_safety_scorer()
    print(f"\nFinal metrics: {metrics}")