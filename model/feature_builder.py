from __future__ import annotations

from typing import Any

from .factor_registry import FACTOR_KEYS, factor_defaults
from .schemas import SafetyFeatures


FACTOR_COLUMNS = list(FACTOR_KEYS)

# TensorFlow path uses a numeric-only matrix.
CATEGORICAL_COLUMNS: list[str] = []

DERIVED_COLUMNS = [
    "latitude",
    "longitude",
    "hour",
    "day_of_week",
    "month",
    "network_type_score_derived",
    "risk_zone_level_score_derived",
    "environment_code",
    "season_code",
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

NUMERIC_COLUMNS = FACTOR_COLUMNS + DERIVED_COLUMNS


def _season_from_month(month: int) -> str:
    if 6 <= month <= 9:
        return "monsoon"
    if month >= 11 or month <= 2:
        return "winter"
    if 3 <= month <= 5:
        return "summer"
    return "post_monsoon"


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _network_score(network_type: str) -> float:
    return {
        "wifi": 95.0,
        "5g": 92.0,
        "4g": 86.0,
        "3g": 65.0,
        "2g": 35.0,
        "none": 5.0,
    }.get(network_type, 45.0)


def _risk_zone_score(level: str, in_zone: bool) -> float:
    if not in_zone:
        return 0.15
    return {
        "LOW": 0.30,
        "MEDIUM": 0.55,
        "HIGH": 0.82,
        "CRITICAL": 0.96,
    }.get(level, 0.45)


def _environment_code(environment: str) -> float:
    return {
        "urban": 0.0,
        "suburban": 1.0,
        "rural": 2.0,
        "remote": 3.0,
        "wilderness": 4.0,
    }.get(environment, 1.0)


def _season_code(season: str) -> float:
    return {
        "summer": 0.0,
        "monsoon": 1.0,
        "post_monsoon": 2.0,
        "winter": 3.0,
    }.get(season, 2.0)


def _time_of_day_risk(hour: int) -> float:
    if 8 <= hour < 18:
        return 0.12
    if 18 <= hour < 20:
        return 0.28
    if 20 <= hour < 22:
        return 0.50
    if hour >= 22 or hour < 2:
        return 0.78
    if 2 <= hour < 5:
        return 0.92
    return 0.35


def _day_of_week_risk(day_of_week: int, hour: int) -> float:
    weekend = day_of_week in {5, 6}
    if weekend and (hour >= 21 or hour < 4):
        return 0.65
    if weekend:
        return 0.32
    return 0.18


def _season_risk(month: int) -> float:
    if 6 <= month <= 9:
        return 0.72
    if month >= 11 or month <= 2:
        return 0.42
    if 3 <= month <= 5:
        return 0.36
    return 0.25


def _moon_visibility_score(day_of_month: int) -> float:
    # Approximation without astronomy dependency.
    phase = abs(((day_of_month % 29) / 14.5) - 1.0)
    return _clamp((1.0 - phase) * 100.0, 0.0, 100.0)


def build_factor_values(features: SafetyFeatures, environment: str) -> dict[str, float]:
    values = factor_defaults()

    season = _season_from_month(features.month)
    is_monsoon = season == "monsoon"
    is_winter = season == "winter"

    network_score = _network_score(features.network_type)
    risk_zone_score = _risk_zone_score(features.risk_zone_level, features.in_risk_zone)

    # Category 1
    values["elevation_m"] = features.elevation_m
    values["slope_gradient_deg"] = features.slope_deg
    values["terrain_type_risk"] = _clamp(
        features.landslide_risk_index * 45.0
        + features.vegetation_density * 25.0
        + min(features.distance_to_road_km / 10.0, 1.0) * 30.0,
        0.0,
        100.0,
    )
    values["distance_to_nearest_road_km"] = features.distance_to_road_km
    values["distance_to_nearest_settlement_km"] = features.distance_to_settlement_km
    values["flood_zone_proximity_km"] = features.flood_zone_proximity_km
    values["landslide_prone_index"] = features.landslide_risk_index
    values["earthquake_zone_risk"] = 0.82
    values["river_waterbody_proximity_km"] = features.river_proximity_km
    values["river_current_season_risk"] = _clamp(
        (1.0 - min(features.flood_zone_proximity_km / 20.0, 1.0)) * 0.45
        + min(features.rainfall_mmph / 60.0, 1.0) * 0.35
        + (0.2 if is_monsoon else 0.05),
        0.0,
        1.0,
    )
    values["vegetation_density_index"] = features.vegetation_density
    values["trail_condition_score"] = _clamp(
        100.0
        - (features.slope_deg * 0.9)
        - (features.landslide_risk_index * 35.0)
        - (12.0 if is_monsoon else 0.0),
        0.0,
        100.0,
    )

    # Category 2
    values["current_temperature_c"] = features.temperature_c
    values["rainfall_intensity_mmph"] = features.rainfall_mmph
    values["flood_warning_status"] = _clamp(
        max(features.ndma_alert_level, min(features.rainfall_mmph / 100.0, 1.0)),
        0.0,
        1.0,
    )
    values["visibility_km"] = features.visibility_km
    values["wind_speed_kmph"] = features.wind_speed_kmph
    values["humidity_pct"] = features.humidity_pct
    values["uv_index"] = features.uv_index
    values["lightning_probability"] = features.lightning_probability
    values["cyclone_storm_risk"] = _clamp(
        min(features.wind_speed_kmph / 120.0, 1.0) * 0.5
        + min(features.weather_severity / 100.0, 1.0) * 0.35
        + (0.15 if is_monsoon else 0.0),
        0.0,
        1.0,
    )
    values["seasonal_risk_profile"] = _season_risk(features.month)
    values["minutes_to_sunset"] = features.minutes_to_sunset
    values["feels_like_temperature_c"] = (
        features.temperature_c
        + max(0.0, (features.humidity_pct - 50.0) * 0.07)
        - max(0.0, (features.wind_speed_kmph - 20.0) * 0.04)
    )

    # Category 3
    values["wildlife_sanctuary_proximity_km"] = features.wildlife_sanctuary_distance_km
    values["elephant_corridor_proximity_km"] = features.elephant_corridor_distance_km
    values["recent_animal_sighting_reports_7d"] = float(features.recent_wildlife_reports_7d)
    values["snake_density_season_index"] = features.snake_activity_index
    values["insect_disease_vector_risk"] = _clamp(
        features.disease_outbreak_level * 0.55
        + (0.30 if features.malaria_zone else 0.05)
        + (0.18 if is_monsoon else 0.0),
        0.0,
        1.0,
    )
    values["poisonous_plant_density_index"] = _clamp(features.vegetation_density * 0.40, 0.0, 1.0)
    values["leech_season_index"] = 0.78 if is_monsoon else 0.22
    values["water_contamination_risk"] = _clamp((100.0 - features.water_safety_score) / 100.0, 0.0, 1.0)
    values["animal_migration_risk"] = _clamp(
        (0.32 if is_monsoon else 0.10)
        + min(features.recent_wildlife_reports_7d / 25.0, 1.0) * 0.35,
        0.0,
        1.0,
    )

    # Category 4
    values["hospital_travel_time_min"] = features.hospital_eta_min
    values["hospital_level_score"] = _clamp(100.0 - min(features.hospital_eta_min, 120.0) * 0.65, 0.0, 100.0)
    values["police_travel_time_min"] = features.police_eta_min
    values["police_station_type_score"] = _clamp(100.0 - min(features.police_eta_min, 120.0) * 0.72, 0.0, 100.0)
    values["road_quality_type_score"] = features.road_quality_score
    values["road_condition_score"] = _clamp(
        features.road_quality_score
        - (18.0 if is_monsoon else 0.0)
        - features.landslide_risk_index * 12.0,
        0.0,
        100.0,
    )
    values["bridge_status_score"] = features.bridge_status_score
    values["fuel_station_proximity_km"] = _clamp(max(0.2, features.distance_to_settlement_km * 0.6), 0.0, 200.0)
    values["atm_bank_proximity_km"] = _clamp(max(0.2, features.distance_to_settlement_km * 0.55), 0.0, 200.0)
    values["public_restroom_availability_score"] = _clamp(features.open_business_count * 9.0, 0.0, 100.0)
    values["street_lighting_score"] = _clamp(features.nearby_place_count * 4.5, 0.0, 100.0)
    values["cctv_coverage_score"] = _clamp(features.nearby_place_count * 3.0, 0.0, 100.0)
    values["shelter_availability_score"] = features.shelter_availability_score
    values["helicopter_landing_access_score"] = _clamp(100.0 - features.slope_deg * 1.4, 0.0, 100.0)
    values["ferry_boat_service_score"] = _clamp(
        60.0 - min(features.river_proximity_km, 20.0) * 2.0 + min(features.nearby_place_count, 20) * 1.5,
        0.0,
        100.0,
    )

    # Category 5
    values["mobile_network_coverage_score"] = _clamp(network_score + 0.12 * (features.signal_strength_dbm + 130.0), 0.0, 100.0)
    values["network_type_score"] = network_score
    values["multi_carrier_coverage_score"] = 85.0 if features.multi_carrier_coverage else 25.0
    values["satellite_phone_necessity_risk"] = _clamp(
        min(features.distance_to_settlement_km / 20.0, 1.0) * 65.0
        + (25.0 if features.network_type in {"none", "2g"} else 0.0),
        0.0,
        100.0,
    )
    values["wifi_availability_score"] = _clamp(features.open_business_count * 8.0, 0.0, 100.0)
    values["emergency_broadcast_reach_score"] = _clamp(network_score * 0.75 + values["multi_carrier_coverage_score"] * 0.25, 0.0, 100.0)
    values["last_known_signal_distance_km"] = 0.0 if features.network_type != "none" else _clamp(features.distance_to_road_km * 0.8 + 0.5, 0.0, 300.0)

    # Category 6
    values["population_density_per_km2"] = features.population_density_per_km2
    values["tourist_to_local_ratio"] = _clamp(features.nearby_tourist_density_index * 2.2, 0.0, 10.0)
    values["crime_rate_per_100k"] = features.crime_rate_per_100k
    values["crime_type_distribution_risk"] = _clamp(
        features.tourist_targeted_crime_index * 0.55
        + min(features.scam_reports_30d / 20.0, 1.0) * 0.45,
        0.0,
        1.0,
    )
    values["tourist_targeted_crime_history_index"] = features.tourist_targeted_crime_index
    values["scam_reports_30d"] = float(features.scam_reports_30d)
    values["alcohol_activity_risk"] = _clamp(
        _day_of_week_risk(features.day_of_week, features.hour) * 0.5
        + min(features.risky_place_count / 10.0, 1.0) * 0.5,
        0.0,
        1.0,
    )
    values["local_unrest_protest_level"] = features.local_unrest_level
    values["ethnic_tension_zone_risk"] = _clamp(features.local_unrest_level * 0.7 + risk_zone_score * 0.2, 0.0, 1.0)
    values["military_insurgent_activity_risk"] = _clamp(risk_zone_score * 0.65, 0.0, 1.0)
    values["gender_safety_index"] = features.gender_safety_index
    values["solo_traveler_risk_modifier"] = _clamp(1.0 - min(features.group_size, 5) / 5.0, 0.0, 1.0)
    values["language_barrier_risk"] = _clamp(min(features.distance_to_settlement_km / 25.0, 1.0) * 0.6 + 0.1, 0.0, 1.0)
    values["local_community_friendliness_score"] = _clamp(100.0 - features.local_unrest_level * 60.0, 0.0, 100.0)
    values["ongoing_event_crowd_risk"] = _clamp(
        min(features.nearby_place_count / 35.0, 1.0) * 0.5 + _day_of_week_risk(features.day_of_week, features.hour) * 0.5,
        0.0,
        1.0,
    )
    values["drug_trafficking_route_proximity_risk"] = _clamp(features.local_unrest_level * 0.45 + risk_zone_score * 0.2, 0.0, 1.0)

    # Category 7
    values["nearest_hospital_travel_time_min"] = features.hospital_eta_min
    values["nearest_pharmacy_distance_km"] = _clamp(max(0.1, features.distance_to_settlement_km * 0.45), 0.0, 250.0)
    values["ambulance_response_coverage_score"] = _clamp(100.0 - min(features.ambulance_eta_min, 180.0) * 0.5, 0.0, 100.0)
    values["disease_outbreak_alert_level"] = features.disease_outbreak_level
    values["malaria_endemic_zone_risk"] = 1.0 if features.malaria_zone else 0.0
    values["water_safety_score"] = features.water_safety_score
    values["altitude_sickness_risk"] = _clamp(
        (0.85 if features.elevation_m > 3500 else 0.55 if features.elevation_m > 2500 else 0.08)
        + min(features.slope_deg / 70.0, 1.0) * 0.12,
        0.0,
        1.0,
    )
    values["anti_venom_availability_score"] = _clamp(100.0 - values["snake_density_season_index"] * 40.0, 0.0, 100.0)
    values["personal_health_condition_risk"] = _clamp(
        max(0.0, (features.aqi - 100.0) / 300.0) * 0.45 + values["altitude_sickness_risk"] * 0.25,
        0.0,
        1.0,
    )
    values["vaccination_status_protection_score"] = _clamp(100.0 - values["disease_outbreak_alert_level"] * 40.0, 0.0, 100.0)

    # Category 8
    values["time_of_day_risk"] = _time_of_day_risk(features.hour)
    values["day_of_week_risk"] = _day_of_week_risk(features.day_of_week, features.hour)
    values["daylight_remaining_minutes"] = features.minutes_to_sunset
    values["moon_phase_visibility_score"] = _moon_visibility_score(features.day_of_week + features.month)
    values["season_risk"] = _season_risk(features.month)
    values["duration_at_location_hours"] = _clamp(features.hours_since_checkin, 0.0, 168.0)
    values["speed_of_movement_kmph"] = _clamp(
        features.distance_to_road_km * 2.0 + features.nearby_place_count * 0.35,
        0.0,
        220.0,
    )
    values["time_since_last_checkin_hours"] = features.hours_since_checkin
    values["holiday_special_date_risk"] = _day_of_week_risk(features.day_of_week, features.hour) * 0.7

    # Category 9
    values["road_accident_hotspot_risk"] = _clamp(
        (1.0 - min(features.accident_hotspot_distance_km / 20.0, 1.0)) * 0.7
        + features.traffic_density_index * 0.3,
        0.0,
        1.0,
    )
    values["traffic_density_index"] = features.traffic_density_index
    values["current_road_type_risk"] = _clamp((100.0 - features.road_quality_score) / 100.0, 0.0, 1.0)
    values["mountain_hairpin_road_risk"] = _clamp(
        min(features.slope_deg / 45.0, 1.0) * 0.6 + min(features.elevation_m / 4500.0, 1.0) * 0.4,
        0.0,
        1.0,
    )
    values["ferry_safety_risk"] = _clamp(
        (1.0 - min(values["ferry_boat_service_score"] / 100.0, 1.0)) * 0.7 + min(features.rainfall_mmph / 80.0, 1.0) * 0.3,
        0.0,
        1.0,
    )
    values["vehicle_type_availability_score"] = _clamp(features.nearby_place_count * 5.0, 0.0, 100.0)
    values["public_transit_availability_score"] = _clamp(features.nearby_place_count * 4.0, 0.0, 100.0)
    values["parking_stopping_safety_score"] = _clamp(
        features.road_quality_score * 0.7 + (100.0 - features.traffic_density_index * 100.0) * 0.3,
        0.0,
        100.0,
    )

    # Category 10
    values["movement_pattern_anomaly_score"] = _clamp(min(features.itinerary_deviation_km / 8.0, 1.0) * 0.7, 0.0, 1.0)
    values["deviation_from_planned_route_km"] = features.itinerary_deviation_km
    values["sudden_stop_after_movement_risk"] = _clamp(
        (0.2 if values["speed_of_movement_kmph"] > 40 else 0.0) + min(features.hours_since_checkin / 12.0, 1.0) * 0.25,
        0.0,
        1.0,
    )
    values["app_usage_pattern_change_risk"] = _clamp(min(features.hours_since_checkin / 10.0, 1.0) * 0.65, 0.0, 1.0)
    values["phone_battery_level_pct"] = features.battery_pct
    values["group_size"] = float(features.group_size)
    values["traveler_experience_level_score"] = _clamp(100.0 - values["movement_pattern_anomaly_score"] * 40.0, 0.0, 100.0)
    values["physical_fitness_score"] = _clamp(100.0 - values["altitude_sickness_risk"] * 40.0, 0.0, 100.0)
    values["preparation_level_score"] = _clamp(
        min(features.battery_pct, 100.0) * 0.35
        + features.water_safety_score * 0.25
        + min(features.group_size, 5) * 8.0,
        0.0,
        100.0,
    )
    values["local_contact_availability_score"] = _clamp(100.0 - values["language_barrier_risk"] * 70.0, 0.0, 100.0)
    values["document_status_score"] = _clamp(100.0 - risk_zone_score * 15.0, 0.0, 100.0)
    values["cash_payment_vulnerability_risk"] = _clamp(
        max(0.0, 1.0 - values["digital_payment_acceptance_score"] / 100.0) * 0.6
        + values["crime_type_distribution_risk"] * 0.25,
        0.0,
        1.0,
    )

    # Category 11
    values["protected_restricted_area_status_risk"] = risk_zone_score
    values["afspa_declared_area_risk"] = _clamp(risk_zone_score * 0.65, 0.0, 1.0)
    values["curfew_status_risk"] = _clamp(features.local_unrest_level * 0.7, 0.0, 1.0)
    values["photography_banned_area_risk"] = _clamp(risk_zone_score * 0.35 + features.local_unrest_level * 0.2, 0.0, 1.0)
    values["foreigner_registration_requirement_risk"] = _clamp(risk_zone_score * 0.30 + 0.05, 0.0, 1.0)
    values["local_laws_customs_awareness_score"] = _clamp(100.0 - values["language_barrier_risk"] * 55.0, 0.0, 100.0)
    values["national_park_entry_requirement_risk"] = _clamp(
        (1.0 - min(features.wildlife_sanctuary_distance_km / 20.0, 1.0)) * 0.6,
        0.0,
        1.0,
    )
    values["embassy_consulate_proximity_km"] = _clamp(600.0 + features.distance_to_settlement_km * 18.0, 0.0, 4000.0)

    # Category 12
    values["air_quality_index"] = features.aqi
    values["water_quality_nearby_score"] = features.water_safety_score
    values["industrial_hazard_proximity_risk"] = _clamp(min(features.population_density_per_km2 / 10000.0, 1.0) * 0.3, 0.0, 1.0)
    values["noise_level_proxy_risk"] = _clamp(min(features.nearby_place_count / 30.0, 1.0) * 0.5, 0.0, 1.0)
    values["active_fire_smoke_risk"] = _clamp(
        (0.12 if is_winter else 0.04)
        + min(max(features.temperature_c - 35.0, 0.0) / 30.0, 1.0) * 0.15,
        0.0,
        1.0,
    )
    values["soil_stability_risk"] = _clamp(features.landslide_risk_index * 0.75 + min(features.rainfall_mmph / 100.0, 1.0) * 0.15, 0.0, 1.0)

    # Category 13
    values["public_wifi_safety_risk"] = _clamp(max(0.0, 1.0 - values["wifi_availability_score"] / 100.0) * 0.4, 0.0, 1.0)
    values["sim_scam_prevalence_risk"] = _clamp(min(features.scam_reports_30d / 25.0, 1.0) * 0.5, 0.0, 1.0)
    values["digital_payment_acceptance_score"] = _clamp(
        100.0 - min(values["atm_bank_proximity_km"] / 20.0, 1.0) * 60.0,
        0.0,
        100.0,
    )

    # Category 14
    values["tourist_police_presence_score"] = _clamp(100.0 - min(features.police_eta_min / 30.0, 1.0) * 60.0, 0.0, 100.0)
    values["similar_event_global_incidents_risk"] = _clamp(
        features.local_unrest_level * 0.40
        + min(features.historical_incidents_90d / 40.0, 1.0) * 0.40
        + features.travel_advisory_level * 0.20,
        0.0,
        1.0,
    )
    values["accommodation_safety_rating_score"] = _clamp(features.open_business_count * 7.0, 0.0, 100.0)
    values["emergency_helpdesk_access_score"] = _clamp(
        values["tourist_police_presence_score"] * 0.6 + values["mobile_network_coverage_score"] * 0.4,
        0.0,
        100.0,
    )
    values["signage_quality_score"] = _clamp(features.road_quality_score * 0.75 + features.nearby_place_count * 1.5, 0.0, 100.0)
    values["rescue_team_proximity_km"] = _clamp(
        max(features.hospital_eta_min * 0.8, 5.0),
        0.0,
        500.0,
    )
    values["safety_equipment_availability_score"] = _clamp(features.shelter_availability_score * 0.75, 0.0, 100.0)
    values["tourist_review_sentiment_score"] = _clamp(100.0 - values["crime_type_distribution_risk"] * 45.0, 0.0, 100.0)
    values["visit_frequency_score"] = _clamp(features.nearby_place_count * 3.5, 0.0, 100.0)
    values["waste_cleanliness_index"] = _clamp(100.0 - values["noise_level_proxy_risk"] * 35.0, 0.0, 100.0)

    # Category 15
    values["incident_count_recent"] = float(features.historical_incidents_30d)
    values["incident_type_breakdown_risk"] = values["crime_type_distribution_risk"]
    values["incident_trend_index"] = features.incident_trend_index
    values["time_of_day_incident_distribution_risk"] = _clamp(
        _time_of_day_risk(features.hour) * 0.55 + values["crime_type_distribution_risk"] * 0.45,
        0.0,
        1.0,
    )
    values["similar_location_incident_rate_risk"] = _clamp(
        values["incident_count_recent"] / 20.0 * 0.55 + values["crime_type_distribution_risk"] * 0.45,
        0.0,
        1.0,
    )
    values["seasonal_incident_pattern_risk"] = _clamp(_season_risk(features.month) * 0.7, 0.0, 1.0)
    values["sos_trigger_frequency"] = float(features.sos_triggers_30d)
    values["prealert_frequency"] = float(features.prealerts_30d)
    values["nearby_tourist_density_index"] = features.nearby_tourist_density_index
    values["predicted_score_next_3h"] = _clamp(
        100.0
        - values["time_of_day_risk"] * 30.0
        - features.weather_severity * 0.2
        - values["incident_count_recent"] * 0.9,
        0.0,
        100.0,
    )

    # Category 16
    values["government_travel_advisory_level"] = features.travel_advisory_level
    values["ndma_disaster_alert_level"] = features.ndma_alert_level
    values["local_news_sentiment_risk"] = _clamp(features.local_unrest_level * 0.6 + features.ndma_alert_level * 0.2, 0.0, 1.0)
    values["social_media_risk_signals"] = _clamp(
        values["local_news_sentiment_risk"] * 0.5 + min(features.active_alerts_nearby / 15.0, 1.0) * 0.4,
        0.0,
        1.0,
    )
    values["community_safety_reports_index"] = _clamp(
        min(features.active_alerts_nearby / 20.0, 1.0) * 0.7 + min(features.prealerts_30d / 30.0, 1.0) * 0.3,
        0.0,
        1.0,
    )

    # Explicit incoming overrides always win.
    for key, value in features.extra_factors.items():
        if key in values:
            values[key] = value

    return values


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

    values = build_factor_values(features, environment)

    row: dict[str, Any] = {
        **values,
        "latitude": features.latitude,
        "longitude": features.longitude,
        "hour": features.hour,
        "day_of_week": features.day_of_week,
        "month": features.month,
        "network_type_score_derived": _network_score(features.network_type),
        "risk_zone_level_score_derived": _risk_zone_score(features.risk_zone_level, features.in_risk_zone),
        "environment_code": _environment_code(environment),
        "season_code": _season_code(season),
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
        "rule_score": float(rule_score),
    }

    return row
