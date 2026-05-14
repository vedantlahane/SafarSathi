"""
Unified grid cell lookup.

The unified_grid.parquet is the source of spatial risk features.
A tourist's (lat, lon) is snapped to the nearest 0.1° cell; features
from that cell are returned as a flat dict.

FIXED VERSION:
- deterministic cell_id lookup
- stable coordinate snapping
- safer nearest-neighbour fallback
- no floating-point mask failures
"""

from __future__ import annotations

import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

from app.config import get_settings

logger = logging.getLogger(__name__)

_REPO_ROOT = Path(__file__).resolve().parent.parent


# ============================================================
# FALLBACK DEFAULTS
# ============================================================

_STATIC_DEFAULTS: dict[str, float] = {
    "crime_rate_per_100k": 150.0,
    "crime_type_distribution_risk": 0.3,
    "gender_safety_index": 0.7,
    "tourist_targeted_crime_index": 0.2,
    "temperature_c": 28.0,
    "humidity_pct": 60.0,
    "wind_speed_kmph": 12.0,
    "rainfall_mmph": 2.0,
    "weather_severity": 20.0,
    "aqi": 100.0,
    "pm25": 45.0,
    "pm10": 75.0,
    "water_safety_score": 60.0,
    "water_contamination_risk": 0.2,
    "road_accident_hotspot_risk": 0.3,
    "accident_severity_index": 0.3,
    "flood_risk": 0.15,
    "earthquake_risk": 0.15,
    "cyclone_risk": 0.1,
    "landslide_risk": 0.1,
    "total_events": 3.0,
    "fire_risk_index": 0.15,
    "fire_intensity_score": 0.1,
    "nearest_hospital_proxy_km": 20.0,
    "ambulance_response_score": 30.0,
    "elevation_m": 300.0,
}


# ============================================================
# LOAD MEDIANS
# ============================================================

@lru_cache(maxsize=1)
def _load_medians() -> dict[str, float]:

    candidates = [
        _REPO_ROOT / "data" / "processed" / "grid_medians.json",
        _REPO_ROOT / "grid_medians.json",
    ]

    for path in candidates:
        if path.exists():
            try:
                with open(path) as f:
                    medians = json.load(f)

                logger.info(
                    "Loaded grid medians from %s (%d features)",
                    path,
                    len(medians),
                )

                return medians

            except Exception as exc:
                logger.warning(
                    "Failed to load medians from %s: %s",
                    path,
                    exc,
                )

    logger.info("No grid_medians.json found — using static defaults")

    return dict(_STATIC_DEFAULTS)


# ============================================================
# LOAD GRID
# ============================================================

@lru_cache(maxsize=1)
def _load_grid() -> Optional[pd.DataFrame]:

    cfg = get_settings()

    candidates = [
        _REPO_ROOT / cfg.data_processed_dir / "unified_grid.parquet",
        _REPO_ROOT / "data" / "processed" / "unified_grid.parquet",
        _REPO_ROOT / "unified_grid.parquet",
    ]

    for path in candidates:

        if path.exists():

            try:
                df = pd.read_parquet(path)

                # ------------------------------------------------
                # CRITICAL FIX:
                # Normalize coordinates + build deterministic index
                # ------------------------------------------------

                df["grid_lat"] = df["grid_lat"].round(1)
                df["grid_lon"] = df["grid_lon"].round(1)

                if "cell_id" not in df.columns:
                    df["cell_id"] = (
                        df["grid_lat"].map(lambda x: f"{x:.1f}")
                        + "_"
                        + df["grid_lon"].map(lambda x: f"{x:.1f}")
                    )

                # Fast deterministic lookup
                df = df.set_index("cell_id", drop=False)

                logger.info(
                    "Loaded unified grid: %s cells, %s features from %s",
                    len(df),
                    len(df.columns),
                    path,
                )

                return df

            except Exception as exc:
                logger.warning(
                    "Failed to load grid from %s: %s",
                    path,
                    exc,
                )

    logger.warning(
        "unified_grid.parquet not found — using fallback defaults"
    )

    return None


# ============================================================
# MAIN LOOKUP
# ============================================================

def get_grid_features(lat: float, lon: float) -> dict[str, float]:

    cfg = get_settings()

    res = cfg.grid_resolution_deg

    medians = _load_medians()

    # --------------------------------------------------------
    # FIXED coordinate snapping
    # --------------------------------------------------------

    cell_lat = round(round(lat / res) * res, 1)
    cell_lon = round(round(lon / res) * res, 1)

    cell_id = f"{cell_lat:.1f}_{cell_lon:.1f}"

    grid = _load_grid()

    # --------------------------------------------------------
    # FULL FALLBACK
    # --------------------------------------------------------

    if grid is None:

        result = dict(medians)

        result["_confidence"] = 0.1
        result["_is_fallback"] = 1.0
        result["_source"] = 2.0
        result["_nearest_dist_km"] = 999.0

        return result

    # --------------------------------------------------------
    # EXACT deterministic lookup
    # --------------------------------------------------------

    if cell_id in grid.index:

        row = grid.loc[cell_id]

        source_type = 0.0
        nearest_dist_km = 0.0

    else:

        # ----------------------------------------------------
        # Nearest-neighbour fallback
        # ----------------------------------------------------

        dists = (
            (grid["grid_lat"] - cell_lat) ** 2
            + (grid["grid_lon"] - cell_lon) ** 2
        )

        nearest_idx = dists.idxmin()

        row = grid.loc[nearest_idx]

        nearest_dist_deg = float(np.sqrt(dists.loc[nearest_idx]))

        nearest_dist_km = nearest_dist_deg * 111.0

        # Reject absurdly distant matches
        if nearest_dist_deg > 2.0:

            result = dict(medians)

            result["_confidence"] = 0.1
            result["_is_fallback"] = 1.0
            result["_source"] = 2.0
            result["_nearest_dist_km"] = round(nearest_dist_km, 1)

            return result

        source_type = 1.0

    # ========================================================
    # BUILD RESULT
    # ========================================================

    result = dict(medians)

    n_real = 0
    n_total = 0

    ignored_cols = {
        "cell_id",
    }

    for col in grid.columns:

        if col in ignored_cols:
            continue

        n_total += 1

        val = row[col]

        if pd.notna(val):

            try:
                result[col] = float(val)
                n_real += 1

            except (ValueError, TypeError):
                pass

    # ========================================================
    # CONFIDENCE
    # ========================================================

    base_confidence = result.get("coverage_score", 0.5)

    completeness = result.get(
        "feature_completeness",
        n_real / max(n_total, 1),
    )

    distance_penalty = max(
        0.0,
        1.0 - nearest_dist_km / 200.0,
    )

    confidence = (
        0.4 * base_confidence
        + 0.3 * completeness
        + 0.3 * distance_penalty
    )

    confidence = max(0.05, min(1.0, confidence))

    result["_confidence"] = round(confidence, 3)
    result["_is_fallback"] = 0.0
    result["_source"] = source_type
    result["_nearest_dist_km"] = round(nearest_dist_km, 1)

    return result


# ============================================================
# OPTIONAL HELPER
# ============================================================

def _find_column(df: pd.DataFrame, candidates: list[str]) -> Optional[str]:

    lower_cols = {c.lower(): c for c in df.columns}

    for name in candidates:

        if name in df.columns:
            return name

        if name.lower() in lower_cols:
            return lower_cols[name.lower()]

    return None