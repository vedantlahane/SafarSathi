"""
Unified grid cell lookup.

The unified_grid.parquet is the source of spatial risk features.
A tourist's (lat, lon) is snapped to the nearest 0.1° cell; features
from that cell are returned as a flat dict.

REFACTORED: Defaults now come from actual training data medians
(grid_medians.json), not hard-coded guesses. When the grid is available,
NaN values are preserved (LightGBM handles them natively).
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

# ── Fallback defaults (used ONLY when grid is completely unavailable) ─────
# These are intentionally conservative mid-range values.
# When the grid IS loaded, we use actual medians from the data.
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


@lru_cache(maxsize=1)
def _load_medians() -> dict[str, float]:
    """Load actual data medians computed during merge step."""
    candidates = [
        _REPO_ROOT / "data" / "processed" / "grid_medians.json",
        _REPO_ROOT / "grid_medians.json",
    ]
    for path in candidates:
        if path.exists():
            try:
                with open(path) as f:
                    medians = json.load(f)
                logger.info("Loaded grid medians from %s (%d features)", path, len(medians))
                return medians
            except Exception as exc:
                logger.warning("Failed to load medians from %s: %s", path, exc)
    logger.info("No grid_medians.json found — using static defaults")
    return dict(_STATIC_DEFAULTS)


@lru_cache(maxsize=1)
def _load_grid() -> Optional[pd.DataFrame]:
    """Load grid once at first call (lazy, cached)."""
    cfg = get_settings()
    # Check multiple possible locations
    candidates = [
        _REPO_ROOT / cfg.data_processed_dir / "unified_grid.parquet",
        _REPO_ROOT / "data" / "processed" / "unified_grid.parquet",
        _REPO_ROOT / "unified_grid.parquet",
    ]
    for path in candidates:
        if path.exists():
            try:
                df = pd.read_parquet(path)
                logger.info("Loaded unified grid: %s cells, %s features from %s",
                            len(df), len(df.columns), path)
                return df
            except Exception as exc:
                logger.warning("Failed to load grid from %s: %s", path, exc)

    logger.warning(
        "unified_grid.parquet not found — all lookups will use median defaults. "
        "Run the training pipeline (python pipeline.py --skip-ingest) to generate it."
    )
    return None


def get_grid_features(lat: float, lon: float) -> dict[str, float]:
    """
    Return the spatial grid features for the cell containing (lat, lon).

    Snapping: round to nearest GRID_RESOLUTION_DEG (0.1°).
    If grid is unavailable or cell not found, returns data-derived median defaults.

    Also returns confidence metadata:
      _confidence:     0-1 float (how much to trust this prediction)
      _is_fallback:    1.0 if using median defaults, 0.0 if real cell data
      _source:         hash of source type (0=exact, 1=nearest, 2=fallback)
      _nearest_dist_km: approximate distance to nearest real data cell
    """
    cfg = get_settings()
    res = cfg.grid_resolution_deg
    medians = _load_medians()

    # Snap coordinates to grid centres
    cell_lat = round(round(lat / res) * res, 6)
    cell_lon = round(round(lon / res) * res, 6)

    grid = _load_grid()
    if grid is None:
        result = dict(medians)
        result["_confidence"] = 0.1
        result["_is_fallback"] = 1.0
        result["_source"] = 2.0  # median fallback
        result["_nearest_dist_km"] = 999.0
        return result

    # Try to find the exact cell
    col_lat = _find_column(grid, ["grid_lat", "lat_center", "lat", "latitude"])
    col_lon = _find_column(grid, ["grid_lon", "lon_center", "lon", "longitude"])

    if col_lat and col_lon:
        mask = (
            np.abs(grid[col_lat] - cell_lat) < res / 2
        ) & (
            np.abs(grid[col_lon] - cell_lon) < res / 2
        )
        hits = grid[mask]
        source_type = 0.0  # exact cell
        nearest_dist_km = 0.0

        if len(hits) == 0:
            # Find nearest cell using distance
            dists = (grid[col_lat] - cell_lat)**2 + (grid[col_lon] - cell_lon)**2
            nearest_idx = dists.idxmin()
            nearest_dist_deg = float(np.sqrt(dists.loc[nearest_idx]))
            nearest_dist_km = nearest_dist_deg * 111.0  # approximate km

            # Only use nearest if within ~100km (roughly 1 degree)
            if nearest_dist_deg < 1.0:
                hits = grid.loc[[nearest_idx]]
                source_type = 1.0  # nearest cell
            else:
                result = dict(medians)
                result["_confidence"] = 0.1
                result["_is_fallback"] = 1.0
                result["_source"] = 2.0
                result["_nearest_dist_km"] = nearest_dist_km
                return result

        row = hits.iloc[0]
        result = dict(medians)  # start with medians as base
        n_real = 0
        n_total = 0
        for col in grid.columns:
            if col not in (col_lat, col_lon, "cell_id"):
                n_total += 1
                val = row[col]
                if pd.notna(val):
                    try:
                        result[col] = float(val)
                        n_real += 1
                    except (ValueError, TypeError):
                        pass

        # Compute confidence from coverage_score, feature_completeness, and distance
        base_confidence = result.get("coverage_score", 0.5)
        completeness = result.get("feature_completeness", n_real / max(n_total, 1))
        distance_penalty = max(0, 1.0 - nearest_dist_km / 100.0)

        confidence = (0.4 * base_confidence + 0.3 * completeness + 0.3 * distance_penalty)
        confidence = max(0.05, min(1.0, confidence))

        result["_confidence"] = round(confidence, 3)
        result["_is_fallback"] = 0.0
        result["_source"] = source_type
        result["_nearest_dist_km"] = round(nearest_dist_km, 1)
        return result

    result = dict(medians)
    result["_confidence"] = 0.1
    result["_is_fallback"] = 1.0
    result["_source"] = 2.0
    result["_nearest_dist_km"] = 999.0
    return result


def _find_column(df: pd.DataFrame, candidates: list[str]) -> Optional[str]:
    """Return the first candidate column name that exists in df."""
    lower_cols = {c.lower(): c for c in df.columns}
    for name in candidates:
        if name in df.columns:
            return name
        if name.lower() in lower_cols:
            return lower_cols[name.lower()]
    return None
