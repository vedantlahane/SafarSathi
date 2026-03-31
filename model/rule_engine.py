from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .constants import ENVIRONMENT_WEIGHTS, STATUS_THRESHOLDS
from .schemas import SafetyFeatures


@dataclass
class RuleScoreResult:
    safety_score: float
    status: str
    capped_by: str | None
    factors: list[dict[str, Any]]
    recommendation: str


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _score_time_of_day(hour: int) -> float:
    if 8 <= hour < 18:
        return 95.0
    if 18 <= hour < 20:
        return 75.0
    if 20 <= hour < 22:
        return 50.0
    if hour >= 22 or hour < 2:
        return 25.0
    if 2 <= hour < 5:
        return 10.0
    return 60.0


def _score_daylight(minutes_to_sunset: float) -> float:
    if minutes_to_sunset > 180:
        return 95.0
    if minutes_to_sunset > 60:
        return 75.0
    if minutes_to_sunset > 15:
        return 45.0
    if minutes_to_sunset > 0:
        return 25.0
    return 15.0


def _score_eta(eta_min: float, good: float, medium: float, poor: float) -> float:
    if eta_min <= good:
        return 95.0
    if eta_min <= medium:
        return 75.0
    if eta_min <= poor:
        return 45.0
    if eta_min <= poor * 1.8:
        return 25.0
    return 8.0


def _score_area_density(nearby_places: int) -> float:
    if nearby_places > 20:
        return 90.0
    if nearby_places > 10:
        return 75.0
    if nearby_places > 5:
        return 55.0
    if nearby_places > 2:
        return 30.0
    return 10.0


def _score_connectivity(features: SafetyFeatures) -> float:
    base = {
        "wifi": 95.0,
        "5g": 92.0,
        "4g": 88.0,
        "3g": 62.0,
        "2g": 35.0,
        "none": 5.0,
    }.get(features.network_type, 45.0)

    if features.signal_strength_dbm < -115:
        base -= 20
    elif features.signal_strength_dbm < -105:
        base -= 10
    elif features.signal_strength_dbm > -80:
        base += 4

    if not features.multi_carrier_coverage:
        base -= 8

    return _clamp(base, 0.0, 100.0)


def _score_weather(features: SafetyFeatures) -> float:
    score = 100.0 - features.weather_severity
    score -= min(features.rainfall_mmph * 1.3, 30.0)
    score -= features.lightning_probability * 25.0

    if features.visibility_km < 1.0:
        score -= 25.0
    elif features.visibility_km < 3.0:
        score -= 10.0

    if features.wind_speed_kmph > 60:
        score -= 20.0
    elif features.wind_speed_kmph > 35:
        score -= 10.0

    return _clamp(score, 0.0, 100.0)


def _score_terrain(features: SafetyFeatures) -> float:
    score = 100.0

    if features.elevation_m > 3500:
        score -= 30.0
    elif features.elevation_m > 2500:
        score -= 18.0

    score -= min(features.slope_deg * 1.2, 35.0)
    score -= features.landslide_risk_index * 25.0

    if features.distance_to_road_km > 15:
        score -= 22.0
    elif features.distance_to_road_km > 5:
        score -= 12.0

    if features.distance_to_settlement_km > 20:
        score -= 18.0
    elif features.distance_to_settlement_km > 8:
        score -= 10.0

    return _clamp(score, 0.0, 100.0)


def _score_wildlife(features: SafetyFeatures) -> float:
    score = 90.0

    if features.wildlife_sanctuary_distance_km < 2:
        score -= 30
    elif features.wildlife_sanctuary_distance_km < 8:
        score -= 15

    if features.elephant_corridor_distance_km < 2:
        score -= 25
    elif features.elephant_corridor_distance_km < 8:
        score -= 12

    score -= min(features.recent_wildlife_reports_7d * 3.0, 25.0)
    score -= features.snake_activity_index * 18.0

    if features.hour >= 18 or features.hour < 6:
        score -= 8.0

    return _clamp(score, 0.0, 100.0)


def _score_shelter(features: SafetyFeatures) -> float:
    score = features.shelter_availability_score
    if features.open_business_count == 0:
        score -= 20
    elif features.open_business_count < 3:
        score -= 8

    if features.bridge_status_score < 40:
        score -= 20

    return _clamp(score, 0.0, 100.0)


def _score_water_risk(features: SafetyFeatures) -> float:
    score = 100.0

    if features.river_proximity_km < 0.2:
        score -= 35
    elif features.river_proximity_km < 1:
        score -= 18

    if features.flood_zone_proximity_km < 1:
        score -= 30
    elif features.flood_zone_proximity_km < 5:
        score -= 15

    if features.rainfall_mmph > 25:
        score -= 18

    score -= max(0.0, 50.0 - features.water_safety_score) * 0.5

    return _clamp(score, 0.0, 100.0)


def _score_crime(features: SafetyFeatures) -> float:
    score = 100.0

    score -= min(features.crime_rate_per_100k / 10.0, 45.0)
    score -= features.tourist_targeted_crime_index * 30.0
    score -= min(features.scam_reports_30d * 2.5, 20.0)
    score -= features.local_unrest_level * 30.0

    # Lower gender safety index means more risk.
    score -= (1.0 - features.gender_safety_index) * 20.0

    return _clamp(score, 0.0, 100.0)


def _score_crowd(features: SafetyFeatures) -> float:
    pd = features.population_density_per_km2

    if pd < 40:
        density_component = 20.0
    elif pd < 300:
        density_component = 55.0
    elif pd < 3000:
        density_component = 85.0
    elif pd < 8000:
        density_component = 70.0
    else:
        density_component = 45.0

    tourist_component = 100.0 - abs(features.nearby_tourist_density_index - 0.5) * 100.0
    tourist_component = _clamp(tourist_component, 15.0, 95.0)

    combined = 0.65 * density_component + 0.35 * tourist_component
    return _clamp(combined, 0.0, 100.0)


def _score_alerts(features: SafetyFeatures) -> float:
    score = 95.0
    score -= min(features.active_alerts_nearby * 8.0, 60.0)
    score -= features.ndma_alert_level * 25.0
    score -= features.travel_advisory_level * 20.0
    return _clamp(score, 0.0, 100.0)


def _score_air_quality(aqi: float) -> float:
    if aqi <= 50:
        return 95.0
    if aqi <= 100:
        return 75.0
    if aqi <= 150:
        return 50.0
    if aqi <= 200:
        return 25.0
    return 8.0


def _score_history(features: SafetyFeatures) -> float:
    score = 95.0
    score -= min(features.historical_incidents_30d * 4.0, 35.0)
    score -= min(features.historical_incidents_90d * 1.5, 20.0)
    score -= min(features.sos_triggers_30d * 3.0, 18.0)
    score -= min(features.prealerts_30d * 1.5, 12.0)

    if features.incident_trend_index > 0:
        score -= min(features.incident_trend_index * 25.0, 20.0)
    elif features.incident_trend_index < 0:
        score += min(abs(features.incident_trend_index) * 10.0, 8.0)

    return _clamp(score, 0.0, 100.0)


def _score_risk_zone(features: SafetyFeatures) -> float:
    if not features.in_risk_zone:
        return 95.0

    level = features.risk_zone_level.upper()
    if level == "CRITICAL":
        return 5.0
    if level == "HIGH":
        return 12.0
    if level == "MEDIUM":
        return 40.0
    return 65.0


def _score_flood_risk(features: SafetyFeatures) -> float:
    score = 100.0

    if features.flood_zone_proximity_km < 1:
        score -= 50
    elif features.flood_zone_proximity_km < 5:
        score -= 30
    elif features.flood_zone_proximity_km < 15:
        score -= 10

    monsoon = 6 <= features.month <= 9
    if monsoon:
        score -= 15

    if features.rainfall_mmph > 40:
        score -= 20
    elif features.rainfall_mmph > 15:
        score -= 8

    score -= features.ndma_alert_level * 25.0

    return _clamp(score, 0.0, 100.0)


def _status_from_score(score: float) -> str:
    if score >= STATUS_THRESHOLDS["safe"]:
        return "safe"
    if score >= STATUS_THRESHOLDS["caution"]:
        return "caution"
    return "danger"


def _recommendation(status: str, factors: list[dict[str, Any]], environment: str) -> str:
    worst = sorted(factors, key=lambda item: item["score"])[0]
    wid = worst["id"]

    if status == "danger":
        if wid == "connectivity":
            return "Move toward a populated area and restore mobile signal immediately."
        if wid == "daylight":
            return "Start return movement now before daylight is fully gone."
        if wid == "hospital_eta":
            return "Reposition closer to medical access before continuing travel."
        if wid == "weather":
            return "Severe weather detected. Seek shelter and avoid exposed routes."
        if wid == "wildlife":
            return "Wildlife risk is elevated. Avoid isolated trails and remain in groups."
        return "High danger context detected. Move to a safer and better-connected area now."

    if status == "caution":
        if wid == "flood_risk":
            return "Flood exposure is increasing. Keep away from river banks and low-lying roads."
        if wid == "crime":
            return "Stay in lit public areas and avoid carrying visible valuables."
        if wid == "history":
            return "This area has recent incident history. Stay alert and keep SOS ready."
        return "Proceed with caution and keep emergency contacts reachable."

    if environment in {"remote", "wilderness"}:
        return "Conditions are acceptable, but keep navigation, water, and battery reserves ready."
    return "Conditions are favorable. Continue with normal safety precautions."


def calculate_rule_score(features: SafetyFeatures, environment: str) -> RuleScoreResult:
    weights = ENVIRONMENT_WEIGHTS[environment]

    factor_scores = {
        "time_of_day": _score_time_of_day(features.hour),
        "daylight": _score_daylight(features.minutes_to_sunset),
        "police_eta": _score_eta(features.police_eta_min, good=5, medium=12, poor=25),
        "hospital_eta": _score_eta(features.hospital_eta_min, good=10, medium=25, poor=45),
        "area_density": _score_area_density(features.nearby_place_count),
        "connectivity": _score_connectivity(features),
        "risk_zone": _score_risk_zone(features),
        "weather": _score_weather(features),
        "history": _score_history(features),
        "terrain": _score_terrain(features),
        "wildlife": _score_wildlife(features),
        "shelter": _score_shelter(features),
        "water_risk": _score_water_risk(features),
        "crime": _score_crime(features),
        "crowd": _score_crowd(features),
        "active_alerts": _score_alerts(features),
        "air_quality": _score_air_quality(features.aqi),
        "flood_risk": _score_flood_risk(features),
    }

    factor_labels = {
        "time_of_day": "Time of Day",
        "daylight": "Daylight Remaining",
        "police_eta": "Police Response",
        "hospital_eta": "Hospital Access",
        "area_density": "Area Activity",
        "connectivity": "Connectivity",
        "risk_zone": "Risk Zone",
        "weather": "Weather Severity",
        "history": "Historical Incidents",
        "terrain": "Terrain Exposure",
        "wildlife": "Wildlife Exposure",
        "shelter": "Shelter Availability",
        "water_risk": "Water Hazard",
        "crime": "Crime Context",
        "crowd": "Crowd Dynamics",
        "active_alerts": "Active Alerts",
        "air_quality": "Air Quality",
        "flood_risk": "Flood Risk",
    }

    factor_details = {
        "time_of_day": f"Hour {features.hour:02d}:00 context",
        "daylight": f"{int(features.minutes_to_sunset)} minutes to sunset",
        "police_eta": f"Nearest police ETA {features.police_eta_min:.1f} min",
        "hospital_eta": f"Nearest hospital ETA {features.hospital_eta_min:.1f} min",
        "area_density": f"{features.nearby_place_count} nearby places",
        "connectivity": f"{features.network_type.upper()} at {features.signal_strength_dbm:.0f} dBm",
        "risk_zone": "Inside risk zone" if features.in_risk_zone else "Outside risk zone",
        "weather": f"Weather severity {features.weather_severity:.0f}/100",
        "history": f"{features.historical_incidents_30d} incidents in 30d",
        "terrain": f"Elevation {features.elevation_m:.0f}m, slope {features.slope_deg:.1f}deg",
        "wildlife": f"{features.recent_wildlife_reports_7d} wildlife reports in 7d",
        "shelter": f"Shelter score {features.shelter_availability_score:.0f}/100",
        "water_risk": f"River {features.river_proximity_km:.2f} km away",
        "crime": f"Crime rate {features.crime_rate_per_100k:.0f}/100k",
        "crowd": f"Population density {features.population_density_per_km2:.0f}/km2",
        "active_alerts": f"{features.active_alerts_nearby} active alerts nearby",
        "air_quality": f"AQI {features.aqi:.0f}",
        "flood_risk": f"Flood zone distance {features.flood_zone_proximity_km:.1f} km",
    }

    weighted_sum = 0.0
    total_weight = 0.0
    factor_rows: list[dict[str, Any]] = []

    for factor_id, score in factor_scores.items():
        weight = float(weights.get(factor_id, 0.0))
        weighted_sum += score * weight
        total_weight += weight
        factor_rows.append(
            {
                "id": factor_id,
                "label": factor_labels[factor_id],
                "score": round(score, 2),
                "weight": weight,
                "detail": factor_details[factor_id],
            }
        )

    overall = round(weighted_sum / total_weight, 2) if total_weight > 0 else 0.0

    capped_by: str | None = None
    if features.in_risk_zone and features.risk_zone_level in {"HIGH", "CRITICAL"} and overall > 40:
        overall = 40.0
        capped_by = "High risk zone"
    if features.active_alerts_nearby > 5 and overall > 30:
        overall = 30.0
        capped_by = "Multiple active alerts"
    if features.network_type == "none":
        cap = 45.0 if environment in {"remote", "wilderness"} else 50.0
        if overall > cap:
            overall = cap
            capped_by = "No network coverage"

    status = _status_from_score(overall)
    recommendation = _recommendation(status, factor_rows, environment)

    return RuleScoreResult(
        safety_score=overall,
        status=status,
        capped_by=capped_by,
        factors=factor_rows,
        recommendation=recommendation,
    )
