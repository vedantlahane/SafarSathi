from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import numpy as np
import pandas as pd

from .environment import detect_environment
from .feature_builder import build_factor_values, build_model_features
from .rule_engine import calculate_rule_score
from .schemas import SafetyFeatures


def _choice(rng: np.random.Generator, values: list[Any], probs: list[float]) -> Any:
    return values[int(rng.choice(len(values), p=probs))]


def _sample_environment(rng: np.random.Generator) -> str:
    return _choice(
        rng,
        ["urban", "suburban", "rural", "remote", "wilderness"],
        [0.36, 0.21, 0.19, 0.17, 0.07],
    )


def _bounded_normal(rng: np.random.Generator, mean: float, std: float, low: float, high: float) -> float:
    return float(np.clip(rng.normal(mean, std), low, high))


def _sample_by_environment(rng: np.random.Generator, env: str) -> SafetyFeatures:
    hour = int(rng.integers(0, 24))
    day_of_week = int(rng.integers(0, 7))
    month = int(rng.integers(1, 13))

    if env == "urban":
        nearby_places = int(rng.integers(14, 45))
        network_type = _choice(rng, ["5g", "4g", "wifi", "3g"], [0.35, 0.45, 0.15, 0.05])
        distance_to_settlement_km = _bounded_normal(rng, 0.8, 0.8, 0.0, 4.0)
        distance_to_road_km = _bounded_normal(rng, 0.05, 0.06, 0.0, 0.4)
        population_density = _bounded_normal(rng, 6500, 2200, 1800, 16000)
        police_eta = _bounded_normal(rng, 7, 3, 1, 25)
        hospital_eta = _bounded_normal(rng, 12, 4, 3, 35)
    elif env == "suburban":
        nearby_places = int(rng.integers(8, 20))
        network_type = _choice(rng, ["4g", "5g", "3g", "2g"], [0.58, 0.22, 0.15, 0.05])
        distance_to_settlement_km = _bounded_normal(rng, 1.8, 1.2, 0.2, 8.0)
        distance_to_road_km = _bounded_normal(rng, 0.2, 0.2, 0.0, 1.2)
        population_density = _bounded_normal(rng, 2200, 900, 300, 5000)
        police_eta = _bounded_normal(rng, 12, 5, 2, 35)
        hospital_eta = _bounded_normal(rng, 20, 8, 5, 50)
    elif env == "rural":
        nearby_places = int(rng.integers(3, 11))
        network_type = _choice(rng, ["4g", "3g", "2g", "none"], [0.35, 0.40, 0.20, 0.05])
        distance_to_settlement_km = _bounded_normal(rng, 4.5, 2.0, 0.6, 15.0)
        distance_to_road_km = _bounded_normal(rng, 1.2, 0.8, 0.1, 6.0)
        population_density = _bounded_normal(rng, 320, 190, 20, 1200)
        police_eta = _bounded_normal(rng, 20, 7, 5, 55)
        hospital_eta = _bounded_normal(rng, 35, 15, 8, 90)
    elif env == "remote":
        nearby_places = int(rng.integers(0, 4))
        network_type = _choice(rng, ["3g", "2g", "none", "4g"], [0.28, 0.36, 0.30, 0.06])
        distance_to_settlement_km = _bounded_normal(rng, 9.0, 4.5, 2.0, 35.0)
        distance_to_road_km = _bounded_normal(rng, 3.0, 1.8, 0.6, 18.0)
        population_density = _bounded_normal(rng, 90, 60, 5, 450)
        police_eta = _bounded_normal(rng, 35, 14, 8, 110)
        hospital_eta = _bounded_normal(rng, 60, 25, 15, 180)
    else:
        nearby_places = int(rng.integers(0, 2))
        network_type = _choice(rng, ["none", "2g", "3g"], [0.70, 0.22, 0.08])
        distance_to_settlement_km = _bounded_normal(rng, 18.0, 7.0, 8.0, 55.0)
        distance_to_road_km = _bounded_normal(rng, 8.0, 4.0, 2.0, 30.0)
        population_density = _bounded_normal(rng, 18, 10, 0.0, 110)
        police_eta = _bounded_normal(rng, 65, 20, 20, 200)
        hospital_eta = _bounded_normal(rng, 110, 40, 30, 300)

    monsoon = 6 <= month <= 9
    winter = month >= 11 or month <= 2

    rainfall = _bounded_normal(rng, 18 if monsoon else 3, 12 if monsoon else 5, 0, 80)
    weather_severity = _bounded_normal(rng, 48 if monsoon else 20, 18, 0, 100)
    visibility = _bounded_normal(rng, 3 if monsoon or winter else 8, 2.5, 0.2, 20)
    lightning_probability = _bounded_normal(rng, 0.35 if monsoon else 0.08, 0.15, 0, 1)

    elevation_m = _bounded_normal(rng, 1200 if env in {"remote", "wilderness"} else 180, 1200, 5, 4600)
    slope_deg = _bounded_normal(rng, 16 if env in {"remote", "wilderness"} else 4, 8, 0, 55)

    wildlife_distance = _bounded_normal(rng, 4 if env in {"remote", "wilderness"} else 25, 14, 0.1, 80)
    elephant_distance = _bounded_normal(rng, 7 if env in {"remote", "wilderness"} else 30, 16, 0.2, 120)

    in_risk_zone = bool(rng.random() < (0.22 if env in {"urban", "suburban", "rural"} else 0.32))
    risk_zone_level = _choice(
        rng,
        ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        [0.55, 0.28, 0.14, 0.03],
    )

    active_alerts = int(rng.poisson(0.8 if env in {"urban", "suburban"} else 0.5))
    incidents_30d = int(rng.poisson(3.5 if env == "urban" else 1.8))

    minutes_to_sunset = float(_bounded_normal(rng, 150, 190, -240, 420))
    if hour >= 19 or hour < 5:
        minutes_to_sunset = -float(rng.integers(5, 500))

    features = SafetyFeatures(
        latitude=float(_bounded_normal(rng, 26.2006, 2.0, 8.0, 36.0)),
        longitude=float(_bounded_normal(rng, 92.9376, 3.0, 68.0, 98.0)),
        hour=hour,
        day_of_week=day_of_week,
        month=month,
        minutes_to_sunset=minutes_to_sunset,
        elevation_m=elevation_m,
        slope_deg=slope_deg,
        distance_to_road_km=distance_to_road_km,
        distance_to_settlement_km=distance_to_settlement_km,
        flood_zone_proximity_km=float(_bounded_normal(rng, 5 if monsoon else 11, 6, 0, 60)),
        landslide_risk_index=float(_bounded_normal(rng, 0.35 if env in {"remote", "wilderness"} else 0.10, 0.15, 0, 1)),
        river_proximity_km=float(_bounded_normal(rng, 1.5, 2.5, 0, 40)),
        vegetation_density=float(_bounded_normal(rng, 0.7 if env in {"remote", "wilderness"} else 0.4, 0.2, 0, 1)),
        temperature_c=float(_bounded_normal(rng, 30 if not winter else 17, 9, -4, 46)),
        rainfall_mmph=rainfall,
        visibility_km=visibility,
        wind_speed_kmph=float(_bounded_normal(rng, 18, 10, 0, 95)),
        humidity_pct=float(_bounded_normal(rng, 74, 16, 15, 100)),
        uv_index=float(_bounded_normal(rng, 8 if elevation_m > 2500 else 5, 2.2, 0, 12)),
        lightning_probability=lightning_probability,
        weather_severity=weather_severity,
        aqi=float(_bounded_normal(rng, 95 if env == "urban" else 65, 45, 10, 380)),
        wildlife_sanctuary_distance_km=wildlife_distance,
        elephant_corridor_distance_km=elephant_distance,
        recent_wildlife_reports_7d=int(rng.poisson(2 if env in {"remote", "wilderness"} else 0.4)),
        snake_activity_index=float(_bounded_normal(rng, 0.55 if monsoon else 0.25, 0.2, 0, 1)),
        police_eta_min=police_eta,
        hospital_eta_min=hospital_eta,
        ambulance_eta_min=float(_bounded_normal(rng, hospital_eta * 1.2, 10, 5, 240)),
        road_quality_score=float(_bounded_normal(rng, 70 if env in {"urban", "suburban"} else 48, 20, 5, 100)),
        bridge_status_score=float(_bounded_normal(rng, 78 if not monsoon else 58, 20, 5, 100)),
        shelter_availability_score=float(_bounded_normal(rng, 72 if env in {"urban", "suburban"} else 42, 22, 0, 100)),
        network_type=network_type,
        signal_strength_dbm=float(_bounded_normal(rng, -82 if network_type in {"5g", "4g", "wifi"} else -104, 10, -130, -45)),
        multi_carrier_coverage=bool(rng.random() < (0.72 if env in {"urban", "suburban"} else 0.34)),
        crime_rate_per_100k=float(_bounded_normal(rng, 250 if env == "urban" else 140, 95, 8, 720)),
        tourist_targeted_crime_index=float(_bounded_normal(rng, 0.22 if env in {"urban", "suburban"} else 0.1, 0.1, 0, 1)),
        scam_reports_30d=int(rng.poisson(2.4 if env in {"urban", "suburban"} else 0.7)),
        local_unrest_level=float(_bounded_normal(rng, 0.08, 0.08, 0, 1)),
        gender_safety_index=float(_bounded_normal(rng, 0.62 if env == "urban" else 0.68, 0.14, 0.15, 0.98)),
        population_density_per_km2=population_density,
        disease_outbreak_level=float(_bounded_normal(rng, 0.12 if monsoon else 0.05, 0.08, 0, 1)),
        malaria_zone=bool(rng.random() < (0.38 if env in {"rural", "remote", "wilderness"} else 0.12)),
        water_safety_score=float(_bounded_normal(rng, 72 if env in {"urban", "suburban"} else 56, 18, 5, 100)),
        accident_hotspot_distance_km=float(_bounded_normal(rng, 3 if env in {"urban", "suburban"} else 6, 4, 0.1, 50)),
        traffic_density_index=float(_bounded_normal(rng, 0.62 if env == "urban" else 0.35, 0.2, 0, 1)),
        group_size=int(np.clip(rng.poisson(2.1) + 1, 1, 8)),
        battery_pct=float(_bounded_normal(rng, 58, 24, 1, 100)),
        itinerary_deviation_km=float(_bounded_normal(rng, 1.2 if env in {"remote", "wilderness"} else 0.6, 1.0, 0, 12)),
        hours_since_checkin=float(_bounded_normal(rng, 2.4 if env in {"urban", "suburban"} else 4.2, 2.0, 0, 18)),
        in_risk_zone=in_risk_zone,
        risk_zone_level=risk_zone_level,
        active_alerts_nearby=active_alerts,
        historical_incidents_30d=incidents_30d,
        historical_incidents_90d=int(incidents_30d + rng.poisson(5)),
        sos_triggers_30d=int(rng.poisson(1.4 if env == "urban" else 0.8)),
        prealerts_30d=int(rng.poisson(2.5 if env in {"urban", "suburban"} else 1.1)),
        incident_trend_index=float(_bounded_normal(rng, 0.05, 0.35, -1, 1)),
        nearby_tourist_density_index=float(_bounded_normal(rng, 0.6 if env in {"urban", "suburban"} else 0.3, 0.2, 0, 1)),
        nearby_place_count=nearby_places,
        safety_place_count=int(np.clip(round(nearby_places * rng.uniform(0.08, 0.18)), 0, 12)),
        risky_place_count=int(np.clip(round(nearby_places * rng.uniform(0.05, 0.20)), 0, 12)),
        open_business_count=int(np.clip(round(nearby_places * rng.uniform(0.25, 0.70)), 0, nearby_places)),
        ndma_alert_level=float(_bounded_normal(rng, 0.12 if monsoon else 0.03, 0.08, 0, 1)),
        travel_advisory_level=float(_bounded_normal(rng, 0.08, 0.08, 0, 1)),
    ).normalize()

    return features


def _safety_target(features: SafetyFeatures, environment: str, rng: np.random.Generator) -> float:
    rule_result = calculate_rule_score(features, environment)
    score = rule_result.safety_score
    factor_values = build_factor_values(features, environment)

    # Non-linear interactions to make the ML model learn beyond weighted sums.
    if features.hour >= 21 or features.hour < 5:
        score -= min(features.risky_place_count * 1.8, 12.0)

    if features.weather_severity > 70 and features.distance_to_settlement_km > 8:
        score -= 8.0

    if features.network_type == "none" and features.battery_pct < 20:
        score -= 7.0

    if features.group_size >= 4 and features.local_unrest_level < 0.2:
        score += 3.0

    if features.in_risk_zone and features.risk_zone_level in {"HIGH", "CRITICAL"}:
        score -= 6.0

    # Additional interactions sourced from the full taxonomy space.
    score -= float(factor_values["similar_event_global_incidents_risk"]) * 8.0
    score -= float(factor_values["social_media_risk_signals"]) * 6.0
    score -= float(factor_values["ferry_safety_risk"]) * 4.5
    score -= float(factor_values["altitude_sickness_risk"]) * 7.0
    score -= float(factor_values["cash_payment_vulnerability_risk"]) * 5.0
    score -= float(factor_values["curfew_status_risk"]) * 7.5
    score -= float(factor_values["soil_stability_risk"]) * 4.0

    # Positive stabilizers.
    score += (float(factor_values["emergency_broadcast_reach_score"]) - 50.0) * 0.05
    score += (float(factor_values["tourist_review_sentiment_score"]) - 50.0) * 0.04
    score += (float(factor_values["safety_equipment_availability_score"]) - 50.0) * 0.03

    # Add calibrated noise.
    score += rng.normal(0, 4.2)

    return float(np.clip(score, 0.0, 100.0))


def generate_synthetic_training_frame(samples: int, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    rows: list[dict[str, Any]] = []

    for _ in range(samples):
        sampled_env = _sample_environment(rng)
        features = _sample_by_environment(rng, sampled_env)
        environment = detect_environment(features)

        rule_result = calculate_rule_score(features, environment)
        target = _safety_target(features, environment, rng)

        row = build_model_features(features, environment=environment, rule_score=rule_result.safety_score)
        row["safety_score_target"] = target
        rows.append(row)

    return pd.DataFrame(rows)


def convert_legacy_csv(csv_path: str | None = None, limit: int = 5000) -> pd.DataFrame:
    """Map the old Punjab lat/lon/hour dataset into the new feature space.

    The legacy data has only three explanatory features. We keep it as weak
    supervision by filling remaining factors with context priors and the
    historical target converted from danger score to safety score.
    """

    if csv_path is None:
        return pd.DataFrame()

    try:
        old_df = pd.read_csv(csv_path)
    except Exception:
        return pd.DataFrame()

    required = {"Latitude", "Longitude", "Hour", "Danger_Score"}
    if not required.issubset(set(old_df.columns)):
        return pd.DataFrame()

    old_df = old_df.dropna(subset=["Latitude", "Longitude", "Hour", "Danger_Score"]).copy()
    if len(old_df) > limit:
        old_df = old_df.sample(limit, random_state=42)

    rows: list[dict[str, Any]] = []
    now = datetime.now(timezone.utc)

    for _, rec in old_df.iterrows():
        hour = int(max(0, min(23, int(rec["Hour"]))))

        features = SafetyFeatures(
            latitude=float(rec["Latitude"]),
            longitude=float(rec["Longitude"]),
            hour=hour,
            day_of_week=now.weekday(),
            month=now.month,
            minutes_to_sunset=120.0 - (hour - 16) * 50.0,
            network_type="4g",
            nearby_place_count=10,
            safety_place_count=2,
            risky_place_count=2 if hour >= 20 else 1,
            open_business_count=5 if 7 <= hour <= 20 else 1,
            in_risk_zone=False,
            risk_zone_level="LOW",
            weather_severity=20.0,
            aqi=90.0,
            police_eta_min=14.0,
            hospital_eta_min=24.0,
        ).normalize()

        environment = detect_environment(features)
        rule_result = calculate_rule_score(features, environment)
        row = build_model_features(features, environment=environment, rule_score=rule_result.safety_score)

        danger_score = float(np.clip(rec["Danger_Score"], 0.0, 1.0))
        row["safety_score_target"] = float(np.clip((1.0 - danger_score) * 100.0, 0.0, 100.0))
        rows.append(row)

    return pd.DataFrame(rows)
