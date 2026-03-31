from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class DataSourceRef:
    key: str
    name: str
    url: str
    access: str
    notes: str


# Official source catalog for implemented and planned safety factors.
# Keep links here so engineering and data teams can trace each feature source.
DATA_SOURCES: dict[str, DataSourceRef] = {
    # Device and derived context
    # MDN Geolocation API docs
    # https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
    "device_gps": DataSourceRef(
        key="device_gps",
        name="Device Geolocation API",
        url="https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API",
        access="free",
        notes="Primary lat/lon source from mobile/web client.",
    ),
    # MDN Network Information API docs
    # https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
    "device_network": DataSourceRef(
        key="device_network",
        name="Device Network Information API",
        url="https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API",
        access="free",
        notes="Network type and rough connectivity quality.",
    ),
    # MDN Battery Status API docs
    # https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API
    "device_battery": DataSourceRef(
        key="device_battery",
        name="Battery Status API",
        url="https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API",
        access="free",
        notes="Battery level proxy for communication resilience.",
    ),
    "datetime_derived": DataSourceRef(
        key="datetime_derived",
        name="DateTime Derived Features",
        url="https://docs.python.org/3/library/datetime.html",
        access="free",
        notes="Hour, day-of-week, month, and season computed from timestamps.",
    ),
    # NOAA solar calculator reference for daylight math
    # https://gml.noaa.gov/grad/solcalc/
    "sunrise_sunset": DataSourceRef(
        key="sunrise_sunset",
        name="Solar Position / Sunrise-Sunset",
        url="https://gml.noaa.gov/grad/solcalc/",
        access="free",
        notes="Used to calculate daylight remaining and night-risk transitions.",
    ),

    # Terrain and maps
    # NASA/JPL SRTM landing page
    # https://www2.jpl.nasa.gov/srtm/
    "srtm": DataSourceRef(
        key="srtm",
        name="SRTM Elevation Dataset",
        url="https://www2.jpl.nasa.gov/srtm/",
        access="free",
        notes="Elevation and terrain baseline for remote risk modeling.",
    ),
    # Google Maps Elevation API
    # https://developers.google.com/maps/documentation/elevation/overview
    "google_elevation": DataSourceRef(
        key="google_elevation",
        name="Google Elevation API",
        url="https://developers.google.com/maps/documentation/elevation/overview",
        access="paid",
        notes="Optional higher-resolution elevation and slope retrieval.",
    ),
    # OpenStreetMap + Overpass query interface
    # https://wiki.openstreetmap.org/wiki/Overpass_API
    "osm_overpass": DataSourceRef(
        key="osm_overpass",
        name="OpenStreetMap / Overpass API",
        url="https://wiki.openstreetmap.org/wiki/Overpass_API",
        access="free",
        notes="Roads, settlements, waterways, amenities, and POI density.",
    ),

    # Weather, climate, and hazards
    # India Meteorological Department
    # https://mausam.imd.gov.in/
    "imd_weather": DataSourceRef(
        key="imd_weather",
        name="India Meteorological Department",
        url="https://mausam.imd.gov.in/",
        access="free",
        notes="Official India weather observations and severe weather alerts.",
    ),
    # OpenWeather API docs
    # https://openweathermap.org/api
    "openweather": DataSourceRef(
        key="openweather",
        name="OpenWeather API",
        url="https://openweathermap.org/api",
        access="free_tier",
        notes="Current weather and forecast feed.",
    ),
    # Flood Forecasting portal (Central Water Commission)
    # https://ffs.india-water.gov.in/
    "cwc_flood": DataSourceRef(
        key="cwc_flood",
        name="Central Water Commission Flood Forecast",
        url="https://ffs.india-water.gov.in/",
        access="free",
        notes="River levels, flood forecast, and warning signals.",
    ),
    # National Disaster Management Authority
    # https://ndma.gov.in/
    "ndma_alerts": DataSourceRef(
        key="ndma_alerts",
        name="NDMA Alerts",
        url="https://ndma.gov.in/",
        access="free",
        notes="National-level disaster advisories and active alerts.",
    ),
    # Geological Survey of India
    # https://www.gsi.gov.in/
    "gsi_geohazards": DataSourceRef(
        key="gsi_geohazards",
        name="Geological Survey of India",
        url="https://www.gsi.gov.in/",
        access="free",
        notes="Landslide and geology hazard maps.",
    ),
    # NASA FIRMS (active fire)
    # https://firms.modaps.eosdis.nasa.gov/
    "nasa_firms": DataSourceRef(
        key="nasa_firms",
        name="NASA FIRMS Fire Data",
        url="https://firms.modaps.eosdis.nasa.gov/",
        access="free",
        notes="Active fire/smoke risk signals.",
    ),
    # Google Air Quality API
    # https://developers.google.com/maps/documentation/air-quality
    "google_air_quality": DataSourceRef(
        key="google_air_quality",
        name="Google Air Quality API",
        url="https://developers.google.com/maps/documentation/air-quality",
        access="paid",
        notes="AQI and pollutant-level data.",
    ),

    # Accessibility, mobility, and places
    # Google Places API docs
    # https://developers.google.com/maps/documentation/places/web-service/overview
    "google_places": DataSourceRef(
        key="google_places",
        name="Google Places API",
        url="https://developers.google.com/maps/documentation/places/web-service/overview",
        access="paid",
        notes="Nearby places, place types, and open-now signals.",
    ),
    # Google Distance Matrix docs
    # https://developers.google.com/maps/documentation/distance-matrix/overview
    "google_distance_matrix": DataSourceRef(
        key="google_distance_matrix",
        name="Google Distance Matrix API",
        url="https://developers.google.com/maps/documentation/distance-matrix/overview",
        access="paid",
        notes="Travel-time ETA to police, hospital, and critical services.",
    ),
    # Google Routes API docs
    # https://developers.google.com/maps/documentation/routes
    "google_routes": DataSourceRef(
        key="google_routes",
        name="Google Routes API",
        url="https://developers.google.com/maps/documentation/routes",
        access="paid",
        notes="Traffic and routing context for transport risk.",
    ),

    # Public Indian datasets
    # Census of India
    # https://censusindia.gov.in/
    "census_india": DataSourceRef(
        key="census_india",
        name="Census of India",
        url="https://censusindia.gov.in/",
        access="free",
        notes="Population density baselines.",
    ),
    # National Crime Records Bureau
    # https://ncrb.gov.in/
    "ncrb": DataSourceRef(
        key="ncrb",
        name="NCRB Crime Statistics",
        url="https://ncrb.gov.in/",
        access="free",
        notes="District/state crime rates and categories.",
    ),
    # TRAI
    # https://www.trai.gov.in/
    "trai": DataSourceRef(
        key="trai",
        name="TRAI Telecom Coverage",
        url="https://www.trai.gov.in/",
        access="free",
        notes="Carrier coverage and telecom footprint references.",
    ),
    # IDSP public health surveillance
    # https://idsp.mohfw.gov.in/
    "idsp": DataSourceRef(
        key="idsp",
        name="IDSP Disease Surveillance",
        url="https://idsp.mohfw.gov.in/",
        access="free",
        notes="Disease outbreak monitoring signals.",
    ),
    # NVBDCP vector-borne disease program
    # https://nvbdcp.mohfw.gov.in/
    "nvbdcp": DataSourceRef(
        key="nvbdcp",
        name="NVBDCP",
        url="https://nvbdcp.mohfw.gov.in/",
        access="free",
        notes="Malaria and vector-borne endemic area references.",
    ),
    # India Biodiversity Portal
    # https://indiabiodiversity.org/
    "india_biodiversity": DataSourceRef(
        key="india_biodiversity",
        name="India Biodiversity Portal",
        url="https://indiabiodiversity.org/",
        access="free",
        notes="Wildlife and ecology observations.",
    ),

    # External intelligence and advisories
    # Ministry of External Affairs travel advisories
    # https://www.mea.gov.in/travel-advisories.htm
    "mea_advisory": DataSourceRef(
        key="mea_advisory",
        name="MEA Travel Advisories",
        url="https://www.mea.gov.in/travel-advisories.htm",
        access="free",
        notes="Government travel advisory level.",
    ),

    # Internal YatraX data products
    "yatrax_backend": DataSourceRef(
        key="yatrax_backend",
        name="YatraX Backend Data",
        url="internal://backend",
        access="internal",
        notes="Risk zones, incidents, SOS/pre-alerts, user density, and alerts.",
    ),
}


# Feature-to-source include map for currently implemented model inputs.
# Add new features here with source keys from DATA_SOURCES.
FEATURE_SOURCE_KEYS: dict[str, tuple[str, ...]] = {
    # Core temporal and location context
    "latitude": ("device_gps",),
    "longitude": ("device_gps",),
    "hour": ("datetime_derived",),
    "day_of_week": ("datetime_derived",),
    "month": ("datetime_derived",),
    "minutes_to_sunset": ("sunrise_sunset", "device_gps", "datetime_derived"),

    # Geographic and terrain
    "elevation_m": ("srtm", "google_elevation"),
    "slope_deg": ("srtm", "google_elevation"),
    "distance_to_road_km": ("osm_overpass",),
    "distance_to_settlement_km": ("osm_overpass", "census_india"),
    "flood_zone_proximity_km": ("cwc_flood", "ndma_alerts"),
    "landslide_risk_index": ("gsi_geohazards",),
    "river_proximity_km": ("osm_overpass",),
    "vegetation_density": ("osm_overpass", "india_biodiversity"),

    # Weather and environmental quality
    "temperature_c": ("imd_weather", "openweather"),
    "rainfall_mmph": ("imd_weather", "openweather"),
    "visibility_km": ("imd_weather", "openweather"),
    "wind_speed_kmph": ("imd_weather", "openweather"),
    "humidity_pct": ("imd_weather", "openweather"),
    "uv_index": ("openweather",),
    "lightning_probability": ("imd_weather", "openweather"),
    "weather_severity": ("imd_weather", "openweather"),
    "aqi": ("google_air_quality",),

    # Wildlife and nature hazards
    "wildlife_sanctuary_distance_km": ("osm_overpass", "india_biodiversity"),
    "elephant_corridor_distance_km": ("india_biodiversity",),
    "recent_wildlife_reports_7d": ("yatrax_backend", "india_biodiversity"),
    "snake_activity_index": ("idsp", "nvbdcp"),

    # Accessibility and services
    "police_eta_min": ("google_distance_matrix", "google_routes"),
    "hospital_eta_min": ("google_distance_matrix", "google_routes"),
    "ambulance_eta_min": ("yatrax_backend",),
    "road_quality_score": ("osm_overpass", "yatrax_backend"),
    "bridge_status_score": ("yatrax_backend",),
    "shelter_availability_score": ("osm_overpass", "google_places"),

    # Connectivity
    "network_type": ("device_network",),
    "signal_strength_dbm": ("device_network",),
    "multi_carrier_coverage": ("trai", "device_network"),

    # Human/social
    "crime_rate_per_100k": ("ncrb", "yatrax_backend"),
    "tourist_targeted_crime_index": ("yatrax_backend",),
    "scam_reports_30d": ("yatrax_backend",),
    "local_unrest_level": ("yatrax_backend",),
    "gender_safety_index": ("ncrb", "yatrax_backend"),
    "population_density_per_km2": ("census_india",),

    # Health
    "disease_outbreak_level": ("idsp",),
    "malaria_zone": ("nvbdcp",),
    "water_safety_score": ("yatrax_backend",),

    # Transport
    "accident_hotspot_distance_km": ("yatrax_backend", "google_routes"),
    "traffic_density_index": ("google_routes",),

    # Behavioral and personal
    "group_size": ("yatrax_backend",),
    "battery_pct": ("device_battery",),
    "itinerary_deviation_km": ("yatrax_backend", "device_gps"),
    "hours_since_checkin": ("yatrax_backend",),

    # Internal intelligence and historical signals
    "in_risk_zone": ("yatrax_backend",),
    "risk_zone_level": ("yatrax_backend",),
    "active_alerts_nearby": ("yatrax_backend", "ndma_alerts"),
    "historical_incidents_30d": ("yatrax_backend",),
    "historical_incidents_90d": ("yatrax_backend",),
    "sos_triggers_30d": ("yatrax_backend",),
    "prealerts_30d": ("yatrax_backend",),
    "incident_trend_index": ("yatrax_backend",),
    "nearby_tourist_density_index": ("yatrax_backend",),

    # Place profile
    "nearby_place_count": ("google_places", "osm_overpass"),
    "safety_place_count": ("google_places", "osm_overpass"),
    "risky_place_count": ("google_places", "osm_overpass"),
    "open_business_count": ("google_places",),

    # External intelligence
    "ndma_alert_level": ("ndma_alerts",),
    "travel_advisory_level": ("mea_advisory",),
}


def source_catalog_dict() -> dict[str, dict[str, str]]:
    return {key: asdict(ref) for key, ref in DATA_SOURCES.items()}


def feature_source_links() -> dict[str, list[dict[str, str]]]:
    result: dict[str, list[dict[str, str]]] = {}

    for feature_name, source_keys in FEATURE_SOURCE_KEYS.items():
        refs: list[dict[str, str]] = []
        for source_key in source_keys:
            ref = DATA_SOURCES.get(source_key)
            if ref is None:
                continue
            refs.append({"key": ref.key, "name": ref.name, "url": ref.url, "access": ref.access})
        result[feature_name] = refs

    return result
