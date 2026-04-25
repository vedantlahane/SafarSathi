"""
Ingest census and population datasets.

Input:  data/raw/population/*.csv
Output: data/processed/population_grid.parquet

Sources:
  - sirpunch/indian-census-data-with-geospatial-indexing
  - webaccess/all-census-data
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from config.settings import RAW_POPULATION, PROCESSED_DIR


def _find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for c in candidates:
        if c in df.columns:
            return c
    lower_map = {col.lower().strip(): col for col in df.columns}
    for c in candidates:
        if c.lower().strip() in lower_map:
            return lower_map[c.lower().strip()]
    return None


def ingest_population_file(file_path: Path) -> pd.DataFrame | None:
    """Parse a single census/population CSV."""
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
    state_col = _find_col(df, ["state", "State", "STATE", "state_name", "State_name"])
    district_col = _find_col(df, ["district", "District", "DISTRICT", "district_name"])

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

    # Population
    pop_col = _find_col(df, [
        "population", "Population", "total_population",
        "Total_Population", "pop", "TOT_P", "tot_p",
    ])
    if pop_col:
        result["population"] = pd.to_numeric(df[pop_col], errors="coerce")
    else:
        result["population"] = np.nan

    # Area
    area_col = _find_col(df, [
        "area", "Area", "area_sq_km", "area_km2",
        "Area_sq_km", "AREA",
    ])
    if area_col:
        result["area_sq_km"] = pd.to_numeric(df[area_col], errors="coerce")
    else:
        result["area_sq_km"] = np.nan

    # Literacy (proxy for development level)
    lit_col = _find_col(df, [
        "literacy", "Literacy", "literacy_rate",
        "Literacy_Rate", "TOT_LIT", "literate",
    ])
    if lit_col:
        val = pd.to_numeric(df[lit_col], errors="coerce")
        # If raw count, need population to convert to rate
        if val.max() > 100 and result["population"].notna().any():
            result["literacy_rate"] = (val / result["population"].clip(lower=1) * 100).clip(0, 100)
        else:
            result["literacy_rate"] = val.clip(0, 100)
    else:
        result["literacy_rate"] = np.nan

    # Urban/Rural
    urban_col = _find_col(df, [
        "urban_population", "Urban_Population", "urban",
        "TOT_U", "urban_pop",
    ])
    if urban_col and pop_col:
        urban_pop = pd.to_numeric(df[urban_col], errors="coerce")
        result["urbanization_rate"] = (urban_pop / result["population"].clip(lower=1) * 100).clip(0, 100)
    else:
        result["urbanization_rate"] = np.nan

    # Sex ratio
    male_col = _find_col(df, ["male", "Male", "TOT_M", "male_population"])
    female_col = _find_col(df, ["female", "Female", "TOT_F", "female_population"])
    if male_col and female_col:
        males = pd.to_numeric(df[male_col], errors="coerce")
        females = pd.to_numeric(df[female_col], errors="coerce")
        result["sex_ratio"] = (females / males.clip(lower=1) * 1000).clip(500, 1200)
    else:
        result["sex_ratio"] = np.nan

    # Compute density
    if result["population"].notna().any() and result["area_sq_km"].notna().any():
        result["population_density_per_km2"] = (
            result["population"] / result["area_sq_km"].clip(lower=0.1)
        )
    else:
        result["population_density_per_km2"] = np.nan

    result["source_file"] = file_path.name
    return result


def compute_population_factors(pop_df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute population-based safety factors per grid cell.

    Outputs:
    - population_density_per_km2
    - urbanization_rate (0-100)
    - literacy_rate (0-100, proxy for development)
    - isolation_score (0-1, inverse of density — higher = more isolated)
    """
    if pop_df.empty:
        return pd.DataFrame()

    geo = pop_df.dropna(subset=["latitude", "longitude"]).copy()

    if geo.empty:
        # State-level fallback
        if "state" in pop_df.columns:
            return _aggregate_population_by_state(pop_df)
        return pd.DataFrame()

    geo["grid_lat"] = (geo["latitude"] / 0.1).round() * 0.1
    geo["grid_lon"] = (geo["longitude"] / 0.1).round() * 0.1

    grouped = geo.groupby(["grid_lat", "grid_lon"]).agg(
        population_density_per_km2=("population_density_per_km2", "mean"),
        urbanization_rate=("urbanization_rate", "mean"),
        literacy_rate=("literacy_rate", "mean"),
        total_population=("population", "sum"),
    ).reset_index()

    # Isolation score: inverse of density, normalized
    max_density = grouped["population_density_per_km2"].quantile(0.95)
    if max_density > 0:
        grouped["isolation_score"] = (
            1.0 - (grouped["population_density_per_km2"] / max_density).clip(0, 1)
        )
    else:
        grouped["isolation_score"] = 0.5

    grouped["latitude"] = grouped["grid_lat"]
    grouped["longitude"] = grouped["grid_lon"]

    return grouped


def _aggregate_population_by_state(pop_df: pd.DataFrame) -> pd.DataFrame:
    from ingestion.ingest_crime import _load_district_centroids

    state_grouped = pop_df.groupby("state").agg(
        population_density_per_km2=("population_density_per_km2", "mean"),
        urbanization_rate=("urbanization_rate", "mean"),
        literacy_rate=("literacy_rate", "mean"),
        total_population=("population", "sum"),
    ).reset_index()

    centroids = _load_district_centroids()
    merged = state_grouped.merge(centroids, on="state", how="left")
    merged = merged.dropna(subset=["latitude", "longitude"])

    max_density = merged["population_density_per_km2"].quantile(0.95)
    if max_density > 0:
        merged["isolation_score"] = (
            1.0 - (merged["population_density_per_km2"] / max_density).clip(0, 1)
        )
    else:
        merged["isolation_score"] = 0.5

    return merged


def ingest_all_population() -> pd.DataFrame:
    csv_files = list(RAW_POPULATION.glob("**/*.csv"))
    print(f"Found {len(csv_files)} population CSV files")

    all_frames = []
    for f in csv_files:
        df = ingest_population_file(f)
        if df is not None and not df.empty:
            all_frames.append(df)
            print(f"  Parsed {f.name}: {len(df)} rows")

    if not all_frames:
        print("No population data found!")
        return pd.DataFrame()

    combined = pd.concat(all_frames, ignore_index=True)
    print(f"Combined: {len(combined)} population records")

    factors = compute_population_factors(combined)

    output_path = PROCESSED_DIR / "population_grid.parquet"
    factors.to_parquet(output_path, index=False)
    print(f"Saved: {output_path} ({len(factors)} grid cells)")

    return factors


if __name__ == "__main__":
    ingest_all_population()