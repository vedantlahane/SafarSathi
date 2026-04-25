"""
Ingest NASA FIRMS wildfire satellite data for India.

Input:  data/raw/fire/*.csv
Output: data/processed/fire_grid.parquet
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from config.settings import (
    RAW_FIRE, PROCESSED_DIR,
    INDIA_LAT_MIN, INDIA_LAT_MAX, INDIA_LON_MIN, INDIA_LON_MAX,
)


def _find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for c in candidates:
        if c in df.columns:
            return c
    lower_map = {col.lower().strip(): col for col in df.columns}
    for c in candidates:
        if c.lower().strip() in lower_map:
            return lower_map[c.lower().strip()]
    return None


def ingest_fire_file(file_path: Path) -> pd.DataFrame | None:
    """Parse NASA FIRMS / wildfire CSV."""
    try:
        df = pd.read_csv(file_path, low_memory=False)
    except Exception as e:
        print(f"  Cannot read {file_path.name}: {e}")
        return None

    if df.empty:
        return None

    result = pd.DataFrame()

    # Location — FIRMS data always has latitude/longitude
    lat_col = _find_col(df, ["latitude", "lat", "Latitude"])
    lon_col = _find_col(df, ["longitude", "lon", "lng", "Longitude"])

    if lat_col is None or lon_col is None:
        print(f"  No coordinates in {file_path.name}")
        return None

    result["latitude"] = pd.to_numeric(df[lat_col], errors="coerce")
    result["longitude"] = pd.to_numeric(df[lon_col], errors="coerce")

    # Filter to India bounding box
    india_mask = (
        (result["latitude"] >= INDIA_LAT_MIN) &
        (result["latitude"] <= INDIA_LAT_MAX) &
        (result["longitude"] >= INDIA_LON_MIN) &
        (result["longitude"] <= INDIA_LON_MAX)
    )
    result = result[india_mask].copy()
    df = df[india_mask].copy()

    if result.empty:
        return None

    # Date
    date_col = _find_col(df, ["acq_date", "date", "Date", "ACQ_DATE"])
    if date_col:
        result["date"] = pd.to_datetime(df[date_col], errors="coerce")
        result["month"] = result["date"].dt.month
        result["year"] = result["date"].dt.year
    else:
        result["date"] = pd.NaT
        result["month"] = np.nan
        result["year"] = np.nan

    # Time
    time_col = _find_col(df, ["acq_time", "time", "ACQ_TIME"])
    if time_col:
        # FIRMS time is HHMM format
        result["hour"] = pd.to_numeric(df[time_col], errors="coerce").fillna(1200) // 100
    else:
        result["hour"] = 12

    # Brightness / Fire Radiative Power — proxy for fire intensity
    brightness_col = _find_col(df, ["brightness", "bright_ti4", "Brightness"])
    if brightness_col:
        result["brightness"] = pd.to_numeric(df[brightness_col], errors="coerce")
    else:
        result["brightness"] = np.nan

    frp_col = _find_col(df, ["frp", "FRP", "fire_radiative_power"])
    if frp_col:
        result["fire_radiative_power"] = pd.to_numeric(df[frp_col], errors="coerce")
    else:
        result["fire_radiative_power"] = np.nan

    # Confidence
    conf_col = _find_col(df, ["confidence", "Confidence", "conf"])
    if conf_col:
        result["confidence"] = pd.to_numeric(df[conf_col], errors="coerce")
    else:
        result["confidence"] = np.nan

    # Satellite source
    sat_col = _find_col(df, ["satellite", "instrument", "Satellite"])
    if sat_col:
        result["satellite"] = df[sat_col].astype(str).str.strip()
    else:
        result["satellite"] = "unknown"

    result["source_file"] = file_path.name
    return result


def compute_fire_factors(fire_df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute fire risk factors per grid cell.

    Outputs:
    - fire_event_count (total detections)
    - fire_risk_index (0-1 normalized)
    - avg_fire_intensity (brightness/FRP)
    - seasonal_fire_profile (month distribution)
    """
    if fire_df.empty:
        return pd.DataFrame()

    geo = fire_df.dropna(subset=["latitude", "longitude"]).copy()
    if geo.empty:
        return pd.DataFrame()

    geo["grid_lat"] = (geo["latitude"] / 0.1).round() * 0.1
    geo["grid_lon"] = (geo["longitude"] / 0.1).round() * 0.1

    grouped = geo.groupby(["grid_lat", "grid_lon"]).agg(
        fire_count=("latitude", "size"),
        avg_brightness=("brightness", "mean"),
        avg_frp=("fire_radiative_power", "mean"),
        max_frp=("fire_radiative_power", "max"),
    ).reset_index()

    # Normalize fire risk
    max_fires = grouped["fire_count"].quantile(0.95)
    if max_fires > 0:
        grouped["fire_risk_index"] = (grouped["fire_count"] / max_fires).clip(0, 1)
    else:
        grouped["fire_risk_index"] = 0.0

    # Intensity score
    if grouped["avg_frp"].notna().sum() > 0:
        max_frp = grouped["avg_frp"].quantile(0.95)
        if max_frp > 0:
            grouped["fire_intensity_score"] = (grouped["avg_frp"] / max_frp).clip(0, 1)
        else:
            grouped["fire_intensity_score"] = 0.0
    else:
        grouped["fire_intensity_score"] = grouped["fire_risk_index"] * 0.5

    # Seasonal distribution
    if "month" in geo.columns and geo["month"].notna().sum() > 0:
        seasonal = geo.groupby(["grid_lat", "grid_lon", "month"]).size().reset_index(name="count")
        winter_fires = seasonal[seasonal["month"].isin([11, 12, 1, 2, 3])].groupby(
            ["grid_lat", "grid_lon"]
        )["count"].sum().reset_index(name="winter_fire_count")
        grouped = grouped.merge(winter_fires, on=["grid_lat", "grid_lon"], how="left")
        grouped["winter_fire_count"] = grouped["winter_fire_count"].fillna(0)
    else:
        grouped["winter_fire_count"] = 0

    grouped["latitude"] = grouped["grid_lat"]
    grouped["longitude"] = grouped["grid_lon"]

    return grouped


def ingest_all_fire() -> pd.DataFrame:
    csv_files = list(RAW_FIRE.glob("**/*.csv"))
    print(f"Found {len(csv_files)} fire CSV files")

    all_frames = []
    for f in csv_files:
        df = ingest_fire_file(f)
        if df is not None and not df.empty:
            all_frames.append(df)
            print(f"  Parsed {f.name}: {len(df)} fire detections in India")

    if not all_frames:
        print("No fire data found!")
        return pd.DataFrame()

    combined = pd.concat(all_frames, ignore_index=True)
    print(f"Combined: {len(combined)} fire detections")

    factors = compute_fire_factors(combined)

    output_path = PROCESSED_DIR / "fire_grid.parquet"
    factors.to_parquet(output_path, index=False)
    print(f"Saved: {output_path} ({len(factors)} grid cells)")

    return factors


if __name__ == "__main__":
    ingest_all_fire()