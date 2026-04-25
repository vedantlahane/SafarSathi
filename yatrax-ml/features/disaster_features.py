"""
Disaster data → safety factor values.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from config.settings import SEASONS


def compute_disaster_risk_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Outputs:
    - composite_disaster_risk (0-1)
    - seasonal_disaster_modifier (multiplier)
    """
    result = df.copy()

    flood = result.get("flood_risk", pd.Series(0.1, index=result.index))
    eq = result.get("earthquake_risk", pd.Series(0.2, index=result.index))
    cyclone = result.get("cyclone_risk", pd.Series(0.05, index=result.index))
    landslide = result.get("landslide_risk", pd.Series(0.08, index=result.index))
    fire = result.get("fire_risk_index", pd.Series(0.05, index=result.index))

    result["composite_disaster_risk"] = (
        flood * 0.30 +
        eq * 0.25 +
        cyclone * 0.15 +
        landslide * 0.15 +
        fire * 0.15
    ).clip(0, 1)

    return result


def get_seasonal_disaster_modifier(month: int, disaster_type: str) -> float:
    """
    How much does this month amplify risk of a specific disaster?
    Returns multiplier (1.0 = normal, >1 = elevated).
    """
    modifiers = {
        "flood": {6: 1.3, 7: 2.0, 8: 2.0, 9: 1.5, 10: 1.1},
        "cyclone": {4: 1.3, 5: 1.5, 10: 1.8, 11: 2.0, 12: 1.3},
        "landslide": {6: 1.3, 7: 1.8, 8: 1.8, 9: 1.4},
        "fire": {3: 1.5, 4: 2.0, 5: 2.0, 10: 1.3, 11: 1.5},
        "earthquake": {},  # no seasonal pattern
        "heatwave": {4: 1.5, 5: 2.0, 6: 1.8},
        "coldwave": {12: 1.8, 1: 2.0, 2: 1.5},
    }

    type_mods = modifiers.get(disaster_type, {})
    return type_mods.get(month, 1.0)