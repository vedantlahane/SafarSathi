"""
Health infrastructure data → safety factor values.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


def compute_health_risk_features(health_df: pd.DataFrame) -> pd.DataFrame:
    """
    Outputs:
    - medical_access_score (0-100): how accessible is medical help
    - emergency_readiness (0-1)
    - hospital_gap_risk (0-1): risk from lack of hospitals
    """
    result = health_df.copy()

    hosp_km = result.get("nearest_hospital_proxy_km", pd.Series(25.0, index=result.index))
    hosp_score = result.get("hospital_level_score", pd.Series(50.0, index=result.index))
    emerg = result.get("emergency_availability_score", pd.Series(40.0, index=result.index))

    # Medical access score: combination of distance + quality
    distance_score = (1.0 - (hosp_km / 50.0).clip(0, 1)) * 100
    result["medical_access_score"] = (
        distance_score * 0.5 + hosp_score * 0.3 + emerg * 0.2
    ).clip(0, 100)

    # Emergency readiness
    result["emergency_readiness"] = (emerg / 100.0).clip(0, 1)

    # Hospital gap risk (inverse of access)
    result["hospital_gap_risk"] = (
        1.0 - result["medical_access_score"] / 100.0
    ).clip(0, 1)

    return result


def estimate_ambulance_time_minutes(distance_km: float, terrain: str = "urban") -> float:
    """
    Estimate ambulance response time based on distance and terrain.
    India average: ~20-30 min urban, 45-90 min rural.
    """
    speed_kmph = {
        "urban": 30,
        "suburban": 25,
        "rural": 20,
        "hills": 15,
        "mountain": 10,
    }.get(terrain, 20)

    travel_time = (distance_km / speed_kmph) * 60  # minutes
    dispatch_time = 5.0  # minutes to dispatch

    return dispatch_time + travel_time