"""
Merge all processed data sources into a unified grid.

IMPROVED VERSION:
- Aggressive dead feature pruning (< 1% coverage)
- Feature registry with coverage tracking
- Feature manifest generation during merge
- Unified confidence engine
- Pipeline validation and invariant checks

Goals:
- Preserve exact grid matches for sources that are already gridded.
- Use source-specific local interpolation for point sources.
- Avoid global propagation that smears sparse hazards across India.
- Track coverage and confidence metadata cleanly.
- Save grid medians for inference defaults.

Input:  data/processed/*_grid.parquet
Output: data/processed/unified_grid.parquet
        data/processed/feature_manifest.json
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from pandas.api.types import is_numeric_dtype

# ---------------------------------------------------------------------
# Repo bootstrap for Colab / standalone execution
# ---------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from config.settings import PROCESSED_DIR
from processing.geo_grid import generate_india_grid, spatial_interpolate
from lib.feature_registry import create_standard_registry, FeatureType
from lib.confidence_engine import get_confidence_engine
from lib.pipeline_validator import (
    validate_merge,
    check_coordinate_consistency,
    warn_if_data_loss,
)


# ---------------------------------------------------------------------
# Source specification
# ---------------------------------------------------------------------
@dataclass(frozen=True)
class SourceSpec:
    filename: str
    columns: list[str]
    radius_km: float
    exact_grid: bool = False


SOURCE_SPECS: dict[str, SourceSpec] = {
    "crime_grid.parquet": SourceSpec(
        filename="crime_grid.parquet",
        columns=[
            "crime_rate_per_100k",
            "crime_type_distribution_risk",
            "gender_safety_index",
            "tourist_targeted_crime_index",
        ],
        radius_km=25.0,
    ),
    "weather_grid.parquet": SourceSpec(
        filename="weather_grid.parquet",
        columns=[
            "temperature_c",
            "humidity_pct",
            "wind_speed_kmph",
            "rainfall_mmph",
            "weather_severity",
        ],
        radius_km=90.0,
        exact_grid=True,
    ),
    "aqi_grid.parquet": SourceSpec(
        filename="aqi_grid.parquet",
        columns=["aqi", "pm25", "pm10"],
        radius_km=60.0,
        exact_grid=True,
    ),
    "water_quality_grid.parquet": SourceSpec(
        filename="water_quality_grid.parquet",
        columns=["water_safety_score", "water_contamination_risk"],
        radius_km=30.0,
        exact_grid=True,
    ),
    "accident_grid.parquet": SourceSpec(
        filename="accident_grid.parquet",
        columns=["road_accident_hotspot_risk", "accident_severity_index"],
        radius_km=20.0,
    ),
    "disaster_grid.parquet": SourceSpec(
        filename="disaster_grid.parquet",
        columns=["flood_risk", "earthquake_risk", "cyclone_risk", "landslide_risk", "total_events"],
        radius_km=10.0,
        exact_grid=True,
    ),
    "health_grid.parquet": SourceSpec(
        filename="health_grid.parquet",
        columns=["ambulance_response_score", "nearest_hospital_proxy_km"],
        radius_km=20.0,
    ),
    "fire_grid.parquet": SourceSpec(
        filename="fire_grid.parquet",
        columns=["fire_risk_index", "fire_intensity_score"],
        radius_km=15.0,
        exact_grid=True,
    ),
    "terrain_grid.parquet": SourceSpec(
        filename="terrain_grid.parquet",
        columns=["elevation_m"],
        radius_km=25.0,
        exact_grid=True,
    ),
    "population_grid.parquet": SourceSpec(
        filename="population_grid.parquet",
        columns=[
            "population_density_per_km2",
            "isolation_score",
            "urbanization_rate",
            "literacy_rate",
            "total_population",
        ],
        radius_km=20.0,
        exact_grid=True,
    ),
    "noise_grid.parquet": SourceSpec(
        filename="noise_grid.parquet",
        columns=["noise_level_proxy"],
        radius_km=10.0,
        exact_grid=True,
    ),
}

# Only these domains determine whether a cell survives the final pruning step.
KEY_SOURCES = {"crime", "disaster", "accident", "fire", "health"}


def _source_prefix(filename: str) -> str:
    """
    Convert a processed parquet filename into a domain prefix.
    Example:
      crime_grid.parquet -> crime
      water_quality_grid.parquet -> water
    """
    stem = Path(filename).stem.lower()
    if stem.startswith("water_quality"):
        return "water"
    if stem.startswith("population"):
        return "population"
    if stem.startswith("noise"):
        return "noise"
    if stem.startswith("disaster"):
        return "disaster"
    if stem.startswith("health"):
        return "health"
    if stem.startswith("terrain"):
        return "terrain"
    if stem.startswith("weather"):
        return "weather"
    if stem.startswith("aqi"):
        return "aqi"
    if stem.startswith("crime"):
        return "crime"
    if stem.startswith("accident"):
        return "accident"
    if stem.startswith("fire"):
        return "fire"
    return stem.split("_")[0]


def _load_processed(filename: str) -> pd.DataFrame | None:
    path = PROCESSED_DIR / filename
    if not path.exists():
        print(f"  Not found: {filename}")
        return None

    df = pd.read_parquet(path)
    print(f"  Loaded {filename}: {len(df)} rows, columns: {list(df.columns)}")
    return df


def _ensure_numeric_grid_keys(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize grid keys to 0.1° precision and ensure consistent numeric dtype.
    """
    out = df.copy()
    if "grid_lat" in out.columns:
        out["grid_lat"] = pd.to_numeric(out["grid_lat"], errors="coerce").round(1)
    if "grid_lon" in out.columns:
        out["grid_lon"] = pd.to_numeric(out["grid_lon"], errors="coerce").round(1)
    return out


def _mark_available(grid: pd.DataFrame, source_name: str, cols: list[str]) -> None:
    avail_col = f"{source_name}_data_available"
    if avail_col not in grid.columns:
        grid[avail_col] = 0

    if not cols:
        return

    existing = [c for c in cols if c in grid.columns]
    if not existing:
        return

    grid.loc[grid[existing].notna().any(axis=1), avail_col] = 1


def _merge_exact_grid_source(
    grid: pd.DataFrame,
    source_df: pd.DataFrame,
    source_name: str,
    columns: list[str],
) -> pd.DataFrame:
    """
    Merge sources that already have grid cells.
    This is an exact rounded-grid merge on (grid_lat, grid_lon).
    """
    src = _ensure_numeric_grid_keys(source_df)

    src = src.dropna(subset=["grid_lat", "grid_lon"])
    if src.empty:
        print(f"  ⚠️ Source {source_name} has no usable grid coordinates.")
        return grid

    # Keep only columns that actually exist.
    available_cols = [c for c in columns if c in src.columns]
    if not available_cols:
        print(f"  ⚠️ Source {source_name} is missing all requested columns: {columns}.")
        return grid

    # Average duplicate grid cells inside the source.
    source_agg = (
        src.groupby(["grid_lat", "grid_lon"], as_index=False)[available_cols]
        .mean(numeric_only=True)
    )

    grid = grid.merge(source_agg, on=["grid_lat", "grid_lon"], how="left")
    _mark_available(grid, source_name, available_cols)

    return grid


def _merge_point_source(
    grid: pd.DataFrame,
    source_df: pd.DataFrame,
    source_name: str,
    columns: list[str],
    radius_km: float,
) -> pd.DataFrame:
    """
    Merge sources that have latitude/longitude points and no reliable grid cell already.
    Uses source-specific local interpolation only.
    """
    available_cols = [c for c in columns if c in source_df.columns]
    if not available_cols:
        print(f"  ⚠️ Source {source_name} is missing all requested columns: {columns}.")
        return grid

    if "latitude" not in source_df.columns or "longitude" not in source_df.columns:
        print(f"  ⚠️ Source {source_name} has no spatial coordinates.")
        return grid

    result = spatial_interpolate(
        source_df=source_df,
        target_grid=grid,
        value_columns=available_cols,
        radius_km=radius_km,
    )

    _mark_available(result, source_name, available_cols)
    return result


def _merge_source(
    grid: pd.DataFrame,
    source_df: pd.DataFrame,
    source_name: str,
    columns: list[str],
    exact_grid: bool,
    radius_km: float,
) -> pd.DataFrame:
    """
    Merge one source into the grid.
    """
    avail_col = f"{source_name}_data_available"
    grid[avail_col] = 0

    if len(source_df) < 5:
        print(f"  ⚠️ Source {source_name} has too few rows ({len(source_df)}). Skipping.")
        return grid

    if exact_grid and "grid_lat" in source_df.columns and "grid_lon" in source_df.columns:
        grid = _merge_exact_grid_source(grid, source_df, source_name, columns)
    else:
        grid = _merge_point_source(grid, source_df, source_name, columns, radius_km)

    # Coverage report for the merged columns
    available_cols = [c for c in columns if c in grid.columns]
    coverage_parts = []
    for col in available_cols:
        real_pct = float(grid[col].notna().mean() * 100)
        coverage_parts.append(f"{col}: {real_pct:.1f}% real")

    if coverage_parts:
        print(f"  Coverage: {'; '.join(coverage_parts)}")

    return grid


def _compute_confidence_columns(grid: pd.DataFrame) -> pd.DataFrame:
    """
    Add coverage_score, per-domain confidence, and feature_completeness.
    """
    all_avail_cols = [c for c in grid.columns if c.endswith("_data_available")]
    if all_avail_cols:
        grid["coverage_score"] = grid[all_avail_cols].sum(axis=1) / len(all_avail_cols)
    else:
        grid["coverage_score"] = 0.5

    domain_map = {
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

    for domain, conf_col in domain_map.items():
        avail_col = f"{domain}_data_available"
        grid[conf_col] = grid[avail_col].astype(float) if avail_col in grid.columns else 0.0

    protected = {
        "grid_lat",
        "grid_lon",
        "cell_id",
        "coverage_score",
        "feature_completeness",
    }
    protected.update(c for c in grid.columns if c.endswith("_confidence"))
    protected.update(c for c in grid.columns if c.endswith("_data_available"))

    numeric_cols = [c for c in grid.columns if is_numeric_dtype(grid[c])]
    feature_cols = [c for c in numeric_cols if c not in protected]

    if feature_cols:
        grid["feature_completeness"] = grid[feature_cols].notna().mean(axis=1)
    else:
        grid["feature_completeness"] = 0.5

    return grid


def _drop_constant_numeric_columns(grid: pd.DataFrame) -> pd.DataFrame:
    """
    Remove constant numeric columns, but keep metadata.
    """
    protected = {
        "grid_lat",
        "grid_lon",
        "coverage_score",
        "feature_completeness",
    }
    protected.update(c for c in grid.columns if c.endswith("_confidence"))
    protected.update(c for c in grid.columns if c.endswith("_data_available"))

    numeric_cols = grid.select_dtypes(include=[np.number]).columns
    constant_cols = [
        c for c in numeric_cols
        if grid[c].nunique(dropna=True) <= 1 and c not in protected
    ]

    if constant_cols:
        print(f"\n✂️ Dropping {len(constant_cols)} constant columns: {constant_cols}")
        grid = grid.drop(columns=constant_cols)

    return grid


def _prune_dead_features(
    grid: pd.DataFrame,
    coverage_threshold_pct: float = 1.0,
) -> tuple[pd.DataFrame, list[str]]:
    """
    Aggressively prune features with insufficient real data.
    
    Features with < 1% real coverage are nearly pure NaN/defaults
    and add noise to training without signal.
    
    Args:
        grid: Merged grid dataframe
        coverage_threshold_pct: Minimum % of non-NaN values to keep
    
    Returns:
        (pruned_grid, dead_features_list)
    """
    protected = {
        "grid_lat",
        "grid_lon",
        "cell_id",
        "coverage_score",
        "feature_completeness",
    }
    protected.update(c for c in grid.columns if c.endswith("_confidence"))
    
    numeric_cols = grid.select_dtypes(include=[np.number]).columns
    dead_features = []
    
    for col in numeric_cols:
        if col in protected:
            continue
        
        coverage = (grid[col].notna().sum() / len(grid)) * 100
        
        if coverage < coverage_threshold_pct:
            dead_features.append(col)
    
    if dead_features:
        print(f"\n✂️ Pruning {len(dead_features)} dead features (<{coverage_threshold_pct}% coverage):")
        
        # Group by domain for clarity
        by_domain = {}
        for feat in dead_features:
            # Infer domain from column name
            domain = feat.split("_")[0]
            if domain not in by_domain:
                by_domain[domain] = []
            by_domain[domain].append(feat)
        
        for domain in sorted(by_domain.keys()):
            feats = by_domain[domain]
            coverage_info = [
                f"{f}: {(grid[f].notna().sum() / len(grid) * 100):.1f}%"
                for f in feats[:2]  # Show first 2 per domain
            ]
            suffix = f"... +{len(feats)-2} more" if len(feats) > 2 else ""
            print(f"   {domain:12s}: {', '.join(coverage_info)} {suffix}")
        
        grid = grid.drop(columns=dead_features)
    
    return grid, dead_features


def _generate_feature_manifest(
    grid: pd.DataFrame,
    registry: Any,
    dead_features: list[str],
) -> dict:
    """
    Generate feature manifest with coverage analysis.
    
    Returns:
        Manifest dict for JSON serialization
    """
    from datetime import datetime
    
    # Compute coverage for each feature
    manifest = registry.compute_coverage(grid)
    
    # Add metadata
    manifest_dict = manifest.to_dict()
    manifest_dict["dead_features_pruned"] = dead_features
    manifest_dict["merge_timestamp"] = datetime.utcnow().isoformat()
    
    # Report
    print(registry.report_coverage(manifest))
    
    return manifest_dict


def merge_all_sources() -> pd.DataFrame:
    print("\n" + "="*70)
    print("MERGING ALL DATA SOURCES")
    print("="*70)
    
    # Initialize systems
    registry = create_standard_registry()
    confidence_engine = get_confidence_engine()
    
    n_before_merge = None
    
    print("\nGenerating India grid...")
    grid = generate_india_grid()
    print(f"Grid: {len(grid)} cells")

    for filename, spec in SOURCE_SPECS.items():
        print(f"\nMerging: {filename}")
        source_name = _source_prefix(filename)
        source = _load_processed(filename)

        if source is None:
            for col in spec.columns:
                if col not in grid.columns:
                    grid[col] = np.nan
            continue

        grid = _ensure_numeric_grid_keys(grid)
        source = _ensure_numeric_grid_keys(source)

        grid = _merge_source(
            grid=grid,
            source_df=source,
            source_name=source_name,
            columns=spec.columns,
            exact_grid=spec.exact_grid,
            radius_km=spec.radius_km,
        )

    # -----------------------------------------------------------------
    # VALIDATION: Check for serialization bugs
    # -----------------------------------------------------------------
    print("\n" + "─"*70)
    print("Validating merged data integrity...")
    print("─"*70)
    
    try:
        check_coordinate_consistency(grid)
        print("✅ Coordinate consistency check passed")
    except Exception as e:
        print(f"❌ Coordinate check failed: {e}")
        raise

    # -----------------------------------------------------------------
    # Keep only cells with any real data in key sources
    # -----------------------------------------------------------------
    n_before_filter = len(grid)
    
    avail_cols = [
        f"{s}_data_available"
        for s in KEY_SOURCES
        if f"{s}_data_available" in grid.columns
    ]

    if avail_cols:
        has_any_real = grid[avail_cols].sum(axis=1) > 0
        grid = grid[has_any_real].copy()
        n_dropped = n_before_filter - len(grid)
        print(f"\n✂️ Dropped {n_dropped} cells with no real data from any key source")
        print(f"   Kept {len(grid)} cells with real data")
        warn_if_data_loss(n_before_filter, len(grid), "key source filtering")
    else:
        print("\n⚠️ No data availability columns found — keeping full grid")

    # -----------------------------------------------------------------
    # Confidence metadata and feature completeness
    # -----------------------------------------------------------------
    grid = _compute_confidence_columns(grid)

    # -----------------------------------------------------------------
    # Constant-column cleanup
    # -----------------------------------------------------------------
    grid = _drop_constant_numeric_columns(grid)

    # -----------------------------------------------------------------
    # AGGRESSIVE FEATURE PRUNING: Remove dead features (<1% coverage)
    # -----------------------------------------------------------------
    grid, dead_features = _prune_dead_features(
        grid,
        coverage_threshold_pct=1.0,
    )

    # -----------------------------------------------------------------
    # Drop indicator columns
    # -----------------------------------------------------------------
    indicator_cols = [c for c in grid.columns if c.endswith("_data_available")]
    if indicator_cols:
        grid = grid.drop(columns=indicator_cols)
        print(f"   Dropped {len(indicator_cols)} indicator columns")

    # -----------------------------------------------------------------
    # VALIDATION: Run invariant checks
    # -----------------------------------------------------------------
    print("\n" + "─"*70)
    print("Running invariant validations...")
    print("─"*70)
    
    try:
        validate_merge(grid, raise_on_critical=True)
    except Exception as e:
        print(f"\n❌ CRITICAL: Merge validation failed")
        print(f"   {e}")
        raise

    print(f"\nUnified grid: {len(grid)} cells × {len(grid.columns)} columns")
    print(f"Columns: {sorted(grid.columns.tolist())}")

    nan_pct = grid.select_dtypes(include=[np.number]).isna().mean()
    high_nan = nan_pct[nan_pct > 0.5]
    if not high_nan.empty:
        print(
            "\nColumns with >50% NaN (handled natively by LightGBM): "
            f"{dict(high_nan.round(2))}"
        )

    cs = grid["coverage_score"]
    fc = grid["feature_completeness"]
    print("\n📊 Confidence metrics:")
    print(f"  coverage_score:       mean={cs.mean():.2f}, std={cs.std():.2f}, min={cs.min():.2f}, max={cs.max():.2f}")
    print(f"  feature_completeness: mean={fc.mean():.2f}, std={fc.std():.2f}")
    print(f"  High confidence (coverage>0.5): {(cs > 0.5).sum()} cells ({(cs > 0.5).mean()*100:.1f}%)")
    print(f"  Low confidence  (coverage<0.2): {(cs < 0.2).sum()} cells ({(cs < 0.2).mean()*100:.1f}%)")

    if "grid_lat" in grid.columns and "grid_lon" in grid.columns:
        lat_mean = grid["grid_lat"].mean()
        lat_std = grid["grid_lat"].std()
        lon_mean = grid["grid_lon"].mean()
        lon_std = grid["grid_lon"].std()

        print("\n🗺️ Geographic distribution:")
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
            print(
                "  ⚠️ WARNING: Spatial coverage is concentrated. "
                "This may bias the model toward monitored urban regions."
            )
        if len(grid) < 500:
            print(
                f"  ⚠️ WARNING: Only {len(grid)} cells — "
                "this may underrepresent rural/remote India."
            )

    # -----------------------------------------------------------------
    # Generate feature manifest
    # -----------------------------------------------------------------
    manifest_dict = _generate_feature_manifest(grid, registry, dead_features)

    # -----------------------------------------------------------------
    # Save artifacts
    # -----------------------------------------------------------------
    output_path = PROCESSED_DIR / "unified_grid.parquet"
    grid.to_parquet(output_path, index=False)
    print(f"\nSaved: {output_path}")

    medians = grid.select_dtypes(include=[np.number]).median().to_dict()
    medians_path = PROCESSED_DIR / "grid_medians.json"
    with open(medians_path, "w", encoding="utf-8") as f:
        json.dump(
            {k: round(float(v), 4) for k, v in medians.items() if not np.isnan(v)},
            f,
            indent=2,
        )
    print(f"Saved column medians: {medians_path}")

    # Save feature manifest
    manifest_path = PROCESSED_DIR / "feature_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest_dict, f, indent=2)
    print(f"Saved feature manifest: {manifest_path}")

    print("\n" + "="*70)
    print(f"✅ MERGE COMPLETE: {len(grid)} cells, {len(grid.columns)} columns")
    print("="*70 + "\n")

    return grid


if __name__ == "__main__":
    merge_all_sources()