"""
Ingest flood, earthquake, cyclone, and general disaster datasets.

Input:  data/raw/disasters/*.csv
Output: data/processed/disaster_grid.parquet
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent

sys.path.insert(0, str(PROJECT_ROOT))

from processing.geo_grid import generate_india_grid

from app.config import get_settings

cfg = get_settings()

RAW_DISASTERS = (
    PROJECT_ROOT
    / "data"
    / "raw"
    / "disasters"
)

PROCESSED_DIR = (
    PROJECT_ROOT
    / cfg.data_processed_dir
)

PROCESSED_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


DISASTER_TYPE_KEYWORDS = {
    "flood": ["flood", "inundation", "waterlog", "deluge", "submerg"],
    "earthquake": ["earthquake", "seismic", "tremor", "quake"],
    "cyclone": ["cyclone", "hurricane", "storm", "typhoon"],
    "landslide": ["landslide", "mudslide", "debris", "land slip"],
    "drought": ["drought", "dry spell"],
    "fire": ["fire", "wildfire", "blaze"],
    "tsunami": ["tsunami"],
    "heatwave": ["heatwave", "heat wave", "heat stroke"],
    "coldwave": ["coldwave", "cold wave", "frost"],
}


def _detect_disaster_type(
    row: pd.Series,
    source_file: str = "",
) -> str:
    """
    Infer disaster type using:
    1. filename priors
    2. row text
    """

    source = str(source_file).lower()

    # ========================================================
    # STRONG FILE PRIORS
    # ========================================================

    if "earthquake" in source:
        return "earthquake"

    if "flood" in source:
        return "flood"

    if "cyclone" in source:
        return "cyclone"

    if "landslide" in source:
        return "landslide"

    # ========================================================
    # FALLBACK TEXT SCAN
    # ========================================================

    text = " ".join(
        str(v).lower()
        for v in row.values
        if pd.notna(v)
    )

    for dtype, keywords in DISASTER_TYPE_KEYWORDS.items():

        if any(kw in text for kw in keywords):
            return dtype

    return "unknown"


def _find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for c in candidates:
        if c in df.columns:
            return c
    lower_map = {col.lower().strip(): col for col in df.columns}
    for c in candidates:
        if c.lower().strip() in lower_map:
            return lower_map[c.lower().strip()]
    return None


def spatial_decay_assign(
    grid_df: pd.DataFrame,
    event_df: pd.DataFrame,
    value_col: str,
    radius_km: float = 25,
    decay_km: float = 10,
) -> np.ndarray:
    """Spread event influence onto the India grid with exponential decay."""
    try:
        from scipy.spatial import cKDTree
    except ImportError as exc:
        raise ImportError(
            "scipy is required for spatial_decay_assign in ingest_disasters.py"
        ) from exc

    result = np.zeros(len(grid_df), dtype=float)
    if event_df.empty:
        return result

    grid_coords = grid_df[["grid_lat", "grid_lon"]].to_numpy()
    tree = cKDTree(grid_coords)

    for _, row in event_df.iterrows():
        if not pd.notna(row.get(value_col)):
            continue

        point = [row["grid_lat"], row["grid_lon"]]
        radius_deg = radius_km / 111.0
        nearby = tree.query_ball_point(point, radius_deg)

        if not nearby:
            continue

        nearby_coords = grid_coords[nearby]
        dists = np.sqrt(np.sum((nearby_coords - point) ** 2, axis=1)) * 111.0
        weights = np.exp(-dists / decay_km)

        result[nearby] += row[value_col] * weights

    return result


def ingest_disaster_file(file_path: Path) -> pd.DataFrame | None:
    """Parse a single disaster CSV."""
    try:
        df = pd.read_csv(file_path, low_memory=False)
    except Exception as e:
        print(f"  Cannot read {file_path.name}: {e}")
        return None

    if df.empty:
        return None

    result = pd.DataFrame()

    # Location
    lat_col = _find_col(df, ["latitude", "lat", "Latitude", "LAT"])
    lon_col = _find_col(df, ["longitude", "lon", "lng", "Longitude", "LON", "LONG"])
    state_col = _find_col(df, ["state", "State", "STATE", "state_name"])
    district_col = _find_col(df, ["district", "District", "DISTRICT"])

    if lat_col and lon_col:
        result["latitude"] = pd.to_numeric(df[lat_col], errors="coerce")
        result["longitude"] = pd.to_numeric(df[lon_col], errors="coerce")
    else:
        result["latitude"] = np.nan
        result["longitude"] = np.nan

    if state_col:
        result["state"] = df[state_col].astype(str).str.strip().str.lower()
    if district_col:
        result["district"] = df[district_col].astype(str).str.strip().str.lower()

    # Date
    date_col = _find_col(df, ["date", "Date", "event_date", "start_date", "year"])
    if date_col:
        result["date"] = pd.to_datetime(df[date_col], errors="coerce")
        result["year"] = result["date"].dt.year
        result["month"] = result["date"].dt.month
    else:
        result["date"] = pd.NaT
        result["year"] = np.nan
        result["month"] = np.nan

    # Severity / magnitude
    severity_col = _find_col(df, ["magnitude", "severity", "intensity", "Magnitude", "deaths", "killed"])
    if severity_col:
        result["severity"] = pd.to_numeric(df[severity_col], errors="coerce")
    else:
        result["severity"] = np.nan

    # Disaster type
    type_col = _find_col(df, ["disaster_type", "type", "event_type", "Disaster_Type", "category"])
    if type_col:
        result["disaster_type"] = df[type_col].astype(str).str.strip().str.lower()
    else:
        # Auto-detect using both filename priors and row content
        result["disaster_type"] = df.apply(
            lambda row: _detect_disaster_type(
                row,
                file_path.name,
            ),
            axis=1,
        )

    # Deaths / affected
    deaths_col = _find_col(df, ["deaths", "killed", "fatalities", "no_killed"])
    if deaths_col:
        result["deaths"] = pd.to_numeric(df[deaths_col], errors="coerce").fillna(0)
    else:
        result["deaths"] = 0

    affected_col = _find_col(df, ["affected", "total_affected", "no_affected"])
    if affected_col:
        result["affected"] = pd.to_numeric(df[affected_col], errors="coerce").fillna(0)
    else:
        result["affected"] = 0

    result["source_file"] = file_path.name
    return result


def compute_disaster_factors(
    disaster_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Build continuous disaster hazard fields.

    Each event contributes locally using exponential decay.
    """

    if disaster_df.empty:
        return pd.DataFrame()

    geo = disaster_df.dropna(
        subset=["latitude", "longitude"]
    ).copy()

    if geo.empty:
        return pd.DataFrame()

    # --------------------------------------------------------
    # IMPORTANT:
    # DO NOT snap events before propagation.
    # Keep original coordinates.
    # --------------------------------------------------------

    grid = generate_india_grid()

    hazard_filters = {
        "flood": "flood|inundation|waterlog|deluge|submerg",
        "earthquake": "earthquake|quake|seismic|tremor",
        "cyclone": "cyclone|storm|typhoon|hurricane",
        "landslide": "landslide|mudslide|debris|land slip",
    }

    hazard_params = {
        "flood": {
            "radius_km": 25,
            "decay_km": 8,
        },
        "earthquake": {
            "radius_km": 80,
            "decay_km": 30,
        },
        "cyclone": {
            "radius_km": 120,
            "decay_km": 40,
        },
        "landslide": {
            "radius_km": 15,
            "decay_km": 5,
        },
    }

    for hazard, pattern in hazard_filters.items():

        params = hazard_params[hazard]

        events = geo[
            geo["disaster_type"]
            .astype(str)
            .str.lower()
            .str.contains(
                pattern,
                na=False,
                regex=True,
            )
        ].copy()

        if events.empty:
            grid[f"{hazard}_count"] = 0.0
            grid[f"{hazard}_severity"] = 0.0
            grid[f"{hazard}_deaths"] = 0.0
            continue

        events["severity"] = pd.to_numeric(
            events["severity"],
            errors="coerce",
        ).fillna(0)

        events["deaths"] = pd.to_numeric(
            events["deaths"],
            errors="coerce",
        ).fillna(0)

        events["event_weight"] = 1.0

        events = events.rename(
            columns={
                "latitude": "grid_lat",
                "longitude": "grid_lon",
            }
        )

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

    all_events = geo.copy()
    all_events["event_weight"] = 1.0
    all_events = all_events.rename(
        columns={
            "latitude": "grid_lat",
            "longitude": "grid_lon",
        }
    )

    grid["total_events"] = spatial_decay_assign(
        grid_df=grid,
        event_df=all_events,
        value_col="event_weight",
        radius_km=40,
        decay_km=15,
    )

    def normalize_series(
        s: pd.Series,
    ) -> pd.Series:

        s = pd.to_numeric(
            s,
            errors="coerce",
        ).fillna(0)

        p99 = s.quantile(0.99)

        if p99 <= 0:
            return pd.Series(
                0.0,
                index=s.index,
            )

        return (s / p99).clip(0, 1)

    for hazard in [
        "flood",
        "earthquake",
        "cyclone",
        "landslide",
    ]:

        count_col = f"{hazard}_count"
        sev_col = f"{hazard}_severity"
        deaths_col = f"{hazard}_deaths"

        count_score = normalize_series(
            grid[count_col]
        )

        sev_score = normalize_series(
            grid[sev_col]
        )

        death_score = normalize_series(
            grid[deaths_col]
        )

        risk_col = f"{hazard}_risk"

        grid[risk_col] = (
            0.5 * count_score
            + 0.3 * sev_score
            + 0.2 * death_score
        ).clip(0, 1)

    grid["latitude"] = grid["grid_lat"]
    grid["longitude"] = grid["grid_lon"]

    return grid


def ingest_all_disasters() -> pd.DataFrame:
    csv_files = list(RAW_DISASTERS.glob("**/*.csv"))
    print(f"Found {len(csv_files)} disaster CSV files")

    all_frames = []
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

    # ... continuing from compute_disaster_factors

    factors = compute_disaster_factors(combined)

    output_path = PROCESSED_DIR / "disaster_grid.parquet"
    factors.to_parquet(output_path, index=False)
    print(f"Saved: {output_path} ({len(factors)} grid cells)")

    return factors


if __name__ == "__main__":
    ingest_all_disasters()