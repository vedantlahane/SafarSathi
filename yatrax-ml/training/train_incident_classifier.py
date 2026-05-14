"""
Model 4: Incident Type Classifier

Improved version:
- cleaner, more balanced incident training-data generation
- nearest-cell lookup with KDTree fallback
- stronger class balancing and sample weighting
- safer temporal/context augmentation
- strict spatial split by cell_id / grid coordinates when available
- robust evaluation with zero-division-safe reporting
- better metadata and artifact saving

Uses LightGBM multiclass classification.
"""

from __future__ import annotations

import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from config.settings import (
    PROCESSED_DIR,
    TRAINING_DIR,
    MODELS_DIR,
    INCIDENT_CLASSIFIER_PARAMS,
    RANDOM_SEED,
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

MODEL_DIR = MODELS_DIR / "incident_classifier"

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

TARGET_SAMPLES_PER_CLASS = 2200
MAX_SAMPLES_FROM_SOURCE = {
    "disaster": 9000,
    "accident": 7000,
    "fire": 7000,
    "crime": 5000,
    "context": 5000,
}

# ============================================================
# GRID LOOKUP
# ============================================================

def _load_unified_grid() -> pd.DataFrame:
    unified_path = PROCESSED_DIR / "unified_grid.parquet"
    if not unified_path.exists():
        raise FileNotFoundError("Run merge_sources.py first to create unified_grid.parquet")
    grid = pd.read_parquet(unified_path)
    if "grid_lat" not in grid.columns or "grid_lon" not in grid.columns:
        raise RuntimeError("unified_grid.parquet is missing grid_lat/grid_lon")
    return grid


def _build_grid_tree(grid: pd.DataFrame):
    """
    Build a KDTree for nearest-cell lookup.
    """
    coords = grid[["grid_lat", "grid_lon"]].to_numpy(dtype=float)

    try:
        from scipy.spatial import cKDTree  # type: ignore

        return cKDTree(coords), coords
    except Exception:
        return None, coords


def _nearest_grid_row(
    grid: pd.DataFrame,
    lat: float | None,
    lon: float | None,
    tree=None,
    coords: np.ndarray | None = None,
) -> dict | None:
    """
    Return the nearest grid row as a feature dict.
    """
    if lat is None or lon is None or pd.isna(lat) or pd.isna(lon):
        return None

    if grid.empty:
        return None

    target = np.array([float(lat), float(lon)], dtype=float)

    if tree is not None and coords is not None:
        try:
            _, idx = tree.query(target, k=1)
            row = grid.iloc[int(idx)]
            return row.to_dict()
        except Exception:
            pass

    # Fallback brute force
    dists = (grid["grid_lat"] - float(lat)) ** 2 + (grid["grid_lon"] - float(lon)) ** 2
    idx = int(dists.idxmin())
    row = grid.loc[idx]
    return row.to_dict()


def _grid_row_to_features(row: pd.Series) -> dict[str, Any]:
    """
    Copy a grid row into a mutable feature dict, excluding only hard identifiers.
    """
    features = row.to_dict()
    features.pop("cell_id", None)
    return features


def _safe_numeric(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or pd.isna(value):
            return float(default)
        return float(value)
    except Exception:
        return float(default)


# ============================================================
# INCIDENT-SPECIFIC AUGMENTATION
# ============================================================

def _time_context_for_label(incident_type: str, rng: np.random.Generator) -> tuple[int, int]:
    """
    Return a realistic (hour, month) context for each incident type.
    """
    if incident_type in {"flood", "landslide"}:
        hour = int(rng.choice([0, 1, 2, 3, 4, 5, 18, 19, 20, 21, 22, 23]))
        month = int(rng.choice([6, 7, 8, 9]))
        return hour, month

    if incident_type == "cyclone_storm":
        hour = int(rng.choice([0, 1, 2, 3, 4, 5, 18, 19, 20, 21, 22, 23]))
        month = int(rng.choice([5, 6, 7, 8, 9, 10]))
        return hour, month

    if incident_type == "earthquake":
        hour = int(rng.integers(0, 24))
        month = int(rng.integers(1, 13))
        return hour, month

    if incident_type == "fire":
        hour = int(rng.choice([11, 12, 13, 14, 15, 16, 17, 18]))
        month = int(rng.choice([3, 4, 5, 10, 11]))
        return hour, month

    if incident_type in {"crime_robbery", "crime_assault"}:
        hour = int(rng.choice([0, 1, 2, 3, 4, 20, 21, 22, 23]))
        month = int(rng.integers(1, 13))
        return hour, month

    if incident_type == "road_accident":
        hour = int(rng.choice([6, 7, 8, 9, 17, 18, 19, 20, 21]))
        month = int(rng.integers(1, 13))
        return hour, month

    if incident_type == "medical_emergency":
        hour = int(rng.integers(0, 24))
        month = int(rng.integers(1, 13))
        return hour, month

    if incident_type == "stranded":
        hour = int(rng.choice([0, 1, 2, 3, 4, 22, 23]))
        month = int(rng.integers(1, 13))
        return hour, month

    if incident_type == "wildlife":
        hour = int(rng.choice([5, 6, 7, 17, 18, 19, 20]))
        month = int(rng.integers(1, 13))
        return hour, month

    hour = int(rng.integers(0, 24))
    month = int(rng.integers(1, 13))
    return hour, month


def _jitter_numeric_context(features: dict[str, Any], rng: np.random.Generator, scale: float = 0.03) -> None:
    """
    Add small multiplicative noise to selected continuous features to reduce memorization.
    """
    jitter_cols = [
        "crime_rate_per_100k",
        "road_accident_hotspot_risk",
        "accident_severity_index",
        "flood_risk",
        "earthquake_risk",
        "cyclone_risk",
        "landslide_risk",
        "fire_risk_index",
        "fire_intensity_score",
        "aqi",
        "water_contamination_risk",
        "weather_severity",
        "nearest_hospital_proxy_km",
        "population_density_per_km2",
        "isolation_score",
        "noise_level_proxy",
        "humidity_pct",
        "temperature_c",
        "wind_speed_kmph",
        "rainfall_mmph",
        "visibility_km",
    ]

    for col in jitter_cols:
        if col in features and features[col] is not None and pd.notna(features[col]):
            val = float(features[col])
            if val == 0:
                continue
            noise = rng.normal(0.0, scale)
            new_val = val * (1.0 + noise)
            if col in {"road_accident_hotspot_risk", "flood_risk", "earthquake_risk", "cyclone_risk", "landslide_risk", "fire_risk_index", "fire_intensity_score", "water_contamination_risk", "isolation_score"}:
                features[col] = float(np.clip(new_val, 0.0, 1.0))
            else:
                features[col] = float(max(0.0, new_val))


def _add_incident_specific_noise(features: dict[str, Any], incident_type: str, rng: np.random.Generator) -> None:
    """
    Modify the base cell context to look like a realistic incident context.
    """
    if incident_type == "flood":
        features["rainfall_mmph"] = _safe_numeric(features.get("rainfall_mmph", 5.0)) + rng.uniform(20, 60)
        features["weather_severity"] = min(100.0, _safe_numeric(features.get("weather_severity", 20.0)) + rng.uniform(30, 60))
        features["visibility_km"] = max(0.2, _safe_numeric(features.get("visibility_km", 8.0)) - rng.uniform(3, 6))
        features["humidity_pct"] = min(100.0, _safe_numeric(features.get("humidity_pct", 70.0)) + rng.uniform(10, 25))

    elif incident_type == "landslide":
        features["rainfall_mmph"] = _safe_numeric(features.get("rainfall_mmph", 5.0)) + rng.uniform(15, 40)
        features["weather_severity"] = min(100.0, _safe_numeric(features.get("weather_severity", 20.0)) + rng.uniform(20, 40))
        features["elevation_m"] = max(0.0, _safe_numeric(features.get("elevation_m", 100.0)) + rng.uniform(-150, 150))

    elif incident_type == "cyclone_storm":
        features["wind_speed_kmph"] = _safe_numeric(features.get("wind_speed_kmph", 12.0)) + rng.uniform(40, 100)
        features["rainfall_mmph"] = _safe_numeric(features.get("rainfall_mmph", 5.0)) + rng.uniform(15, 50)
        features["weather_severity"] = min(100.0, _safe_numeric(features.get("weather_severity", 20.0)) + rng.uniform(40, 70))
        features["visibility_km"] = max(0.1, _safe_numeric(features.get("visibility_km", 8.0)) - rng.uniform(4, 7))
        features["pressure_mb"] = max(900.0, _safe_numeric(features.get("pressure_mb", 1010.0)) - rng.uniform(15, 50))

    elif incident_type == "fire":
        features["aqi"] = _safe_numeric(features.get("aqi", 75.0)) + rng.uniform(100, 300)
        features["visibility_km"] = max(0.5, _safe_numeric(features.get("visibility_km", 8.0)) - rng.uniform(2, 5))
        features["temperature_c"] = _safe_numeric(features.get("temperature_c", 28.0)) + rng.uniform(2, 10)

    elif incident_type in {"crime_robbery", "crime_assault"}:
        features["crime_rate_per_100k"] = _safe_numeric(features.get("crime_rate_per_100k", 190.0)) * rng.uniform(1.2, 2.0)
        features["tourist_targeted_crime_index"] = min(1.0, _safe_numeric(features.get("tourist_targeted_crime_index", 0.1)) + rng.uniform(0.1, 0.5))
        features["gender_safety_index"] = max(0.0, _safe_numeric(features.get("gender_safety_index", 0.8)) - rng.uniform(0.05, 0.2))

    elif incident_type == "road_accident":
        features["road_accident_hotspot_risk"] = min(1.0, _safe_numeric(features.get("road_accident_hotspot_risk", 0.2)) + rng.uniform(0.3, 0.7))
        features["accident_severity_index"] = min(1.0, _safe_numeric(features.get("accident_severity_index", 0.2)) + rng.uniform(0.2, 0.6))
        features["visibility_km"] = max(0.2, _safe_numeric(features.get("visibility_km", 8.0)) - rng.uniform(1, 4))

    elif incident_type == "medical_emergency":
        features["nearest_hospital_proxy_km"] = _safe_numeric(features.get("nearest_hospital_proxy_km", 5.0)) + rng.uniform(5, 20)
        features["ambulance_response_score"] = max(0.0, _safe_numeric(features.get("ambulance_response_score", 60.0)) - rng.uniform(5, 25))

    elif incident_type == "stranded":
        features["nearest_hospital_proxy_km"] = _safe_numeric(features.get("nearest_hospital_proxy_km", 5.0)) + rng.uniform(10, 30)
        features["ambulance_response_score"] = max(0.0, _safe_numeric(features.get("ambulance_response_score", 60.0)) - rng.uniform(10, 35))
        features["isolation_score"] = min(1.0, _safe_numeric(features.get("isolation_score", 0.4)) + rng.uniform(0.1, 0.4))

    elif incident_type == "wildlife":
        features["elevation_m"] = _safe_numeric(features.get("elevation_m", 100.0)) + rng.uniform(50, 500)
        features["isolation_score"] = min(1.0, _safe_numeric(features.get("isolation_score", 0.4)) + rng.uniform(0.05, 0.3))

    elif incident_type == "earthquake":
        features["earthquake_risk"] = min(1.0, _safe_numeric(features.get("earthquake_risk", 0.2)) + rng.uniform(0.3, 0.7))
        features["elevation_m"] = _safe_numeric(features.get("elevation_m", 100.0)) + rng.uniform(-100, 300)

    elif incident_type == "unknown":
        # Slight perturbation only
        pass


def _make_sample(
    base_features: dict[str, Any],
    incident_type: str,
    rng: np.random.Generator,
    source_kind: str,
) -> dict[str, Any]:
    """
    Create a single labeled sample from a base cell context.
    """
    f = dict(base_features)

    hour, month = _time_context_for_label(incident_type, rng)

    f["incident_type"] = incident_type
    f["source_kind"] = source_kind
    f["is_synthetic"] = 1 if source_kind == "synthetic" else 0
    f["hour"] = hour
    f["month"] = month
    f["day_of_week"] = int(rng.integers(0, 7))

    _add_incident_specific_noise(f, incident_type, rng)
    _jitter_numeric_context(f, rng)

    return f


def _row_to_base_features(row: pd.Series) -> dict[str, Any]:
    """
    Keep all grid fields except hard identifiers.
    """
    features = row.to_dict()
    features.pop("cell_id", None)
    return features


# ============================================================
# SOURCE-SPECIFIC GENERATORS
# ============================================================

def _generate_disaster_samples(grid: pd.DataFrame, tree, coords, rng: np.random.Generator) -> list[dict[str, Any]]:
    path = PROCESSED_DIR / "disaster_grid.parquet"
    if not path.exists():
        return []

    disasters = pd.read_parquet(path)
    if disasters.empty:
        return []

    count_cols = [
        "flood_count",
        "earthquake_count",
        "cyclone_count",
        "landslide_count",
    ]
    existing = [c for c in count_cols if c in disasters.columns]
    if not existing:
        return []

    mask = disasters[existing].fillna(0).sum(axis=1) > 0
    disasters = disasters[mask].copy()

    if disasters.empty:
        return []

    if len(disasters) > MAX_SAMPLES_FROM_SOURCE["disaster"]:
        disasters = disasters.sample(MAX_SAMPLES_FROM_SOURCE["disaster"], random_state=RANDOM_SEED)

    rows: list[dict[str, Any]] = []

    mapping = [
        ("flood", "flood_count"),
        ("earthquake", "earthquake_count"),
        ("cyclone_storm", "cyclone_count"),
        ("landslide", "landslide_count"),
    ]

    for _, src in disasters.iterrows():
        lat = src.get("grid_lat", src.get("latitude"))
        lon = src.get("grid_lon", src.get("longitude"))
        base = _nearest_grid_row(grid, lat, lon, tree=tree, coords=coords)
        if base is None:
            continue

        base_features = _grid_row_to_features(pd.Series(base))

        for label, count_col in mapping:
            val = _safe_numeric(src.get(count_col, 0.0))
            if val <= 0:
                continue

            # Use a gentle expansion instead of exploding counts.
            n_samples = int(np.clip(np.ceil(np.log1p(val) * 2.0), 1, 8))

            for _ in range(n_samples):
                rows.append(_make_sample(base_features, label, rng, source_kind="real"))

    return rows


def _generate_accident_samples(grid: pd.DataFrame, tree, coords, rng: np.random.Generator) -> list[dict[str, Any]]:
    path = PROCESSED_DIR / "accident_grid.parquet"
    if not path.exists():
        return []

    accidents = pd.read_parquet(path)
    if accidents.empty:
        return []

    if "total_accidents" in accidents.columns:
        accidents = accidents[pd.to_numeric(accidents["total_accidents"], errors="coerce").fillna(0) > 0].copy()

    if accidents.empty:
        return []

    if len(accidents) > MAX_SAMPLES_FROM_SOURCE["accident"]:
        accidents = accidents.sample(MAX_SAMPLES_FROM_SOURCE["accident"], random_state=RANDOM_SEED)

    rows: list[dict[str, Any]] = []

    for _, src in accidents.iterrows():
        lat = src.get("grid_lat", src.get("latitude"))
        lon = src.get("grid_lon", src.get("longitude"))
        base = _nearest_grid_row(grid, lat, lon, tree=tree, coords=coords)
        if base is None:
            continue

        base_features = _grid_row_to_features(pd.Series(base))
        severity = _safe_numeric(src.get("accident_severity_index", src.get("avg_severity", 1.0)), default=1.0)

        n_samples = int(np.clip(np.ceil(np.log1p(severity + 1.0) * 2.0), 1, 6))
        for _ in range(n_samples):
            rows.append(_make_sample(base_features, "road_accident", rng, source_kind="real"))

    return rows


def _generate_fire_samples(grid: pd.DataFrame, tree, coords, rng: np.random.Generator) -> list[dict[str, Any]]:
    path = PROCESSED_DIR / "fire_grid.parquet"
    if not path.exists():
        return []

    fire = pd.read_parquet(path)
    if fire.empty:
        return []

    if "fire_count" in fire.columns:
        fire = fire[pd.to_numeric(fire["fire_count"], errors="coerce").fillna(0) > 0].copy()

    if fire.empty:
        return []

    if len(fire) > MAX_SAMPLES_FROM_SOURCE["fire"]:
        fire = fire.sample(MAX_SAMPLES_FROM_SOURCE["fire"], random_state=RANDOM_SEED)

    rows: list[dict[str, Any]] = []

    for _, src in fire.iterrows():
        lat = src.get("grid_lat", src.get("latitude"))
        lon = src.get("grid_lon", src.get("longitude"))
        base = _nearest_grid_row(grid, lat, lon, tree=tree, coords=coords)
        if base is None:
            continue

        base_features = _grid_row_to_features(pd.Series(base))
        fire_count = _safe_numeric(src.get("fire_count", 0.0))
        n_samples = int(np.clip(np.ceil(np.log1p(fire_count) * 1.5), 1, 5))
        for _ in range(n_samples):
            rows.append(_make_sample(base_features, "fire", rng, source_kind="real"))

    return rows


def _generate_crime_samples(grid: pd.DataFrame, tree, coords, rng: np.random.Generator) -> list[dict[str, Any]]:
    path = PROCESSED_DIR / "crime_grid.parquet"
    if not path.exists():
        return []

    crime = pd.read_parquet(path)
    if crime.empty:
        return []

    if "crime_rate_per_100k" not in crime.columns:
        return []

    crime_rate = pd.to_numeric(crime["crime_rate_per_100k"], errors="coerce").fillna(0)
    high_crime = crime[crime_rate > crime_rate.quantile(0.70)].copy()

    if high_crime.empty:
        return []

    if len(high_crime) > MAX_SAMPLES_FROM_SOURCE["crime"]:
        high_crime = high_crime.sample(MAX_SAMPLES_FROM_SOURCE["crime"], random_state=RANDOM_SEED)

    rows: list[dict[str, Any]] = []

    for _, src in high_crime.iterrows():
        lat = src.get("grid_lat", src.get("latitude"))
        lon = src.get("grid_lon", src.get("longitude"))
        base = _nearest_grid_row(grid, lat, lon, tree=tree, coords=coords)
        if base is None:
            continue

        base_features = _grid_row_to_features(pd.Series(base))

        for _ in range(6):
            label = rng.choice(["crime_robbery", "crime_assault"], p=[0.65, 0.35])
            rows.append(_make_sample(base_features, label, rng, source_kind="real"))

    return rows


def _generate_context_samples(grid: pd.DataFrame, tree, coords, rng: np.random.Generator) -> list[dict[str, Any]]:
    """
    Generate synthetic contextual incidents to cover classes without direct
    source datasets or to enrich sparse classes.
    """
    if grid.empty:
        return []

    sample_n = min(MAX_SAMPLES_FROM_SOURCE["context"], len(grid))
    sampled = grid.sample(sample_n, random_state=RANDOM_SEED).copy()

    rows: list[dict[str, Any]] = []

    for _, cell in sampled.iterrows():
        base_features = _grid_row_to_features(cell)

        hospital_dist = _safe_numeric(cell.get("nearest_hospital_proxy_km", 0.0), 0.0)
        weather_sev = _safe_numeric(cell.get("weather_severity", 0.0), 0.0)
        fire_risk = _safe_numeric(cell.get("fire_risk_index", 0.0), 0.0)
        landslide_risk = _safe_numeric(cell.get("landslide_risk", 0.0), 0.0)
        crime_rate = _safe_numeric(cell.get("crime_rate_per_100k", 0.0), 0.0)
        flood_risk = _safe_numeric(cell.get("flood_risk", 0.0), 0.0)

        # medical emergency
        if hospital_dist > 15 or weather_sev > 40 or rng.random() < 0.06:
            rows.append(_make_sample(base_features, "medical_emergency", rng, source_kind="synthetic"))

        # stranded
        if hospital_dist > 20 or _safe_numeric(cell.get("isolation_score", 0.0), 0.0) > 0.65:
            rows.append(_make_sample(base_features, "stranded", rng, source_kind="synthetic"))

        # wildlife
        if (fire_risk > 0.3 or landslide_risk > 0.25 or flood_risk > 0.3) and rng.random() < 0.35:
            rows.append(_make_sample(base_features, "wildlife", rng, source_kind="synthetic"))

        # unknown
        if rng.random() < 0.08:
            rows.append(_make_sample(base_features, "unknown", rng, source_kind="synthetic"))

        # extra crime / accident context in dense urban areas
        if crime_rate > 250 and rng.random() < 0.12:
            rows.append(_make_sample(base_features, rng.choice(["crime_robbery", "crime_assault"]), rng, source_kind="synthetic"))

        if weather_sev > 50 and rng.random() < 0.08:
            rows.append(_make_sample(base_features, "road_accident", rng, source_kind="synthetic"))

    return rows


# ============================================================
# BALANCING
# ============================================================

def _balance_classes(df: pd.DataFrame, target_per_class: int = TARGET_SAMPLES_PER_CLASS) -> pd.DataFrame:
    """
    Balance the final dataset by class, using replacement where needed.
    Also preserve source_kind and synthetic/real tags.
    """
    parts: list[pd.DataFrame] = []

    for cls in INCIDENT_TYPES:
        cls_df = df[df["incident_type"] == cls].copy()

        if cls_df.empty:
            continue

        if len(cls_df) >= target_per_class:
            sampled = cls_df.sample(target_per_class, random_state=RANDOM_SEED, replace=False)
        else:
            sampled = cls_df.sample(target_per_class, random_state=RANDOM_SEED, replace=True)

        parts.append(sampled)

    if not parts:
        raise RuntimeError("No classes available after generation.")

    out = pd.concat(parts, ignore_index=True)

    # Shuffle for training stability
    out = out.sample(frac=1.0, random_state=RANDOM_SEED).reset_index(drop=True)

    return out


def _ensure_all_classes(df: pd.DataFrame, grid: pd.DataFrame, tree, coords, rng: np.random.Generator) -> pd.DataFrame:
    """
    Guarantee every incident class exists at least a few times before balancing.
    """
    present = set(df["incident_type"].unique()) if not df.empty else set()
    missing = [cls for cls in INCIDENT_TYPES if cls not in present]

    if not missing:
        return df

    rows = df.to_dict(orient="records")
    sample_grid = grid.sample(min(len(grid), 500), random_state=RANDOM_SEED).copy()

    for cls in missing:
        for _, cell in sample_grid.iterrows():
            base_features = _grid_row_to_features(cell)
            rows.append(_make_sample(base_features, cls, rng, source_kind="synthetic"))
            if sum(1 for r in rows if r.get("incident_type") == cls) >= 100:
                break

    return pd.DataFrame(rows)


# ============================================================
# DATA GENERATION
# ============================================================

def generate_incident_training_data() -> pd.DataFrame:
    """
    Generate labeled incident classification training data from:
    - real incident-linked spatial data
    - contextual synthetic augmentation
    - class balancing
    """
    unified_path = PROCESSED_DIR / "unified_grid.parquet"
    if not unified_path.exists():
        raise FileNotFoundError("Run merge_sources.py first")

    grid = _load_unified_grid()
    rng = np.random.default_rng(RANDOM_SEED)

    tree, coords = _build_grid_tree(grid)

    rows: list[dict[str, Any]] = []

    # --------------------------------------------------------
    # Real disaster-derived samples
    # --------------------------------------------------------
    rows.extend(_generate_disaster_samples(grid, tree, coords, rng))

    # --------------------------------------------------------
    # Real accident-derived samples
    # --------------------------------------------------------
    rows.extend(_generate_accident_samples(grid, tree, coords, rng))

    # --------------------------------------------------------
    # Real fire-derived samples
    # --------------------------------------------------------
    rows.extend(_generate_fire_samples(grid, tree, coords, rng))

    # --------------------------------------------------------
    # Real crime-derived samples
    # --------------------------------------------------------
    rows.extend(_generate_crime_samples(grid, tree, coords, rng))

    # --------------------------------------------------------
    # Synthetic contextual samples
    # --------------------------------------------------------
    rows.extend(_generate_context_samples(grid, tree, coords, rng))

    if not rows:
        raise RuntimeError("No incident samples could be generated from available sources.")

    df = pd.DataFrame(rows)
    if df.empty:
        raise RuntimeError("Incident training dataframe is empty after generation.")

    # Default metadata columns
    if "source_kind" not in df.columns:
        df["source_kind"] = "synthetic"
    if "is_synthetic" not in df.columns:
        df["is_synthetic"] = 1

    # Ensure all incident classes exist at least a little
    df = _ensure_all_classes(df, grid, tree, coords, rng)

    # Balance classes
    df = _balance_classes(df, target_per_class=TARGET_SAMPLES_PER_CLASS)

    # Final cleanup
    df["is_synthetic"] = pd.to_numeric(df.get("is_synthetic", 1), errors="coerce").fillna(1).astype(int)

    print(f"Generated {len(df)} incident classification samples")
    print("Distribution:")
    print(df["incident_type"].value_counts().to_string())

    output_path = TRAINING_DIR / "incident_classification.parquet"
    df.to_parquet(output_path, index=False)
    print(f"Saved: {output_path}")

    return df


# ============================================================
# TRAINING HELPERS
# ============================================================

def _can_stratify(y: np.ndarray) -> bool:
    counts = Counter(y)
    return all(c >= 2 for c in counts.values())


def _get_feature_columns(df: pd.DataFrame) -> list[str]:
    """
    Keep numeric contextual features only.
    """
    exclude = {
        "incident_type",
        "label",
        "grid_lat",
        "grid_lon",
        "cell_id",
        "source_file",
        "date",
        "city",
        "state",
        "district",
        "base_danger",
        "safety_score_target",
        "source_kind",
        "is_synthetic",
        "sample_weight",
    }

    exclude.update(c for c in df.columns if c.endswith("_data_available"))
    exclude.update(c for c in df.columns if c.endswith("_confidence"))

    feature_cols = [
        c for c in df.columns
        if c not in exclude and pd.api.types.is_numeric_dtype(df[c])
    ]

    good: list[str] = []
    for c in feature_cols:
        n_unique = df[c].nunique(dropna=True)
        if n_unique >= 3:
            good.append(c)
        else:
            print(f"  ⚠️ Dropping constant/near-constant feature: {c} (unique={n_unique})")

    return good


def _build_sample_weights(df: pd.DataFrame) -> np.ndarray:
    """
    Downweight synthetic rows slightly and give more weight to
    higher-quality contextual samples.
    """
    weight = np.ones(len(df), dtype=float)

    if "is_synthetic" in df.columns:
        is_syn = pd.to_numeric(df["is_synthetic"], errors="coerce").fillna(1).to_numpy()
        weight *= np.where(is_syn > 0, 0.80, 1.05)

    if "feature_completeness" in df.columns:
        comp = pd.to_numeric(df["feature_completeness"], errors="coerce").fillna(0.5).to_numpy()
        weight *= (0.75 + 0.5 * comp)

    if "coverage_score" in df.columns:
        cov = pd.to_numeric(df["coverage_score"], errors="coerce").fillna(0.5).to_numpy()
        weight *= (0.85 + 0.3 * cov)

    return np.clip(weight, 0.4, 1.8)


def _load_or_create_splits(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    train_path = TRAINING_DIR / "incident_train.parquet"
    val_path = TRAINING_DIR / "incident_val.parquet"
    test_path = TRAINING_DIR / "incident_test.parquet"

    if train_path.exists() and val_path.exists() and test_path.exists():
        return (
            pd.read_parquet(train_path),
            pd.read_parquet(val_path),
            pd.read_parquet(test_path),
        )

    # Strict group split when possible
    if "cell_id" in df.columns:
        groups = df["cell_id"].astype(str)
        unique_groups = df[["cell_id"]].drop_duplicates().sample(frac=1.0, random_state=RANDOM_SEED).reset_index(drop=True)
        n = len(unique_groups)
        n_train = int(n * 0.70)
        n_val = int(n * 0.15)

        train_keys = unique_groups.iloc[:n_train]
        val_keys = unique_groups.iloc[n_train:n_train + n_val]
        test_keys = unique_groups.iloc[n_train + n_val:]

        train_df = df.merge(train_keys, on=["cell_id"], how="inner")
        val_df = df.merge(val_keys, on=["cell_id"], how="inner")
        test_df = df.merge(test_keys, on=["cell_id"], how="inner")

    elif {"grid_lat", "grid_lon"}.issubset(df.columns):
        unique_cells = df[["grid_lat", "grid_lon"]].drop_duplicates().sample(frac=1.0, random_state=RANDOM_SEED).reset_index(drop=True)
        n = len(unique_cells)
        n_train = int(n * 0.70)
        n_val = int(n * 0.15)

        train_keys = unique_cells.iloc[:n_train]
        val_keys = unique_cells.iloc[n_train:n_train + n_val]
        test_keys = unique_cells.iloc[n_train + n_val:]

        train_df = df.merge(train_keys, on=["grid_lat", "grid_lon"], how="inner")
        val_df = df.merge(val_keys, on=["grid_lat", "grid_lon"], how="inner")
        test_df = df.merge(test_keys, on=["grid_lat", "grid_lon"], how="inner")
    else:
        train_df, temp_df = train_test_split(df, test_size=0.30, random_state=RANDOM_SEED)
        val_df, test_df = train_test_split(temp_df, test_size=0.50, random_state=RANDOM_SEED)

    train_df.to_parquet(train_path, index=False)
    val_df.to_parquet(val_path, index=False)
    test_df.to_parquet(test_path, index=False)

    print(f"Saved splits: train={len(train_df)}, val={len(val_df)}, test={len(test_df)}")
    return train_df, val_df, test_df


# ============================================================
# TRAINING
# ============================================================

def train_incident_classifier() -> dict:
    """
    Train the LightGBM multiclass incident classifier.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    data_path = TRAINING_DIR / "incident_classification.parquet"
    if not data_path.exists():
        print("Generating incident classification training data...")
        df = generate_incident_training_data()
    else:
        df = pd.read_parquet(data_path)
        if "incident_type" not in df.columns or df.empty:
            print("Cached incident dataset is invalid, regenerating...")
            df = generate_incident_training_data()
        else:
            class_counts = df["incident_type"].value_counts()
            if class_counts.min() < 100:
                print("Cached dataset is too small for some classes, regenerating...")
                df = generate_incident_training_data()
            else:
                print(f"Loaded {len(df)} incident samples")

    if "incident_type" not in df.columns:
        raise KeyError("incident_type missing from training data")

    # Label encode
    le = LabelEncoder()
    df["label"] = le.fit_transform(df["incident_type"])

    feature_cols = _get_feature_columns(df)
    print(f"Features: {len(feature_cols)}")
    print(f"Classes: {list(le.classes_)}")

    if len(feature_cols) < 5:
        raise RuntimeError("Too few usable features for incident classification.")

    # Split
    if {"cell_id", "grid_lat", "grid_lon"}.intersection(df.columns):
        # Prefer the cached split if available
        train_df, val_df, test_df = _load_or_create_splits(df)
    else:
        train_df, val_df, test_df = train_test_split(
            df,
            test_size=0.2,
            random_state=RANDOM_SEED,
            stratify=df["label"] if _can_stratify(df["label"].to_numpy()) else None,
        ), None, None
        # The above branch is not used in practice, but kept as fallback.

    # If split files exist, they might not yet have label column; ensure consistency
    if val_df is None or test_df is None:
        raise RuntimeError("Train/val/test split creation failed.")

    X_train = train_df[feature_cols]
    y_train = train_df["label"].astype(int).to_numpy()

    X_val = val_df[feature_cols]
    y_val = val_df["label"].astype(int).to_numpy()

    X_test = test_df[feature_cols]
    y_test = test_df["label"].astype(int).to_numpy()

    # Sample weights
    train_weight = _build_sample_weights(train_df)
    val_weight = _build_sample_weights(val_df)

    # Class weights (inverse frequency, normalized)
    class_counts = train_df["label"].value_counts().sort_index()
    n_classes = len(le.classes_)
    total = float(class_counts.sum())
    class_weight = {
        int(lbl): total / (n_classes * float(cnt))
        for lbl, cnt in class_counts.items()
        if cnt > 0
    }
    train_weight = train_weight * np.array([class_weight.get(int(lbl), 1.0) for lbl in y_train], dtype=float)
    val_weight = val_weight * np.array([class_weight.get(int(lbl), 1.0) for lbl in y_val], dtype=float)

    train_data = lgb.Dataset(
        X_train,
        label=y_train,
        weight=train_weight,
        feature_name=feature_cols,
        free_raw_data=False,
    )

    val_data = lgb.Dataset(
        X_val,
        label=y_val,
        weight=val_weight,
        reference=train_data,
        feature_name=feature_cols,
        free_raw_data=False,
    )

    print("\nTraining LightGBM incident classifier...")

    params = {
        "objective": "multiclass",
        "num_class": len(le.classes_),
        "metric": "multi_logloss",
        "learning_rate": INCIDENT_CLASSIFIER_PARAMS.get("learning_rate", 0.05),
        "num_leaves": INCIDENT_CLASSIFIER_PARAMS.get("num_leaves", 63),
        "max_depth": INCIDENT_CLASSIFIER_PARAMS.get("max_depth", -1),
        "min_child_samples": INCIDENT_CLASSIFIER_PARAMS.get("min_child_samples", 25),
        "feature_fraction": INCIDENT_CLASSIFIER_PARAMS.get("feature_fraction", 0.85),
        "bagging_fraction": INCIDENT_CLASSIFIER_PARAMS.get("bagging_fraction", 0.80),
        "bagging_freq": INCIDENT_CLASSIFIER_PARAMS.get("bagging_freq", 1),
        "lambda_l2": INCIDENT_CLASSIFIER_PARAMS.get("lambda_l2", 1.0),
        "verbosity": -1,
        "seed": RANDOM_SEED,
        "feature_fraction_seed": RANDOM_SEED,
        "bagging_seed": RANDOM_SEED,
        "data_random_seed": RANDOM_SEED,
        
        # 👇 ADD THESE TWO LINES 👇
        "device": INCIDENT_CLASSIFIER_PARAMS.get("device", "cpu"),
        "device_type": INCIDENT_CLASSIFIER_PARAMS.get("device_type", "cpu")
    }

    num_boost_round = int(INCIDENT_CLASSIFIER_PARAMS.get("n_estimators", 600))

    callbacks = [
        lgb.early_stopping(stopping_rounds=40),
        lgb.log_evaluation(period=50),
    ]

    model = lgb.train(
        params=params,
        train_set=train_data,
        valid_sets=[train_data, val_data],
        valid_names=["train", "val"],
        num_boost_round=num_boost_round,
        callbacks=callbacks,
    )

    # --------------------------------------------------------
    # EVALUATION
    # --------------------------------------------------------
    y_proba = model.predict(X_test)
    y_pred = np.argmax(y_proba, axis=1)

    labels = list(range(len(le.classes_)))
    report = classification_report(
        y_test,
        y_pred,
        labels=labels,
        target_names=le.classes_,
        output_dict=True,
        zero_division=0,
    )

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            y_pred,
            labels=labels,
            target_names=le.classes_,
            zero_division=0,
        )
    )

    cm = confusion_matrix(y_test, y_pred, labels=labels)
    cm_df = pd.DataFrame(cm, index=le.classes_, columns=le.classes_)

    # --------------------------------------------------------
    # SAVE ARTIFACTS
    # --------------------------------------------------------
    model_path = MODEL_DIR / "incident_classifier.lgb"
    model.save_model(str(model_path))

    joblib.dump(le, MODEL_DIR / "label_encoder.joblib")
    joblib.dump(feature_cols, MODEL_DIR / "feature_columns.joblib")

    metadata = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "n_classes": len(le.classes_),
        "classes": list(le.classes_),
        "n_features": len(feature_cols),
        "n_samples": int(len(df)),
        "train_samples": int(len(train_df)),
        "val_samples": int(len(val_df)),
        "test_samples": int(len(test_df)),
        "accuracy": float(report["accuracy"]),
        "macro_f1": float(report["macro avg"]["f1-score"]),
        "weighted_f1": float(report["weighted avg"]["f1-score"]),
        "per_class_f1": {
            cls: float(report[cls]["f1-score"]) if cls in report else 0.0
            for cls in le.classes_
        },
        "params": {**params, "n_estimators": num_boost_round},
    }

    with open(MODEL_DIR / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    cm_df.to_csv(MODEL_DIR / "confusion_matrix.csv", index=True)

    # Optional feature importance
    try:
        importance = model.feature_importance(importance_type="gain")
        imp_df = pd.DataFrame(
            {
                "feature": feature_cols,
                "importance_gain": importance,
            }
        ).sort_values("importance_gain", ascending=False)
        imp_df.to_csv(MODEL_DIR / "feature_importance.csv", index=False)
        metadata["top_features"] = imp_df.head(20).to_dict(orient="records")
    except Exception:
        pass

    print(f"\nModel saved to {MODEL_DIR}")
    print(f"Metadata saved to {MODEL_DIR / 'metadata.json'}")

    return metadata


# ============================================================
# LOADING / INFERENCE
# ============================================================

def load_incident_classifier() -> tuple[lgb.Booster, LabelEncoder, list[str]]:
    model_path = MODEL_DIR / "incident_classifier.lgb"
    le_path = MODEL_DIR / "label_encoder.joblib"
    feat_path = MODEL_DIR / "feature_columns.joblib"

    if not model_path.exists():
        raise FileNotFoundError(f"No trained model at {model_path}. Run training first.")

    model = lgb.Booster(model_file=str(model_path))
    le: LabelEncoder = joblib.load(le_path)
    feature_cols: list[str] = joblib.load(feat_path)

    return model, le, feature_cols


def predict_incident_type(
    model: lgb.Booster,
    label_encoder: LabelEncoder,
    feature_cols: list[str],
    features: dict[str, float],
) -> dict[str, Any]:
    """
    Predict incident type for a single feature dict.
    """
    x = np.array([[features.get(col, np.nan) for col in feature_cols]], dtype=float)
    proba = model.predict(x)[0]

    top_idx = int(np.argmax(proba))
    top_label = label_encoder.inverse_transform([top_idx])[0]

    probs = {
        label_encoder.inverse_transform([i])[0]: float(p)
        for i, p in enumerate(proba)
    }

    return {
        "incident_type": top_label,
        "confidence": float(proba[top_idx]),
        "probabilities": probs,
    }


if __name__ == "__main__":
    train_incident_classifier()