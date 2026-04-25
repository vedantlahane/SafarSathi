"""
Master feature column definitions for all models.

Single source of truth for which columns each model uses.
"""

from __future__ import annotations

from processing.factor_mapper import get_factor_names, get_factors_by_category


# ─── SAFETY SCORER FEATURES ───
# All geographic + temporal features
SAFETY_SCORER_FEATURES: list[str] = get_factor_names() + [
    "hour", "month", "day_of_week",
    "is_night", "is_monsoon", "is_fog_season",
    "is_weekend", "is_rush_hour",
    "hour_sin", "hour_cos",
    "month_sin", "month_cos",
]

# ─── ANOMALY DETECTOR FEATURES ───
# Subset most useful for detecting unusual combinations
ANOMALY_FEATURES: list[str] = [
    "crime_rate_per_100k",
    "road_accident_hotspot_risk",
    "accident_severity_index",
    "flood_risk",
    "earthquake_risk",
    "landslide_risk",
    "fire_risk_index",
    "aqi",
    "weather_severity",
    "temperature_c",
    "rainfall_mmph",
    "wind_speed_kmph",
    "visibility_km",
    "hospital_level_score",
    "emergency_availability_score",
    "nearest_hospital_proxy_km",
    "water_safety_score",
    "water_contamination_risk",
    "population_density_per_km2",
    "noise_level_proxy",
]

# ─── INCIDENT CLASSIFIER FEATURES ───
# Same as safety scorer + anomaly metadata columns
INCIDENT_CLASSIFIER_FEATURES: list[str] = SAFETY_SCORER_FEATURES + [
    "anomaly_score",
    "is_sudden_event",
]

# ─── TRAJECTORY FORECASTER FEATURES ───
# Time-varying features only (static features handled separately)
TRAJECTORY_TIME_FEATURES: list[str] = [
    "temperature_c", "humidity_pct", "rainfall_mmph",
    "wind_speed_kmph", "visibility_km", "weather_severity",
    "aqi",
    "hour_sin", "hour_cos",
    "is_night",
]

TRAJECTORY_STATIC_FEATURES: list[str] = [
    "crime_rate_per_100k",
    "road_accident_hotspot_risk",
    "flood_risk", "earthquake_risk",
    "hospital_level_score",
    "nearest_hospital_proxy_km",
    "population_density_per_km2",
    "elevation_m",
    "terrain_difficulty_score",
]

# ─── ALERT TIMING CONTEXT FEATURES ───
ALERT_CONTEXT_FEATURES: list[str] = [
    "current_safety_score",
    "score_change_rate_per_hour",
    "score_variance",
    "predicted_score_1h",
    "hours_since_last_alert",
    "alerts_last_24h",
    "user_response_rate",
    "incident_confidence",
    "distance_to_safety_km",
    "is_night",
    "hour_sin",
    "hour_cos",
    "battery_pct",
    "network_quality",
    "nearest_hospital_proxy_km",
]