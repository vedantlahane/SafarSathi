"""
Model 3: Anomaly Detector (Isolation Forest)

Detects unusual combinations of features that might indicate danger
even when individual features look okay.

No labeled data needed — Isolation Forest is unsupervised.
Trains on the unified grid to learn what "normal" looks like.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from config.settings import PROCESSED_DIR, MODELS_DIR, ANOMALY_PARAMS, RANDOM_SEED

MODEL_DIR = MODELS_DIR / "anomaly"


def _get_anomaly_features(df: pd.DataFrame) -> tuple[list[str], pd.DataFrame]:
    """Select features relevant for anomaly detection."""
    candidates = [
        "crime_rate_per_100k",
        "road_accident_hotspot_risk",
        "accident_severity_index",
        "flood_risk",
        "earthquake_risk",
        "landslide_risk",
        "fire_risk_index",
        "aqi",
        "weather_severity",
        "temperature_c",
        "rainfall_mmph",
        "wind_speed_kmph",
        "visibility_km",
        "hospital_level_score",
        "emergency_availability_score",
        "nearest_hospital_proxy_km",
        "water_safety_score",
        "water_contamination_risk",
        "population_density_per_km2",
        "noise_level_proxy",
    ]

    available = [c for c in candidates if c in df.columns]
    return available, df[available].copy()


def train_anomaly_detector() -> dict:
    """
    Train Isolation Forest on unified grid data.

    The model learns what "normal" geographic feature combinations
    look like across India. Anomalies = unusual combinations.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    grid_path = PROCESSED_DIR / "unified_grid.parquet"
    if not grid_path.exists():
        raise FileNotFoundError("Run merge_sources.py first")

    grid = pd.read_parquet(grid_path)
    print(f"Loaded grid: {len(grid)} cells")

    feature_names, X_df = _get_anomaly_features(grid)
    print(f"Anomaly features: {len(feature_names)}")

    # Fill NaN with median (Isolation Forest can't handle NaN)
    medians = X_df.median()
    X_filled = X_df.fillna(medians)

    # Store medians for the perturbation-based explanation method
    feature_medians = medians.to_dict()

    X = X_filled.values

    # Train Isolation Forest
    print("\nTraining Isolation Forest...")
    iso_params = ANOMALY_PARAMS["isolation_forest"]

    model = IsolationForest(
        n_estimators=iso_params["n_estimators"],
        contamination=iso_params["contamination"],
        max_features=iso_params["max_features"],
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )

    model.fit(X)

    # Get predictions on training data to understand distribution
    predictions = model.predict(X)
    scores = model.score_samples(X)

    n_anomalies = (predictions == -1).sum()
    anomaly_pct = n_anomalies / len(predictions) * 100

    print(f"\nResults on training data:")
    print(f"  Normal:    {(predictions == 1).sum()} ({100 - anomaly_pct:.1f}%)")
    print(f"  Anomalous: {n_anomalies} ({anomaly_pct:.1f}%)")
    print(f"  Score range: {scores.min():.4f} to {scores.max():.4f}")
    print(f"  Score mean:  {scores.mean():.4f}")
    print(f"  Score std:   {scores.std():.4f}")

    # Examine some anomalies
    anomaly_mask = predictions == -1
    anomaly_cells = grid[anomaly_mask].copy()
    anomaly_cells["anomaly_score"] = scores[anomaly_mask]

    print(f"\nTop 10 most anomalous cells:")
    worst = anomaly_cells.nsmallest(10, "anomaly_score")
    for _, row in worst.iterrows():
        lat, lon = row.get("grid_lat", "?"), row.get("grid_lon", "?")
        ascore = row["anomaly_score"]
        # Show which features are extreme
        extreme = []
        for feat in feature_names[:5]:
            val = row.get(feat, None)
            med = feature_medians.get(feat, None)
            if val is not None and med is not None and med != 0:
                ratio = val / med
                if ratio > 2.0 or ratio < 0.5:
                    extreme.append(f"{feat}={val:.1f}(med={med:.1f})")
        print(f"  ({lat}, {lon}) score={ascore:.4f} — {', '.join(extreme[:3])}")

    # Save
    joblib.dump(model, MODEL_DIR / "isolation_forest.joblib")
    joblib.dump(feature_names, MODEL_DIR / "feature_names.joblib")
    joblib.dump(feature_medians, MODEL_DIR / "feature_medians.joblib")

    metadata = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "n_features": len(feature_names),
        "feature_names": feature_names,
        "n_training_cells": len(grid),
        "contamination": iso_params["contamination"],
        "n_anomalies_found": int(n_anomalies),
        "anomaly_pct": round(anomaly_pct, 2),
        "score_stats": {
            "min": float(scores.min()),
            "max": float(scores.max()),
            "mean": float(scores.mean()),
            "std": float(scores.std()),
            "threshold_approx": float(np.percentile(scores, iso_params["contamination"] * 100)),
        },
    }

    with open(MODEL_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nModel saved to {MODEL_DIR}")
    return metadata


def detect_anomaly(features: dict[str, float]) -> dict | None:
    """
    Run anomaly detection on a single feature vector.

    Returns None if normal, or dict with anomaly details if anomalous.
    """
    model = joblib.load(MODEL_DIR / "isolation_forest.joblib")
    feature_names = joblib.load(MODEL_DIR / "feature_names.joblib")
    feature_medians = joblib.load(MODEL_DIR / "feature_medians.joblib")

    vector = np.array([[features.get(f, feature_medians.get(f, 0)) for f in feature_names]])

    prediction = model.predict(vector)[0]
    score = model.score_samples(vector)[0]

    if prediction == 1:
        return None  # Normal

    # Explain: which features drive the anomaly?
    baseline_score = score
    contributions = []

    for i, feat in enumerate(feature_names):
        perturbed = vector.copy()
        perturbed[0, i] = feature_medians.get(feat, 0)
        perturbed_score = model.score_samples(perturbed)[0]
        impact = perturbed_score - baseline_score

        if impact > 0.005:
            contributions.append({
                "feature": feat,
                "actual": float(vector[0, i]),
                "median": float(feature_medians.get(feat, 0)),
                "impact": round(float(impact), 4),
            })

    contributions.sort(key=lambda x: x["impact"], reverse=True)

    severity = "high" if score < -0.3 else "medium" if score < -0.2 else "low"

    return {
        "anomaly_score": round(float(score), 4),
        "severity": severity,
        "contributing_features": contributions[:5],
        "description": _describe_anomaly(contributions[:3]),
    }


def _describe_anomaly(contributions: list[dict]) -> str:
    """Generate human-readable anomaly description."""
    if not contributions:
        return "Unusual combination of features detected"

    parts = []
    for c in contributions[:3]:
        feat = c["feature"].replace("_", " ")
        if c["actual"] > c["median"] * 1.5:
            parts.append(f"unusually high {feat}")
        elif c["actual"] < c["median"] * 0.5:
            parts.append(f"unusually low {feat}")
        else:
            parts.append(f"atypical {feat}")

    return "Anomaly: " + ", ".join(parts)


if __name__ == "__main__":
    train_anomaly_detector()