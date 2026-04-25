"""
Terrain data → safety factor values.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


def compute_terrain_risk_features(terrain_df: pd.DataFrame) -> pd.DataFrame:
    """
    Outputs:
    - elevation_risk (0-1, higher elevation = more risk)
    - slope_risk (0-1, steeper = more dangerous)
    - terrain_accessibility (0-1, 1=easy access)
    """
    result = terrain_df.copy()

    elev = result.get("elevation_m", pd.Series(200.0, index=result.index))
    slope = result.get("slope_deg", pd.Series(5.0, index=result.index))

    # Elevation risk: ramps up above 2500m
    result["elevation_risk"] = np.where(
        elev > 2500,
        ((elev - 2500) / 4000).clip(0, 1),
        0.0,
    )

    # Slope risk
    result["slope_risk"] = (slope / 45.0).clip(0, 1)

    # Terrain accessibility (composite inverse)
    result["terrain_accessibility"] = (
        1.0 - (result["elevation_risk"] * 0.4 + result["slope_risk"] * 0.6)
    ).clip(0, 1)

    return result


def estimate_terrain_type(elevation_m: float, slope_deg: float, ndvi: float = 0.3) -> str:
    """Classify terrain type from numeric features."""
    if elevation_m > 4000:
        return "high_mountain"
    if elevation_m > 2000:
        return "mountain"
    if elevation_m > 800 and slope_deg > 15:
        return "hills"
    if ndvi > 0.6:
        return "forest"
    if elevation_m < 50:
        return "coastal_plains"
    if ndvi < 0.1 and elevation_m < 500:
        return "desert"
    return "plains"