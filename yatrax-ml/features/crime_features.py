"""
Crime data → safety factor values.

Transforms raw crime statistics into normalized risk features
that the ML models consume.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


def compute_crime_risk_features(crime_df: pd.DataFrame) -> pd.DataFrame:
    """
    Transform raw crime data into model-ready features.

    Input columns expected:
    - crime_rate_per_100k
    - murder, robbery, theft, rape, kidnapping, assault, riots

    Output columns added:
    - crime_risk_normalized (0-1)
    - violent_crime_ratio (0-1)
    - property_crime_ratio (0-1)
    - night_crime_multiplier (estimated)
    """
    result = crime_df.copy()

    # Normalize crime rate to 0-1 scale
    # India range: ~50 (safest districts) to ~800 (highest)
    if "crime_rate_per_100k" in result.columns:
        result["crime_risk_normalized"] = (
            result["crime_rate_per_100k"].clip(0, 800) / 800.0
        )
    else:
        result["crime_risk_normalized"] = 0.25

    # Violent crime ratio
    violent_cols = ["murder", "robbery", "assault", "riots"]
    available_violent = [c for c in violent_cols if c in result.columns]
    total_col = "total_ipc" if "total_ipc" in result.columns else None

    if available_violent and total_col:
        violent_sum = result[available_violent].sum(axis=1)
        total = result[total_col].clip(lower=1)
        result["violent_crime_ratio"] = (violent_sum / total).clip(0, 1)
    else:
        result["violent_crime_ratio"] = 0.22  # India average

    # Property crime ratio (theft, robbery)
    property_cols = ["theft", "robbery"]
    available_property = [c for c in property_cols if c in result.columns]

    if available_property and total_col:
        property_sum = result[available_property].sum(axis=1)
        total = result[total_col].clip(lower=1)
        result["property_crime_ratio"] = (property_sum / total).clip(0, 1)
    else:
        result["property_crime_ratio"] = 0.30

    # Night crime multiplier (estimated from NCRB time-of-day data)
    # Most crimes happen between 6pm-6am
    # This is a static estimate per area; real-time model uses hour feature
    result["night_crime_multiplier"] = np.where(
        result["crime_risk_normalized"] > 0.5,
        1.5,  # high crime areas are worse at night
        1.2,  # moderate areas slightly worse at night
    )

    # Gender safety risk
    gender_cols = ["rape", "kidnapping"]
    available_gender = [c for c in gender_cols if c in result.columns]

    if available_gender and total_col:
        gender_sum = result[available_gender].sum(axis=1)
        total = result[total_col].clip(lower=1)
        result["gender_crime_risk"] = (gender_sum / total).clip(0, 1)
    else:
        result["gender_crime_risk"] = 0.08

    return result


def apply_temporal_crime_modifiers(
    base_crime_rate: float,
    hour: int,
    month: int,
    is_weekend: bool = False,
) -> float:
    """
    Adjust crime rate based on time factors.
    Returns modified crime rate.

    Based on NCRB time-of-occurrence distributions:
    - Peak crime hours: 6pm-12am
    - Lowest: 6am-12pm
    - Festivals/holidays: slight increase in property crime
    """
    # Hour modifier
    hour_mods = {
        0: 1.40, 1: 1.35, 2: 1.30, 3: 1.25, 4: 1.15,
        5: 1.00, 6: 0.85, 7: 0.80, 8: 0.75, 9: 0.75,
        10: 0.78, 11: 0.80, 12: 0.85, 13: 0.85, 14: 0.82,
        15: 0.85, 16: 0.90, 17: 0.95, 18: 1.10, 19: 1.20,
        20: 1.30, 21: 1.40, 22: 1.42, 23: 1.43,
    }
    modified = base_crime_rate * hour_mods.get(hour, 1.0)

    # Weekend modifier
    if is_weekend:
        modified *= 1.08

    # Festival season (Oct-Nov) slight increase
    if month in (10, 11):
        modified *= 1.05

    return modified