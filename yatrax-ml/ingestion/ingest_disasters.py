"""
Ingest flood, earthquake, cyclone, and general disaster datasets.

Input:  data/raw/disasters/*.csv
Output: data/processed/disaster_grid.parquet
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from config.settings import RAW_DISASTERS, PROCESSED_DIR


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


def _detect_disaster_type(row: pd.Series) -> str:
    """Infer disaster type from any text columns in the row."""
    text = " ".join(str(v).lower() for v in row.values if pd.notna(v))

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
        # Auto-detect from row content
        result["disaster_type"] = df.apply(_detect_disaster_type, axis=1)

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


def compute_disaster_factors(disaster_df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute safety-relevant disaster factors.
    
    Outputs:
    - flood_risk_index (historical flood frequency + severity)
    - earthquake_zone_risk (historical earthquake frequency + magnitude)
    - cyclone_risk_index (historical cyclone impact)
    - overall_disaster_risk (composite)
    """
    if disaster_df.empty:
        return pd.DataFrame()

    # Only rows with coordinates
    geo = disaster_df.dropna(subset=["latitude", "longitude"]).copy()

    if geo.empty:
        return pd.DataFrame()

    # Round to grid cells
    geo["grid_lat"] = (geo["latitude"] / 0.1).round() * 0.1
    geo["grid_lon"] = (geo["longitude"] / 0.1).round() * 0.1

    # Count events by type per grid cell
    flood_events = geo[geo["disaster_type"] == "flood"]
    earthquake_events = geo[geo["disaster_type"] == "earthquake"]
    cyclone_events = geo[geo["disaster_type"] == "cyclone"]
    landslide_events = geo[geo["disaster_type"] == "landslide"]

    all_cells = geo.groupby(["grid_lat", "grid_lon"]).size().reset_index(name="total_events")

    def _count_by_type(events: pd.DataFrame, name: str) -> pd.DataFrame:
        if events.empty:
            return pd.DataFrame(columns=["grid_lat", "grid_lon", f"{name}_count", f"{name}_severity_avg"])
        grouped = events.groupby(["grid_lat", "grid_lon"]).agg(
            count=("disaster_type", "size"),
            severity_avg=("severity", "mean"),
            deaths_total=("deaths", "sum"),
        ).reset_index()
        grouped.columns = ["grid_lat", "grid_lon", f"{name}_count", f"{name}_severity_avg", f"{name}_deaths"]
        return grouped

    flood_grid = _count_by_type(flood_events, "flood")
    earthquake_grid = _count_by_type(earthquake_events, "earthquake")
    cyclone_grid = _count_by_type(cyclone_events, "cyclone")
    landslide_grid = _count_by_type(landslide_events, "landslide")

    # Merge all
    result = all_cells.copy()
    for grid_df in [flood_grid, earthquake_grid, cyclone_grid, landslide_grid]:
        if not grid_df.empty:
            result = result.merge(grid_df, on=["grid_lat", "grid_lon"], how="left")

    result = result.fillna(0)

    # Normalize to risk indices (0 to 1)
    for col in ["flood_count", "earthquake_count", "cyclone_count", "landslide_count"]:
        if col in result.columns:
            max_val = result[col].quantile(0.95)
            if max_val > 0:
                result[col.replace("_count", "_risk")] = (result[col] / max_val).clip(0, 1)
            else:
                result[col.replace("_count", "_risk")] = 0.0

    result["latitude"] = result["grid_lat"]
    result["longitude"] = result["grid_lon"]

    return result


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