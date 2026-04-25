"""
Composite / derived features that combine multiple factor categories.
These capture cross-category interactions that individual features miss.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


def compute_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add cross-category composite features.

    These are specifically designed to capture interactions:
    - rain + slope = landslide risk (higher than either alone)
    - night + crime + isolation = extreme danger
    - heat + humidity + no hospital = medical emergency risk
    """
    result = df.copy()

    # ─── LANDSLIDE COMPOUND RISK ───
    rain = result.get("rainfall_mmph", pd.Series(2.0, index=result.index))
    slope = result.get("slope_deg", pd.Series(5.0, index=result.index))
    ls_base = result.get("landslide_prone_index", pd.Series(0.05, index=result.index))

    result["landslide_compound_risk"] = (
        ls_base * 0.4 +
        (rain / 50).clip(0, 1) * 0.3 +
        (slope / 30).clip(0, 1) * 0.3
    ).clip(0, 1)

    # ─── FLOOD COMPOUND RISK ───
    flood_base = result.get("flood_risk", pd.Series(0.1, index=result.index))
    result["flood_compound_risk"] = (
        flood_base * 0.5 +
        (rain / 40).clip(0, 1) * 0.5
    ).clip(0, 1)

    # ─── NIGHT DANGER COMPOUND ───
    is_night = result.get("is_night", pd.Series(0, index=result.index))
    crime = result.get("crime_rate_per_100k", pd.Series(190.0, index=result.index))
    isolation = result.get("isolation_score", pd.Series(0.3, index=result.index))

    crime_norm = (crime / 600).clip(0, 1)
    result["night_danger_compound"] = (
        is_night * (crime_norm * 0.5 + isolation * 0.5)
    ).clip(0, 1)

    # ─── MEDICAL EMERGENCY COMPOUND ───
    hosp_km = result.get("nearest_hospital_proxy_km", pd.Series(25.0, index=result.index))
    temp = result.get("temperature_c", pd.Series(28.0, index=result.index))
    elev = result.get("elevation_m", pd.Series(200.0, index=result.index))

    heat_risk = ((temp - 38).clip(lower=0) / 12).clip(0, 1)
    altitude_risk = ((elev - 2500).clip(lower=0) / 3000).clip(0, 1)
    hosp_gap = (hosp_km / 50).clip(0, 1)

    result["medical_emergency_compound"] = (
        (heat_risk + altitude_risk).clip(0, 1) * 0.5 +
        hosp_gap * 0.5
    ).clip(0, 1)

    # ─── STRANDED RISK COMPOUND ───
    # Combination of isolation + poor weather + infrastructure gaps
    weather_sev = result.get("weather_severity", pd.Series(20.0, index=result.index))
    result["stranded_risk_compound"] = (
        isolation * 0.35 +
        (weather_sev / 80).clip(0, 1) * 0.30 +
        hosp_gap * 0.20 +
        ((100 - result.get("connectivity_score", pd.Series(70.0, index=result.index)).clip(0, 100)) / 100) * 0.15
    ).clip(0, 1)

    # ─── TRANSPORT DANGER COMPOUND ───
    accident_risk = result.get("road_accident_hotspot_risk", pd.Series(0.2, index=result.index))
    vis = result.get("visibility_km", pd.Series(8.0, index=result.index))
    vis_danger = ((5 - vis.clip(0, 5)) / 5).clip(0, 1)

    result["transport_danger_compound"] = (
        accident_risk * 0.4 +
        vis_danger * 0.3 +
        (rain / 30).clip(0, 1) * 0.3
    ).clip(0, 1)

    return result