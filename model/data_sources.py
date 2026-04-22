# path: model/data_sources.py
from __future__ import annotations

from dataclasses import asdict, dataclass

from .factor_registry import factor_source_map


@dataclass(frozen=True)
class DataSourceRef:
    key: str
    name: str
    url: str
    access: str
    notes: str


# Official source catalog for all factors in the master taxonomy.
# Keep links in comments and fields so data engineering can trace each feature source quickly.
DATA_SOURCES: dict[str, DataSourceRef] = {
    # Device and browser APIs
    # https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
    "device_gps": DataSourceRef("device_gps", "Device Geolocation API", "https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API", "free", "Primary lat/lon stream from client devices."),
    # https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
    "device_network": DataSourceRef("device_network", "Network Information API", "https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API", "free", "Network type and signal quality context."),
    # https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API
    "device_battery": DataSourceRef("device_battery", "Battery Status API", "https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API", "free", "Battery state for communication resilience."),
    # https://docs.python.org/3/library/datetime.html
    "datetime_derived": DataSourceRef("datetime_derived", "Datetime Derived Features", "https://docs.python.org/3/library/datetime.html", "free", "Hour, weekday, season, and calendar signals."),
    # https://gml.noaa.gov/grad/solcalc/
    "sunrise_sunset": DataSourceRef("sunrise_sunset", "Solar/Sunrise Sunset Calculations", "https://gml.noaa.gov/grad/solcalc/", "free", "Daylight remaining and night transition calculations."),

    # Terrain, geology, and maps
    # https://www2.jpl.nasa.gov/srtm/
    "srtm": DataSourceRef("srtm", "SRTM Elevation Dataset", "https://www2.jpl.nasa.gov/srtm/", "free", "Elevation and slope baseline."),
    # https://developers.google.com/maps/documentation/elevation/overview
    "google_elevation": DataSourceRef("google_elevation", "Google Elevation API", "https://developers.google.com/maps/documentation/elevation/overview", "paid", "High-resolution elevation/slope queries."),
    # https://wiki.openstreetmap.org/wiki/Overpass_API
    "osm_overpass": DataSourceRef("osm_overpass", "OpenStreetMap/Overpass API", "https://wiki.openstreetmap.org/wiki/Overpass_API", "free", "Roads, trails, waterways, amenities, and POIs."),
    # https://www.fsi.nic.in/
    "forest_survey_india": DataSourceRef("forest_survey_india", "Forest Survey of India", "https://www.fsi.nic.in/", "free", "Forest cover and vegetation layers."),
    # https://seismo.gov.in/
    "seismic_zones": DataSourceRef("seismic_zones", "National Seismology Centre", "https://seismo.gov.in/", "free", "Seismic hazard and earthquake zone layers."),
    # https://www.gsi.gov.in/
    "gsi_geohazards": DataSourceRef("gsi_geohazards", "Geological Survey of India", "https://www.gsi.gov.in/", "free", "Landslide and geology hazard maps."),
    # https://surveyofindia.gov.in/
    "survey_india": DataSourceRef("survey_india", "Survey of India", "https://surveyofindia.gov.in/", "free", "Boundaries and official map references."),

    # Weather, flood, and disaster
    # https://mausam.imd.gov.in/
    "imd_weather": DataSourceRef("imd_weather", "India Meteorological Department", "https://mausam.imd.gov.in/", "free", "Weather observations and severe weather alerts."),
    # https://openweathermap.org/api
    "openweather": DataSourceRef("openweather", "OpenWeather API", "https://openweathermap.org/api", "free_tier", "Current weather and forecast feed."),
    # https://ffs.india-water.gov.in/
    "cwc_flood": DataSourceRef("cwc_flood", "Central Water Commission Flood Forecast", "https://ffs.india-water.gov.in/", "free", "Flood forecasts and river-level warnings."),
    # https://ndma.gov.in/
    "ndma_alerts": DataSourceRef("ndma_alerts", "NDMA Alerts", "https://ndma.gov.in/", "free", "National disaster advisories and active alerts."),
    # https://firms.modaps.eosdis.nasa.gov/
    "nasa_firms": DataSourceRef("nasa_firms", "NASA FIRMS", "https://firms.modaps.eosdis.nasa.gov/", "free", "Active fire/smoke detections."),

    # Air, water, pollution
    # https://developers.google.com/maps/documentation/air-quality
    "google_air_quality": DataSourceRef("google_air_quality", "Google Air Quality API", "https://developers.google.com/maps/documentation/air-quality", "paid", "AQI and pollutant data."),
    # https://cpcb.nic.in/
    "cpcb": DataSourceRef("cpcb", "Central Pollution Control Board", "https://cpcb.nic.in/", "free", "Station-based air/water pollution records."),
    # https://jalshakti-dowr.gov.in/
    "jal_shakti": DataSourceRef("jal_shakti", "Ministry of Jal Shakti", "https://jalshakti-dowr.gov.in/", "free", "Water quality and river resources."),
    # https://pcba.maharashtra.gov.in/ (proxy example for state boards)
    "pollution_control_board": DataSourceRef("pollution_control_board", "State Pollution Control Boards", "https://pcba.maharashtra.gov.in/", "free", "Industrial hazard and contamination datasets."),

    # Places, routes, and mobility
    # https://developers.google.com/maps/documentation/places/web-service/overview
    "google_places": DataSourceRef("google_places", "Google Places API", "https://developers.google.com/maps/documentation/places/web-service/overview", "paid", "Nearby places, categories, and open-now status."),
    # https://developers.google.com/maps/documentation/distance-matrix/overview
    "google_distance_matrix": DataSourceRef("google_distance_matrix", "Google Distance Matrix API", "https://developers.google.com/maps/documentation/distance-matrix/overview", "paid", "Travel-time ETA to emergency and support points."),
    # https://developers.google.com/maps/documentation/routes
    "google_routes": DataSourceRef("google_routes", "Google Routes API", "https://developers.google.com/maps/documentation/routes", "paid", "Traffic and routing context for transport risk."),
    # https://iwt.nic.in/
    "inland_waterways": DataSourceRef("inland_waterways", "Inland Waterways Authority", "https://iwt.nic.in/", "free", "Ferry and inland water transport operations."),
    # https://www.dgca.gov.in/digigov-portal/
    "aviation_data": DataSourceRef("aviation_data", "DGCA/Aviation Data", "https://www.dgca.gov.in/digigov-portal/", "free", "Aviation and rescue accessibility information."),
    # https://www.viirsfire.nasa.gov/ (night-light references often distributed via NOAA/NASA products)
    "viirs_night_lights": DataSourceRef("viirs_night_lights", "VIIRS Nighttime Lights", "https://www.viirsfire.nasa.gov/", "free", "Street-lighting and activity proxy."),

    # Public datasets and social context
    # https://censusindia.gov.in/
    "census_india": DataSourceRef("census_india", "Census of India", "https://censusindia.gov.in/", "free", "Population density and demographic baselines."),
    # https://ncrb.gov.in/
    "ncrb": DataSourceRef("ncrb", "NCRB Crime Statistics", "https://ncrb.gov.in/", "free", "Crime rates and category distribution."),
    # https://www.trai.gov.in/
    "trai": DataSourceRef("trai", "TRAI Telecom Coverage", "https://www.trai.gov.in/", "free", "Carrier and telecom coverage maps."),
    # https://idsp.mohfw.gov.in/
    "idsp": DataSourceRef("idsp", "IDSP Disease Surveillance", "https://idsp.mohfw.gov.in/", "free", "Disease outbreak and surveillance alerts."),
    # https://nvbdcp.mohfw.gov.in/
    "nvbdcp": DataSourceRef("nvbdcp", "NVBDCP", "https://nvbdcp.mohfw.gov.in/", "free", "Vector-borne endemic region references."),
    # https://indiabiodiversity.org/
    "india_biodiversity": DataSourceRef("india_biodiversity", "India Biodiversity Portal", "https://indiabiodiversity.org/", "free", "Wildlife and ecology observations."),
    # https://mohfw.gov.in/
    "health_dept": DataSourceRef("health_dept", "State/National Health Department", "https://mohfw.gov.in/", "free", "Hospital capability and emergency health operations."),
    # https://www.who.int/
    "who_alerts": DataSourceRef("who_alerts", "WHO Alerts", "https://www.who.int/", "free", "Global/public-health risk notifications."),

    # Legal, advisory, and government
    # https://www.mea.gov.in/travel-advisories.htm
    "mea_advisory": DataSourceRef("mea_advisory", "MEA Travel Advisories", "https://www.mea.gov.in/travel-advisories.htm", "free", "Government travel advisory levels."),
    # https://www.mha.gov.in/
    "mha_notifications": DataSourceRef("mha_notifications", "MHA Notifications", "https://www.mha.gov.in/", "free", "Restricted areas, security, and legal notifications."),
    # https://indianfrro.gov.in/
    "frro_requirements": DataSourceRef("frro_requirements", "FRRO Requirements", "https://indianfrro.gov.in/", "free", "Foreigner registration requirements."),
    # https://www.indiacode.nic.in/
    "law_database": DataSourceRef("law_database", "India Code Legal Database", "https://www.indiacode.nic.in/", "free", "Legal and compliance references."),
    # https://www.mea.gov.in/indian-missions-abroad-new.htm
    "mfa_data": DataSourceRef("mfa_data", "Missions and Consulates", "https://www.mea.gov.in/indian-missions-abroad-new.htm", "free", "Embassy/consulate location references."),
    # https://www.india.gov.in/
    "district_admin_orders": DataSourceRef("district_admin_orders", "District Administration Orders", "https://www.india.gov.in/", "free", "Curfew and district-level directives."),
    # https://www.india.gov.in/
    "state_advisories": DataSourceRef("state_advisories", "State Advisories", "https://www.india.gov.in/", "free", "State-level safety and travel advisories."),

    # Tourism and rescue ecosystem
    # https://www.incredibleindia.org/
    "tourism_board": DataSourceRef("tourism_board", "Tourism Board Data", "https://www.incredibleindia.org/", "free", "Tourism infrastructure and service quality references."),
    # https://www.ndrf.gov.in/
    "ndrf_sdrf": DataSourceRef("ndrf_sdrf", "NDRF/SDRF", "https://www.ndrf.gov.in/", "free", "Rescue team locations and readiness."),
    "mountain_rescue": DataSourceRef("mountain_rescue", "Mountain Rescue Registries", "https://www.ndrf.gov.in/", "free", "Mountain rescue and high-risk terrain support."),
    "tourist_police": DataSourceRef("tourist_police", "Tourist Police Records", "https://assampolice.gov.in/", "free", "Tourist-specific safety assistance and complaints."),
    # https://trai.gov.in/ (forums are unstructured; represented as aggregated sources)
    "tourism_forums": DataSourceRef("tourism_forums", "Tourism Forum Signals", "https://www.tripadvisor.in/", "mixed", "Scraped/aggregated user reports where policy allows."),
    "tripadvisor_reviews": DataSourceRef("tripadvisor_reviews", "TripAdvisor/Reviews Sentiment", "https://www.tripadvisor.in/", "mixed", "Public review sentiment features."),
    "swachh_bharat": DataSourceRef("swachh_bharat", "Swachh Bharat Data", "https://sbmurban.org/", "free", "Cleanliness indicators for civic quality context."),

    # Transport agencies
    "pwd_roads": DataSourceRef("pwd_roads", "PWD Road Status", "https://www.india.gov.in/", "free", "Road and bridge condition datasets."),
    "traffic_police_data": DataSourceRef("traffic_police_data", "Traffic Police Accident Data", "https://morth.nic.in/", "free", "Accident hotspots and road safety records."),
    "state_transport": DataSourceRef("state_transport", "State Transport Schedules", "https://www.assamtransport.gov.in/", "free", "Public transit coverage and schedules."),
    "ride_hailing_apis": DataSourceRef("ride_hailing_apis", "Ride-hailing APIs", "https://developer.uber.com/", "paid", "Vehicle availability proxies where integrated."),

    # Intelligence and media
    "news_api": DataSourceRef("news_api", "News API", "https://newsapi.org/", "paid", "Local safety sentiment and incident mentions."),
    "social_media": DataSourceRef("social_media", "Social Media Signals", "https://developer.x.com/", "paid", "Crowd-sourced risk mentions and alerts."),
    "global_incident_db": DataSourceRef("global_incident_db", "Global Incident Databases", "https://www.unodc.org/", "free", "Cross-region incident trend references."),

    # Misc references used by derived features
    "astronomy_data": DataSourceRef("astronomy_data", "Astronomy Data", "https://aa.usno.navy.mil/data", "free", "Moon phase and visibility context."),
    "holiday_calendar": DataSourceRef("holiday_calendar", "Holiday Calendar API", "https://date.nager.at/", "free", "Holiday and special-date risk contexts."),
    "enforcement_reports": DataSourceRef("enforcement_reports", "Enforcement Reports", "https://www.ncb.gov.in/", "free", "Crime route and enforcement intensity references."),
    "payment_aggregators": DataSourceRef("payment_aggregators", "Payment Aggregator Data", "https://www.npci.org.in/", "mixed", "Digital payment acceptance proxies."),
    "wii_corridors": DataSourceRef("wii_corridors", "WII Elephant Corridor Maps", "https://wii.gov.in/", "free", "Elephant corridor and migration data."),
    "forest_dept": DataSourceRef("forest_dept", "Forest Department Data", "https://forest.assam.gov.in/", "free", "Protected areas, sightings, and wildlife alerts."),
    "excise_data": DataSourceRef("excise_data", "Excise Department Data", "https://excise.assam.gov.in/", "free", "Alcohol activity density and licensing context."),
    "event_calendars": DataSourceRef("event_calendars", "Event Calendar Sources", "https://www.incredibleindia.org/", "free", "Festival and crowd event metadata."),
    "municipal_cctv": DataSourceRef("municipal_cctv", "Municipal CCTV Registry", "https://www.india.gov.in/", "restricted", "CCTV location and coverage data where available."),
    "time_series_models": DataSourceRef("time_series_models", "Internal Time-series Forecast Models", "internal://forecasting", "internal", "Forecasted safety trend signals."),
    "cyber_advisories": DataSourceRef("cyber_advisories", "Cyber Safety Advisories", "https://www.cert-in.org.in/", "free", "Public cyber-risk advisories for unsafe public networks/scams."),
    "police_data": DataSourceRef("police_data", "Police Operational Data", "https://assampolice.gov.in/", "restricted", "Police station capability and deployment metadata."),

    # Internal platform signals
    "yatrax_backend": DataSourceRef("yatrax_backend", "YatraX Backend Data", "internal://backend", "internal", "Risk zones, incidents, SOS, pre-alerts, and user telemetry."),
}


# Registry-driven factor-source map for all taxonomy factors.
FEATURE_SOURCE_KEYS: dict[str, tuple[str, ...]] = factor_source_map()


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
