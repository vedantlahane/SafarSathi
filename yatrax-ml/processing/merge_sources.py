"""
Merge all processed data sources into a unified grid.
Each grid cell gets values from every data source.

REFACTORED: Only keeps cells with REAL data. No false default filling.
Cells without any real data are DROPPED, not padded with invented numbers.

Input:  data/processed/*_grid.parquet
Output: data/processed/unified_grid.parquet
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from config.settings import PROCESSED_DIR
from processing.geo_grid import generate_india_grid, spatial_interpolate


# ── Sources that have REAL, usable data ──────────────────────────────────────
# Excluded entirely:
#   - noise_grid.parquet  → 0 rows in last run, 100% default
#   - tourism_grid.parquet → only 14 cells, too sparse to help
#   - population_grid.parquet → population_density has only 1 unique value
#
# Per-source: only list features that have actual variance in real data.
# Features like visibility_km, uv_index, fatality_rate, hospital_level_score,
# emergency_availability_score were flagged as having <5 unique values → removed.

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
            # REMOVED: visibility_km (0% real), uv_index (0% real)
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
            # REMOVED: fatality_rate (1 unique value)
        ],
    },
    "disaster_grid.parquet": {
        "columns": [
            "flood_risk", "earthquake_risk",
            "cyclone_risk", "landslide_risk",
            "total_events",
        ],
    },
    "health_grid.parquet": {
        "columns": [
            # REMOVED: hospital_level_score (1 unique), emergency_availability_score (1 unique)
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
    # Population — re-added. Important for tourist safety (isolation = no help).
    # Grid rounding precision bug fixed below in _merge_source.
    "population_grid.parquet": {
        "columns": [
            "population_density_per_km2",
            "isolation_score",
            "urbanization_rate",
        ],
    },
    # Noise — re-added. Station→city join fixed in ingest_noise.py.
    # Will be auto-skipped if <5 rows (no data locally).
    "noise_grid.parquet": {
        "columns": ["noise_level_proxy"],
    },
}

# Sources whose data presence marks a cell as "has real data"
KEY_SOURCES = {"crime", "disaster", "accident", "fire", "health"}


def _load_processed(filename: str) -> pd.DataFrame | None:
    """Load a processed parquet file if it exists."""
    path = PROCESSED_DIR / filename
    if not path.exists():
        print(f"  Not found: {filename}")
        return None

    df = pd.read_parquet(path)
    print(f"  Loaded {filename}: {len(df)} rows, columns: {list(df.columns)}")
    return df


def _merge_source(
    grid: pd.DataFrame,
    source_df: pd.DataFrame,
    source_name: str,
    columns: list[str],
    interpolate_radius_km: float = 50.0,
) -> pd.DataFrame:
    """
    Merge a single source into the grid.
    Missing cells stay NaN — no fake defaults.
    """
    avail_col = f"{source_name}_data_available"
    grid[avail_col] = 0

    if len(source_df) < 5:
        print(f"  ⚠️ Source {source_name} has too few rows ({len(source_df)}). Skipping.")
        return grid

    # Only keep columns that actually exist in the source
    available_cols = [c for c in columns if c in source_df.columns]
    if not available_cols:
        print(f"  ⚠️ Source {source_name} is missing all requested columns: {columns}. Skipping.")
        return grid

    # ── Direct grid merge or spatial interpolation ───────────────────────
    if "grid_lat" in source_df.columns and "grid_lon" in source_df.columns:
        source_agg = source_df.groupby(["grid_lat", "grid_lon"])[available_cols].mean().reset_index()
        # Fix precision bug: round to 1 decimal to match the 0.1° grid
        source_agg["grid_lat"] = source_agg["grid_lat"].round(1)
        source_agg["grid_lon"] = source_agg["grid_lon"].round(1)
        source_agg = source_agg.groupby(["grid_lat", "grid_lon"])[available_cols].mean().reset_index()
        grid = grid.merge(source_agg, on=["grid_lat", "grid_lon"], how="left")
        if available_cols:
            hit_mask = grid[available_cols[0]].notna()
            grid.loc[hit_mask, avail_col] = 1

    elif "latitude" in source_df.columns and "longitude" in source_df.columns:
        grid = spatial_interpolate(
            source_df=source_df,
            target_grid=grid,
            value_columns=available_cols,
            radius_km=interpolate_radius_km,
        )
        if available_cols:
            hit_mask = grid[available_cols[0]].notna()
            grid.loc[hit_mask, avail_col] = 1
    else:
        print(f"  ⚠️ Source {source_name} has no spatial coordinates. Skipping.")
        return grid

    # ── NN propagation within a limited radius (50km) ─────────────────
    # Only propagate to cells that are NEAR real data, not across the
    # entire country, which was smearing sparse data everywhere.
    valid_mask = grid[available_cols].notna().any(axis=1)
    n_valid = valid_mask.sum()
    n_missing = (~valid_mask).sum()

    if 0 < n_valid < len(grid) and n_valid >= 10:
        try:
            from scipy.spatial import cKDTree

            valid_grid = grid[valid_mask].reset_index(drop=True)
            missing_coords = grid.loc[~valid_mask, ["grid_lat", "grid_lon"]].values

            tree = cKDTree(valid_grid[["grid_lat", "grid_lon"]].values)
            dists, indices = tree.query(missing_coords)

            # Only propagate within ~50km (≈0.45 degrees at Indian latitudes)
            MAX_PROPAGATION_DEG = 0.45
            near_mask = dists < MAX_PROPAGATION_DEG

            if near_mask.any():
                missing_indices = grid.index[~valid_mask]
                for col in available_cols:
                    if col in valid_grid.columns:
                        values = valid_grid.iloc[indices][col].values
                        # Only fill cells within the radius
                        fill_values = np.where(near_mask, values, np.nan)
                        grid.loc[missing_indices, col] = fill_values

                n_propagated = near_mask.sum()
                print(f"  ✓ Propagated real data to {n_propagated}/{n_missing} nearby cells (within ~50km)")
            else:
                print(f"  ⚠️ No cells close enough for NN propagation")
        except ImportError:
            print("  ⚠️ scipy not installed, skipping NN propagation")

    # ── Coverage report ──────────────────────────────────────────────────
    coverage_parts = []
    for col in available_cols:
        if col in grid.columns:
            real_pct = float(grid[col].notna().mean() * 100)
            coverage_parts.append(f"{col}: {real_pct:.1f}% real")
    if coverage_parts:
        print(f"  Coverage: {'; '.join(coverage_parts)}")

    return grid


def merge_all_sources() -> pd.DataFrame:
    """
    Main entry: generate India grid and merge all processed sources.
    After merging, DROP cells that have no real data from any key source.
    Then compute confidence metadata per cell.
    """
    print("Generating India grid...")
    grid = generate_india_grid()
    print(f"Grid: {len(grid)} cells")

    for filename, config in MERGE_CONFIG.items():
        print(f"\nMerging: {filename}")
        source_name = filename.split('_')[0]
        source = _load_processed(filename)

        if source is not None:
            grid = _merge_source(
                grid=grid,
                source_df=source,
                source_name=source_name,
                columns=config["columns"],
            )
        else:
            # Source not found — add NaN columns but no defaults
            for col in config["columns"]:
                if col not in grid.columns:
                    grid[col] = np.nan

    # ── DROP cells that have no real data ────────────────────────────────
    avail_cols = [f"{s}_data_available" for s in KEY_SOURCES if f"{s}_data_available" in grid.columns]
    if avail_cols:
        has_any_real = grid[avail_cols].sum(axis=1) > 0
        n_before = len(grid)
        grid = grid[has_any_real].copy()
        n_dropped = n_before - len(grid)
        print(f"\n✂️ Dropped {n_dropped} cells with no real data from any key source")
        print(f"   Kept {len(grid)} cells with real data")
    else:
        print("\n⚠️ No data availability columns found — keeping full grid")

    # ── Compute confidence metadata BEFORE dropping indicator columns ────
    all_avail_cols = [c for c in grid.columns if c.endswith("_data_available")]
    if all_avail_cols:
        # coverage_score: fraction of ALL sources that have real data for this cell
        grid["coverage_score"] = grid[all_avail_cols].sum(axis=1) / len(all_avail_cols)
    else:
        grid["coverage_score"] = 0.5

    # Per-domain confidence: 1.0 if domain has real data, 0.0 if not
    DOMAIN_MAP = {
        "crime":    "crime_confidence",
        "weather":  "weather_confidence",
        "aqi":      "aqi_confidence",
        "water":    "water_confidence",
        "health":   "health_confidence",
        "disaster": "disaster_confidence",
        "accident": "accident_confidence",
        "fire":     "fire_confidence",
        "terrain":  "terrain_confidence",
        "population": "population_confidence",
        "noise":    "noise_confidence",
    }
    for source_prefix, conf_col in DOMAIN_MAP.items():
        avail_col = f"{source_prefix}_data_available"
        if avail_col in grid.columns:
            grid[conf_col] = grid[avail_col].astype(float)
        else:
            grid[conf_col] = 0.0

    # feature_completeness: fraction of numeric features that are non-NaN
    feature_cols = [c for c in grid.columns
                    if c not in ("grid_lat", "grid_lon", "cell_id", "coverage_score")
                    and not c.endswith("_data_available")
                    and not c.endswith("_confidence")
                    and grid[c].dtype in [np.float64, np.float32, np.int64, np.int32]]
    if feature_cols:
        grid["feature_completeness"] = grid[feature_cols].notna().mean(axis=1)
    else:
        grid["feature_completeness"] = 0.5

    # ── Drop columns with zero variance ──────────────────────────────────
    # Protect metadata columns: grid coords, coverage, completeness, per-domain confidence
    protected = {"grid_lat", "grid_lon", "coverage_score", "feature_completeness"}
    protected.update(c for c in grid.columns if c.endswith("_confidence"))
    numeric_cols = grid.select_dtypes(include=[np.number]).columns
    constant_cols = [c for c in numeric_cols if grid[c].nunique(dropna=True) <= 1
                     and c not in protected]
    if constant_cols:
        print(f"\n✂️ Dropping {len(constant_cols)} constant columns: {constant_cols}")
        grid = grid.drop(columns=constant_cols)

    # ── Drop _data_available indicator columns ───────────────────────────
    indicator_cols = [c for c in grid.columns if c.endswith("_data_available")]
    if indicator_cols:
        grid = grid.drop(columns=indicator_cols)
        print(f"   Dropped {len(indicator_cols)} indicator columns")

    print(f"\nUnified grid: {len(grid)} cells × {len(grid.columns)} columns")
    print(f"Columns: {sorted(grid.columns.tolist())}")

    # ── NaN report ───────────────────────────────────────────────────────
    nan_pct = grid.select_dtypes(include=[np.number]).isna().mean()
    high_nan = nan_pct[nan_pct > 0.5]
    if not high_nan.empty:
        print(f"\nColumns with >50% NaN (handled natively by LightGBM): {dict(high_nan.round(2))}")

    # ── Confidence report ────────────────────────────────────────────────
    cs = grid["coverage_score"]
    fc = grid["feature_completeness"]
    print(f"\n📊 Confidence metrics:")
    print(f"  coverage_score:       mean={cs.mean():.2f}, std={cs.std():.2f}, "
          f"min={cs.min():.2f}, max={cs.max():.2f}")
    print(f"  feature_completeness: mean={fc.mean():.2f}, std={fc.std():.2f}")
    print(f"  High confidence (coverage>0.5): {(cs > 0.5).sum()} cells ({(cs > 0.5).mean()*100:.1f}%)")
    print(f"  Low confidence  (coverage<0.2): {(cs < 0.2).sum()} cells ({(cs < 0.2).mean()*100:.1f}%)")

    # ── Geographic bias monitoring ───────────────────────────────────────
    if "grid_lat" in grid.columns and "grid_lon" in grid.columns:
        lat_mean = grid["grid_lat"].mean()
        lat_std = grid["grid_lat"].std()
        lon_mean = grid["grid_lon"].mean()
        lon_std = grid["grid_lon"].std()

        print(f"\n🗺️ Geographic distribution:")
        print(f"  Latitude:  mean={lat_mean:.1f}° (std={lat_std:.1f}°)")
        print(f"  Longitude: mean={lon_mean:.1f}° (std={lon_std:.1f}°)")

        # Check for urban bias: India's major cities are around 12-28°N, 72-88°E
        # If coverage is heavily clustered there, warn about rural underrepresentation
        north_count = (grid["grid_lat"] > 25).sum()
        south_count = (grid["grid_lat"] <= 25).sum()
        ratio = north_count / max(south_count, 1)
        print(f"  North/South split: {north_count} / {south_count} (ratio {ratio:.2f})")

        # Check state coverage breadth
        lat_range = grid["grid_lat"].max() - grid["grid_lat"].min()
        lon_range = grid["grid_lon"].max() - grid["grid_lon"].min()
        print(f"  Spatial extent: {lat_range:.1f}° lat × {lon_range:.1f}° lon")

        if lat_std < 3.0 or lon_std < 3.0:
            print(f"  ⚠️ WARNING: Spatial coverage is very concentrated! "
                  f"May be biased toward monitored urban regions.")
        if len(grid) < 500:
            print(f"  ⚠️ WARNING: Only {len(grid)} cells — may underrepresent "
                  f"rural/remote India. Consider relaxing KEY_SOURCES filter.")

    # ── Save ─────────────────────────────────────────────────────────────
    output_path = PROCESSED_DIR / "unified_grid.parquet"
    grid.to_parquet(output_path, index=False)
    print(f"\nSaved: {output_path}")

    # Also save column medians for inference defaults
    import json
    medians = grid.select_dtypes(include=[np.number]).median().to_dict()
    medians_path = PROCESSED_DIR / "grid_medians.json"
    with open(medians_path, "w") as f:
        json.dump({k: round(float(v), 4) for k, v in medians.items() if not np.isnan(v)}, f, indent=2)
    print(f"Saved column medians: {medians_path}")

    return grid


if __name__ == "__main__":
    merge_all_sources()
