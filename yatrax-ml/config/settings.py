"""
Central configuration for all paths, constants, and hyperparameters.
Every other file imports from here — single source of truth.
"""

from pathlib import Path

# ─── PATHS ───
ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
TRAINING_DIR = DATA_DIR / "training"
MODELS_DIR = ROOT_DIR / "models"

# Create all directories
for d in [RAW_DIR, PROCESSED_DIR, TRAINING_DIR, MODELS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Raw data subdirectories
RAW_CRIME = RAW_DIR / "crime"
RAW_WEATHER = RAW_DIR / "weather"
RAW_AQI = RAW_DIR / "air_quality"
RAW_WATER = RAW_DIR / "water_quality"
RAW_ACCIDENTS = RAW_DIR / "road_accidents"
RAW_DISASTERS = RAW_DIR / "disasters"
RAW_TERRAIN = RAW_DIR / "terrain"
RAW_HEALTH = RAW_DIR / "health"
RAW_POPULATION = RAW_DIR / "population"
RAW_TOURISM = RAW_DIR / "tourism"
RAW_FIRE = RAW_DIR / "fire"
RAW_NOISE = RAW_DIR / "noise"

for d in [
    RAW_CRIME, RAW_WEATHER, RAW_AQI, RAW_WATER, RAW_ACCIDENTS,
    RAW_DISASTERS, RAW_TERRAIN, RAW_HEALTH, RAW_POPULATION,
    RAW_TOURISM, RAW_FIRE, RAW_NOISE,
]:
    d.mkdir(parents=True, exist_ok=True)

# ─── SPATIAL GRID ───
# India bounding box
INDIA_LAT_MIN = 6.0
INDIA_LAT_MAX = 37.0
INDIA_LON_MIN = 68.0
INDIA_LON_MAX = 98.0

# Grid resolution: 0.1 degree ≈ 11km cells
GRID_RESOLUTION_DEG = 0.1

# ─── TEMPORAL ───
SEASONS = {
    "summer": [3, 4, 5],
    "monsoon": [6, 7, 8, 9],
    "post_monsoon": [10, 11],
    "winter": [12, 1, 2],
}

# ─── MODEL HYPERPARAMETERS ───

# Model 1: Safety Scorer (LightGBM)
SAFETY_SCORER_PARAMS = {
    "n_estimators": 800,
    "max_depth": 10,
    "learning_rate": 0.03,
    "num_leaves": 63,
    "min_child_samples": 30,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "reg_alpha": 0.1,
    "reg_lambda": 1.0,
    "random_state": 42,
}

# Model 2: Trajectory Forecaster (LSTM)
TRAJECTORY_PARAMS = {
    "history_hours": 24,
    "forecast_hours": 12,
    "lstm_units": 128,
    "attention_heads": 4,
    "dropout": 0.2,
    "batch_size": 128,
    "epochs": 100,
    "learning_rate": 1e-3,
}

# Model 3: Anomaly Detector
ANOMALY_PARAMS = {
    "isolation_forest": {
        "n_estimators": 200,
        "contamination": 0.08,
        "max_features": 0.7,
    },
    "autoencoder": {
        "timesteps": 12,
        "features_per_step": 15,
        "encoding_dim": 16,
        "epochs": 80,
        "batch_size": 64,
    },
}

# Model 4: Incident Classifier (LightGBM)
INCIDENT_CLASSIFIER_PARAMS = {
    "n_estimators": 300,
    "max_depth": 8,
    "learning_rate": 0.05,
    "num_leaves": 31,
    "min_child_samples": 20,
    "class_weight": "balanced",
    "random_state": 42,
}

# Model 5: Spatial Risk (Graph or fallback diffusion)
SPATIAL_RISK_PARAMS = {
    "cell_size_km": 5.0,
    "gnn_hidden_dim": 64,
    "gnn_heads": 4,
    "gnn_layers": 3,
    "decay_hours_default": 12.0,
}

# Model 6: Alert Timing
ALERT_TIMING_PARAMS = {
    "context_dim": 15,
    "hidden_dim": 64,
    "action_space": ["wait", "soft_nudge", "standard_alert", "urgent_alert", "emergency"],
}

# ─── TRAINING ───
TRAIN_SPLIT = 0.70
VAL_SPLIT = 0.15
TEST_SPLIT = 0.15
RANDOM_SEED = 42