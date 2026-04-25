"""
Ingest hospital and health infrastructure datasets.

Input:  data/raw/health/*.csv
Output: data/processed/health_grid.parquet
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from config.settings import RAW_HEALTH, PROCESSED_DIR


HOSPITAL_TYPE_SCORES = {
    # Higher score = better equipped facility
    "aiims": 100,
    "medical college": 95,
    "district hospital": 85,
    "sub-district hospital": 75,
    "community health centre": 65,
    "chc": 65,
    "primary health centre": 50,
    "phc": 50,
    "sub centre": 30,
    "dispensary": 35,
    "private": 70,
    "government": 60,
    "charitable": 55,
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


def _classify_hospital_type(name_or_type: str) -> tuple[str, float]:
    """Classify hospital and return (type, capability_score)."""
    text = str(name_or_type).lower().strip()

    for keyword, score in HOSPITAL_TYPE_SCORES.items():
        if keyword in text:
            return keyword, float(score)

    # Default classification based on name patterns
    if any(w in text for w in ["super", "specialty", "multi"]):
        return "specialty", 90.0
    if any(w in text for w in ["clinic", "nursing home"]):
        return "clinic", 55.0
    if any(w in text for w in ["hospital", "medical"]):
        return "general_hospital", 65.0

    return "unknown", 50.0


def ingest_hospital_file(file_path: Path) -> pd.DataFrame | None:
    """Parse a single hospital/health CSV."""
    try:
        df = pd.read_csv(file_path, low_memory=False, encoding="utf-8")
    except Exception:
        try:
            df = pd.read_csv(file_path, low_memory=False, encoding="latin-1")
        except Exception as e:
            print(f"  Cannot read {file_path.name}: {e}")
            return None

    if df.empty:
        return None

    result = pd.DataFrame()

    # Location
    lat_col = _find_col(df, ["latitude", "lat", "Latitude", "hospital_latitude"])
    lon_col = _find_col(df, ["longitude", "lon", "lng", "Longitude", "hospital_longitude"])
    state_col = _find_col(df, ["state", "State", "STATE", "state_name"])
    district_col = _find_col(df, ["district", "District", "DISTRICT"])
    city_col = _find_col(df, ["city", "City", "location", "place"])

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
    if city_col:
        result["city"] = df[city_col].astype(str).str.strip().str.lower()

    # Hospital name
    name_col = _find_col(df, [
        "hospital_name", "name", "Name", "Hospital_Name",
        "facility_name", "Facility_Name", "hospital",
    ])
    if name_col:
        result["hospital_name"] = df[name_col].astype(str).str.strip()
    else:
        result["hospital_name"] = "Unknown Hospital"

    # Hospital type
    type_col = _find_col(df, [
        "hospital_type", "type", "Type", "Hospital_Type",
        "facility_type", "category", "Category",
    ])
    type_source = df[type_col] if type_col else result["hospital_name"]

    classifications = type_source.apply(_classify_hospital_type)
    result["hospital_type"] = classifications.apply(lambda x: x[0])
    result["hospital_capability_score"] = classifications.apply(lambda x: x[1])

    # Beds
    beds_col = _find_col(df, [
        "beds", "total_beds", "Beds", "no_of_beds",
        "Total_Beds", "bed_count", "number_of_beds",
    ])
    if beds_col:
        result["bed_count"] = pd.to_numeric(df[beds_col], errors="coerce").fillna(0)
    else:
        result["bed_count"] = 0

    # Specialty departments / services
    for dept_name, dept_cols in {
        "has_emergency": ["emergency", "Emergency", "casualty", "trauma"],
        "has_icu": ["icu", "ICU", "intensive"],
        "has_surgery": ["surgery", "surgical", "operation"],
        "has_blood_bank": ["blood_bank", "blood bank", "Blood_Bank"],
    }.items():
        dept_col = _find_col(df, dept_cols)
        if dept_col:
            result[dept_name] = df[dept_col].apply(
                lambda v: 1 if str(v).strip().lower() in ["yes", "y", "1", "true", "available"] else 0
            )
        else:
            # Infer from name/type
            result[dept_name] = type_source.apply(
                lambda v: 1 if any(kw in str(v).lower() for kw in dept_cols) else 0
            )

    result["source_file"] = file_path.name
    return result


def compute_health_factors(hospital_df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute health infrastructure factors per grid cell.

    Outputs:
    - hospital_density (hospitals per grid cell)
    - avg_hospital_capability (average capability score)
    - total_bed_count
    - emergency_availability_score
    - nearest_hospital_estimated_km (proxy based on density)
    """
    if hospital_df.empty:
        return pd.DataFrame()

    geo = hospital_df.dropna(subset=["latitude", "longitude"]).copy()

    if geo.empty:
        return pd.DataFrame()

    geo["grid_lat"] = (geo["latitude"] / 0.1).round() * 0.1
    geo["grid_lon"] = (geo["longitude"] / 0.1).round() * 0.1

    grouped = geo.groupby(["grid_lat", "grid_lon"]).agg(
        hospital_count=("hospital_name", "size"),
        avg_capability=("hospital_capability_score", "mean"),
        total_beds=("bed_count", "sum"),
        emergency_count=("has_emergency", "sum"),
        icu_count=("has_icu", "sum"),
    ).reset_index()

    # Hospital level score (0-100)
    grouped["hospital_level_score"] = grouped["avg_capability"].clip(0, 100)

    # Emergency availability score
    grouped["emergency_availability_score"] = np.where(
        grouped["hospital_count"] > 0,
        (grouped["emergency_count"] / grouped["hospital_count"] * 100).clip(0, 100),
        0.0,
    )

    # Ambulance response proxy: more hospitals = faster response
    # Rough estimate: each hospital "covers" about 15km radius
    grouped["ambulance_response_score"] = (
        grouped["hospital_count"].clip(0, 10) * 10.0
    ).clip(0, 100)

    # Nearest hospital proxy (inverse of density)
    # If 5 hospitals in an 11km cell, avg distance ≈ 2-3km
    grouped["nearest_hospital_proxy_km"] = np.where(
        grouped["hospital_count"] > 0,
        (11.0 / np.sqrt(grouped["hospital_count"])).clip(0.5, 100),
        50.0,
    )

    grouped["latitude"] = grouped["grid_lat"]
    grouped["longitude"] = grouped["grid_lon"]

    return grouped


def ingest_all_health() -> pd.DataFrame:
    csv_files = list(RAW_HEALTH.glob("**/*.csv"))
    print(f"Found {len(csv_files)} health CSV files")

    all_frames = []
    for f in csv_files:
        df = ingest_hospital_file(f)
        if df is not None and not df.empty:
            all_frames.append(df)
            print(f"  Parsed {f.name}: {len(df)} facilities")

    if not all_frames:
        print("No health data found!")
        return pd.DataFrame()

    combined = pd.concat(all_frames, ignore_index=True)
    # Deduplicate hospitals by name + approximate location
    combined["name_lower"] = combined["hospital_name"].str.lower().str.strip()
    combined = combined.drop_duplicates(
        subset=["name_lower", "state"],
        keep="first",
    ).drop(columns=["name_lower"])

    print(f"Combined: {len(combined)} unique facilities")

    factors = compute_health_factors(combined)

    output_path = PROCESSED_DIR / "health_grid.parquet"
    factors.to_parquet(output_path, index=False)
    print(f"Saved: {output_path} ({len(factors)} grid cells)")

    return factors


if __name__ == "__main__":
    ingest_all_health()