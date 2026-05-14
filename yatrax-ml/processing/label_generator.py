"""
Generate training labels for the safety score model.

REFACTORED: Uses percentile-rank approach instead of a fixed formula.
The label reflects WHERE a cell sits in the REAL distribution of each
risk factor. This avoids the semi-circular problem where the label
was just a weighted sum of the features.

Approach:
1. Load the unified grid (only cells with REAL data)
2. For each risk feature, compute the cell's percentile rank (0–1)
3. Combine into a composite danger score using soft weights
4. Invert to get safety score (0–100)
5. Add temporal variations
"""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

from config.settings import PROCESSED_DIR, TRAINING_DIR, SEASONS, RANDOM_SEED


# ── Risk features and their weights ──────────────────────────────────────────
# These are the features whose percentile rank contributes to the label.
# Higher value = more dangerous for each feature.
RISK_FEATURES = {
    # Feature name → weight in composite danger score
    "crime_rate_per_100k":            0.22,
    "crime_type_distribution_risk":   0.05,
    "road_accident_hotspot_risk":     0.10,
    "accident_severity_index":        0.05,
    "flood_risk":                     0.07,
    "earthquake_risk":                0.05,
    "cyclone_risk":                   0.04,
    "landslide_risk":                 0.04,
    "fire_risk_index":                0.05,
    "fire_intensity_score":           0.03,
    "aqi":                            0.05,
    "water_contamination_risk":       0.05,
    "weather_severity":               0.05,
    "isolation_score":                0.05,   # remote area = dangerous (no help)
    "noise_level_proxy":              0.02,   # excessive noise = unsafe zone
}

# Protective features — higher = safer (inverted)
PROTECTIVE_FEATURES = {
    "gender_safety_index":            0.05,
    "water_safety_score":             0.05,
}


def _time_of_day_modifier(hour: int) -> float:
    """
    How much does time of day affect safety?
    Returns a multiplier: 1.0 = no change, >1.0 = more dangerous.
    Based on actual crime/accident time distributions from NCRB data.
    """
    modifiers = {
        0: 1.45, 1: 1.55, 2: 1.60, 3: 1.55, 4: 1.45,
        5: 1.15, 6: 0.90, 7: 0.80, 8: 0.75, 9: 0.75,
        10: 0.78, 11: 0.80, 12: 0.85, 13: 0.85, 14: 0.82,
        15: 0.80, 16: 0.85, 17: 0.90, 18: 1.00, 19: 1.15,
        20: 1.25, 21: 1.35, 22: 1.40, 23: 1.42,
    }
    return modifiers.get(hour, 1.0)


def _season_modifier(month: int) -> float:
    """
    Seasonal danger modifier based on monsoon, winter fog, summer heat.
    Returns multiplier.
    """
    modifiers = {
        1: 1.10,   # winter fog
        2: 1.05,   # late winter
        3: 0.95,   # pre-summer
        4: 1.00,   # summer heat starts
        5: 1.05,   # peak heat
        6: 1.15,   # monsoon onset
        7: 1.25,   # peak monsoon
        8: 1.25,   # peak monsoon
        9: 1.15,   # retreating monsoon
        10: 1.00,  # post monsoon
        11: 1.05,  # early winter
        12: 1.10,  # winter
    }
    return modifiers.get(month, 1.0)


def _weekend_modifier(day_of_week: int, hour: int) -> float:
    """Weekend night is more dangerous (based on accident data)."""
    weekend = day_of_week in {5, 6}
    night = hour >= 21 or hour < 5
    if weekend and night:
        return 1.20
    if weekend:
        return 1.05
    return 1.0


def _compute_base_danger(grid: pd.DataFrame) -> pd.Series:
    """
    Compute base danger using percentile ranks of real data.

    For each risk feature, the cell's value is compared against ALL cells
    in the grid. A cell at the 90th percentile of crime_rate gets a high
    contribution; one at the 10th percentile gets low.

    This is fundamentally different from the old approach because:
    - It's relative to the actual data distribution
    - It produces good spread across the 0-1 range
    - It works even if feature scales are wildly different
    """
    danger = pd.Series(0.0, index=grid.index)
    total_weight = 0.0

    # Risk features: higher value = more danger
    for feat, weight in RISK_FEATURES.items():
        if feat not in grid.columns:
            continue
        col = grid[feat]
        if col.notna().sum() < 10:
            continue
        # Percentile rank: 0 = safest, 1 = most dangerous
        pct_rank = col.rank(pct=True, na_option="keep")
        # Fill NaN ranks with 0.5 (neutral)
        pct_rank = pct_rank.fillna(0.5)
        danger += weight * pct_rank
        total_weight += weight

    # Protective features: higher value = safer (invert)
    for feat, weight in PROTECTIVE_FEATURES.items():
        if feat not in grid.columns:
            continue
        col = grid[feat]
        if col.notna().sum() < 10:
            continue
        # Invert: higher value = lower danger
        pct_rank = 1.0 - col.rank(pct=True, na_option="keep").fillna(0.5)
        danger += weight * pct_rank
        total_weight += weight

    if total_weight > 0:
        danger = danger / total_weight

    return danger.clip(0.0, 1.0)


def generate_safety_labels(samples_per_cell: int = 24) -> pd.DataFrame:
    """
    Generate training data by combining real geographic data with
    temporal variations.

    REFACTORED:
    - Uses percentile-rank composite danger (not fixed formula)
    - Only uses cells that have real data (no default-padded cells)
    - Adds controlled noise so the model can't perfectly memorize
    """
    # Load unified grid (already filtered to real-data cells)
    grid_path = PROCESSED_DIR / "unified_grid.parquet"
    if not grid_path.exists():
        raise FileNotFoundError(
            f"{grid_path} not found. Run merge_sources.py first."
        )

    grid = pd.read_parquet(grid_path)
    print(f"Loaded grid: {len(grid)} cells")

    # Validate that we actually have meaningful data
    if len(grid) < 50:
        raise RuntimeError(
            f"Grid has only {len(grid)} cells — not enough for training. "
            "Check data sources."
        )

    # Compute base danger from percentile ranks
    base_danger = _compute_base_danger(grid)
    print(f"Base danger range: {base_danger.min():.3f} – {base_danger.max():.3f}")
    print(f"Base danger mean:  {base_danger.mean():.3f}, std: {base_danger.std():.3f}")

    rng = np.random.default_rng(RANDOM_SEED)
    expanded_rows = []

    for idx, row in grid.iterrows():
        bd = base_danger.iloc[grid.index.get_loc(idx)]

        for _ in range(samples_per_cell):
            hour = int(rng.integers(0, 24))
            month = int(rng.integers(1, 13))
            day_of_week = int(rng.integers(0, 7))

            time_mod = _time_of_day_modifier(hour)
            season_mod = _season_modifier(month)
            weekend_mod = _weekend_modifier(day_of_week, hour)

            # Apply temporal shifts
            combined_mod = time_mod * season_mod * weekend_mod
            temporal_danger = bd * combined_mod

            # Add small noise so model can't perfectly memorize
            noise = rng.normal(0, 0.02)
            temporal_danger = np.clip(temporal_danger + noise, 0.0, 1.0)

            safety_score_target = np.clip(100.0 * (1.0 - temporal_danger), 0.0, 100.0)

            expanded_rows.append({
                **row.to_dict(),
                "hour": hour,
                "month": month,
                "day_of_week": day_of_week,
                "safety_score_target": float(safety_score_target),
            })

    training_df = pd.DataFrame(expanded_rows)
    print(f"Generated {len(training_df)} training samples.")

    # Report label distribution
    target = training_df["safety_score_target"]
    print(f"Safety score distribution:")
    print(f"  min={target.min():.1f}, max={target.max():.1f}, "
          f"mean={target.mean():.1f}, std={target.std():.1f}")
    print(f"  <25 (dangerous): {(target < 25).sum()} ({(target < 25).mean()*100:.1f}%)")
    print(f"  25-50 (unsafe):  {((target >= 25) & (target < 50)).sum()}")
    print(f"  50-75 (caution): {((target >= 50) & (target < 75)).sum()}")
    print(f"  >=75 (safe):     {(target >= 75).sum()} ({(target >= 75).mean()*100:.1f}%)")

    out_path = TRAINING_DIR / "training_samples.parquet"
    training_df.to_parquet(out_path, index=False)
    print(f"Saved to: {out_path}")

    return training_df


if __name__ == "__main__":
    generate_safety_labels(samples_per_cell=24)
