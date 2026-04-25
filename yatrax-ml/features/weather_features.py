"""
Weather data → safety factor values.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


def compute_weather_risk_features(weather_df: pd.DataFrame) -> pd.DataFrame:
    """
    Transform raw weather data into model-ready risk features.

    Outputs:
    - heat_index_risk (0-1)
    - cold_risk (0-1)
    - rain_danger (0-1)
    - wind_danger (0-1)
    - visibility_danger (0-1)
    - composite_weather_danger (0-1)
    """
    result = weather_df.copy()

    # Heat index risk (temp + humidity combination)
    temp = result.get("temperature_c", pd.Series(28.0, index=result.index))
    humidity = result.get("humidity_pct", pd.Series(60.0, index=result.index))

    # Simplified heat index
    heat_index = temp + 0.1 * humidity
    result["heat_index_risk"] = np.where(
        heat_index > 50, ((heat_index - 50) / 20).clip(0, 1),
        0.0
    )

    # Cold risk
    result["cold_risk"] = np.where(
        temp < 5, ((5 - temp) / 15).clip(0, 1),
        0.0
    )

    # Rain danger (0 = no rain, 1 = extreme)
    rain = result.get("rainfall_mmph", pd.Series(0.0, index=result.index))
    result["rain_danger"] = (rain / 60.0).clip(0, 1)

    # Wind danger
    wind = result.get("wind_speed_kmph", pd.Series(10.0, index=result.index))
    result["wind_danger"] = np.where(
        wind > 30, ((wind - 30) / 70).clip(0, 1),
        0.0
    )

    # Visibility danger (inverse)
    vis = result.get("visibility_km", pd.Series(8.0, index=result.index))
    result["visibility_danger"] = ((5.0 - vis.clip(0, 5)) / 5.0).clip(0, 1)

    # Composite
    result["composite_weather_danger"] = (
        result["heat_index_risk"] * 0.15 +
        result["cold_risk"] * 0.10 +
        result["rain_danger"] * 0.30 +
        result["wind_danger"] * 0.20 +
        result["visibility_danger"] * 0.25
    ).clip(0, 1)

    return result


def is_fog_likely(
    temperature_c: float,
    humidity_pct: float,
    month: int,
    hour: int,
    region: str = "north",
) -> float:
    """
    Estimate fog probability (0-1).
    North India Dec-Jan, early morning, high humidity.
    """
    fog_prob = 0.0

    if region in ("north", "plains"):
        if month in (12, 1) and (5 <= hour <= 9):
            fog_prob = 0.5
            if humidity_pct > 85:
                fog_prob += 0.3
            if temperature_c < 8:
                fog_prob += 0.2

    elif region in ("hill", "mountain"):
        if humidity_pct > 90:
            fog_prob = 0.4
        if 5 <= hour <= 8:
            fog_prob += 0.2

    return min(1.0, fog_prob)