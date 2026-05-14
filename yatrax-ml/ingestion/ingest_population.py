"""
Ingest census and population datasets.

Input:
    data/raw/population/*.csv

Output:
    data/processed/population_grid.parquet

Improvements:
- handles real Indian census schemas more robustly
- fills missing coordinates using district/state centroid lookups
- avoids synthetic population-density formulas
- population-weighted urbanization/literacy aggregation
- deterministic 0.1° grid snapping
- safer numeric parsing and normalization
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------
# Repo bootstrap for standalone execution / Colab
# ---------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.config import get_settings
from processing.geo_grid import snap_dataframe

cfg = get_settings()

RAW_POPULATION = PROJECT_ROOT / "data" / "raw" / "population"
PROCESSED_DIR = PROJECT_ROOT / cfg.data_processed_dir
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# HELPERS
# ============================================================

def _normalize_text(value: object) -> str:
    return (
        str(value)
        .strip()
        .upper()
        .replace("&", " AND ")
        .replace("_", " ")
        .replace("-", " ")
        .replace(".", " ")
    )


def _find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
    """
    Return the best matching column using exact normalized match first,
    then partial containment.
    """
    normalized = {
        _normalize_text(col): col
        for col in df.columns
    }

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


def _safe_numeric(series: pd.Series) -> pd.Series:
    """
    Convert messy numeric text to float.
    Removes commas and strips whitespace.
    """
    return pd.to_numeric(
        series.astype(str)
        .str.replace(",", "", regex=False)
        .str.strip(),
        errors="coerce",
    )


def _weighted_mean(values: pd.Series, weights: pd.Series) -> float:
    """
    Compute weighted mean ignoring NaNs.
    Returns NaN if no valid values exist.
    """
    v = pd.to_numeric(values, errors="coerce")
    w = pd.to_numeric(weights, errors="coerce").fillna(0)

    mask = v.notna() & w.notna() & (w > 0)
    if not mask.any():
        valid = v.dropna()
        return float(valid.mean()) if not valid.empty else np.nan

    vv = v[mask].astype(float)
    ww = w[mask].astype(float)

    total_w = ww.sum()
    if total_w <= 0:
        return float(vv.mean()) if len(vv) else np.nan

    return float((vv * ww).sum() / total_w)


def _choose_first_nonnull(row: pd.Series, cols: list[str]) -> object:
    for c in cols:
        if c in row and pd.notna(row[c]):
            return row[c]
    return np.nan


# ============================================================
# INGEST SINGLE FILE
# ============================================================

def ingest_population_file(file_path: Path) -> pd.DataFrame | None:
    """
    Parse a single population/census CSV into a normalized intermediate table.
    """
    try:
        df = pd.read_csv(file_path, low_memory=False)
    except Exception as exc:
        print(f"Cannot read {file_path.name}: {exc}")
        return None

    if df.empty:
        return None

    df.columns = [c.strip() for c in df.columns]
    result = pd.DataFrame(index=df.index)

    # --------------------------------------------------------
    # LOCATION / IDENTIFIERS
    # --------------------------------------------------------
    lat_col = _find_col(df, ["latitude", "lat", "Latitude"])
    lon_col = _find_col(df, ["longitude", "lon", "lng", "Longitude"])
    state_col = _find_col(df, ["state", "State", "STATE NAME", "STATE"])
    district_col = _find_col(df, ["district", "District", "DISTRICT NAME", "DISTRICT"])

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
    # POPULATION
    # Prefer 2011 when present.
    # --------------------------------------------------------
    pop_col = _find_col(
        df,
        [
            "Population in 2011",
            "Population 2011",
            "TOTAL POULATION",
            "population",
            "Population",
            "total_population",
            "TOT_P",
        ],
    )
    if pop_col:
        result["population"] = _safe_numeric(df[pop_col])
    else:
        result["population"] = np.nan

    # --------------------------------------------------------
    # AREA
    # --------------------------------------------------------
    area_col = _find_col(
        df,
        [
            "AREA (SQ. KM) (AREA SQKM)",
            "area_sq_km",
            "area",
            "AREA",
            "district_area",
        ],
    )
    if area_col:
        result["area_sq_km"] = _safe_numeric(df[area_col])
    else:
        result["area_sq_km"] = np.nan

    # --------------------------------------------------------
    # LITERACY
    # --------------------------------------------------------
    literacy_col = _find_col(
        df,
        [
            "overall literacy",
            "literacy rate",
            "literacy",
            "OVERALL LITERACY",
            "LITERACY RATE",
        ],
    )
    if literacy_col:
        literacy = _safe_numeric(df[literacy_col])
        result["literacy_rate"] = literacy.clip(0, 100)
    else:
        result["literacy_rate"] = np.nan

    # --------------------------------------------------------
    # URBANIZATION
    # --------------------------------------------------------
    urban_col = _find_col(
        df,
        [
            "percentage urban population",
            "urban population",
            "urbanization",
            "PERCENTAGE URBAN POPULATION",
            "URBAN POPULATION",
        ],
    )
    if urban_col:
        urban = _safe_numeric(df[urban_col])
        result["urbanization_rate"] = urban.clip(0, 100)
    else:
        result["urbanization_rate"] = np.nan

    # --------------------------------------------------------
    # SEX RATIO
    # --------------------------------------------------------
    male_col = _find_col(df, ["male", "Male", "TOT_M", "male_population"])
    female_col = _find_col(df, ["female", "Female", "TOT_F", "female_population"])

    if male_col and female_col:
        males = _safe_numeric(df[male_col])
        females = _safe_numeric(df[female_col])
        result["sex_ratio"] = (females / males.clip(lower=1)) * 1000
    else:
        result["sex_ratio"] = np.nan

    # --------------------------------------------------------
    # DIRECT DENSITY IF PRESENT
    # --------------------------------------------------------
    density_col = _find_col(
        df,
        [
            "population_density_per_km2",
            "density",
            "density_per_km2",
            "population density",
        ],
    )
    if density_col:
        result["population_density_per_km2"] = _safe_numeric(df[density_col])
    else:
        result["population_density_per_km2"] = np.nan

    result["source_file"] = file_path.name
    result["file_stem"] = file_path.stem

    return result


# ============================================================
# COORDINATE FILLING
# ============================================================

def _build_coordinate_lookups(pop_df: pd.DataFrame) -> tuple[dict[tuple[str, str], tuple[float, float]], dict[str, tuple[float, float]], dict[str, tuple[float, float]]]:
    """
    Build:
      1) exact (state, district) lookup
      2) district-only lookup
      3) state-only lookup

    All based on rows that already have coordinates.
    """
    geo = pop_df.dropna(subset=["latitude", "longitude"]).copy()
    if geo.empty:
        return {}, {}, {}

    # Normalize keys
    geo["state_key"] = geo["state"].fillna("").map(_normalize_text)
    geo["district_key"] = geo["district"].fillna("").map(_normalize_text)

    # Exact state + district
    exact_lookup: dict[tuple[str, str], tuple[float, float]] = {}
    for (state, district), g in geo.groupby(["state_key", "district_key"], dropna=False):
        if not state and not district:
            continue
        lat = float(g["latitude"].mean())
        lon = float(g["longitude"].mean())
        exact_lookup[(state, district)] = (lat, lon)

    # District-only
    district_lookup: dict[str, tuple[float, float]] = {}
    for district, g in geo.groupby("district_key", dropna=False):
        if not district:
            continue
        lat = float(g["latitude"].mean())
        lon = float(g["longitude"].mean())
        district_lookup[district] = (lat, lon)

    # State-only
    state_lookup: dict[str, tuple[float, float]] = {}
    for state, g in geo.groupby("state_key", dropna=False):
        if not state:
            continue
        lat = float(g["latitude"].mean())
        lon = float(g["longitude"].mean())
        state_lookup[state] = (lat, lon)

    return exact_lookup, district_lookup, state_lookup


def _fill_missing_coordinates(pop_df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill missing latitude/longitude using the best available centroid lookup.
    """
    out = pop_df.copy()
    exact_lookup, district_lookup, state_lookup = _build_coordinate_lookups(out)

    out["state_key"] = out["state"].fillna("").map(_normalize_text)
    out["district_key"] = out["district"].fillna("").map(_normalize_text)

    missing = out["latitude"].isna() | out["longitude"].isna()
    if not missing.any():
        out = out.drop(columns=["state_key", "district_key"], errors="ignore")
        return out

    filled = 0
    for idx in out[missing].index:
        state = out.at[idx, "state_key"]
        district = out.at[idx, "district_key"]

        coords = None
        if state and district:
            coords = exact_lookup.get((state, district))
        if coords is None and district:
            coords = district_lookup.get(district)
        if coords is None and state:
            coords = state_lookup.get(state)

        if coords is not None:
            out.at[idx, "latitude"] = coords[0]
            out.at[idx, "longitude"] = coords[1]
            filled += 1

    print(f"Coordinate fill: {filled}/{missing.sum()} rows filled from centroid lookups")
    out = out.drop(columns=["state_key", "district_key"], errors="ignore")
    return out


# ============================================================
# COMPUTE GRID FACTORS
# ============================================================

def compute_population_factors(pop_df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate population signals into a 0.1° grid.

    Key design choice:
    - no synthetic log1p*constant density fallback
    - use real density where available
    - otherwise keep density NaN and let downstream merge confidence handle it
    """
    if pop_df.empty:
        return pd.DataFrame()

    geo = pop_df.copy()

    # Fill coordinates from centroids where possible
    geo = _fill_missing_coordinates(geo)

    # Keep only rows with actual spatial coordinates
    geo = geo.dropna(subset=["latitude", "longitude"]).copy()
    if geo.empty:
        return pd.DataFrame()

    # Keep rows with at least one meaningful demographic signal
    signal_cols = [
        "population",
        "area_sq_km",
        "literacy_rate",
        "urbanization_rate",
        "sex_ratio",
        "population_density_per_km2",
    ]
    has_signal = geo[signal_cols].notna().any(axis=1)
    geo = geo[has_signal].copy()
    if geo.empty:
        return pd.DataFrame()

    # Deterministic grid snapping
    geo = snap_dataframe(geo, lat_col="latitude", lon_col="longitude")

    # Population-weighted aggregation is more realistic for literacy/urbanization
    def _aggregate_group(g: pd.DataFrame) -> pd.Series:
        pop = pd.to_numeric(g["population"], errors="coerce").fillna(0)

        density = pd.to_numeric(g["population_density_per_km2"], errors="coerce")
        literacy = pd.to_numeric(g["literacy_rate"], errors="coerce")
        urban = pd.to_numeric(g["urbanization_rate"], errors="coerce")

        total_population = float(pop.sum())

        # Prefer actual density if present; otherwise leave NaN rather than inventing.
        if density.notna().any():
            density_value = float(density.mean(skipna=True))
        else:
            density_value = np.nan

        literacy_value = _weighted_mean(literacy, pop)
        urban_value = _weighted_mean(urban, pop)

        sex_ratio = pd.to_numeric(g["sex_ratio"], errors="coerce")
        sex_ratio_value = float(sex_ratio.mean(skipna=True)) if sex_ratio.notna().any() else np.nan

        return pd.Series(
            {
                "population_density_per_km2": density_value,
                "urbanization_rate": urban_value,
                "literacy_rate": literacy_value,
                "total_population": total_population,
                "sex_ratio": sex_ratio_value,
                "record_count": int(len(g)),
            }
        )

    grouped = (
        geo.groupby(["grid_lat", "grid_lon"], as_index=False)
        .apply(_aggregate_group)
        .reset_index(drop=True)
    )

    # -----------------------------------------------------------------
    # Isolation score:
    # inverse of density if available; otherwise inverse of population.
    # -----------------------------------------------------------------
    density = pd.to_numeric(grouped["population_density_per_km2"], errors="coerce")
    density_ref = density.dropna().quantile(0.95) if density.notna().any() else np.nan

    if pd.notna(density_ref) and density_ref > 0:
        isolation = 1.0 - (density / density_ref).clip(0, 1)
    else:
        isolation = pd.Series(np.nan, index=grouped.index)

    # Fallback using total population if density is unavailable
    if isolation.isna().any():
        pop = pd.to_numeric(grouped["total_population"], errors="coerce")
        pop_ref = pop.dropna().quantile(0.95) if pop.notna().any() else np.nan
        if pd.notna(pop_ref) and pop_ref > 0:
            pop_iso = 1.0 - (pop / pop_ref).clip(0, 1)
            isolation = isolation.fillna(pop_iso)

    grouped["isolation_score"] = isolation.clip(0, 1)
    grouped["isolation_score"] = grouped["isolation_score"].fillna(grouped["isolation_score"].median())

    grouped["latitude"] = grouped["grid_lat"]
    grouped["longitude"] = grouped["grid_lon"]

    # Optional quality columns for debugging
    grouped["population_coverage_score"] = (
        grouped[["population_density_per_km2", "urbanization_rate", "literacy_rate"]]
        .notna()
        .mean(axis=1)
    )

    return grouped


# ============================================================
# MAIN ENTRY
# ============================================================

def ingest_all_population() -> pd.DataFrame:
    csv_files = list(RAW_POPULATION.glob("**/*.csv"))
    print(f"Found {len(csv_files)} population CSV files")

    all_frames: list[pd.DataFrame] = []
    for f in csv_files:
        df = ingest_population_file(f)
        if df is not None and not df.empty:
            all_frames.append(df)
            print(f"Parsed {f.name}: {len(df)} rows")

    if not all_frames:
        print("No population data found!")
        return pd.DataFrame()

    combined = pd.concat(all_frames, ignore_index=True)
    print(f"Combined: {len(combined)} population records")

    # Quick raw coordinate coverage report
    raw_coord_pct = float(combined["latitude"].notna().mean() * 100) if "latitude" in combined.columns else 0.0
    print(f"Raw coordinate coverage before fill: {raw_coord_pct:.1f}%")

    factors = compute_population_factors(combined)

    if factors.empty:
        print("No population factors could be computed!")
        return pd.DataFrame()

    output_path = PROCESSED_DIR / "population_grid.parquet"
    factors.to_parquet(output_path, index=False)
    print(f"Saved: {output_path} ({len(factors)} grid cells)")

    print("\nNull %:")
    print((factors.isna().mean() * 100).sort_values(ascending=False))

    return factors


if __name__ == "__main__":
    ingest_all_population()