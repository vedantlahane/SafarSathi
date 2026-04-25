"""
Ingest road accident datasets.

Input:  data/raw/road_accidents/*.csv
Output: data/processed/accident_grid.parquet
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from config.settings import RAW_ACCIDENTS, PROCESSED_DIR


SEVERITY_KEYWORDS = {
    "fatal": ["fatal", "killed", "death", "dead"],
    "grievous": ["grievous", "serious", "major", "severe"],
    "minor": ["minor", "simple", "slight", "non-grievous"],
}


def _find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for c in candidates:
        if c in df.columns:
            return c
    lower_map = {col.lower().strip(): col for col in df.columns}
    for c in candidates:
        if c.lower().strip() in lower_map:
            return lower_map[c.lower().strip()]
    return None


def _detect_severity(row: pd.Series) -> str:
    """Classify accident severity from any text columns."""
    text = " ".join(str(v).lower() for v in row.values if pd.notna(v))
    for severity, keywords in SEVERITY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return severity
    return "unknown"


def _severity_to_score(severity: str) -> float:
    """Convert severity category to numeric risk score."""
    return {
        "fatal": 1.0,
        "grievous": 0.7,
        "minor": 0.3,
        "unknown": 0.5,
    }.get(severity, 0.5)


def ingest_accident_file(file_path: Path) -> pd.DataFrame | None:
    """Parse a single road accident CSV."""
    try:
        df = pd.read_csv(file_path, low_memory=False)
    except Exception as e:
        print(f"  Cannot read {file_path.name}: {e}")
        return None

    if df.empty:
        return None

    result = pd.DataFrame()

    # Location
    lat_col = _find_col(df, ["latitude", "lat", "Latitude"])
    lon_col = _find_col(df, ["longitude", "lon", "lng", "Longitude"])
    state_col = _find_col(df, ["state", "State", "STATE", "state_name", "State_Name"])
    district_col = _find_col(df, ["district", "District", "DISTRICT"])

    if lat_col and lon_col:
        result["latitude"] = pd.to_numeric(df[lat_col], errors="coerce")
        result["longitude"] = pd.to_numeric(df[lon_col], errors="coerce")
    else:
        result["latitude"] = np.nan
        result["longitude"] = np.nan

    if state_col:
        result["state"] = df[state_col].astype(str).str.strip().str.lower()
    else:
        result["state"] = "unknown"

    if district_col:
        result["district"] = df[district_col].astype(str).str.strip().str.lower()
    else:
        result["district"] = "unknown"

    # Date / Year
    date_col = _find_col(df, ["date", "Date", "accident_date", "year", "Year"])
    if date_col:
        parsed = pd.to_datetime(df[date_col], errors="coerce")
        if parsed.notna().sum() > len(df) * 0.3:
            result["date"] = parsed
            result["year"] = parsed.dt.year
            result["month"] = parsed.dt.month
            result["hour"] = parsed.dt.hour
        else:
            # Might be just a year column
            result["year"] = pd.to_numeric(df[date_col], errors="coerce")
            result["month"] = np.nan
            result["hour"] = np.nan
            result["date"] = pd.NaT
    else:
        result["date"] = pd.NaT
        result["year"] = np.nan
        result["month"] = np.nan
        result["hour"] = np.nan

    # Accident counts / casualties
    accidents_col = _find_col(df, [
        "total_accidents", "accidents", "no_of_accidents",
        "Total_Accidents", "Accidents", "accident_count",
    ])
    if accidents_col:
        result["accident_count"] = pd.to_numeric(df[accidents_col], errors="coerce").fillna(1)
    else:
        result["accident_count"] = 1

    killed_col = _find_col(df, [
        "persons_killed", "killed", "deaths", "fatalities",
        "Persons_Killed", "no_killed", "total_killed",
    ])
    if killed_col:
        result["persons_killed"] = pd.to_numeric(df[killed_col], errors="coerce").fillna(0)
    else:
        result["persons_killed"] = 0

    injured_col = _find_col(df, [
        "persons_injured", "injured", "Persons_Injured",
        "no_injured", "total_injured",
    ])
    if injured_col:
        result["persons_injured"] = pd.to_numeric(df[injured_col], errors="coerce").fillna(0)
    else:
        result["persons_injured"] = 0

    # Road type
    road_col = _find_col(df, [
        "road_type", "Road_Type", "road_category",
        "road_name", "highway",
    ])
    if road_col:
        result["road_type"] = df[road_col].astype(str).str.strip().str.lower()
    else:
        result["road_type"] = "unknown"

    # Severity
    severity_col = _find_col(df, ["severity", "Severity", "accident_severity"])
    if severity_col:
        result["severity"] = df[severity_col].astype(str).str.strip().str.lower()
    else:
        result["severity"] = df.apply(_detect_severity, axis=1)

    result["severity_score"] = result["severity"].apply(_severity_to_score)

    # Cause
    cause_col = _find_col(df, [
        "cause", "Cause", "accident_cause", "reason",
        "cause_category", "Cause_category",
    ])
    if cause_col:
        result["cause"] = df[cause_col].astype(str).str.strip().str.lower()
    else:
        result["cause"] = "unknown"

    # Vehicle type
    vehicle_col = _find_col(df, [
        "vehicle_type", "Vehicle_Type", "vehicle",
    ])
    if vehicle_col:
        result["vehicle_type"] = df[vehicle_col].astype(str).str.strip().str.lower()
    else:
        result["vehicle_type"] = "unknown"

    # Weather condition at time of accident
    weather_col = _find_col(df, [
        "weather", "Weather", "weather_condition",
        "Weather_Condition",
    ])
    if weather_col:
        result["weather_condition"] = df[weather_col].astype(str).str.strip().str.lower()
    else:
        result["weather_condition"] = "unknown"

    # Filter out aggregate rows
    result = result[
        ~result["state"].str.contains("total|all india|grand", case=False, na=False)
    ].copy()

    result["source_file"] = file_path.name
    return result


def compute_accident_factors(accident_df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute safety-relevant accident factors per grid cell.

    Outputs:
    - road_accident_hotspot_risk (0-1)
    - accident_severity_index (0-1)
    - fatality_rate (killed per accident)
    - night_accident_ratio (proxy for time-of-day risk)
    - weather_accident_ratio (proxy for weather-related risk)
    """
    if accident_df.empty:
        return pd.DataFrame()

    geo = accident_df.dropna(subset=["latitude", "longitude"]).copy()

    # If no coordinates, try state-level aggregation with centroids
    if geo.empty and "state" in accident_df.columns:
        return _aggregate_by_state(accident_df)

    if geo.empty:
        return pd.DataFrame()

    # Grid cells
    geo["grid_lat"] = (geo["latitude"] / 0.1).round() * 0.1
    geo["grid_lon"] = (geo["longitude"] / 0.1).round() * 0.1

    grouped = geo.groupby(["grid_lat", "grid_lon"]).agg(
        total_accidents=("accident_count", "sum"),
        total_killed=("persons_killed", "sum"),
        total_injured=("persons_injured", "sum"),
        avg_severity=("severity_score", "mean"),
        event_count=("accident_count", "size"),
    ).reset_index()

    # Normalize to risk indices
    max_accidents = grouped["total_accidents"].quantile(0.95)
    if max_accidents > 0:
        grouped["road_accident_hotspot_risk"] = (
            grouped["total_accidents"] / max_accidents
        ).clip(0, 1)
    else:
        grouped["road_accident_hotspot_risk"] = 0.0

    grouped["accident_severity_index"] = grouped["avg_severity"].clip(0, 1)

    # Fatality rate
    grouped["fatality_rate"] = np.where(
        grouped["total_accidents"] > 0,
        (grouped["total_killed"] / grouped["total_accidents"]).clip(0, 1),
        0.0,
    )

    grouped["latitude"] = grouped["grid_lat"]
    grouped["longitude"] = grouped["grid_lon"]

    return grouped


def _aggregate_by_state(accident_df: pd.DataFrame) -> pd.DataFrame:
    """Fallback: aggregate accident data at state level when no coordinates exist."""
    from ingestion.ingest_crime import _load_district_centroids

    state_grouped = accident_df.groupby("state").agg(
        total_accidents=("accident_count", "sum"),
        total_killed=("persons_killed", "sum"),
        total_injured=("persons_injured", "sum"),
        avg_severity=("severity_score", "mean"),
    ).reset_index()

    centroids = _load_district_centroids()
    merged = state_grouped.merge(centroids, on="state", how="left")
    merged = merged.dropna(subset=["latitude", "longitude"])

    max_acc = merged["total_accidents"].quantile(0.95)
    if max_acc > 0:
        merged["road_accident_hotspot_risk"] = (merged["total_accidents"] / max_acc).clip(0, 1)
    else:
        merged["road_accident_hotspot_risk"] = 0.0

    merged["accident_severity_index"] = merged["avg_severity"].clip(0, 1)
    merged["fatality_rate"] = np.where(
        merged["total_accidents"] > 0,
        (merged["total_killed"] / merged["total_accidents"]).clip(0, 1),
        0.0,
    )

    return merged


def ingest_all_accidents() -> pd.DataFrame:
    csv_files = list(RAW_ACCIDENTS.glob("**/*.csv"))
    print(f"Found {len(csv_files)} accident CSV files")

    all_frames = []
    for f in csv_files:
        df = ingest_accident_file(f)
        if df is not None and not df.empty:
            all_frames.append(df)
            print(f"  Parsed {f.name}: {len(df)} rows")

    if not all_frames:
        print("No accident data found!")
        return pd.DataFrame()

    combined = pd.concat(all_frames, ignore_index=True)
    print(f"Combined: {len(combined)} accident records")

    factors = compute_accident_factors(combined)

    output_path = PROCESSED_DIR / "accident_grid.parquet"
    factors.to_parquet(output_path, index=False)
    print(f"Saved: {output_path} ({len(factors)} grid cells)")

    return factors


if __name__ == "__main__":
    ingest_all_accidents()