"""
Model 4: Incident Type Classifier

Given features at the moment of an anomaly, classify WHAT type
of incident is most likely happening.

Uses LightGBM multiclass classification.
Training data: generated from real incident records + feature context.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from config.settings import (
    PROCESSED_DIR, TRAINING_DIR, MODELS_DIR,
    INCIDENT_CLASSIFIER_PARAMS, RANDOM_SEED,
)

MODEL_DIR = MODELS_DIR / "incident_classifier"

# Incident types we classify
INCIDENT_TYPES = [
    "flood",
    "landslide",
    "earthquake",
    "cyclone_storm",
    "wildlife",
    "crime_robbery",
    "crime_assault",
    "road_accident",
    "fire",
    "medical_emergency",
    "stranded",
    "unknown",
]


def generate_incident_training_data() -> pd.DataFrame:
    """
    Generate labeled incident classification training data.

    Uses real disaster/accident/crime data locations to create
    realistic feature vectors with known incident types.

    For each real incident:
    1. Look up the grid cell where it happened
    2. Pull all features for that cell from unified grid
    3. Add temporal context + noise
    4. Label with the real incident type
    """
    unified_path = PROCESSED_DIR / "unified_grid.parquet"
    if not unified_path.exists():
        raise FileNotFoundError("Run merge_sources.py first")

    grid = pd.read_parquet(unified_path)
    rng = np.random.default_rng(RANDOM_SEED)
    rows = []

    # ─── LOAD REAL INCIDENT LOCATIONS ───

    # Disasters
    disaster_path = PROCESSED_DIR / "disaster_grid.parquet"
    if disaster_path.exists():
        disasters = pd.read_parquet(disaster_path)
        for _, row in disasters.iterrows():
            for incident_type, count_col in [
                ("flood", "flood_count"),
                ("earthquake", "earthquake_count"),
                ("cyclone_storm", "cyclone_count"),
                ("landslide", "landslide_count"),
            ]:
                if count_col in row and row[count_col] > 0:
                    n_samples = min(int(row[count_col]), 50)
                    for _ in range(n_samples):
                        features = _get_cell_features(grid, row.get("grid_lat", row.get("latitude")),
                                                       row.get("grid_lon", row.get("longitude")))
                        if features is not None:
                            features["incident_type"] = incident_type
                            features["hour"] = int(rng.choice(24))
                            features["month"] = int(rng.choice([6, 7, 8, 9]) if incident_type == "flood"
                                                     else rng.choice(12) + 1)
                            _add_incident_specific_noise(features, incident_type, rng)
                            rows.append(features)

    # Accidents
    accident_path = PROCESSED_DIR / "accident_grid.parquet"
    if accident_path.exists():
        accidents = pd.read_parquet(accident_path)
        for _, row in accidents.iterrows():
            n_samples = min(max(1, int(row.get("total_accidents", 1) / 10)), 30)
            for _ in range(n_samples):
                features = _get_cell_features(grid, row.get("grid_lat", row.get("latitude")),
                                               row.get("grid_lon", row.get("longitude")))
                if features is not None:
                    features["incident_type"] = "road_accident"
                    features["hour"] = int(rng.choice(24))
                    features["month"] = int(rng.choice(12) + 1)
                    _add_incident_specific_noise(features, "road_accident", rng)
                    rows.append(features)

    # Fire
    fire_path = PROCESSED_DIR / "fire_grid.parquet"
    if fire_path.exists():
        fires = pd.read_parquet(fire_path)
        for _, row in fires.iterrows():
            n_samples = min(max(1, int(row.get("fire_count", 1) / 5)), 20)
            for _ in range(n_samples):
                features = _get_cell_features(grid, row.get("grid_lat", row.get("latitude")),
                                               row.get("grid_lon", row.get("longitude")))
                if features is not None:
                    features["incident_type"] = "fire"
                    features["hour"] = int(rng.choice(24))
                    features["month"] = int(rng.choice([3, 4, 5, 10, 11]))
                    _add_incident_specific_noise(features, "fire", rng)
                    rows.append(features)

    # Crime — generate from high-crime cells
    crime_path = PROCESSED_DIR / "crime_grid.parquet"
    if crime_path.exists():
        crimes = pd.read_parquet(crime_path)
        high_crime = crimes[crimes.get("crime_rate_per_100k", pd.Series([0])) > 300]
        for _, row in high_crime.iterrows():
            for _ in range(10):
                features = _get_cell_features(grid, row.get("latitude"), row.get("longitude"))
                if features is not None:
                    crime_type = rng.choice(["crime_robbery", "crime_assault"])
                    features["incident_type"] = crime_type
                    features["hour"] = int(rng.choice([0, 1, 2, 3, 21, 22, 23]))
                    features["month"] = int(rng.choice(12) + 1)
                    _add_incident_specific_noise(features, crime_type, rng)
                    rows.append(features)

    # Synthetic: medical emergency, stranded, wildlife, unknown
    # These don't have direct datasets, so we generate from context
    for _, cell in grid.sample(min(2000, len(grid)), random_state=RANDOM_SEED).iterrows():
        features = {col: cell[col] for col in grid.columns
                     if col not in ["cell_id", "base_danger"]}

        # Medical emergency — high altitude or extreme weather
        if cell.get("elevation_m", 0) > 2500 or cell.get("weather_severity", 0) > 60:
            f = features.copy()
            f["incident_type"] = "medical_emergency"
            f["hour"] = int(rng.choice(24))
            f["month"] = int(rng.choice(12) + 1)
            rows.append(f)

        # Stranded — remote + poor infrastructure
        if cell.get("nearest_hospital_proxy_km", 0) > 30:
            f = features.copy()
            f["incident_type"] = "stranded"
            f["hour"] = int(rng.choice([0, 1, 2, 3, 22, 23]))
            f["month"] = int(rng.choice(12) + 1)
            rows.append(f)

        # Unknown — random anomaly anywhere
        if rng.random() < 0.05:
            f = features.copy()
            f["incident_type"] = "unknown"
            f["hour"] = int(rng.choice(24))
            f["month"] = int(rng.choice(12) + 1)
            rows.append(f)

    df = pd.DataFrame(rows)
    print(f"Generated {len(df)} incident classification samples")
    print(f"Distribution:\n{df['incident_type'].value_counts().to_string()}")

    output_path = TRAINING_DIR / "incident_classification.parquet"
    df.to_parquet(output_path, index=False)
    print(f"Saved: {output_path}")

    return df


def _get_cell_features(
    grid: pd.DataFrame,
    lat: float | None,
    lon: float | None,
) -> dict | None:
    """Look up unified grid features for a location."""
    if lat is None or lon is None or pd.isna(lat) or pd.isna(lon):
        return None

    grid_lat = round(round(lat / 0.1) * 0.1, 1)
    grid_lon = round(round(lon / 0.1) * 0.1, 1)

    match = grid[
        (grid["grid_lat"] == grid_lat) & (grid["grid_lon"] == grid_lon)
    ]

    if match.empty:
        # Find nearest cell
        dists = ((grid["grid_lat"] - grid_lat)**2 + (grid["grid_lon"] - grid_lon)**2)
        nearest_idx = dists.idxmin()
        match = grid.loc[[nearest_idx]]

    row = match.iloc[0]
    return {col: row[col] for col in grid.columns if col not in ["cell_id", "base_danger"]}


def _add_incident_specific_noise(features: dict, incident_type: str, rng) -> None:
    """
    Add realistic feature modifications based on incident type.
    During a flood, rainfall is high. During a fire, AQI spikes. Etc.
    """
    if incident_type == "flood":
        features["rainfall_mmph"] = features.get("rainfall_mmph", 5) + rng.uniform(20, 60)
        features["weather_severity"] = min(100, features.get("weather_severity", 20) + rng.uniform(30, 60))
        features["visibility_km"] = max(0.2, features.get("visibility_km", 8) - rng.uniform(3, 6))

    elif incident_type == "landslide":
        features["rainfall_mmph"] = features.get("rainfall_mmph", 5) + rng.uniform(15, 40)
        features["weather_severity"] = min(100, features.get("weather_severity", 20) + rng.uniform(20, 40))

    elif incident_type == "cyclone_storm":
        features["wind_speed_kmph"] = features.get("wind_speed_kmph", 12) + rng.uniform(40, 100)
        features["rainfall_mmph"] = features.get("rainfall_mmph", 5) + rng.uniform(15, 50)
        features["weather_severity"] = min(100, features.get("weather_severity", 20) + rng.uniform(40, 70))
        features["visibility_km"] = max(0.1, features.get("visibility_km", 8) - rng.uniform(4, 7))

    elif incident_type == "fire":
        features["aqi"] = features.get("aqi", 75) + rng.uniform(100, 300)
        features["visibility_km"] = max(0.5, features.get("visibility_km", 8) - rng.uniform(2, 5))

    elif incident_type in ("crime_robbery", "crime_assault"):
        features["crime_rate_per_100k"] = features.get("crime_rate_per_100k", 190) * rng.uniform(1.2, 2.0)

    elif incident_type == "road_accident":
        features["road_accident_hotspot_risk"] = min(1.0,
            features.get("road_accident_hotspot_risk", 0.2) + rng.uniform(0.3, 0.7))

    elif incident_type == "medical_emergency":
        features["nearest_hospital_proxy_km"] = features.get("nearest_hospital_proxy_km", 5) + rng.uniform(5, 20)

    elif incident_type == "stranded":
        features["nearest_hospital_proxy_km"] = features.get("nearest_hospital_proxy_km", 5) + rng.uniform(10, 30)
        features["emergency_availability_score"] = max(0, features.get("emergency_availability_score", 40) - 30)


def train_incident_classifier() -> dict:
    """Train the incident type classifier."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # Load or generate training data
    data_path = TRAINING_DIR / "incident_classification.parquet"
    if not data_path.exists():
        print("Generating incident classification training data...")
        df = generate_incident_training_data()
    else:
        df = pd.read_parquet(data_path)
        print(f"Loaded {len(df)} incident samples")

    # Encode labels
    le = LabelEncoder()
    df["label"] = le.fit_transform(df["incident_type"])

    # Features — same as safety scorer but without target
    exclude = {
        "incident_type", "label",
        "grid_lat", "grid_lon", "cell_id",
        "source_file", "date", "city", "state", "district",
        "base_danger", "safety_score_target",
    }
    feature_cols = [c for c in df.columns if c not in exclude
                    and df[c].dtype in [np.float64, np.float32, np.int64, np.int32, float, int]]

    print(f"Features: {len(feature_cols)}")
    print(f"Classes: {list(le.classes_)}")

    X = df[feature_cols].values
    y = df["label"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y,
    )

    # Train
    print("\nTraining LightGBM incident classifier...")

    train_data = lgb.Dataset(X_train, label=y_train)
    val_data = lgb.Dataset(X_test, label=y_test, reference=train_data)

    params = {
        "objective": "multiclass",
        "num_class": len(le.classes_),
        "metric": "multi_logloss",
        "max_depth": INCIDENT_CLASSIFIER_PARAMS["max_depth"],
        "learning_rate": INCIDENT_CLASSIFIER_PARAMS["learning_rate"],
        "num_leaves": INCIDENT_CLASSIFIER_PARAMS["num_leaves"],
        "min_child_samples": INCIDENT_CLASSIFIER_PARAMS["min_child_samples"],
        "verbose": -1,
    }

    callbacks = [
        lgb.early_stopping(stopping_rounds=30),
        lgb.log_evaluation(period=50),
    ]

    model = lgb.train(
        params=params,
        train_set=train_data,
        valid_sets=[val_data],
        valid_names=["val"],
        num_boost_round=INCIDENT_CLASSIFIER_PARAMS["n_estimators"],
        callbacks=callbacks,
    )

    # Evaluate
    y_pred_proba = model.predict(X_test)
    y_pred = np.argmax(y_pred_proba, axis=1)

    report = classification_report(
        y_test, y_pred,
        target_names=le.classes_,
        output_dict=True,
    )

    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Save
    model.save_model(str(MODEL_DIR / "incident_classifier.lgb"))
    joblib.dump(le, MODEL_DIR / "label_encoder.joblib")
    joblib.dump(feature_cols, MODEL_DIR / "feature_columns.joblib")

    metadata = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "n_classes": len(le.classes_),
        "classes": list(le.classes_),
        "n_features": len(feature_cols),
        "n_samples": len(df),
        "accuracy": float(report["accuracy"]),
        "per_class_f1": {
            cls: float(report[cls]["f1-score"]) for cls in le.classes_
        },
    }

    with open(MODEL_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nModel saved to {MODEL_DIR}")
    return metadata


if __name__ == "__main__":
    train_incident_classifier()