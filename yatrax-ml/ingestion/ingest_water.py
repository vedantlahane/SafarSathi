"""
Ingest water quality datasets.

Input:  data/raw/water_quality/*.csv
Output: data/processed/water_quality_grid.parquet

Sources:
  - anbarivan/indian-water-quality-data
  - balabaskar/water-quality-data-india
  - venkatramakrishnan/india-water-quality-data
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from config.settings import RAW_WATER, PROCESSED_DIR


# WHO / BIS drinking water guidelines
SAFE_LIMITS = {
    "ph": (6.5, 8.5),
    "dissolved_oxygen": (5.0, None),      # mg/L, minimum
    "bod": (None, 3.0),                   # mg/L, maximum
    "cod": (None, 10.0),
    "conductivity": (None, 1500.0),       # µS/cm
    "total_coliform": (None, 50.0),       # MPN/100mL
    "fecal_coliform": (None, 0.0),        # should be 0
    "nitrate": (None, 45.0),              # mg/L
    "fluoride": (None, 1.5),              # mg/L
    "arsenic": (None, 0.01),              # mg/L
    "iron": (None, 0.3),                  # mg/L
    "hardness": (None, 300.0),            # mg/L
    "turbidity": (None, 5.0),             # NTU
    "tds": (None, 500.0),                 # mg/L
}

CITY_COORDS = {
    "delhi": (28.6139, 77.2090), "mumbai": (19.0760, 72.8777),
    "kolkata": (22.5726, 88.3639), "chennai": (13.0827, 80.2707),
    "bangalore": (12.9716, 77.5946), "hyderabad": (17.3850, 78.4867),
    "ahmedabad": (23.0225, 72.5714), "pune": (18.5204, 73.8567),
    "lucknow": (26.8467, 80.9462), "jaipur": (26.9124, 75.7873),
    "chandigarh": (30.7333, 76.7794), "patna": (25.6093, 85.1376),
    "bhopal": (23.2599, 77.4126), "nagpur": (21.1458, 79.0882),
    "indore": (22.7196, 75.8577), "surat": (21.1702, 72.8311),
    "visakhapatnam": (17.6868, 83.2185), "coimbatore": (11.0168, 76.9558),
    "kochi": (9.9312, 76.2673), "thiruvananthapuram": (8.5241, 76.9366),
    "dehradun": (30.3165, 78.0322), "ranchi": (23.3441, 85.3096),
    "bhubaneswar": (20.2961, 85.8245), "raipur": (21.2514, 81.6296),
    "guwahati": (26.1445, 91.7362), "varanasi": (25.3176, 83.0064),
    "agra": (27.1767, 78.0081), "kanpur": (26.4499, 80.3319),
    "noida": (28.5355, 77.3910), "gurgaon": (28.4595, 77.0266),
    "faridabad": (28.4089, 77.3178), "ghaziabad": (28.6692, 77.4538),
    "mysore": (12.2958, 76.6394), "vijayawada": (16.5062, 80.6480),
    "rajkot": (22.3039, 70.8022), "madurai": (9.9252, 78.1198),
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


def _compute_parameter_safety(value: float, param: str) -> float:
    """
    Score a single water parameter: 1.0 = safe, 0.0 = dangerous.
    """
    if pd.isna(value) or param not in SAFE_LIMITS:
        return 0.5  # unknown

    lo, hi = SAFE_LIMITS[param]

    if lo is not None and hi is not None:
        # Range parameter (like pH)
        if lo <= value <= hi:
            return 1.0
        deviation = max(lo - value, value - hi, 0) / max(abs(hi - lo), 1e-6)
        return max(0.0, 1.0 - deviation)

    elif hi is not None:
        # Maximum limit (like BOD, nitrate)
        if value <= hi:
            return 1.0
        return max(0.0, 1.0 - (value - hi) / max(hi, 1e-6))

    elif lo is not None:
        # Minimum limit (like dissolved oxygen)
        if value >= lo:
            return 1.0
        return max(0.0, value / max(lo, 1e-6))

    return 0.5


def ingest_water_file(file_path: Path) -> pd.DataFrame | None:
    """Parse a single water quality CSV."""
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
    state_col = _find_col(df, ["state", "State", "STATE", "state_name", "STATE_NAME"])
    station_col = _find_col(df, [
        "station", "Station", "station_name", "Station_Name",
        "location", "Location", "STATION_NAME",
    ])

    if lat_col and lon_col:
        result["latitude"] = pd.to_numeric(df[lat_col], errors="coerce")
        result["longitude"] = pd.to_numeric(df[lon_col], errors="coerce")
        result["coverage_type"] = "exact"
    else:
        result["latitude"] = np.nan
        result["longitude"] = np.nan
        result["coverage_type"] = "none"

    if state_col:
        result["state"] = df[state_col].astype(str).str.strip().str.lower()
        result.loc[result["coverage_type"] == "none", "coverage_type"] = "state"
    
    if station_col:
        result["station"] = df[station_col].astype(str).str.strip()
        
        # Try to map station to known city coordinates
        for idx in result.index:
            if pd.isna(result.at[idx, "latitude"]):
                station_name = str(result.at[idx, "station"]).lower()
                matched = False
                for city, (lat, lon) in CITY_COORDS.items():
                    if city in station_name:
                        result.at[idx, "latitude"] = lat
                        result.at[idx, "longitude"] = lon
                        result.at[idx, "coverage_type"] = "station_matched"
                        matched = True
                        break
                if not matched:
                    # Also check state name as a last resort, but add random jitter
                    if "state" in result.columns and pd.notna(result.at[idx, "state"]):
                        state_name = str(result.at[idx, "state"]).lower()
                        # Fallback state coordinates
                        STATE_COORDS = {"kerala": (10.85, 76.27), "maharashtra": (19.08, 72.88), "karnataka": (12.97, 77.59), "tamil nadu": (13.08, 80.27)}
                        for st, (lat, lon) in STATE_COORDS.items():
                            if st in state_name:
                                result.at[idx, "latitude"] = lat + np.random.uniform(-0.5, 0.5)
                                result.at[idx, "longitude"] = lon + np.random.uniform(-0.5, 0.5)
                                result.at[idx, "coverage_type"] = "state_jittered"
                                break

    # Date
    date_col = _find_col(df, ["date", "Date", "year", "Year", "sampling_date"])
    if date_col:
        parsed = pd.to_datetime(df[date_col], errors="coerce")
        if parsed.notna().sum() > len(df) * 0.3:
            result["date"] = parsed
            result["year"] = parsed.dt.year
            result["month"] = parsed.dt.month
        else:
            result["year"] = pd.to_numeric(df[date_col], errors="coerce")
            result["month"] = np.nan
            result["date"] = pd.NaT
    else:
        result["date"] = pd.NaT
        result["year"] = np.nan
        result["month"] = np.nan

    # Water quality parameters
    param_col_map = {
        "ph": ["ph", "pH", "PH", "p_h"],
        "dissolved_oxygen": ["do", "DO", "dissolved_oxygen", "Dissolved_Oxygen", "do_mg_l"],
        "bod": ["bod", "BOD", "bod_mg_l"],
        "cod": ["cod", "COD", "cod_mg_l"],
        "conductivity": ["conductivity", "Conductivity", "ec", "EC", "electrical_conductivity"],
        "total_coliform": ["total_coliform", "Total_Coliform", "tc", "TC", "coliform"],
        "fecal_coliform": ["fecal_coliform", "Fecal_Coliform", "fc", "FC"],
        "nitrate": ["nitrate", "Nitrate", "no3", "NO3", "nitrate_n"],
        "fluoride": ["fluoride", "Fluoride", "F"],
        "arsenic": ["arsenic", "Arsenic", "As"],
        "iron": ["iron", "Iron", "Fe", "fe"],
        "hardness": ["hardness", "Hardness", "total_hardness", "TH"],
        "turbidity": ["turbidity", "Turbidity", "NTU"],
        "tds": ["tds", "TDS", "total_dissolved_solids"],
        "temperature": ["temp", "temperature", "Temperature", "water_temp"],
    }

    for param, col_candidates in param_col_map.items():
        col = _find_col(df, col_candidates)
        if col:
            result[param] = pd.to_numeric(df[col], errors="coerce")
        else:
            result[param] = np.nan

    # Compute per-parameter safety scores
    for param in SAFE_LIMITS:
        if param in result.columns:
            result[f"{param}_safe"] = result[param].apply(
                lambda v: _compute_parameter_safety(v, param)
            )

    # Overall water safety score (average of available parameter scores)
    safe_cols = [c for c in result.columns if c.endswith("_safe")]
    if safe_cols:
        result["water_safety_score"] = result[safe_cols].mean(axis=1) * 100  # scale to 0-100
    else:
        result["water_safety_score"] = 50.0

    # Contamination risk (inverse of safety)
    result["water_contamination_risk"] = (100.0 - result["water_safety_score"]) / 100.0

    # Drop rows with no data at all
    param_cols = list(param_col_map.keys())
    available_params = [c for c in param_cols if c in result.columns]
    if available_params:
        has_data = result[available_params].notna().any(axis=1)
        result = result[has_data].copy()

    result["source_file"] = file_path.name
    return result


def compute_water_factors(water_df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute water quality factors per grid cell.

    Outputs:
    - water_safety_score (0-100)
    - water_contamination_risk (0-1)
    - drinking_water_safe (binary proxy)
    """
    if water_df.empty:
        return pd.DataFrame()

    geo = water_df.dropna(subset=["latitude", "longitude"]).copy()

    if geo.empty:
        return pd.DataFrame()

    geo["grid_lat"] = (geo["latitude"] / 0.1).round() * 0.1
    geo["grid_lon"] = (geo["longitude"] / 0.1).round() * 0.1

    grouped = geo.groupby(["grid_lat", "grid_lon"]).agg(
        water_safety_score=("water_safety_score", "mean"),
        water_contamination_risk=("water_contamination_risk", "mean"),
        sample_count=("water_safety_score", "size"),
        coverage_type=("coverage_type", "first"),
    ).reset_index()

    grouped["drinking_water_safe"] = (grouped["water_safety_score"] > 60).astype(float)
    grouped["latitude"] = grouped["grid_lat"]
    grouped["longitude"] = grouped["grid_lon"]

    return grouped


def _aggregate_water_by_state(water_df: pd.DataFrame) -> pd.DataFrame:
    """Fallback: aggregate at state level."""
    # Deprecated: Do not spread state-level averages as if they were local measurements
    return pd.DataFrame()


def ingest_all_water() -> pd.DataFrame:
    csv_files = list(RAW_WATER.glob("**/*.csv"))
    print(f"Found {len(csv_files)} water quality CSV files")

    all_frames = []
    for f in csv_files:
        df = ingest_water_file(f)
        if df is not None and not df.empty:
            all_frames.append(df)
            print(f"  Parsed {f.name}: {len(df)} rows, "
                  f"safety={df['water_safety_score'].mean():.1f}")

    if not all_frames:
        print("No water quality data found!")
        return pd.DataFrame()

    combined = pd.concat(all_frames, ignore_index=True)
    print(f"Combined: {len(combined)} water quality records")

    if "coverage_type" in combined.columns:
        print(f"Coverage breakdown: {combined['coverage_type'].value_counts().to_dict()}")

    if "station" in combined.columns:
        print(f"Unique stations: {combined['station'].nunique()}")

    if "latitude" in combined.columns:
        coord_pct = float(combined["latitude"].notna().mean() * 100)
        print(f"Coordinate coverage: {coord_pct:.1f}%")
        if coord_pct < 5.0:
            print(f"  ⚠️ Water coverage is very low ({coord_pct:.1f}%)")

    factors = compute_water_factors(combined)
    
    if factors.empty:
        print("No spatial water factors could be computed!")
        return pd.DataFrame()

    output_path = PROCESSED_DIR / "water_quality_grid.parquet"
    factors.to_parquet(output_path, index=False)
    print(f"Saved: {output_path} ({len(factors)} grid cells)")

    return factors


if __name__ == "__main__":
    ingest_all_water()