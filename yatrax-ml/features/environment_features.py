"""
Environmental quality data → safety factor values.
Covers AQI, water quality, noise.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


# India AQI categories
AQI_CATEGORIES = {
    (0, 50): ("good", 0.0),
    (51, 100): ("satisfactory", 0.1),
    (101, 200): ("moderate", 0.3),
    (201, 300): ("poor", 0.6),
    (301, 400): ("very_poor", 0.8),
    (401, 500): ("severe", 1.0),
}


def aqi_to_risk(aqi: float) -> float:
    """Convert AQI value to health risk score (0-1)."""
    for (lo, hi), (_, risk) in AQI_CATEGORIES.items():
        if lo <= aqi <= hi:
            return risk
    if aqi > 500:
        return 1.0
    return 0.1


def compute_environment_risk_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Outputs:
    - aqi_risk (0-1)
    - water_risk (0-1)
    - noise_risk (0-1)
    - composite_environment_risk (0-1)
    """
    result = df.copy()

    # AQI risk
    aqi = result.get("aqi", pd.Series(75.0, index=result.index))
    result["aqi_risk"] = aqi.apply(aqi_to_risk)

    # Water risk
    water_contam = result.get("water_contamination_risk", pd.Series(0.15, index=result.index))
    result["water_risk"] = water_contam.clip(0, 1)

    # Noise risk
    noise = result.get("noise_level_proxy", pd.Series(0.2, index=result.index))
    result["noise_risk"] = noise.clip(0, 1)

    # Composite
    result["composite_environment_risk"] = (
        result["aqi_risk"] * 0.50 +
        result["water_risk"] * 0.35 +
        result["noise_risk"] * 0.15
    ).clip(0, 1)

    return result