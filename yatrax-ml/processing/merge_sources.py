"""
Merge all processed data sources into a unified grid.

This version fixes two major problems:
1) It removes the extra global NN propagation pass that was smearing sparse
   hazards (especially disaster and population signals) across India.
2) It keeps exact grid matches for grid-based sources and only interpolates
   coordinate-based sources with source-specific radii.

Input:  data/processed/*_grid.parquet
Output: data/processed/unified_grid.parquet
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from pandas.api.types import is_numeric_dtype

# Make sure repo-root imports work in Colab / standalone execution.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from config.settings import PROCESSED_DIR
from processing.geo_grid import generate_india_grid, spatial_interpolate


# ---------------------------------------------------------------------
# Source-specific interpolation radii
# Only used for sources that have latitude/longitude but not grid cells.
# ---------------------------------------------------------------------
SOURCE_RADII_KM = {
    "crime": 25.0,
    "accident": 20.0,
    "weather": 90.0,
    "aqi": 60.0,
    "water": 30.0,
    "health": 20.0,
    "terrain": 25.0,
    "population": 20.0,
    "fire": 15.0,
    "disaster": 10.0,
    "noise": 10.0,
}

# ---------------------------------------------------------------------
# Sources with real, useful signal
# ---------------------------------------------------------------------
MERGE_CONFIG = {
    "crime_grid.parquet": {
        "columns": [
            "crime_rate_per_100k",
            "crime_type_distribution_risk",
            "gender_safety_index",
            "tourist_targeted_crime_index",
        ],
    },
    "weather_grid.parquet": {
        "columns": [
            "temperature_c",
            "humidity_pct",
            "wind_speed_kmph",
            "rainfall_mmph",
            "weather_severity",
        ],
    },
    "aqi_grid.parquet": {
        "columns": ["aqi", "pm25", "pm10"],
    },
    "water_quality_grid.parquet": {
        "columns": ["water_safety_score", "water_contamination_risk"],
    },
    "accident_grid.parquet": {
        "columns": [
            "road_accident_hotspot_risk",
            "accident_severity_index",
        ],
    },
    "disaster_grid.parquet": {
        "columns": [
            "flood_risk",
            "earthquake_risk",
            "cyclone_risk",
            "landslide_risk",
            "total_events",
        ],
    },
    "health_grid.parquet": {
        "columns": [
            "ambulance_response_score",
            "nearest_hospital_proxy_km",
        ],
    },
    "fire_grid.parquet": {
        "columns": ["fire_risk_index", "fire_intensity_score"],
    },
    "terrain_grid.parquet": {
        "columns": ["elevation_m"],
    },
    "population_grid.parquet": {
        "columns": [
            "population_density_per_km2",
            "isolation_score",
            "urbanization_rate",
            "literacy_rate",
            "total_population",
        ],
    },
    "noise_grid.parquet": {
        "columns": ["noise_level_proxy"],
    },
}

# Cells must have real data in at least one of these domains to survive.
KEY_SOURCES = {"crime", "disaster", "accident", "fire", "health"}


def _load_processed(filename: str) -> pd.DataFrame | None:
    path = PROCESSED_DIR / filename
    if not path.exists():
        print(f"  Not found: {filename}")
        return None

    df = pd.read_parquet(path)
    print(f"  Loaded {filename}: {len(df)} rows, columns: {list(df.columns)}")
    return df


def _mark_available(grid: pd.DataFrame, source_name: str, cols: list[str]) -> None:
    avail_col = f"{source_name}_data_available"
    if avail_col not in grid.columns:
        grid[avail_col] = 0
    if cols:
        grid.loc[grid[cols].notna().any(axis=1), avail_col] = 1


def _merge_source(
    grid: pd.DataFrame,
    source_df: pd.DataFrame,
    source_name: str,
    columns: list[str],
) -> pd.DataFrame:
    """
    Merge one source into the grid.

    Important design choice:
    - grid-based sources are merged exactly on rounded 0.1° cells
    - lat/lon sources are interpolated only with source-specific radius
    - NO extra global NN propagation pass is performed
    """
    avail_col = f"{source_name}_data_available"
    grid[avail_col] = 0

    if len(source_df) < 5:
        print(f"  ⚠️ Source {source_name} has too few rows ({len(source_df)}). Skipping.")
        return grid

    available_cols = [c for c in columns if c in source_df.columns]
    if not available_cols:
        print(f"  ⚠️ Source {source_name} is missing all requested columns: {columns}. Skipping.")
        return grid

    # -----------------------------------------------------------------
    # Case 1: source already has grid cells
    # -----------------------------------------------------------------
    if "grid_lat" in source_df.columns and "grid_lon" in source_df.columns:
        src = source_df.copy()
        src["grid_lat"] = pd.to_numeric(src["grid_lat"], errors="coerce").round(1)
        src["grid_lon"] = pd.to_numeric(src["grid_lon"], errors="coerce").round(1)

        src = src.dropna(subset=["grid_lat", "grid_lon"])

        source_agg = (
            src.groupby(["grid_lat", "grid_lon"], as_index=False)[available_cols]
            .mean()
        )

        # Exact merge only; no country-wide smearing.
        grid = grid.merge(source_agg, on=["grid_lat", "grid_lon"], how="left")
        _mark_available(grid, source_name, available_cols)

    # -----------------------------------------------------------------
    # Case 2: source has lat/lon coordinates only
    # -----------------------------------------------------------------
    elif "latitude" in source_df.columns and "longitude" in source_df.columns:
        radius_km = SOURCE_RADII_KM.get(source_name, 25.0)

        # The interpolator should do local filling only.
        grid = spatial_interpolate(
            source_df=source_df,
            target_grid=grid,
            value_columns=available_cols,
            radius_km=radius_km,
        )

        _mark_available(grid, source_name, available_cols)

    else:
        print(f"  ⚠️ Source {source_name} has no spatial coordinates. Skipping.")
        return grid

    # Coverage report
    coverage_parts = []
    for col in available_cols:
        if col in grid.columns:
            real_pct = float(grid[col].notna().mean() * 100)
            coverage_parts.append(f"{col}: {real_pct:.1f}% real")

    if coverage_parts:
        print(f"  Coverage: {'; '.join(coverage_parts)}")

    return grid


def merge_all_sources() -> pd.DataFrame:
    print("Generating India grid...")
    grid = generate_india_grid()
    print(f"Grid: {len(grid)} cells")

    for filename, config in MERGE_CONFIG.items():
        print(f"\nMerging: {filename}")
        source_name = filename.split("_")[0]
        source = _load_processed(filename)

        if source is not None:
            grid = _merge_source(
                grid=grid,
                source_df=source,
                source_name=source_name,
                columns=config["columns"],
            )
        else:
            for col in config["columns"]:
                if col not in grid.columns:
                    grid[col] = np.nan

    # -----------------------------------------------------------------
    # Keep only cells with any real data in key sources
    # -----------------------------------------------------------------
    avail_cols = [
        f"{s}_data_available"
        for s in KEY_SOURCES
        if f"{s}_data_available" in grid.columns
    ]

    if avail_cols:
        has_any_real = grid[avail_cols].sum(axis=1) > 0
        n_before = len(grid)
        grid = grid[has_any_real].copy()
        n_dropped = n_before - len(grid)
        print(f"\n✂️ Dropped {n_dropped} cells with no real data from any key source")
        print(f"   Kept {len(grid)} cells with real data")
    else:
        print("\n⚠️ No data availability columns found — keeping full grid")

    # -----------------------------------------------------------------
    # Coverage metadata
    # -----------------------------------------------------------------
    all_avail_cols = [c for c in grid.columns if c.endswith("_data_available")]
    if all_avail_cols:
        grid["coverage_score"] = grid[all_avail_cols].sum(axis=1) / len(all_avail_cols)
    else:
        grid["coverage_score"] = 0.5

    DOMAIN_MAP = {
        "crime": "crime_confidence",
        "weather": "weather_confidence",
        "aqi": "aqi_confidence",
        "water": "water_confidence",
        "health": "health_confidence",
        "disaster": "disaster_confidence",
        "accident": "accident_confidence",
        "fire": "fire_confidence",
        "terrain": "terrain_confidence",
        "population": "population_confidence",
        "noise": "noise_confidence",
    }

    for source_prefix, conf_col in DOMAIN_MAP.items():
        avail_col = f"{source_prefix}_data_available"
        grid[conf_col] = grid[avail_col].astype(float) if avail_col in grid.columns else 0.0

    # Fraction of numeric features that are non-NaN
    protected = {"grid_lat", "grid_lon", "cell_id", "coverage_score"}
    protected.update(c for c in grid.columns if c.endswith("_confidence"))
    protected.update(c for c in grid.columns if c.endswith("_data_available"))

    feature_cols = [
        c for c in grid.columns
        if c not in protected and is_numeric_dtype(grid[c])
    ]

    if feature_cols:
        grid["feature_completeness"] = grid[feature_cols].notna().mean(axis=1)
    else:
        grid["feature_completeness"] = 0.5

    # -----------------------------------------------------------------
    # Drop constant numeric columns, but keep metadata
    # -----------------------------------------------------------------
    protected_for_constants = {"grid_lat", "grid_lon", "coverage_score", "feature_completeness"}
    protected_for_constants.update(c for c in grid.columns if c.endswith("_confidence"))
    protected_for_constants.update(c for c in grid.columns if c.endswith("_data_available"))

    numeric_cols = grid.select_dtypes(include=[np.number]).columns
    constant_cols = [
        c for c in numeric_cols
        if grid[c].nunique(dropna=True) <= 1 and c not in protected_for_constants
    ]

    if constant_cols:
        print(f"\n✂️ Dropping {len(constant_cols)} constant columns: {constant_cols}")
        grid = grid.drop(columns=constant_cols)

    indicator_cols = [c for c in grid.columns if c.endswith("_data_available")]
    if indicator_cols:
        grid = grid.drop(columns=indicator_cols)
        print(f"   Dropped {len(indicator_cols)} indicator columns")

    print(f"\nUnified grid: {len(grid)} cells × {len(grid.columns)} columns")
    print(f"Columns: {sorted(grid.columns.tolist())}")

    nan_pct = grid.select_dtypes(include=[np.number]).isna().mean()
    high_nan = nan_pct[nan_pct > 0.5]
    if not high_nan.empty:
        print(f"\nColumns with >50% NaN (handled natively by LightGBM): {dict(high_nan.round(2))}")

    cs = grid["coverage_score"]
    fc = grid["feature_completeness"]
    print(f"\n📊 Confidence metrics:")
    print(f"  coverage_score:       mean={cs.mean():.2f}, std={cs.std():.2f}, min={cs.min():.2f}, max={cs.max():.2f}")
    print(f"  feature_completeness: mean={fc.mean():.2f}, std={fc.std():.2f}")
    print(f"  High confidence (coverage>0.5): {(cs > 0.5).sum()} cells ({(cs > 0.5).mean()*100:.1f}%)")
    print(f"  Low confidence  (coverage<0.2): {(cs < 0.2).sum()} cells ({(cs < 0.2).mean()*100:.1f}%)")

    if "grid_lat" in grid.columns and "grid_lon" in grid.columns:
        lat_mean = grid["grid_lat"].mean()
        lat_std = grid["grid_lat"].std()
        lon_mean = grid["grid_lon"].mean()
        lon_std = grid["grid_lon"].std()

        print(f"\n🗺️ Geographic distribution:")
        print(f"  Latitude:  mean={lat_mean:.1f}° (std={lat_std:.1f}°)")
        print(f"  Longitude: mean={lon_mean:.1f}° (std={lon_std:.1f}°)")

        north_count = (grid["grid_lat"] > 25).sum()
        south_count = (grid["grid_lat"] <= 25).sum()
        ratio = north_count / max(south_count, 1)
        print(f"  North/South split: {north_count} / {south_count} (ratio {ratio:.2f})")

        lat_range = grid["grid_lat"].max() - grid["grid_lat"].min()
        lon_range = grid["grid_lon"].max() - grid["grid_lon"].min()
        print(f"  Spatial extent: {lat_range:.1f}° lat × {lon_range:.1f}° lon")

        if lat_std < 3.0 or lon_std < 3.0:
            print("  ⚠️ WARNING: Spatial coverage is very concentrated! May be biased toward monitored urban regions.")
        if len(grid) < 500:
            print(f"  ⚠️ WARNING: Only {len(grid)} cells — may underrepresent rural/remote India.")

    output_path = PROCESSED_DIR / "unified_grid.parquet"
    grid.to_parquet(output_path, index=False)
    print(f"\nSaved: {output_path}")

    medians = grid.select_dtypes(include=[np.number]).median().to_dict()
    medians_path = PROCESSED_DIR / "grid_medians.json"
    with open(medians_path, "w") as f:
        json.dump(
            {k: round(float(v), 4) for k, v in medians.items() if not np.isnan(v)},
            f,
            indent=2,
        )
    print(f"Saved column medians: {medians_path}")

    return grid


if __name__ == "__main__":
    merge_all_sources()