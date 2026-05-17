"""
Generate training labels for the safety score model.

IMPROVED VERSION v2.0:
- Reduced temporal weighting to prevent signal collapse
- Strong geographic priors from crime/disaster features
- Confidence-aware penalties
- Uncertainty-aware supervision
- Anti-memorization noise injection
- Label distribution tracking per cell type

CHANGES from v1:
- Temporal modifiers: 1.4-1.58 → 0.95-1.15 (much weaker)
- Geographic mixing: Now 60% geographic + 40% temporal (was inverse)
- Feature dropout: Random feature masking during training
- Cell type tracking: Monitor labels by crime/disaster risk
"""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

from config.settings import (
    PROCESSED_DIR,
    TRAINING_DIR,
    RANDOM_SEED,
)

# ============================================================
# RISK FEATURES
# ============================================================

RISK_FEATURES = {
    "crime_rate_per_100k": 0.22,
    "crime_type_distribution_risk": 0.05,
    "road_accident_hotspot_risk": 0.10,
    "accident_severity_index": 0.05,
    "flood_risk": 0.07,
    "earthquake_risk": 0.05,
    "cyclone_risk": 0.04,
    "landslide_risk": 0.04,
    "fire_risk_index": 0.05,
    "fire_intensity_score": 0.03,
    "aqi": 0.05,
    "water_contamination_risk": 0.05,
    "weather_severity": 0.05,
    "isolation_score": 0.05,
    "noise_level_proxy": 0.02,
}

PROTECTIVE_FEATURES = {
    "gender_safety_index": 0.05,
    "water_safety_score": 0.05,
}

# Geographic prior features: strong spatial signals
GEOGRAPHIC_PRIORS = {
    "crime_rate_per_100k": 0.30,  # Crime is strongly geographic
    "flood_risk": 0.15,
    "earthquake_risk": 0.15,
    "fire_risk_index": 0.10,
    "road_accident_hotspot_risk": 0.10,
    "isolation_score": 0.10,
}

CONFIDENCE_COLUMNS = [
    "crime_confidence",
    "weather_confidence",
    "aqi_confidence",
    "water_confidence",
    "health_confidence",
    "disaster_confidence",
    "accident_confidence",
    "fire_confidence",
    "terrain_confidence",
    "population_confidence",
    "noise_confidence",
]


# ============================================================
# TEMPORAL MODIFIERS (REDUCED v2.0)
# ============================================================

def _time_of_day_modifier(hour: int) -> float:
    """
    WEAKENED time-based modifier.
    
    Old range: 0.72-1.58 (58% variation)
    New range: 0.95-1.10 (10% variation)
    
    Justification:
    - Hour should NOT be 82.8% of feature importance
    - Real risk is more geographically determined than temporal
    - This allows geographic signals to emerge during training
    """
    modifiers = {
        0: 1.08,   # Slight night risk
        1: 1.09,
        2: 1.10,
        3: 1.09,
        4: 1.08,
        5: 1.03,
        6: 0.98,
        7: 0.97,
        8: 0.96,
        9: 0.95,   # Peak day hours
        10: 0.95,
        11: 0.96,
        12: 0.97,
        13: 0.98,
        14: 0.97,
        15: 0.96,
        16: 0.97,
        17: 0.99,
        18: 1.00,
        19: 1.02,
        20: 1.05,
        21: 1.07,
        22: 1.09,
        23: 1.08,
    }
    return modifiers.get(hour, 1.0)


def _season_modifier(month: int) -> float:
    """
    Monsoon / winter / heatwave seasonality (also weakened).
    
    Old range: 0.96-1.28
    New range: 0.98-1.10
    """
    modifiers = {
        1: 1.04,
        2: 1.02,
        3: 0.99,
        4: 0.98,
        5: 1.00,
        6: 1.08,
        7: 1.10,
        8: 1.09,
        9: 1.06,
        10: 1.00,
        11: 1.02,
        12: 1.04,
    }
    return modifiers.get(month, 1.0)


def _weekend_modifier(day_of_week: int, hour: int) -> float:
    """Weakened weekend effect."""
    weekend = day_of_week in {5, 6}
    night = hour >= 21 or hour < 5

    if weekend and night:
        return 1.04  # Down from 1.22
    if weekend:
        return 1.02  # Down from 1.06
    return 1.0


# ============================================================
# GEOGRAPHIC PRIORS
# ============================================================

def _compute_geographic_prior(grid: pd.DataFrame) -> pd.Series:
    """
    Strong geographic risk signal.
    
    Uses features with strong spatial/environmental correlation:
    - Crime concentration
    - Disaster-prone regions
    - Isolated areas
    
    Returns:
        Percentile-normalized geographic risk (0-1)
    """
    geo_risk = pd.Series(0.0, index=grid.index)
    total_weight = 0.0

    for feat, weight in GEOGRAPHIC_PRIORS.items():
        if feat not in grid.columns:
            continue
        
        col = pd.to_numeric(grid[feat], errors="coerce")
        if col.notna().sum() < 10:
            continue
        
        # Percentile rank
        pct = col.rank(pct=True, na_option="keep").fillna(0.5)
        
        # Nonlinear amplification of extreme values
        nonlinear = pct ** 1.8
        
        geo_risk += weight * nonlinear
        total_weight += weight
    
    if total_weight > 0:
        geo_risk = geo_risk / total_weight
    else:
        geo_risk.fillna(0.5)
    
    return geo_risk.clip(0.0, 1.0)


# ============================================================
# NONLINEAR DANGER MODEL
# ============================================================

def _robust_percentile_rank(series: pd.Series) -> pd.Series:
    """
    Percentile rank with NaN-safe handling.
    """
    s = pd.to_numeric(series, errors="coerce")

    if s.notna().sum() < 10:
        return pd.Series(0.5, index=s.index)

    ranked = s.rank(pct=True, na_option="keep")

    return ranked.fillna(0.5)


def _compute_base_danger(grid: pd.DataFrame) -> pd.Series:
    """
    Compute nonlinear danger field (geographic component).

    Key improvements:
    - heavy-tail amplification
    - extreme-risk boosting
    - confidence-aware scaling
    - Now emphasizes geographic over temporal
    """

    danger = pd.Series(0.0, index=grid.index)
    total_weight = 0.0

    # --------------------------------------------------------
    # RISK FEATURES
    # --------------------------------------------------------
    for feat, weight in RISK_FEATURES.items():

        if feat not in grid.columns:
            continue

        pct = _robust_percentile_rank(grid[feat])

        # Nonlinear amplification
        nonlinear = pct ** 1.8

        danger += weight * nonlinear
        total_weight += weight

    # --------------------------------------------------------
    # PROTECTIVE FEATURES
    # --------------------------------------------------------
    for feat, weight in PROTECTIVE_FEATURES.items():

        if feat not in grid.columns:
            continue

        pct = _robust_percentile_rank(grid[feat])

        # invert
        protective = (1.0 - pct) ** 1.6

        danger += weight * protective
        total_weight += weight

    if total_weight > 0:
        danger = danger / total_weight

    # --------------------------------------------------------
    # CONFIDENCE PENALTY
    # Sparse / low-confidence cells become uncertain-danger cells.
    # --------------------------------------------------------
    conf_cols = [
        c for c in CONFIDENCE_COLUMNS
        if c in grid.columns
    ]

    if conf_cols:
        avg_conf = (
            grid[conf_cols]
            .apply(pd.to_numeric, errors="coerce")
            .fillna(0)
            .mean(axis=1)
        )

        # Low confidence slightly increases danger uncertainty.
        confidence_penalty = (1.0 - avg_conf) * 0.12

        danger += confidence_penalty

    # --------------------------------------------------------
    # FEATURE COMPLETENESS PENALTY
    # --------------------------------------------------------
    if "feature_completeness" in grid.columns:

        completeness = pd.to_numeric(
            grid["feature_completeness"],
            errors="coerce",
        ).fillna(0)

        incompleteness_penalty = (
            (1.0 - completeness) ** 1.4
        ) * 0.10

        danger += incompleteness_penalty

    # --------------------------------------------------------
    # SOFT SATURATION
    # Avoid hard clipping artifacts.
    # --------------------------------------------------------
    danger = 1.0 / (1.0 + np.exp(-6 * (danger - 0.5)))

    return danger.clip(0.0, 1.0)


# ============================================================
# SAMPLE GENERATION v2.0
# ============================================================

def generate_safety_labels(
    samples_per_cell: int = 24,
    geographic_weight: float = 0.60,
    temporal_weight: float = 0.40,
) -> pd.DataFrame:
    """
    Generate realistic supervised training labels.

    v2.0 Changes:
    - Geographic weight 60%, temporal 40% (was inverse)
    - Reduced temporal modifiers (0.95-1.10 range)
    - Feature dropout to prevent overfitting to data artifacts
    
    Args:
        samples_per_cell: Samples per grid cell
        geographic_weight: Weight of geographic priors vs temporal (0-1)
        temporal_weight: Weight of temporal signals vs geographic
    """

    grid_path = PROCESSED_DIR / "unified_grid.parquet"

    if not grid_path.exists():
        raise FileNotFoundError(
            f"{grid_path} not found. Run merge_sources.py first."
        )

    grid = pd.read_parquet(grid_path)

    print(f"\n" + "="*70)
    print(f"LABEL GENERATION v2.0 (Geographic + Temporal)")
    print(f"="*70)
    print(f"Loaded grid: {len(grid)} cells")

    if len(grid) < 50:
        raise RuntimeError(
            f"Grid has only {len(grid)} cells."
        )

    # --------------------------------------------------------
    # GEOGRAPHIC PRIOR (new)
    # --------------------------------------------------------
    print("\n🗺️ Computing geographic priors...")
    geographic_risk = _compute_geographic_prior(grid)
    
    print(
        f"Geographic risk range: "
        f"{geographic_risk.min():.3f} – {geographic_risk.max():.3f}"
    )

    # --------------------------------------------------------
    # BASE DANGER (geographic component)
    # --------------------------------------------------------
    print("\n📊 Computing base danger (geographic)...")
    base_danger = _compute_base_danger(grid)

    print(
        f"Base danger range: "
        f"{base_danger.min():.3f} – {base_danger.max():.3f}"
    )

    print(
        f"Base danger mean={base_danger.mean():.3f}, "
        f"std={base_danger.std():.3f}"
    )

    rng = np.random.default_rng(RANDOM_SEED)

    expanded_rows = []

    # Cell type tracking for distribution analysis
    cell_type_labels = []

    # ========================================================
    # SAMPLE GENERATION LOOP
    # ========================================================
    print(f"\nGenerating {len(grid)} × {samples_per_cell} = {len(grid) * samples_per_cell} samples...")
    
    for idx, row in grid.iterrows():

        bd = float(base_danger.iloc[grid.index.get_loc(idx)])
        geo_prior = float(geographic_risk.iloc[grid.index.get_loc(idx)])

        # Uncertainty for sparse cells
        completeness = float(
            row.get("feature_completeness", 0.5)
        )

        uncertainty_scale = (
            1.0 - completeness
        ) * 0.10
        
        # Cell type: categorize by crime rate for tracking
        crime_rate = pd.to_numeric(row.get("crime_rate_per_100k"), errors="coerce")
        if pd.isna(crime_rate):
            cell_type = "unknown"
        elif crime_rate < 100:
            cell_type = "safe"
        elif crime_rate < 250:
            cell_type = "moderate"
        else:
            cell_type = "high_risk"

        for sample_idx in range(samples_per_cell):

            hour = int(rng.integers(0, 24))
            month = int(rng.integers(1, 13))
            day_of_week = int(rng.integers(0, 7))

            # ------------------------------------------------
            # TEMPORAL EFFECTS (WEAKENED v2.0)
            # ------------------------------------------------
            time_mod = _time_of_day_modifier(hour)
            season_mod = _season_modifier(month)
            weekend_mod = _weekend_modifier(
                day_of_week,
                hour,
            )

            # Combined temporal modifier (much weaker now)
            combined_temporal_mod = (
                time_mod
                * season_mod
                * weekend_mod
            )

            # ------------------------------------------------
            # GEOGRAPHIC + TEMPORAL MIXING (v2.0)
            # ------------------------------------------------
            # Geographic: 60%, Temporal: 40%
            # This allows model to learn spatial patterns, not just time
            composite_danger = (
                geographic_weight * geo_prior +
                temporal_weight * (bd * combined_temporal_mod)
            )

            # ------------------------------------------------
            # STOCHASTIC EXTREME EVENTS
            # ------------------------------------------------
            extreme_event_boost = 1.0

            if rng.random() < 0.015:
                extreme_event_boost += rng.uniform(
                    0.15,
                    0.45,
                )

            # ------------------------------------------------
            # FINAL DANGER COMPUTATION
            # ------------------------------------------------
            final_danger = (
                composite_danger
                * extreme_event_boost
            )

            # ------------------------------------------------
            # GEO PERTURBATION
            # Prevent memorization.
            # ------------------------------------------------
            geo_noise = rng.normal(
                0,
                0.015,
            )

            # ------------------------------------------------
            # UNCERTAINTY NOISE
            # ------------------------------------------------
            uncertainty_noise = rng.normal(
                0,
                uncertainty_scale,
            )

            # ------------------------------------------------
            # FEATURE DROPOUT (v2.0)
            # Randomly mask features to prevent overfitting
            # to data artifacts in incomplete cells
            # ------------------------------------------------
            feature_dropout_noise = 0.0
            if completeness < 0.7:  # Only for incomplete cells
                if rng.random() < (1.0 - completeness):
                    feature_dropout_noise = rng.normal(0, 0.08)

            # ------------------------------------------------
            # FINAL NOISE
            # ------------------------------------------------
            total_noise = (
                geo_noise
                + uncertainty_noise
                + feature_dropout_noise
            )

            final_danger += total_noise

            # Soft clamp
            final_danger = np.tanh(
                final_danger * 1.3
            )

            final_danger = np.clip(
                final_danger,
                0.0,
                1.0,
            )

            # ------------------------------------------------
            # SAFETY SCORE
            # ------------------------------------------------
            safety_score_target = (
                100.0
                * (1.0 - final_danger)
            )

            expanded_rows.append({
                **row.to_dict(),
                "hour": hour,
                "month": month,
                "day_of_week": day_of_week,
                "safety_score_target": float(
                    safety_score_target
                ),
            })
            
            cell_type_labels.append(cell_type)

    training_df = pd.DataFrame(expanded_rows)

    print(
        f"\n✅ Generated {len(training_df)} training samples."
    )

    # ========================================================
    # LABEL DISTRIBUTION ANALYSIS
    # ========================================================
    target = training_df["safety_score_target"]

    print("\n📈 Safety score distribution (overall):")
    print(
        f"  min={target.min():.1f}, "
        f"max={target.max():.1f}, "
        f"mean={target.mean():.1f}, "
        f"std={target.std():.1f}"
    )

    print(
        f"  <25 (dangerous): "
        f"{(target < 25).sum()} "
        f"({(target < 25).mean()*100:.1f}%)"
    )

    print(
        f"  25-50 (unsafe): "
        f"{((target >= 25) & (target < 50)).sum()}"
    )

    print(
        f"  50-75 (caution): "
        f"{((target >= 50) & (target < 75)).sum()}"
    )

    print(
        f"  >=75 (safe): "
        f"{(target >= 75).sum()} "
        f"({(target >= 75).mean()*100:.1f}%)"
    )

    # ========================================================
    # DISTRIBUTION BY CELL TYPE (v2.0)
    # ========================================================
    print("\n📊 Label distribution by cell type:")
    print("  (Ensures model learns cell-specific patterns)")
    
    for cell_type in ["safe", "moderate", "high_risk", "unknown"]:
        mask = training_df["cell_type"] == cell_type
        n_samples = mask.sum()
        if n_samples == 0:
            continue
        
        subset_target = target[mask]
        mean_safety = subset_target.mean()
        
        print(
            f"  {cell_type:12s}: {n_samples:6d} samples, "
            f"mean_safety={mean_safety:6.1f}, "
            f"std={subset_target.std():5.1f}"
        )

    # Remove cell_type from final output (was only for tracking)
    training_df = training_df.drop(columns=["cell_type"])

    out_path = TRAINING_DIR / "training_samples.parquet"

    training_df.to_parquet(
        out_path,
        index=False,
    )

    print(f"\n✅ Saved to: {out_path}")
    print("="*70 + "\n")

    return training_df


if __name__ == "__main__":
    generate_safety_labels(samples_per_cell=24)