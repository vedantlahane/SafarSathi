# path: model/api.py
from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

from flask import Flask, jsonify, request
from flask_cors import CORS

from .constants import DEFAULT_MODEL_PATH
from .data_sources import feature_source_links, source_catalog_dict
from .factor_registry import FACTOR_KEYS, TOTAL_FACTOR_COUNT, canonical_factor_key, factor_category_map
from .predictor import SafetyPredictor
from .schemas import SafetyFeatures


predictor = SafetyPredictor(str(DEFAULT_MODEL_PATH))


def _to_float(data: dict[str, Any], key: str, default: float) -> float:
    val = data.get(key, default)
    try:
        return float(val)
    except (TypeError, ValueError):
        return float(default)


def _to_int(data: dict[str, Any], key: str, default: int) -> int:
    val = data.get(key, default)
    try:
        return int(val)
    except (TypeError, ValueError):
        return int(default)


def _to_bool(data: dict[str, Any], key: str, default: bool) -> bool:
    val = data.get(key, default)
    if isinstance(val, bool):
        return val
    if isinstance(val, str):
        return val.strip().lower() in {"1", "true", "yes", "y", "on"}
    if isinstance(val, (int, float)):
        return bool(val)
    return default


def _minutes_to_sunset_default(hour: int) -> float:
    # Approximation for bootstrap requests when no astronomical service exists.
    # Noon => large positive minutes, night => negative minutes.
    return float(240 - abs(hour - 13) * 48)


def _factor_overrides_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    overrides: dict[str, Any] = {}

    factors_block = payload.get("factors")
    if isinstance(factors_block, dict):
        for raw_key, raw_value in factors_block.items():
            key = canonical_factor_key(str(raw_key))
            if key is not None:
                overrides[key] = raw_value

    for raw_key, raw_value in payload.items():
        key = canonical_factor_key(str(raw_key))
        if key is not None:
            overrides[key] = raw_value

    return overrides


def _provided_factor_keys(payload: dict[str, Any]) -> set[str]:
    return set(_factor_overrides_from_payload(payload).keys())


def _factor_completeness_report(payload: dict[str, Any], include_lists: bool = True) -> dict[str, Any]:
    provided = _provided_factor_keys(payload)
    missing = [key for key in FACTOR_KEYS if key not in provided]
    provided_sorted = sorted(provided)
    coverage_pct = round((len(provided_sorted) / float(TOTAL_FACTOR_COUNT)) * 100.0, 2)

    categories = factor_category_map()
    provided_by_category: dict[str, int] = {}
    missing_by_category: dict[str, int] = {}
    for key in FACTOR_KEYS:
        cat = categories.get(key, "unknown")
        if key in provided:
            provided_by_category[cat] = provided_by_category.get(cat, 0) + 1
        else:
            missing_by_category[cat] = missing_by_category.get(cat, 0) + 1

    report: dict[str, Any] = {
        "factor_count": TOTAL_FACTOR_COUNT,
        "provided_count": len(provided_sorted),
        "defaulted_count": len(missing),
        "coverage_pct": coverage_pct,
        "is_complete": len(missing) == 0,
        "provided_by_category": provided_by_category,
        "defaulted_by_category": missing_by_category,
    }

    if include_lists:
        report["provided_factors"] = provided_sorted
        report["defaulted_factors"] = missing
    else:
        report["provided_factor_sample"] = provided_sorted[:12]
        report["defaulted_factor_sample"] = missing[:12]

    return report


def _features_from_payload(payload: dict[str, Any]) -> tuple[SafetyFeatures, int, set[str]]:
    now = datetime.now(timezone.utc)

    extra_factors = _factor_overrides_from_payload(payload)

    features = SafetyFeatures(
        latitude=_to_float(payload, "latitude", _to_float(payload, "lat", 26.2006)),
        longitude=_to_float(payload, "longitude", _to_float(payload, "lon", 92.9376)),
        hour=_to_int(payload, "hour", now.hour),
        day_of_week=_to_int(payload, "day_of_week", now.weekday()),
        month=_to_int(payload, "month", now.month),
        minutes_to_sunset=_to_float(payload, "minutes_to_sunset", _minutes_to_sunset_default(_to_int(payload, "hour", now.hour))),
        elevation_m=_to_float(payload, "elevation_m", 120.0),
        slope_deg=_to_float(payload, "slope_deg", 4.0),
        distance_to_road_km=_to_float(payload, "distance_to_road_km", 0.2),
        distance_to_settlement_km=_to_float(payload, "distance_to_settlement_km", 1.0),
        flood_zone_proximity_km=_to_float(payload, "flood_zone_proximity_km", 10.0),
        landslide_risk_index=_to_float(payload, "landslide_risk_index", 0.1),
        river_proximity_km=_to_float(payload, "river_proximity_km", 2.0),
        vegetation_density=_to_float(payload, "vegetation_density", 0.4),
        temperature_c=_to_float(payload, "temperature_c", 28.0),
        rainfall_mmph=_to_float(payload, "rainfall_mmph", 0.0),
        visibility_km=_to_float(payload, "visibility_km", 8.0),
        wind_speed_kmph=_to_float(payload, "wind_speed_kmph", 12.0),
        humidity_pct=_to_float(payload, "humidity_pct", 60.0),
        uv_index=_to_float(payload, "uv_index", 5.0),
        lightning_probability=_to_float(payload, "lightning_probability", 0.1),
        weather_severity=_to_float(payload, "weather_severity", _to_float(payload, "weatherSeverity", 15.0)),
        aqi=_to_float(payload, "aqi", _to_float(payload, "air_quality_index", 70.0)),
        wildlife_sanctuary_distance_km=_to_float(payload, "wildlife_sanctuary_distance_km", 25.0),
        elephant_corridor_distance_km=_to_float(payload, "elephant_corridor_distance_km", 50.0),
        recent_wildlife_reports_7d=_to_int(payload, "recent_wildlife_reports_7d", 0),
        snake_activity_index=_to_float(payload, "snake_activity_index", 0.2),
        police_eta_min=_to_float(payload, "police_eta_min", _to_float(payload, "police_eta_minutes", 15.0)),
        hospital_eta_min=_to_float(payload, "hospital_eta_min", _to_float(payload, "hospital_eta_minutes", 25.0)),
        ambulance_eta_min=_to_float(payload, "ambulance_eta_min", 30.0),
        road_quality_score=_to_float(payload, "road_quality_score", 70.0),
        bridge_status_score=_to_float(payload, "bridge_status_score", 85.0),
        shelter_availability_score=_to_float(payload, "shelter_availability_score", 65.0),
        network_type=str(payload.get("network_type", payload.get("networkType", "4g"))).lower(),
        signal_strength_dbm=_to_float(payload, "signal_strength_dbm", -90.0),
        multi_carrier_coverage=_to_bool(payload, "multi_carrier_coverage", True),
        crime_rate_per_100k=_to_float(payload, "crime_rate_per_100k", 190.0),
        tourist_targeted_crime_index=_to_float(payload, "tourist_targeted_crime_index", 0.2),
        scam_reports_30d=_to_int(payload, "scam_reports_30d", 1),
        local_unrest_level=_to_float(payload, "local_unrest_level", 0.05),
        gender_safety_index=_to_float(payload, "gender_safety_index", 0.65),
        population_density_per_km2=_to_float(payload, "population_density_per_km2", 1200.0),
        disease_outbreak_level=_to_float(payload, "disease_outbreak_level", 0.05),
        malaria_zone=_to_bool(payload, "malaria_zone", False),
        water_safety_score=_to_float(payload, "water_safety_score", 75.0),
        accident_hotspot_distance_km=_to_float(payload, "accident_hotspot_distance_km", 5.0),
        traffic_density_index=_to_float(payload, "traffic_density_index", 0.4),
        group_size=_to_int(payload, "group_size", 2),
        battery_pct=_to_float(payload, "battery_pct", 65.0),
        itinerary_deviation_km=_to_float(payload, "itinerary_deviation_km", 0.7),
        hours_since_checkin=_to_float(payload, "hours_since_checkin", 2.0),
        in_risk_zone=_to_bool(payload, "in_risk_zone", _to_bool(payload, "inRiskZone", False)),
        risk_zone_level=str(payload.get("risk_zone_level", payload.get("riskZoneLevel", "LOW"))).upper(),
        active_alerts_nearby=_to_int(payload, "active_alerts_nearby", _to_int(payload, "activeAlertsNearby", 0)),
        historical_incidents_30d=_to_int(payload, "historical_incidents_30d", _to_int(payload, "historicalIncidents30d", 0)),
        historical_incidents_90d=_to_int(payload, "historical_incidents_90d", 1),
        sos_triggers_30d=_to_int(payload, "sos_triggers_30d", 0),
        prealerts_30d=_to_int(payload, "prealerts_30d", 1),
        incident_trend_index=_to_float(payload, "incident_trend_index", 0.0),
        nearby_tourist_density_index=_to_float(payload, "nearby_tourist_density_index", 0.4),
        nearby_place_count=_to_int(payload, "nearby_place_count", _to_int(payload, "nearbyPlaceCount", 12)),
        safety_place_count=_to_int(payload, "safety_place_count", _to_int(payload, "safetyPlaceCount", 2)),
        risky_place_count=_to_int(payload, "risky_place_count", _to_int(payload, "riskyPlaceCount", 1)),
        open_business_count=_to_int(payload, "open_business_count", _to_int(payload, "openBusinessCount", 6)),
        ndma_alert_level=_to_float(payload, "ndma_alert_level", 0.0),
        travel_advisory_level=_to_float(payload, "travel_advisory_level", 0.0),
        extra_factors=extra_factors,
    ).normalize()

    core_signal_keys = {
        "latitude",
        "lat",
        "longitude",
        "lon",
        "hour",
        "day_of_week",
        "month",
        "minutes_to_sunset",
        "network_type",
        "networkType",
        "in_risk_zone",
        "inRiskZone",
        "risk_zone_level",
        "riskZoneLevel",
        "active_alerts_nearby",
        "activeAlertsNearby",
        "historical_incidents_30d",
        "historicalIncidents30d",
        "weather_severity",
        "weatherSeverity",
        "aqi",
    }
    explicit_factor_count = len(extra_factors)
    provided_count = explicit_factor_count + sum(1 for key in core_signal_keys if key in payload)
    provided_count = int(min(TOTAL_FACTOR_COUNT, max(0, provided_count)))
    return features, provided_count, set(extra_factors.keys())


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    @app.get("/health")
    def health() -> Any:
        return jsonify(
            {
                "status": "ok",
                "model_loaded": predictor.is_model_loaded(),
                "model_version": predictor.model_version,
            }
        )

    @app.post("/v2/reload-model")
    def reload_model() -> Any:
        global predictor
        predictor = SafetyPredictor(str(DEFAULT_MODEL_PATH))
        return jsonify(
            {
                "status": "ok",
                "model_loaded": predictor.is_model_loaded(),
                "model_version": predictor.model_version,
            }
        )

    @app.get("/v2/data-sources")
    def data_sources() -> Any:
        return jsonify(
            {
                "success": True,
                "factor_count": TOTAL_FACTOR_COUNT,
                "factor_keys": list(FACTOR_KEYS),
                "sources": source_catalog_dict(),
                "feature_sources": feature_source_links(),
            }
        )

    @app.post("/v2/factor-completeness")
    def factor_completeness() -> Any:
        payload = request.get_json(silent=True) or {}
        if not isinstance(payload, dict):
            return jsonify({"error": "JSON body must be an object."}), 400

        features_payload = payload.get("features", payload)
        if not isinstance(features_payload, dict):
            return jsonify({"error": "'features' must be an object if provided."}), 400

        strict = _to_bool(payload, "strict", False)
        min_coverage_pct = _to_float(payload, "min_coverage_pct", 100.0 if strict else 0.0)
        report = _factor_completeness_report(features_payload, include_lists=True)

        meets_threshold = report["coverage_pct"] >= max(0.0, min(100.0, min_coverage_pct))
        is_valid = (not strict) or meets_threshold
        status_code = 200 if is_valid else 400

        return jsonify(
            {
                "success": is_valid,
                "strict": strict,
                "min_coverage_pct": max(0.0, min(100.0, min_coverage_pct)),
                "message": (
                    "All factors provided." if report["is_complete"] else "Some factors are defaulted."
                ),
                "data": report,
            }
        ), status_code

    @app.get("/predict-safety")
    def predict_safety_legacy() -> Any:
        lat = request.args.get("lat", type=float)
        lon = request.args.get("lon", type=float)
        hour = request.args.get("hour", type=int)

        if lat is None or lon is None or hour is None:
            return jsonify({"error": "Query params lat, lon, and hour are required."}), 400

        payload = {
            "lat": lat,
            "lon": lon,
            "hour": hour,
            "networkType": request.args.get("networkType", "4g"),
            "weatherSeverity": request.args.get("weatherSeverity", default=15.0, type=float),
            "aqi": request.args.get("aqi", default=70.0, type=float),
            "inRiskZone": request.args.get("inRiskZone", default="false"),
            "riskZoneLevel": request.args.get("riskZoneLevel", default="LOW"),
            "activeAlertsNearby": request.args.get("activeAlertsNearby", default=0, type=int),
            "historicalIncidents30d": request.args.get("historicalIncidents30d", default=0, type=int),
            "nearbyPlaceCount": request.args.get("nearbyPlaceCount", default=10, type=int),
            "openBusinessCount": request.args.get("openBusinessCount", default=4, type=int),
            "police_eta_min": request.args.get("policeEtaMin", default=18.0, type=float),
            "hospital_eta_min": request.args.get("hospitalEtaMin", default=28.0, type=float),
        }

        features, provided_count, _ = _features_from_payload(payload)
        result = predictor.predict(features, provided_feature_count=provided_count, forecast_hours=[])

        return jsonify(
            {
                "danger_score": result.danger_score,
                "dangerScore": result.danger_score,
                "safety_score": result.safety_score,
                "status": result.status,
                "environment": result.environment,
                "model_version": predictor.model_version,
            }
        )

    @app.post("/v2/predict-safety")
    def predict_safety_v2() -> Any:
        payload = request.get_json(silent=True) or {}
        if not isinstance(payload, dict):
            return jsonify({"error": "JSON body must be an object."}), 400

        features_payload = payload.get("features", payload)
        if not isinstance(features_payload, dict):
            return jsonify({"error": "'features' must be an object if provided."}), 400

        forecast_hours = payload.get("forecast_hours", [1, 3, 6])
        if not isinstance(forecast_hours, list):
            forecast_hours = [1, 3, 6]

        features, provided_count, provided_factor_keys = _features_from_payload(features_payload)
        completeness = _factor_completeness_report(features_payload, include_lists=False)
        result = predictor.predict(
            features,
            provided_feature_count=provided_count,
            forecast_hours=[int(x) for x in forecast_hours if isinstance(x, (int, float, str))],
        )

        data = result.to_dict()

        return jsonify(
            {
                "success": True,
                "model_version": predictor.model_version,
                "provided_factor_count": len(provided_factor_keys),
                "factor_completeness": completeness,
                "data": data,
                # Legacy aliases for old parsers
                "danger_score": data["danger_score"],
                "dangerScore": data["danger_score"],
            }
        )

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
