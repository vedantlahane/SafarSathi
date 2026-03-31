from __future__ import annotations

from typing import Any

from .schemas import SafetyFeatures


NUMERIC_COLUMNS = [
    "latitude",
    "longitude",
    "hour",
    "day_of_week",
    "month",
    "minutes_to_sunset",
    "elevation_m",
    "slope_deg",
    "distance_to_road_km",
    "distance_to_settlement_km",
    "flood_zone_proximity_km",
    "landslide_risk_index",
    "river_proximity_km",
    "vegetation_density",
    "temperature_c",
    "rainfall_mmph",
    "visibility_km",
    "wind_speed_kmph",
    "humidity_pct",
    "uv_index",
    "lightning_probability",
    "weather_severity",
    "aqi",
    "wildlife_sanctuary_distance_km",
    "elephant_corridor_distance_km",
    "recent_wildlife_reports_7d",
    "snake_activity_index",
    "police_eta_min",
    "hospital_eta_min",
    "ambulance_eta_min",
    "road_quality_score",
    "bridge_status_score",
    "shelter_availability_score",
    "signal_strength_dbm",
    "multi_carrier_coverage",
    "crime_rate_per_100k",
    "tourist_targeted_crime_index",
    "scam_reports_30d",
    "local_unrest_level",
    "gender_safety_index",
    "population_density_per_km2",
    "disease_outbreak_level",
    "malaria_zone",
    "water_safety_score",
    "accident_hotspot_distance_km",
    "traffic_density_index",
    "group_size",
    "battery_pct",
    "itinerary_deviation_km",
    "hours_since_checkin",
    "in_risk_zone",
    "active_alerts_nearby",
    "historical_incidents_30d",
    "historical_incidents_90d",
    "sos_triggers_30d",
    "prealerts_30d",
    "incident_trend_index",
    "nearby_tourist_density_index",
    "nearby_place_count",
    "safety_place_count",
    "risky_place_count",
    "open_business_count",
    "ndma_alert_level",
    "travel_advisory_level",
    # Derived features
    "is_night",
    "is_weekend_night",
    "is_monsoon",
    "is_winter",
    "is_summer",
    "remoteness_index",
    "response_access_index",
    "hazard_pressure_index",
    "social_pressure_index",
    "resource_readiness_index",
    "rule_score",
]

CATEGORICAL_COLUMNS = [
    "network_type",
    "risk_zone_level",
    "environment",
    "season",
]


def _season_from_month(month: int) -> str:
    if 6 <= month <= 9:
        return "monsoon"
    if month >= 11 or month <= 2:
        return "winter"
    if 3 <= month <= 5:
        return "summer"
    return "post_monsoon"


def build_model_features(
    features: SafetyFeatures,
    environment: str,
    rule_score: float,
) -> dict[str, Any]:
    season = _season_from_month(features.month)
    is_night = int(features.hour >= 20 or features.hour < 5)
    is_weekend_night = int(features.day_of_week in {5, 6} and is_night == 1)

    remoteness_index = (
        min(features.distance_to_settlement_km / 20.0, 1.0) * 0.35
        + min(features.distance_to_road_km / 10.0, 1.0) * 0.25
        + (1.0 - min(features.nearby_place_count / 20.0, 1.0)) * 0.20
        + (1.0 if features.network_type == "none" else 0.0) * 0.20
    )

    response_access_index = (
        (1.0 - min(features.police_eta_min / 40.0, 1.0)) * 0.35
        + (1.0 - min(features.hospital_eta_min / 60.0, 1.0)) * 0.35
        + (features.shelter_availability_score / 100.0) * 0.15
        + (features.road_quality_score / 100.0) * 0.15
    )

    hazard_pressure_index = (
        (features.weather_severity / 100.0) * 0.30
        + min(features.rainfall_mmph / 60.0, 1.0) * 0.15
        + features.lightning_probability * 0.10
        + features.landslide_risk_index * 0.10
        + (1.0 - min(features.flood_zone_proximity_km / 15.0, 1.0)) * 0.15
        + (1.0 - min(features.wildlife_sanctuary_distance_km / 20.0, 1.0)) * 0.10
        + features.snake_activity_index * 0.10
    )

    social_pressure_index = (
        min(features.crime_rate_per_100k / 600.0, 1.0) * 0.35
        + features.tourist_targeted_crime_index * 0.20
        + features.local_unrest_level * 0.20
        + min(features.scam_reports_30d / 15.0, 1.0) * 0.10
        + (1.0 - features.gender_safety_index) * 0.15
    )

    resource_readiness_index = (
        min(features.battery_pct / 100.0, 1.0) * 0.20
        + min(features.group_size / 5.0, 1.0) * 0.20
        + min(features.open_business_count / 12.0, 1.0) * 0.20
        + min(features.safety_place_count / 6.0, 1.0) * 0.20
        + min(features.water_safety_score / 100.0, 1.0) * 0.20
    )

    row: dict[str, Any] = {
        **features.to_dict(),
        "multi_carrier_coverage": int(features.multi_carrier_coverage),
        "malaria_zone": int(features.malaria_zone),
        "in_risk_zone": int(features.in_risk_zone),
        "is_night": is_night,
        "is_weekend_night": is_weekend_night,
        "is_monsoon": int(season == "monsoon"),
        "is_winter": int(season == "winter"),
        "is_summer": int(season == "summer"),
        "remoteness_index": round(remoteness_index, 6),
        "response_access_index": round(response_access_index, 6),
        "hazard_pressure_index": round(hazard_pressure_index, 6),
        "social_pressure_index": round(social_pressure_index, 6),
        "resource_readiness_index": round(resource_readiness_index, 6),
        "environment": environment,
        "season": season,
        "rule_score": float(rule_score),
    }

    return row
