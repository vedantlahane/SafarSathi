"""
Generate training labels for the safety score model.

IMPROVED VERSION:
- nonlinear percentile-risk composition
- confidence-aware penalties
- uncertainty-aware supervision
- probabilistic temporal effects
- realistic heavy-tail danger modeling
- anti-memorization noise injection
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
# TEMPORAL MODIFIERS
# ============================================================

def _time_of_day_modifier(hour: int) -> float:
    """
    Time-based danger prior.

    Designed from real-world urban risk patterns:
    - late-night crime peaks
    - early-morning road danger
    - safer daylight hours
    """
    modifiers = {
        0: 1.40,
        1: 1.52,
        2: 1.58,
        3: 1.55,
        4: 1.45,
        5: 1.15,
        6: 0.95,
        7: 0.82,
        8: 0.75,
        9: 0.72,
        10: 0.74,
        11: 0.76,
        12: 0.80,
        13: 0.82,
        14: 0.80,
        15: 0.78,
        16: 0.82,
        17: 0.90,
        18: 1.00,
        19: 1.12,
        20: 1.22,
        21: 1.32,
        22: 1.38,
        23: 1.40,
    }
    return modifiers.get(hour, 1.0)


def _season_modifier(month: int) -> float:
    """
    Monsoon / winter / heatwave seasonality.
    """
    modifiers = {
        1: 1.10,
        2: 1.04,
        3: 0.96,
        4: 1.00,
        5: 1.06,
        6: 1.16,
        7: 1.26,
        8: 1.28,
        9: 1.18,
        10: 1.00,
        11: 1.04,
        12: 1.10,
    }
    return modifiers.get(month, 1.0)


def _weekend_modifier(day_of_week: int, hour: int) -> float:
    weekend = day_of_week in {5, 6}
    night = hour >= 21 or hour < 5

    if weekend and night:
        return 1.22

    if weekend:
        return 1.06

    return 1.0


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
    Compute nonlinear danger field.

    Key improvements:
    - heavy-tail amplification
    - extreme-risk boosting
    - confidence-aware scaling
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

        # Nonlinear amplification:
        # dangerous tail becomes more visible.
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
# SAMPLE GENERATION
# ============================================================

def generate_safety_labels(
    samples_per_cell: int = 24,
) -> pd.DataFrame:
    """
    Generate realistic supervised training labels.

    Improvements:
    - stochastic temporal variation
    - anti-overfitting perturbation
    - uncertainty-aware supervision
    """

    grid_path = PROCESSED_DIR / "unified_grid.parquet"

    if not grid_path.exists():
        raise FileNotFoundError(
            f"{grid_path} not found. Run merge_sources.py first."
        )

    grid = pd.read_parquet(grid_path)

    print(f"Loaded grid: {len(grid)} cells")

    if len(grid) < 50:
        raise RuntimeError(
            f"Grid has only {len(grid)} cells."
        )

    # --------------------------------------------------------
    # BASE DANGER
    # --------------------------------------------------------
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

    # ========================================================
    # SAMPLE GENERATION LOOP
    # ========================================================
    for idx, row in grid.iterrows():

        bd = float(base_danger.iloc[grid.index.get_loc(idx)])

        # uncertainty for sparse cells
        completeness = float(
            row.get("feature_completeness", 0.5)
        )

        uncertainty_scale = (
            1.0 - completeness
        ) * 0.10

        for _ in range(samples_per_cell):

            hour = int(rng.integers(0, 24))
            month = int(rng.integers(1, 13))
            day_of_week = int(rng.integers(0, 7))

            # ------------------------------------------------
            # TEMPORAL EFFECTS
            # ------------------------------------------------
            time_mod = _time_of_day_modifier(hour)
            season_mod = _season_modifier(month)
            weekend_mod = _weekend_modifier(
                day_of_week,
                hour,
            )

            combined_mod = (
                time_mod
                * season_mod
                * weekend_mod
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
            # NONLINEAR TEMPORAL DANGER
            # ------------------------------------------------
            temporal_danger = (
                bd
                * (combined_mod ** 0.7)
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
            # FINAL NOISE
            # ------------------------------------------------
            total_noise = (
                geo_noise
                + uncertainty_noise
            )

            temporal_danger += total_noise

            # Soft clamp
            temporal_danger = np.tanh(
                temporal_danger * 1.3
            )

            temporal_danger = np.clip(
                temporal_danger,
                0.0,
                1.0,
            )

            # ------------------------------------------------
            # SAFETY SCORE
            # ------------------------------------------------
            safety_score_target = (
                100.0
                * (1.0 - temporal_danger)
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

    training_df = pd.DataFrame(expanded_rows)

    print(
        f"Generated {len(training_df)} training samples."
    )

    # ========================================================
    # LABEL DISTRIBUTION
    # ========================================================
    target = training_df["safety_score_target"]

    print("\nSafety score distribution:")
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

    out_path = TRAINING_DIR / "training_samples.parquet"

    training_df.to_parquet(
        out_path,
        index=False,
    )

    print(f"Saved to: {out_path}")

    return training_df


if __name__ == "__main__":
    generate_safety_labels(samples_per_cell=24)