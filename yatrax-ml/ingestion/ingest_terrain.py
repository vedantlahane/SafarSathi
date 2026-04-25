"""
Ingest terrain, elevation, and landslide datasets.

Input:  data/raw/terrain/*.csv + shapefiles
Output: data/processed/terrain_grid.parquet

Sources:
  - jaisreenivasan/elevation-of-indian-districts
  - kkhandekar/lanslide-recent-incidents-india
  - nehaprabhavalkar/india-gis-data
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from config.settings import RAW_TERRAIN, PROCESSED_DIR, RANDOM_SEED


# Approximate elevation ranges by Indian region (fallback)
REGION_ELEVATION_M = {
    "coastal": (0, 50),
    "plains": (50, 300),
    "plateau": (300, 900),
    "hills": (900, 2000),
    "mountains": (2000, 5000),
    "high_mountains": (5000, 8500),
}

# State-level terrain type approximations (used when no precise data)
STATE_TERRAIN = {
    "andhra pradesh": "coastal_plains",
    "arunachal pradesh": "mountains",
    "assam": "plains",
    "bihar": "plains",
    "chhattisgarh": "plateau",
    "delhi": "plains",
    "goa": "coastal",
    "gujarat": "coastal_plains",
    "haryana": "plains",
    "himachal pradesh": "mountains",
    "jharkhand": "plateau",
    "karnataka": "plateau",
    "kerala": "coastal_hills",
    "madhya pradesh": "plateau",
    "maharashtra": "plateau_coastal",
    "manipur": "hills",
    "meghalaya": "hills",
    "mizoram": "hills",
    "nagaland": "hills",
    "odisha": "coastal_plains",
    "punjab": "plains",
    "rajasthan": "desert_plains",
    "sikkim": "mountains",
    "tamil nadu": "coastal_plains",
    "telangana": "plateau",
    "tripura": "hills",
    "uttar pradesh": "plains",
    "uttarakhand": "mountains",
    "west bengal": "plains_coastal",
    "jammu and kashmir": "mountains",
    "ladakh": "high_mountains",
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


def ingest_elevation_file(file_path: Path) -> pd.DataFrame | None:
    """Parse elevation dataset."""
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

    # Elevation
    elev_col = _find_col(df, [
        "elevation", "Elevation", "elevation_m", "altitude",
        "Altitude", "height", "avg_elevation", "mean_elevation",
        "elev", "ELEVATION",
    ])
    if elev_col:
        result["elevation_m"] = pd.to_numeric(df[elev_col], errors="coerce").clip(-50, 9000)
    else:
        result["elevation_m"] = np.nan

    # Slope (if available)
    slope_col = _find_col(df, ["slope", "Slope", "slope_deg", "avg_slope"])
    if slope_col:
        result["slope_deg"] = pd.to_numeric(df[slope_col], errors="coerce").clip(0, 90)
    else:
        result["slope_deg"] = np.nan

    # NDVI / vegetation (if available)
    ndvi_col = _find_col(df, ["ndvi", "NDVI", "vegetation_index"])
    if ndvi_col:
        result["ndvi"] = pd.to_numeric(df[ndvi_col], errors="coerce").clip(-1, 1)
    else:
        result["ndvi"] = np.nan

    result["source_file"] = file_path.name
    return result


def ingest_landslide_file(file_path: Path) -> pd.DataFrame | None:
    """Parse landslide incident dataset."""
    try:
        df = pd.read_csv(file_path, low_memory=False)
    except Exception as e:
        print(f"  Cannot read {file_path.name}: {e}")
        return None

    if df.empty:
        return None

    result = pd.DataFrame()

    lat_col = _find_col(df, ["latitude", "lat", "Latitude"])
    lon_col = _find_col(df, ["longitude", "lon", "lng", "Longitude"])

    if lat_col and lon_col:
        result["latitude"] = pd.to_numeric(df[lat_col], errors="coerce")
        result["longitude"] = pd.to_numeric(df[lon_col], errors="coerce")
    else:
        result["latitude"] = np.nan
        result["longitude"] = np.nan

    # Date
    date_col = _find_col(df, ["date", "Date", "event_date", "year"])
    if date_col:
        result["date"] = pd.to_datetime(df[date_col], errors="coerce")
        result["year"] = result["date"].dt.year
        result["month"] = result["date"].dt.month
    else:
        result["date"] = pd.NaT
        result["year"] = np.nan
        result["month"] = np.nan

    # Severity / fatalities
    deaths_col = _find_col(df, ["deaths", "killed", "fatalities", "fatality"])
    if deaths_col:
        result["deaths"] = pd.to_numeric(df[deaths_col], errors="coerce").fillna(0)
    else:
        result["deaths"] = 0

    # Trigger
    trigger_col = _find_col(df, ["trigger", "cause", "landslide_trigger"])
    if trigger_col:
        result["trigger"] = df[trigger_col].astype(str).str.strip().str.lower()
    else:
        result["trigger"] = "unknown"

    state_col = _find_col(df, ["state", "State", "STATE"])
    if state_col:
        result["state"] = df[state_col].astype(str).str.strip().str.lower()

    result["event_type"] = "landslide"
    result["source_file"] = file_path.name
    return result


def compute_terrain_factors(
    elevation_df: pd.DataFrame,
    landslide_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Compute terrain safety factors per grid cell.

    Outputs:
    - elevation_m (average elevation)
    - slope_deg (average slope)
    - ndvi (vegetation density)
    - landslide_prone_index (0-1, based on historical incidents)
    - altitude_sickness_risk (0-1, based on elevation)
    - terrain_difficulty_score (0-1, composite)
    """
    results = []

    # Process elevation data
    if not elevation_df.empty:
        geo = elevation_df.dropna(subset=["latitude", "longitude"]).copy()
        if not geo.empty:
            geo["grid_lat"] = (geo["latitude"] / 0.1).round() * 0.1
            geo["grid_lon"] = (geo["longitude"] / 0.1).round() * 0.1

            elev_grid = geo.groupby(["grid_lat", "grid_lon"]).agg(
                elevation_m=("elevation_m", "mean"),
                slope_deg=("slope_deg", "mean"),
                ndvi=("ndvi", "mean"),
            ).reset_index()

            results.append(elev_grid)

    # Process landslide data
    if not landslide_df.empty:
        geo = landslide_df.dropna(subset=["latitude", "longitude"]).copy()
        if not geo.empty:
            geo["grid_lat"] = (geo["latitude"] / 0.1).round() * 0.1
            geo["grid_lon"] = (geo["longitude"] / 0.1).round() * 0.1

            ls_grid = geo.groupby(["grid_lat", "grid_lon"]).agg(
                landslide_count=("event_type", "size"),
                landslide_deaths=("deaths", "sum"),
            ).reset_index()

            # Normalize to risk index
            max_ls = ls_grid["landslide_count"].quantile(0.95)
            if max_ls > 0:
                ls_grid["landslide_prone_index"] = (ls_grid["landslide_count"] / max_ls).clip(0, 1)
            else:
                ls_grid["landslide_prone_index"] = 0.0

            results.append(ls_grid)

    if not results:
        return pd.DataFrame()

    # Merge elevation + landslide
    merged = results[0]
    for extra in results[1:]:
        merged = merged.merge(
            extra, on=["grid_lat", "grid_lon"], how="outer"
        )

    merged = merged.fillna({
        "elevation_m": 200.0,
        "slope_deg": 5.0,
        "ndvi": 0.3,
        "landslide_count": 0,
        "landslide_prone_index": 0.0,
        "landslide_deaths": 0,
    })

    # Derived factors
    # Altitude sickness risk: starts at 2500m, serious above 3500m
    merged["altitude_sickness_risk"] = np.where(
        merged["elevation_m"] > 2500,
        ((merged["elevation_m"] - 2500) / 3000).clip(0, 1),
        0.0,
    )

    # Terrain difficulty composite
    slope_norm = (merged["slope_deg"] / 45.0).clip(0, 1)
    elev_norm = (merged["elevation_m"] / 5000.0).clip(0, 1)
    veg_factor = (1.0 - merged["ndvi"].clip(0, 0.8))  # less vegetation = harder terrain
    ls_factor = merged["landslide_prone_index"]

    merged["terrain_difficulty_score"] = (
        slope_norm * 0.35 +
        elev_norm * 0.25 +
        veg_factor * 0.15 +
        ls_factor * 0.25
    ).clip(0, 1)

    merged["latitude"] = merged["grid_lat"]
    merged["longitude"] = merged["grid_lon"]

    return merged


def ingest_all_terrain() -> pd.DataFrame:
    csv_files = list(RAW_TERRAIN.glob("**/*.csv"))
    print(f"Found {len(csv_files)} terrain CSV files")

    elevation_frames = []
    landslide_frames = []

    for f in csv_files:
        fname = f.name.lower()

        if any(kw in fname for kw in ["landslide", "lanslide", "land_slide"]):
            df = ingest_landslide_file(f)
            if df is not None and not df.empty:
                landslide_frames.append(df)
                print(f"  Parsed landslide: {f.name}: {len(df)} events")
        else:
            df = ingest_elevation_file(f)
            if df is not None and not df.empty:
                elevation_frames.append(df)
                print(f"  Parsed elevation: {f.name}: {len(df)} rows")

    elevation_df = pd.concat(elevation_frames, ignore_index=True) if elevation_frames else pd.DataFrame()
    landslide_df = pd.concat(landslide_frames, ignore_index=True) if landslide_frames else pd.DataFrame()

    print(f"Elevation records: {len(elevation_df)}")
    print(f"Landslide events: {len(landslide_df)}")

    factors = compute_terrain_factors(elevation_df, landslide_df)

    output_path = PROCESSED_DIR / "terrain_grid.parquet"
    if not factors.empty:
        factors.to_parquet(output_path, index=False)
        print(f"Saved: {output_path} ({len(factors)} grid cells)")
    else:
        print("No terrain data to save")

    return factors


if __name__ == "__main__":
    ingest_all_terrain()