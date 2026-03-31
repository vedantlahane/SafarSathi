from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any

from .constants import NETWORK_TYPES, RISK_ZONE_LEVELS
from .factor_registry import canonical_factor_key, clamp_factor_value


@dataclass
class SafetyFeatures:
    # Core spatiotemporal context
    latitude: float = 26.2006
    longitude: float = 92.9376
    hour: int = 12
    day_of_week: int = 2
    month: int = 3
    minutes_to_sunset: float = 240.0

    # Geographic and terrain
    elevation_m: float = 120.0
    slope_deg: float = 4.0
    distance_to_road_km: float = 0.2
    distance_to_settlement_km: float = 1.0
    flood_zone_proximity_km: float = 8.0
    landslide_risk_index: float = 0.15
    river_proximity_km: float = 2.0
    vegetation_density: float = 0.4

    # Weather and environment
    temperature_c: float = 28.0
    rainfall_mmph: float = 0.0
    visibility_km: float = 8.0
    wind_speed_kmph: float = 12.0
    humidity_pct: float = 60.0
    uv_index: float = 5.0
    lightning_probability: float = 0.1
    weather_severity: float = 15.0
    aqi: float = 70.0

    # Wildlife and nature hazards
    wildlife_sanctuary_distance_km: float = 25.0
    elephant_corridor_distance_km: float = 50.0
    recent_wildlife_reports_7d: int = 0
    snake_activity_index: float = 0.2

    # Infrastructure and accessibility
    police_eta_min: float = 15.0
    hospital_eta_min: float = 25.0
    ambulance_eta_min: float = 30.0
    road_quality_score: float = 70.0
    bridge_status_score: float = 85.0
    shelter_availability_score: float = 65.0

    # Communication and connectivity
    network_type: str = "4g"
    signal_strength_dbm: float = -90.0
    multi_carrier_coverage: bool = True

    # Human and social context
    crime_rate_per_100k: float = 190.0
    tourist_targeted_crime_index: float = 0.2
    scam_reports_30d: int = 1
    local_unrest_level: float = 0.05
    gender_safety_index: float = 0.65
    population_density_per_km2: float = 1200.0

    # Health
    disease_outbreak_level: float = 0.05
    malaria_zone: bool = False
    water_safety_score: float = 75.0

    # Transport
    accident_hotspot_distance_km: float = 5.0
    traffic_density_index: float = 0.4

    # Behavior and personal
    group_size: int = 2
    battery_pct: float = 65.0
    itinerary_deviation_km: float = 0.7
    hours_since_checkin: float = 2.0

    # Historical and predictive
    in_risk_zone: bool = False
    risk_zone_level: str = "LOW"
    active_alerts_nearby: int = 0
    historical_incidents_30d: int = 0
    historical_incidents_90d: int = 1
    sos_triggers_30d: int = 0
    prealerts_30d: int = 1
    incident_trend_index: float = 0.0
    nearby_tourist_density_index: float = 0.4

    # Place profile (used by phase-1 + env detector)
    nearby_place_count: int = 12
    safety_place_count: int = 2
    risky_place_count: int = 1
    open_business_count: int = 6

    # External intelligence
    ndma_alert_level: float = 0.0
    travel_advisory_level: float = 0.0

    # Optional true label for training
    safety_score_label: float | None = None

    # Optional full taxonomy overrides (any of the 153 canonical factor keys)
    extra_factors: dict[str, Any] = field(default_factory=dict)

    def normalize(self) -> "SafetyFeatures":
        self.hour = int(max(0, min(23, self.hour)))
        self.day_of_week = int(max(0, min(6, self.day_of_week)))
        self.month = int(max(1, min(12, self.month)))
        self.minutes_to_sunset = float(max(-720.0, min(720.0, self.minutes_to_sunset)))

        self.network_type = str(self.network_type).lower()
        if self.network_type not in NETWORK_TYPES:
            self.network_type = "none"

        self.risk_zone_level = str(self.risk_zone_level).upper()
        if self.risk_zone_level not in RISK_ZONE_LEVELS:
            self.risk_zone_level = "LOW"

        self.weather_severity = float(max(0.0, min(100.0, self.weather_severity)))
        self.aqi = float(max(0.0, min(500.0, self.aqi)))
        self.signal_strength_dbm = float(max(-130.0, min(-30.0, self.signal_strength_dbm)))
        self.battery_pct = float(max(0.0, min(100.0, self.battery_pct)))

        self.slope_deg = float(max(0.0, min(70.0, self.slope_deg)))
        self.landslide_risk_index = float(max(0.0, min(1.0, self.landslide_risk_index)))
        self.vegetation_density = float(max(0.0, min(1.0, self.vegetation_density)))
        self.lightning_probability = float(max(0.0, min(1.0, self.lightning_probability)))
        self.snake_activity_index = float(max(0.0, min(1.0, self.snake_activity_index)))
        self.local_unrest_level = float(max(0.0, min(1.0, self.local_unrest_level)))
        self.tourist_targeted_crime_index = float(max(0.0, min(1.0, self.tourist_targeted_crime_index)))
        self.incident_trend_index = float(max(-1.0, min(1.0, self.incident_trend_index)))
        self.ndma_alert_level = float(max(0.0, min(1.0, self.ndma_alert_level)))
        self.travel_advisory_level = float(max(0.0, min(1.0, self.travel_advisory_level)))

        self.gender_safety_index = float(max(0.0, min(1.0, self.gender_safety_index)))
        self.traffic_density_index = float(max(0.0, min(1.0, self.traffic_density_index)))
        self.nearby_tourist_density_index = float(max(0.0, min(1.0, self.nearby_tourist_density_index)))

        for field_name in (
            "distance_to_road_km",
            "distance_to_settlement_km",
            "flood_zone_proximity_km",
            "river_proximity_km",
            "wildlife_sanctuary_distance_km",
            "elephant_corridor_distance_km",
            "accident_hotspot_distance_km",
            "itinerary_deviation_km",
            "hours_since_checkin",
            "police_eta_min",
            "hospital_eta_min",
            "ambulance_eta_min",
        ):
            val = getattr(self, field_name)
            setattr(self, field_name, float(max(0.0, val)))

        self.group_size = int(max(1, self.group_size))
        self.active_alerts_nearby = int(max(0, self.active_alerts_nearby))
        self.historical_incidents_30d = int(max(0, self.historical_incidents_30d))
        self.historical_incidents_90d = int(max(0, self.historical_incidents_90d))
        self.sos_triggers_30d = int(max(0, self.sos_triggers_30d))
        self.prealerts_30d = int(max(0, self.prealerts_30d))
        self.recent_wildlife_reports_7d = int(max(0, self.recent_wildlife_reports_7d))
        self.scam_reports_30d = int(max(0, self.scam_reports_30d))

        self.road_quality_score = float(max(0.0, min(100.0, self.road_quality_score)))
        self.bridge_status_score = float(max(0.0, min(100.0, self.bridge_status_score)))
        self.shelter_availability_score = float(max(0.0, min(100.0, self.shelter_availability_score)))
        self.water_safety_score = float(max(0.0, min(100.0, self.water_safety_score)))

        self.nearby_place_count = int(max(0, self.nearby_place_count))
        self.safety_place_count = int(max(0, self.safety_place_count))
        self.risky_place_count = int(max(0, self.risky_place_count))
        self.open_business_count = int(max(0, self.open_business_count))

        normalized_extra: dict[str, float] = {}
        for raw_key, raw_value in self.extra_factors.items():
            key = canonical_factor_key(str(raw_key))
            if key is None:
                continue
            normalized_extra[key] = clamp_factor_value(key, raw_value)
        self.extra_factors = normalized_extra

        return self

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class ForecastPoint:
    horizon_hours: int
    safety_score: float
    danger_score: float
    status: str
    rationale: str


@dataclass
class PredictionResult:
    safety_score: float
    danger_score: float
    status: str
    environment: str
    rule_score: float
    ml_score: float
    confidence: float
    capped_by: str | None
    recommendation: str
    factors: list[dict[str, Any]]
    forecast: list[ForecastPoint] = field(default_factory=list)
    timestamp_utc: str = field(default_factory=lambda: datetime.utcnow().isoformat(timespec="seconds") + "Z")

    def to_dict(self) -> dict[str, Any]:
        data = {
            "safety_score": self.safety_score,
            "danger_score": self.danger_score,
            "status": self.status,
            "environment": self.environment,
            "rule_score": self.rule_score,
            "ml_score": self.ml_score,
            "confidence": self.confidence,
            "capped_by": self.capped_by,
            "recommendation": self.recommendation,
            "factors": self.factors,
            "forecast": [
                {
                    "horizon_hours": f.horizon_hours,
                    "safety_score": f.safety_score,
                    "danger_score": f.danger_score,
                    "status": f.status,
                    "rationale": f.rationale,
                }
                for f in self.forecast
            ],
            "timestamp_utc": self.timestamp_utc,
        }
        return data
