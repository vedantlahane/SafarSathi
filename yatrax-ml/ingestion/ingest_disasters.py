"""
Ingest flood, earthquake, cyclone, and general disaster datasets.

Input:  data/raw/disasters/*.csv
Output: data/processed/disaster_grid.parquet

Improvements:
- stronger disaster-type canonicalization
- filename-aware priors plus row-text fallback
- better cyclone / storm / depression handling
- continuous spatial hazard fields with decay
- robust severity and deaths normalization
- deterministic India-grid output
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.config import get_settings
from processing.geo_grid import generate_india_grid

cfg = get_settings()

RAW_DISASTERS = PROJECT_ROOT / "data" / "raw" / "disasters"
PROCESSED_DIR = PROJECT_ROOT / cfg.data_processed_dir
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# DISASTER TYPE NORMALIZATION
# ============================================================

DISASTER_TYPE_KEYWORDS = {
    "flood": [
        "flood",
        "flooding",
        "inundation",
        "waterlog",
        "waterlogging",
        "deluge",
        "submerg",
        "flash flood",
    ],
    "earthquake": [
        "earthquake",
        "seismic",
        "tremor",
        "quake",
        "epicenter",
        "richter",
    ],
    "cyclone": [
        "cyclone",
        "cyclonic",
        "cyclonic storm",
        "storm",
        "typhoon",
        "hurricane",
        "depression",
        "low pressure",
    ],
    "landslide": [
        "landslide",
        "mudslide",
        "debris",
        "land slip",
        "mass movement",
        "slip",
    ],
    "drought": [
        "drought",
        "dry spell",
        "water scarcity",
    ],
    "fire": [
        "fire",
        "wildfire",
        "blaze",
        "forest fire",
        "grass fire",
    ],
    "tsunami": ["tsunami"],
    "heatwave": ["heatwave", "heat wave", "heatstroke", "heat stroke"],
    "coldwave": ["coldwave", "cold wave", "frost", "cold spell"],
}

HAZARD_ORDER = [
    "earthquake",
    "cyclone",
    "flood",
    "landslide",
    "tsunami",
    "heatwave",
    "coldwave",
    "drought",
    "fire",
]

FILE_PRIORS = {
    "earthquake": ["earthquake", "seismic", "quake"],
    "cyclone": ["cyclone", "storm", "typhoon", "hurricane", "depression"],
    "flood": ["flood", "inundation", "waterlog", "deluge", "submerg"],
    "landslide": ["landslide", "mudslide", "debris", "land slip"],
    "fire": ["fire", "wildfire", "forest fire"],
    "drought": ["drought"],
    "tsunami": ["tsunami"],
    "heatwave": ["heatwave", "heat wave"],
    "coldwave": ["coldwave", "cold wave"],
}


def _normalize_text(value: object) -> str:
    return (
        str(value)
        .strip()
        .lower()
        .replace("&", " and ")
        .replace("_", " ")
        .replace("-", " ")
        .replace(".", " ")
    )


def _find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
    normalized = {_normalize_text(col): col for col in df.columns}

    for cand in candidates:
        key = _normalize_text(cand)
        if key in normalized:
            return normalized[key]

    for cand in candidates:
        cand_key = _normalize_text(cand)
        for norm_key, original_col in normalized.items():
            if cand_key in norm_key or norm_key in cand_key:
                return original_col

    return None


def _canonical_from_text(text: str) -> str | None:
    """
    Return the best matching canonical hazard type from free text.
    """
    norm = _normalize_text(text)
    for hazard in HAZARD_ORDER:
        for kw in DISASTER_TYPE_KEYWORDS[hazard]:
            if kw in norm:
                return hazard
    return None


def _detect_disaster_type(row: pd.Series, source_file: str = "", raw_type: object = None) -> str:
    """
    Infer disaster type using:
    1) filename priors
    2) explicit type column (if present)
    3) row text fallback
    """
    source = _normalize_text(source_file)

    # Strong file priors
    for hazard, patterns in FILE_PRIORS.items():
        if any(pat in source for pat in patterns):
            return hazard

    # Explicit type column, if present
    if raw_type is not None and pd.notna(raw_type):
        raw_canon = _canonical_from_text(raw_type)
        if raw_canon is not None:
            return raw_canon

    # Fallback text scan across the row
    text = " ".join(
        _normalize_text(v)
        for v in row.values
        if pd.notna(v)
    )
    txt_canon = _canonical_from_text(text)
    if txt_canon is not None:
        return txt_canon

    return "unknown"


# ============================================================
# NUMERIC HELPERS
# ============================================================

def _safe_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(
        series.astype(str)
        .str.replace(",", "", regex=False)
        .str.replace("%", "", regex=False)
        .str.strip(),
        errors="coerce",
    )


def _safe_percentile(series: pd.Series, q: float) -> float:
    s = pd.to_numeric(series, errors="coerce").dropna()
    if s.empty:
        return np.nan
    return float(np.nanpercentile(s, q))


# ============================================================
# SPATIAL PROPAGATION
# ============================================================

def spatial_decay_assign(
    grid_df: pd.DataFrame,
    event_df: pd.DataFrame,
    value_col: str,
    radius_km: float = 25,
    decay_km: float = 10,
) -> np.ndarray:
    """
    Spread event influence onto the India grid with exponential decay.
    """
    try:
        from scipy.spatial import cKDTree
    except ImportError as exc:
        raise ImportError(
            "scipy is required for spatial_decay_assign in ingest_disaster.py"
        ) from exc

    result = np.zeros(len(grid_df), dtype=float)
    if event_df.empty:
        return result

    if "grid_lat" not in event_df.columns or "grid_lon" not in event_df.columns:
        return result

    grid_coords = grid_df[["grid_lat", "grid_lon"]].to_numpy(dtype=float)
    tree = cKDTree(grid_coords)

    radius_deg = radius_km / 111.0

    for _, row in event_df.iterrows():
        val = row.get(value_col)
        if not pd.notna(val):
            continue

        lat = row.get("grid_lat")
        lon = row.get("grid_lon")
        if not pd.notna(lat) or not pd.notna(lon):
            continue

        point = [float(lat), float(lon)]
        nearby = tree.query_ball_point(point, radius_deg)

        if not nearby:
            continue

        nearby_coords = grid_coords[nearby]
        dists = np.sqrt(np.sum((nearby_coords - point) ** 2, axis=1)) * 111.0
        weights = np.exp(-dists / decay_km)

        result[nearby] += float(val) * weights

    return result


# ============================================================
# INGEST SINGLE FILE
# ============================================================

def ingest_disaster_file(file_path: Path) -> pd.DataFrame | None:
    """
    Parse a single disaster CSV.
    """
    try:
        df = pd.read_csv(file_path, low_memory=False)
    except Exception as exc:
        print(f"  Cannot read {file_path.name}: {exc}")
        return None

    if df.empty:
        return None

    result = pd.DataFrame(index=df.index)

    # --------------------------------------------------------
    # Location
    # --------------------------------------------------------
    lat_col = _find_col(df, ["latitude", "lat", "Latitude", "LAT"])
    lon_col = _find_col(df, ["longitude", "lon", "lng", "Longitude", "LON", "LONG"])
    state_col = _find_col(df, ["state", "State", "STATE", "state_name"])
    district_col = _find_col(df, ["district", "District", "DISTRICT"])

    if lat_col and lon_col:
        result["latitude"] = _safe_numeric(df[lat_col])
        result["longitude"] = _safe_numeric(df[lon_col])
    else:
        result["latitude"] = np.nan
        result["longitude"] = np.nan

    if state_col:
        result["state"] = df[state_col].astype(str).map(_normalize_text)
    else:
        result["state"] = np.nan

    if district_col:
        result["district"] = df[district_col].astype(str).map(_normalize_text)
    else:
        result["district"] = np.nan

    # --------------------------------------------------------
    # Date
    # --------------------------------------------------------
    date_col = _find_col(df, ["date", "Date", "event_date", "start_date", "year"])
    if date_col:
        dates = pd.to_datetime(df[date_col], errors="coerce")
        result["date"] = dates
        result["year"] = dates.dt.year
        result["month"] = dates.dt.month
    else:
        result["date"] = pd.NaT
        result["year"] = np.nan
        result["month"] = np.nan

    # --------------------------------------------------------
    # Severity / magnitude
    # Prefer an explicit severity field, but fall back to deaths/killed
    # when severity is not available.
    # --------------------------------------------------------
    severity_col = _find_col(
        df,
        [
            "magnitude",
            "severity",
            "intensity",
            "Magnitude",
            "Severity",
            "Intensity",
        ],
    )
    deaths_col = _find_col(df, ["deaths", "killed", "fatalities", "no_killed"])

    if severity_col:
        result["severity"] = _safe_numeric(df[severity_col])
    elif deaths_col:
        result["severity"] = _safe_numeric(df[deaths_col])
    else:
        result["severity"] = np.nan

    # --------------------------------------------------------
    # Disaster type
    # --------------------------------------------------------
    type_col = _find_col(
        df,
        ["disaster_type", "type", "event_type", "Disaster_Type", "category"]
    )

    if type_col:
        result["disaster_type"] = [
            _detect_disaster_type(
                row,
                source_file=file_path.name,
                raw_type=df.iloc[i][type_col],
            )
            for i, row in df.iterrows()
        ]
    else:
        result["disaster_type"] = df.apply(
            lambda row: _detect_disaster_type(row, source_file=file_path.name),
            axis=1,
        )

    # --------------------------------------------------------
    # Deaths / affected
    # --------------------------------------------------------
    if deaths_col:
        result["deaths"] = _safe_numeric(df[deaths_col]).fillna(0)
    else:
        result["deaths"] = 0.0

    affected_col = _find_col(df, ["affected", "total_affected", "no_affected"])
    if affected_col:
        result["affected"] = _safe_numeric(df[affected_col]).fillna(0)
    else:
        result["affected"] = 0.0

    result["source_file"] = file_path.name

    return result


# ============================================================
# HAZARD SURFACE CONSTRUCTION
# ============================================================

def compute_disaster_factors(disaster_df: pd.DataFrame) -> pd.DataFrame:
    """
    Build continuous disaster hazard fields.

    Each event contributes locally using exponential decay.
    """
    if disaster_df.empty:
        return pd.DataFrame()

    geo = disaster_df.dropna(subset=["latitude", "longitude"]).copy()
    if geo.empty:
        return pd.DataFrame()

    for col in ["severity", "deaths", "affected"]:
        if col not in geo.columns:
            geo[col] = 0.0
        geo[col] = pd.to_numeric(geo[col], errors="coerce").fillna(0)

    # Do NOT snap events before propagation; keep original coordinates.
    grid = generate_india_grid()

    hazard_filters = {
        "flood": r"flood|inundation|waterlog|deluge|submerg",
        "earthquake": r"earthquake|quake|seismic|tremor",
        "cyclone": r"cyclone|cyclonic|cyclonic storm|typhoon|hurricane|depression|low pressure|storm",
        "landslide": r"landslide|mudslide|debris|land slip|mass movement",
    }

    hazard_params = {
        "flood": {"radius_km": 25, "decay_km": 8},
        "earthquake": {"radius_km": 80, "decay_km": 30},
        "cyclone": {"radius_km": 120, "decay_km": 40},
        "landslide": {"radius_km": 15, "decay_km": 5},
    }

    # Keep the original event coordinates and work on a grid coordinate copy.
    geo = geo.rename(columns={"latitude": "grid_lat", "longitude": "grid_lon"})

    for hazard, pattern in hazard_filters.items():
        params = hazard_params[hazard]

        events = geo[
            geo["disaster_type"]
            .astype(str)
            .str.lower()
            .str.contains(pattern, na=False, regex=True)
        ].copy()

        if events.empty:
            grid[f"{hazard}_count"] = 0.0
            grid[f"{hazard}_severity"] = 0.0
            grid[f"{hazard}_deaths"] = 0.0
            grid[f"{hazard}_risk"] = 0.0
            continue

        events["event_weight"] = 1.0

        grid[f"{hazard}_count"] = spatial_decay_assign(
            grid_df=grid,
            event_df=events,
            value_col="event_weight",
            radius_km=params["radius_km"],
            decay_km=params["decay_km"],
        )

        grid[f"{hazard}_severity"] = spatial_decay_assign(
            grid_df=grid,
            event_df=events,
            value_col="severity",
            radius_km=params["radius_km"],
            decay_km=params["decay_km"],
        )

        grid[f"{hazard}_deaths"] = spatial_decay_assign(
            grid_df=grid,
            event_df=events,
            value_col="deaths",
            radius_km=params["radius_km"],
            decay_km=params["decay_km"],
        )

    # --------------------------------------------------------
    # Total event density
    # --------------------------------------------------------
    all_events = geo.copy()
    all_events["event_weight"] = 1.0

    grid["total_events"] = spatial_decay_assign(
        grid_df=grid,
        event_df=all_events,
        value_col="event_weight",
        radius_km=40,
        decay_km=15,
    )

    # --------------------------------------------------------
    # Robust normalization
    # --------------------------------------------------------
    def normalize_series(s: pd.Series) -> pd.Series:
        s = pd.to_numeric(s, errors="coerce").fillna(0)
        p99 = s.quantile(0.99)
        if p99 <= 0:
            return pd.Series(0.0, index=s.index)
        return (s / p99).clip(0, 1)

    # --------------------------------------------------------
    # Final risk engineering
    # --------------------------------------------------------
    for hazard in ["flood", "earthquake", "cyclone", "landslide"]:
        count_col = f"{hazard}_count"
        sev_col = f"{hazard}_severity"
        deaths_col = f"{hazard}_deaths"
        risk_col = f"{hazard}_risk"

        count_score = normalize_series(grid[count_col])
        sev_score = normalize_series(grid[sev_col])
        death_score = normalize_series(grid[deaths_col])

        # Floods tend to be better captured by volume + impact.
        # Earthquakes/cyclones benefit from keeping severity/deaths visible.
        if hazard == "flood":
            raw = (
                0.9 * np.log1p(grid[count_col])
                + 1.2 * np.log1p(grid[sev_col])
                + 1.0 * np.log1p(grid[deaths_col])
            )
            p99 = raw.quantile(0.99)
            grid[risk_col] = (raw / p99).clip(0, 1) if p99 > 0 else 0.0
        else:
            grid[risk_col] = (
                0.45 * count_score
                + 0.35 * sev_score
                + 0.20 * death_score
            ).clip(0, 1)

    grid["latitude"] = grid["grid_lat"]
    grid["longitude"] = grid["grid_lon"]

    return grid


# ============================================================
# MAIN ENTRY
# ============================================================

def ingest_all_disasters() -> pd.DataFrame:
    csv_files = list(RAW_DISASTERS.glob("**/*.csv"))
    print(f"Found {len(csv_files)} disaster CSV files")

    all_frames: list[pd.DataFrame] = []

    for f in csv_files:
        df = ingest_disaster_file(f)
        if df is not None and not df.empty:
            all_frames.append(df)
            types = df["disaster_type"].value_counts().to_dict()
            print(f"  Parsed {f.name}: {len(df)} events — {types}")

    if not all_frames:
        print("No disaster data found!")
        return pd.DataFrame()

    combined = pd.concat(all_frames, ignore_index=True)
    print(f"Combined: {len(combined)} disaster events")

    factors = compute_disaster_factors(combined)
    if factors.empty:
        print("No disaster factors could be computed!")
        return pd.DataFrame()

    output_path = PROCESSED_DIR / "disaster_grid.parquet"
    factors.to_parquet(output_path, index=False)
    print(f"Saved: {output_path} ({len(factors)} grid cells)")

    return factors


if __name__ == "__main__":
    ingest_all_disasters()