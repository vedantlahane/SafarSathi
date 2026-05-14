"""
Ingest census and population datasets.

Input:
    data/raw/population/*.csv

Output:
    data/processed/population_grid.parquet

FIXED VERSION:
- handles real Indian census schemas
- extracts Population in 2011 correctly
- extracts literacy + urbanization
- stable numeric coercion
- deterministic grid snapping
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from app.config import get_settings

cfg = get_settings()

PROJECT_ROOT = Path(__file__).resolve().parent.parent

RAW_POPULATION = (
    PROJECT_ROOT
    / "data"
    / "raw"
    / "population"
)

PROCESSED_DIR = (
    PROJECT_ROOT
    / cfg.data_processed_dir
)

PROCESSED_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# HELPERS
# ============================================================

def _find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:

    normalized = {}

    for col in df.columns:

        key = (
            str(col)
            .lower()
            .strip()
            .replace("_", " ")
            .replace("-", " ")
        )

        normalized[key] = col

    # --------------------------------------------------------
    # Exact normalized match
    # --------------------------------------------------------

    for cand in candidates:

        key = (
            cand.lower()
            .strip()
            .replace("_", " ")
            .replace("-", " ")
        )

        if key in normalized:
            return normalized[key]

    # --------------------------------------------------------
    # Partial fuzzy containment
    # --------------------------------------------------------

    for cand in candidates:

        cand_key = (
            cand.lower()
            .strip()
            .replace("_", " ")
            .replace("-", " ")
        )

        for norm_key, original_col in normalized.items():

            if cand_key in norm_key:
                return original_col

            if norm_key in cand_key:
                return original_col

    return None


def _safe_numeric(series: pd.Series) -> pd.Series:

    return pd.to_numeric(
        series.astype(str)
        .str.replace(",", "", regex=False)
        .str.strip(),
        errors="coerce",
    )


# ============================================================
# INGEST SINGLE FILE
# ============================================================

def ingest_population_file(file_path: Path) -> pd.DataFrame | None:

    try:

        df = pd.read_csv(
            file_path,
            low_memory=False,
        )

    except Exception as exc:

        print(f"Cannot read {file_path.name}: {exc}")
        return None

    if df.empty:
        return None

    df.columns = [c.strip() for c in df.columns]

    result = pd.DataFrame()

    # ========================================================
    # LOCATION
    # ========================================================

    lat_col = _find_col(
        df,
        [
            "latitude",
            "lat",
            "Latitude",
        ],
    )

    lon_col = _find_col(
        df,
        [
            "longitude",
            "lon",
            "lng",
            "Longitude",
        ],
    )

    state_col = _find_col(
        df,
        [
            "state",
            "State",
            "STATE NAME",
        ],
    )

    district_col = _find_col(
        df,
        [
            "district",
            "District",
            "DISTRICT NAME",
        ],
    )

    if lat_col and lon_col:

        result["latitude"] = _safe_numeric(df[lat_col])
        result["longitude"] = _safe_numeric(df[lon_col])

    else:

        result["latitude"] = np.nan
        result["longitude"] = np.nan

    if state_col:

        result["state"] = (
            df[state_col]
            .astype(str)
            .str.strip()
            .str.upper()
        )

    if district_col:

        result["district"] = (
            df[district_col]
            .astype(str)
            .str.strip()
            .str.upper()
        )

    # ========================================================
    # POPULATION
    # ========================================================

    pop_col = _find_col(
        df,
        [
            "Population in 2011",
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

    # ========================================================
    # AREA
    # ========================================================

    area_col = _find_col(
        df,
        [
            "AREA (SQ. KM) (AREA SQKM)",
            "area_sq_km",
            "area",
            "AREA",
        ],
    )

    if area_col:

        result["area_sq_km"] = _safe_numeric(df[area_col])

    else:

        result["area_sq_km"] = np.nan

    # ========================================================
    # LITERACY
    # ========================================================

    literacy_col = _find_col(
        df,
        [
            "overall literacy",
            "literacy rate",
            "literacy",
        ],
    )

    if literacy_col:

        literacy = _safe_numeric(df[literacy_col])

        result["literacy_rate"] = literacy.clip(0, 100)

    else:

        result["literacy_rate"] = np.nan

    # ========================================================
    # URBANIZATION
    # ========================================================

    urban_col = _find_col(
        df,
        [
            "percentage urban population",
            "urban population",
            "urbanization",
        ],
    )

    if urban_col:

        urban = _safe_numeric(df[urban_col])

        result["urbanization_rate"] = urban.clip(0, 100)

    else:

        result["urbanization_rate"] = np.nan

    # ========================================================
    # SEX RATIO
    # ========================================================

    male_col = _find_col(
        df,
        [
            "male",
            "Male",
            "TOT_M",
        ],
    )

    female_col = _find_col(
        df,
        [
            "female",
            "Female",
            "TOT_F",
        ],
    )

    if male_col and female_col:

        males = _safe_numeric(df[male_col])
        females = _safe_numeric(df[female_col])

        result["sex_ratio"] = (
            females / males.clip(lower=1)
        ) * 1000

    else:

        result["sex_ratio"] = np.nan

    # ========================================================
    # DENSITY
    # ========================================================

    if area_col:

        result["population_density_per_km2"] = (
            result["population"]
            / result["area_sq_km"].clip(lower=0.1)
        )

    else:

        # fallback engineered density proxy
        result["population_density_per_km2"] = (
            np.log1p(result["population"])
            * 120
        )

    result["source_file"] = file_path.name

    return result


# ============================================================
# COMPUTE GRID FACTORS
# ============================================================

def compute_population_factors(
    pop_df: pd.DataFrame,
) -> pd.DataFrame:

    if pop_df.empty:
        return pd.DataFrame()

    # ========================================================
    # NORMALIZE KEYS
    # ========================================================

    if "district" in pop_df.columns:

        pop_df["district"] = (
            pop_df["district"]
            .astype(str)
            .str.strip()
            .str.upper()
        )

    if "state" in pop_df.columns:

        pop_df["state"] = (
            pop_df["state"]
            .astype(str)
            .str.strip()
            .str.upper()
        )

    # ========================================================
    # BASE GEO DATA
    # ========================================================

    geo = pop_df.dropna(
        subset=["latitude", "longitude"]
    ).copy()

    if geo.empty:
        return pd.DataFrame()

    # ========================================================
    # ENRICHMENT TABLE
    # ========================================================

    enrich = (
        pop_df.groupby("district", as_index=False)
        .agg(
            {
                "literacy_rate": "mean",
                "urbanization_rate": "mean",
            }
        )
    )

    # ========================================================
    # MERGE ENRICHMENT
    # ========================================================

    geo = geo.merge(
        enrich,
        on="district",
        how="left",
        suffixes=("", "_enriched"),
    )

    # Prefer enriched values
    for col in [
        "literacy_rate",
        "urbanization_rate",
    ]:

        enriched_col = f"{col}_enriched"

        if enriched_col in geo.columns:

            geo[col] = geo[col].fillna(
                geo[enriched_col]
            )

    # ========================================================
    # GRID SNAP
    # ========================================================

    GRID_RES = 0.1

    geo["grid_lat"] = (
        round(geo["latitude"] / GRID_RES)
        * GRID_RES
    ).round(1)

    geo["grid_lon"] = (
        round(geo["longitude"] / GRID_RES)
        * GRID_RES
    ).round(1)

    # ========================================================
    # AGGREGATE
    # ========================================================

    grouped = (
        geo.groupby(
            ["grid_lat", "grid_lon"],
            as_index=False,
        )
        .agg(
            {
                "population_density_per_km2": "mean",
                "urbanization_rate": "mean",
                "literacy_rate": "mean",
                "population": "sum",
            }
        )
    )

    grouped = grouped.rename(
        columns={
            "population": "total_population",
        }
    )

    # ========================================================
    # ISOLATION SCORE
    # ========================================================

    max_density = grouped[
        "population_density_per_km2"
    ].quantile(0.95)

    if pd.notna(max_density) and max_density > 0:

        grouped["isolation_score"] = (
            1.0
            - (
                grouped["population_density_per_km2"]
                / max_density
            ).clip(0, 1)
        )

    else:

        grouped["isolation_score"] = 0.5

    grouped["latitude"] = grouped["grid_lat"]
    grouped["longitude"] = grouped["grid_lon"]

    return grouped


# ============================================================
# MAIN ENTRY
# ============================================================

def ingest_all_population() -> pd.DataFrame:

    csv_files = list(
        RAW_POPULATION.glob("**/*.csv")
    )

    print(f"Found {len(csv_files)} population CSV files")

    all_frames = []

    for f in csv_files:

        df = ingest_population_file(f)

        if df is not None and not df.empty:

            all_frames.append(df)

            print(
                f"Parsed {f.name}: {len(df)} rows"
            )

    if not all_frames:

        print("No population data found!")

        return pd.DataFrame()

    combined = pd.concat(
        all_frames,
        ignore_index=True,
    )

    print(
        f"Combined: {len(combined)} population records"
    )

    factors = compute_population_factors(
        combined
    )

    output_path = (
        PROCESSED_DIR
        / "population_grid.parquet"
    )

    factors.to_parquet(
        output_path,
        index=False,
    )

    print(
        f"Saved: {output_path} "
        f"({len(factors)} grid cells)"
    )

    print("\nNull %:")
    print(
        (
            factors.isna().mean() * 100
        ).sort_values(ascending=False)
    )

    return factors


if __name__ == "__main__":

    ingest_all_population()