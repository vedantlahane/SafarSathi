# path: model/factor_registry.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class FactorSpec:
    index: int
    key: str
    label: str
    category: str
    minimum: float
    maximum: float
    default: float
    source_keys: tuple[str, ...]
    aliases: tuple[str, ...] = ()


def _spec(
    index: int,
    key: str,
    label: str,
    category: str,
    minimum: float,
    maximum: float,
    default: float,
    source_keys: tuple[str, ...],
    aliases: tuple[str, ...] = (),
) -> FactorSpec:
    return FactorSpec(
        index=index,
        key=key,
        label=label,
        category=category,
        minimum=minimum,
        maximum=maximum,
        default=default,
        source_keys=source_keys,
        aliases=aliases,
    )


# Master taxonomy: 153 factors.
# Note: factor ids 128-131 are explicitly included to match the declared taxonomy total.
_FACTOR_ROWS: list[FactorSpec] = [
    # Category 1 - Geographic and Terrain (1-13)
    _spec(1, "elevation_m", "Elevation", "geographic_terrain", 0.0, 9000.0, 220.0, ("srtm", "google_elevation"), ("elevation",)),
    _spec(2, "slope_gradient_deg", "Slope/Gradient", "geographic_terrain", 0.0, 70.0, 6.0, ("srtm", "google_elevation"), ("slope_deg",)),
    _spec(3, "terrain_type_risk", "Terrain Type Risk", "geographic_terrain", 0.0, 100.0, 42.0, ("osm_overpass", "forest_survey_india")),
    _spec(4, "distance_to_nearest_road_km", "Distance to Road", "geographic_terrain", 0.0, 120.0, 0.5, ("osm_overpass", "google_routes"), ("distance_to_road_km",)),
    _spec(5, "distance_to_nearest_settlement_km", "Distance to Settlement", "geographic_terrain", 0.0, 150.0, 1.6, ("osm_overpass", "census_india"), ("distance_to_settlement_km",)),
    _spec(6, "flood_zone_proximity_km", "Flood Zone Proximity", "geographic_terrain", 0.0, 120.0, 9.0, ("cwc_flood", "ndma_alerts")),
    _spec(7, "landslide_prone_index", "Landslide Risk", "geographic_terrain", 0.0, 1.0, 0.16, ("gsi_geohazards",), ("landslide_risk_index",)),
    _spec(8, "earthquake_zone_risk", "Earthquake Zone Risk", "geographic_terrain", 0.0, 1.0, 0.82, ("seismic_zones",)),
    _spec(9, "river_waterbody_proximity_km", "River/Water Body Proximity", "geographic_terrain", 0.0, 120.0, 2.2, ("osm_overpass", "cwc_flood"), ("river_proximity_km",)),
    _spec(10, "river_current_season_risk", "River Current Seasonal Risk", "geographic_terrain", 0.0, 1.0, 0.28, ("cwc_flood", "ndma_alerts")),
    _spec(11, "vegetation_density_index", "Vegetation Density", "geographic_terrain", 0.0, 1.0, 0.42, ("forest_survey_india", "india_biodiversity"), ("vegetation_density",)),
    _spec(12, "trail_condition_score", "Trail Condition Score", "geographic_terrain", 0.0, 100.0, 58.0, ("osm_overpass", "tourism_board")),
    _spec(13, "border_proximity_km", "Border Proximity", "geographic_terrain", 0.0, 500.0, 95.0, ("survey_india", "mha_notifications")),

    # Category 2 - Weather and Climate (14-25)
    _spec(14, "current_temperature_c", "Current Temperature", "weather_climate", -30.0, 55.0, 28.0, ("imd_weather", "openweather"), ("temperature_c",)),
    _spec(15, "rainfall_intensity_mmph", "Rainfall Intensity", "weather_climate", 0.0, 180.0, 2.0, ("imd_weather", "openweather"), ("rainfall_mmph",)),
    _spec(16, "flood_warning_status", "Flood Warning Status", "weather_climate", 0.0, 1.0, 0.05, ("cwc_flood", "ndma_alerts")),
    _spec(17, "visibility_km", "Visibility", "weather_climate", 0.0, 30.0, 8.0, ("imd_weather", "openweather")),
    _spec(18, "wind_speed_kmph", "Wind Speed", "weather_climate", 0.0, 220.0, 12.0, ("imd_weather", "openweather")),
    _spec(19, "humidity_pct", "Humidity", "weather_climate", 0.0, 100.0, 60.0, ("imd_weather", "openweather")),
    _spec(20, "uv_index", "UV Index", "weather_climate", 0.0, 15.0, 5.0, ("openweather",)),
    _spec(21, "lightning_probability", "Lightning Probability", "weather_climate", 0.0, 1.0, 0.10, ("imd_weather", "openweather")),
    _spec(22, "cyclone_storm_risk", "Cyclone/Storm Risk", "weather_climate", 0.0, 1.0, 0.05, ("imd_weather", "ndma_alerts")),
    _spec(23, "seasonal_risk_profile", "Seasonal Risk Profile", "weather_climate", 0.0, 1.0, 0.22, ("imd_weather", "datetime_derived")),
    _spec(24, "minutes_to_sunset", "Sunset/Sunrise Context", "weather_climate", -900.0, 900.0, 180.0, ("sunrise_sunset", "device_gps", "datetime_derived")),
    _spec(25, "feels_like_temperature_c", "Feels-like Temperature", "weather_climate", -40.0, 65.0, 30.0, ("imd_weather", "openweather")),

    # Category 3 - Wildlife and Nature Hazards (26-34)
    _spec(26, "wildlife_sanctuary_proximity_km", "Wildlife Sanctuary Proximity", "wildlife_nature", 0.0, 200.0, 25.0, ("forest_dept", "india_biodiversity"), ("wildlife_sanctuary_distance_km",)),
    _spec(27, "elephant_corridor_proximity_km", "Elephant Corridor Proximity", "wildlife_nature", 0.0, 300.0, 45.0, ("wii_corridors", "forest_dept"), ("elephant_corridor_distance_km",)),
    _spec(28, "recent_animal_sighting_reports_7d", "Recent Animal Sightings", "wildlife_nature", 0.0, 300.0, 0.0, ("forest_dept", "news_api", "yatrax_backend"), ("recent_wildlife_reports_7d",)),
    _spec(29, "snake_density_season_index", "Snake Density Season Index", "wildlife_nature", 0.0, 1.0, 0.20, ("forest_dept", "idsp"), ("snake_activity_index",)),
    _spec(30, "insect_disease_vector_risk", "Insect/Disease Vector Risk", "wildlife_nature", 0.0, 1.0, 0.15, ("idsp", "nvbdcp", "who_alerts")),
    _spec(31, "poisonous_plant_density_index", "Poisonous Plant Density", "wildlife_nature", 0.0, 1.0, 0.08, ("india_biodiversity", "forest_dept")),
    _spec(32, "leech_season_index", "Leech Season Index", "wildlife_nature", 0.0, 1.0, 0.20, ("forest_dept", "datetime_derived")),
    _spec(33, "water_contamination_risk", "Water Contamination Risk", "wildlife_nature", 0.0, 1.0, 0.12, ("jal_shakti", "health_dept")),
    _spec(34, "animal_migration_risk", "Animal Migration Risk", "wildlife_nature", 0.0, 1.0, 0.10, ("forest_dept", "india_biodiversity")),

    # Category 4 - Infrastructure and Accessibility (35-49)
    _spec(35, "hospital_travel_time_min", "Distance/Time to Hospital", "infrastructure", 0.0, 600.0, 24.0, ("google_distance_matrix", "google_routes"), ("hospital_eta_min",)),
    _spec(36, "hospital_level_score", "Hospital Level Score", "infrastructure", 0.0, 100.0, 55.0, ("health_dept", "yatrax_backend")),
    _spec(37, "police_travel_time_min", "Distance/Time to Police", "infrastructure", 0.0, 600.0, 16.0, ("google_distance_matrix", "google_routes"), ("police_eta_min",)),
    _spec(38, "police_station_type_score", "Police Station Type Score", "infrastructure", 0.0, 100.0, 58.0, ("yatrax_backend", "police_data")),
    _spec(39, "road_quality_type_score", "Road Quality/Type Score", "infrastructure", 0.0, 100.0, 68.0, ("osm_overpass", "pwd_roads"), ("road_quality_score",)),
    _spec(40, "road_condition_score", "Road Condition Score", "infrastructure", 0.0, 100.0, 66.0, ("pwd_roads", "google_routes", "yatrax_backend")),
    _spec(41, "bridge_status_score", "Bridge Status Score", "infrastructure", 0.0, 100.0, 80.0, ("pwd_roads", "yatrax_backend")),
    _spec(42, "fuel_station_proximity_km", "Fuel Station Proximity", "infrastructure", 0.0, 200.0, 3.0, ("google_places", "osm_overpass")),
    _spec(43, "atm_bank_proximity_km", "ATM/Bank Proximity", "infrastructure", 0.0, 200.0, 2.0, ("google_places", "osm_overpass")),
    _spec(44, "public_restroom_availability_score", "Public Restroom Availability", "infrastructure", 0.0, 100.0, 52.0, ("google_places", "osm_overpass")),
    _spec(45, "street_lighting_score", "Street Lighting", "infrastructure", 0.0, 100.0, 55.0, ("viirs_night_lights", "osm_overpass")),
    _spec(46, "cctv_coverage_score", "CCTV Coverage", "infrastructure", 0.0, 100.0, 45.0, ("municipal_cctv", "yatrax_backend")),
    _spec(47, "shelter_availability_score", "Shelter Availability", "infrastructure", 0.0, 100.0, 62.0, ("osm_overpass", "google_places")),
    _spec(48, "helicopter_landing_access_score", "Helicopter Landing Accessibility", "infrastructure", 0.0, 100.0, 40.0, ("aviation_data", "srtm")),
    _spec(49, "ferry_boat_service_score", "Ferry/Boat Service Availability", "infrastructure", 0.0, 100.0, 50.0, ("inland_waterways", "google_places")),

    # Category 5 - Communication and Connectivity (50-56)
    _spec(50, "mobile_network_coverage_score", "Mobile Network Coverage", "communication", 0.0, 100.0, 70.0, ("trai", "device_network")),
    _spec(51, "network_type_score", "Network Type Availability", "communication", 0.0, 100.0, 82.0, ("device_network",), ("network_type",)),
    _spec(52, "multi_carrier_coverage_score", "Multiple Carrier Coverage", "communication", 0.0, 100.0, 62.0, ("trai", "device_network"), ("multi_carrier_coverage",)),
    _spec(53, "satellite_phone_necessity_risk", "Satellite Phone Necessity", "communication", 0.0, 100.0, 18.0, ("mha_notifications", "tourism_board")),
    _spec(54, "wifi_availability_score", "WiFi Availability", "communication", 0.0, 100.0, 38.0, ("google_places", "device_network")),
    _spec(55, "emergency_broadcast_reach_score", "Emergency Broadcast Reach", "communication", 0.0, 100.0, 58.0, ("ndma_alerts", "trai")),
    _spec(56, "last_known_signal_distance_km", "Last Known Signal Distance", "communication", 0.0, 300.0, 1.0, ("device_network", "device_gps")),

    # Category 6 - Human and Social Environment (57-72)
    _spec(57, "population_density_per_km2", "Population Density", "human_social", 0.0, 200000.0, 1200.0, ("census_india",)),
    _spec(58, "tourist_to_local_ratio", "Tourist-to-Local Ratio", "human_social", 0.0, 10.0, 0.30, ("tourism_board", "yatrax_backend")),
    _spec(59, "crime_rate_per_100k", "Crime Rate", "human_social", 0.0, 1500.0, 190.0, ("ncrb", "yatrax_backend")),
    _spec(60, "crime_type_distribution_risk", "Crime Type Distribution Risk", "human_social", 0.0, 1.0, 0.22, ("ncrb", "yatrax_backend")),
    _spec(61, "tourist_targeted_crime_history_index", "Tourist-Targeted Crime History", "human_social", 0.0, 1.0, 0.16, ("yatrax_backend", "police_data")),
    _spec(62, "scam_reports_30d", "Scam Reports", "human_social", 0.0, 300.0, 1.0, ("yatrax_backend", "tourism_forums")),
    _spec(63, "alcohol_activity_risk", "Alcohol Activity Risk", "human_social", 0.0, 1.0, 0.18, ("excise_data", "google_places")),
    _spec(64, "local_unrest_protest_level", "Local Unrest/Protest Level", "human_social", 0.0, 1.0, 0.05, ("news_api", "yatrax_backend"), ("local_unrest_level",)),
    _spec(65, "ethnic_tension_zone_risk", "Ethnic Tension Zone Risk", "human_social", 0.0, 1.0, 0.10, ("mha_notifications", "state_advisories")),
    _spec(66, "military_insurgent_activity_risk", "Military/Insurgent Activity Risk", "human_social", 0.0, 1.0, 0.08, ("mha_notifications", "state_advisories")),
    _spec(67, "gender_safety_index", "Gender Safety Index", "human_social", 0.0, 1.0, 0.65, ("ncrb", "yatrax_backend")),
    _spec(68, "solo_traveler_risk_modifier", "Solo Traveler Risk Modifier", "human_social", 0.0, 1.0, 0.25, ("yatrax_backend",)),
    _spec(69, "language_barrier_risk", "Local Language Barrier", "human_social", 0.0, 1.0, 0.20, ("tourism_board", "yatrax_backend")),
    _spec(70, "local_community_friendliness_score", "Community Friendliness", "human_social", 0.0, 100.0, 62.0, ("tourism_board", "tripadvisor_reviews")),
    _spec(71, "ongoing_event_crowd_risk", "Ongoing Event Crowd Risk", "human_social", 0.0, 1.0, 0.10, ("event_calendars", "yatrax_backend")),
    _spec(72, "drug_trafficking_route_proximity_risk", "Drug Trafficking Route Proximity", "human_social", 0.0, 1.0, 0.06, ("enforcement_reports", "mha_notifications")),

    # Category 7 - Health and Medical (73-82)
    _spec(73, "nearest_hospital_travel_time_min", "Nearest Hospital Travel Time", "health_medical", 0.0, 600.0, 24.0, ("google_distance_matrix", "google_routes")),
    _spec(74, "nearest_pharmacy_distance_km", "Nearest Pharmacy Distance", "health_medical", 0.0, 250.0, 1.8, ("google_places", "osm_overpass")),
    _spec(75, "ambulance_response_coverage_score", "Ambulance Response Coverage", "health_medical", 0.0, 100.0, 52.0, ("health_dept", "yatrax_backend"), ("ambulance_eta_min",)),
    _spec(76, "disease_outbreak_alert_level", "Disease Outbreak Alerts", "health_medical", 0.0, 1.0, 0.05, ("idsp", "who_alerts"), ("disease_outbreak_level",)),
    _spec(77, "malaria_endemic_zone_risk", "Malaria Endemic Zone", "health_medical", 0.0, 1.0, 0.12, ("nvbdcp",), ("malaria_zone",)),
    _spec(78, "water_safety_score", "Water Safety", "health_medical", 0.0, 100.0, 74.0, ("jal_shakti", "health_dept")),
    _spec(79, "altitude_sickness_risk", "Altitude Sickness Risk", "health_medical", 0.0, 1.0, 0.08, ("srtm", "google_elevation")),
    _spec(80, "anti_venom_availability_score", "Anti-venom Availability", "health_medical", 0.0, 100.0, 50.0, ("health_dept", "yatrax_backend")),
    _spec(81, "personal_health_condition_risk", "Personal Health Condition Risk", "health_medical", 0.0, 1.0, 0.10, ("yatrax_backend",)),
    _spec(82, "vaccination_status_protection_score", "Vaccination Status Protection", "health_medical", 0.0, 100.0, 55.0, ("yatrax_backend",)),

    # Category 8 - Time-based (83-91)
    _spec(83, "time_of_day_risk", "Time of Day", "time_based", 0.0, 1.0, 0.35, ("datetime_derived",)),
    _spec(84, "day_of_week_risk", "Day of Week", "time_based", 0.0, 1.0, 0.20, ("datetime_derived",)),
    _spec(85, "daylight_remaining_minutes", "Daylight Remaining", "time_based", -900.0, 900.0, 180.0, ("sunrise_sunset", "device_gps", "datetime_derived")),
    _spec(86, "moon_phase_visibility_score", "Moon Phase Visibility", "time_based", 0.0, 100.0, 60.0, ("astronomy_data", "datetime_derived")),
    _spec(87, "season_risk", "Season", "time_based", 0.0, 1.0, 0.25, ("datetime_derived", "imd_weather")),
    _spec(88, "duration_at_location_hours", "Duration at Location", "time_based", 0.0, 168.0, 1.5, ("yatrax_backend",)),
    _spec(89, "speed_of_movement_kmph", "Speed of Movement", "time_based", 0.0, 220.0, 8.0, ("device_gps", "yatrax_backend")),
    _spec(90, "time_since_last_checkin_hours", "Time Since Last Check-in", "time_based", 0.0, 240.0, 2.0, ("yatrax_backend",), ("hours_since_checkin",)),
    _spec(91, "holiday_special_date_risk", "Holiday/Special Date Risk", "time_based", 0.0, 1.0, 0.10, ("holiday_calendar", "event_calendars")),

    # Category 9 - Transportation Safety (92-99)
    _spec(92, "road_accident_hotspot_risk", "Road Accident Hotspot Risk", "transportation", 0.0, 1.0, 0.20, ("traffic_police_data", "yatrax_backend"), ("accident_hotspot_distance_km",)),
    _spec(93, "traffic_density_index", "Traffic Density", "transportation", 0.0, 1.0, 0.35, ("google_routes",)),
    _spec(94, "current_road_type_risk", "Current Road Type Risk", "transportation", 0.0, 1.0, 0.25, ("osm_overpass", "google_routes")),
    _spec(95, "mountain_hairpin_road_risk", "Hairpin/Mountain Road Risk", "transportation", 0.0, 1.0, 0.10, ("osm_overpass", "srtm")),
    _spec(96, "ferry_safety_risk", "Ferry Safety Risk", "transportation", 0.0, 1.0, 0.12, ("inland_waterways", "imd_weather")),
    _spec(97, "vehicle_type_availability_score", "Vehicle Type Availability", "transportation", 0.0, 100.0, 58.0, ("google_places", "ride_hailing_apis")),
    _spec(98, "public_transit_availability_score", "Public Transit Availability", "transportation", 0.0, 100.0, 52.0, ("google_routes", "state_transport")),
    _spec(99, "parking_stopping_safety_score", "Parking/Stopping Safety", "transportation", 0.0, 100.0, 62.0, ("osm_overpass", "yatrax_backend")),

    # Category 10 - Behavioral and Personal (100-111)
    _spec(100, "movement_pattern_anomaly_score", "Movement Pattern Anomaly", "behavioral_personal", 0.0, 1.0, 0.08, ("yatrax_backend", "device_gps")),
    _spec(101, "deviation_from_planned_route_km", "Deviation from Planned Route", "behavioral_personal", 0.0, 200.0, 0.6, ("yatrax_backend", "device_gps"), ("itinerary_deviation_km",)),
    _spec(102, "sudden_stop_after_movement_risk", "Sudden Stop After Movement", "behavioral_personal", 0.0, 1.0, 0.06, ("yatrax_backend", "device_gps")),
    _spec(103, "app_usage_pattern_change_risk", "App Usage Pattern Change", "behavioral_personal", 0.0, 1.0, 0.08, ("yatrax_backend",)),
    _spec(104, "phone_battery_level_pct", "Phone Battery Level", "behavioral_personal", 0.0, 100.0, 65.0, ("device_battery",), ("battery_pct",)),
    _spec(105, "group_size", "Group Size", "behavioral_personal", 1.0, 20.0, 2.0, ("yatrax_backend",)),
    _spec(106, "traveler_experience_level_score", "Traveler Experience Level", "behavioral_personal", 0.0, 100.0, 55.0, ("yatrax_backend",)),
    _spec(107, "physical_fitness_score", "Physical Fitness", "behavioral_personal", 0.0, 100.0, 58.0, ("yatrax_backend", "device_gps")),
    _spec(108, "preparation_level_score", "Preparation Level", "behavioral_personal", 0.0, 100.0, 52.0, ("yatrax_backend",)),
    _spec(109, "local_contact_availability_score", "Local Contact Availability", "behavioral_personal", 0.0, 100.0, 42.0, ("yatrax_backend",)),
    _spec(110, "document_status_score", "Document Status", "behavioral_personal", 0.0, 100.0, 70.0, ("yatrax_backend",)),
    _spec(111, "cash_payment_vulnerability_risk", "Cash/Payment Vulnerability", "behavioral_personal", 0.0, 1.0, 0.28, ("yatrax_backend", "google_places")),

    # Category 11 - Legal and Regulatory (112-119)
    _spec(112, "protected_restricted_area_status_risk", "Protected/Restricted Area Status", "legal_regulatory", 0.0, 1.0, 0.10, ("mha_notifications", "state_advisories")),
    _spec(113, "afspa_declared_area_risk", "AFSPA Declared Area Risk", "legal_regulatory", 0.0, 1.0, 0.10, ("mha_notifications",)),
    _spec(114, "curfew_status_risk", "Curfew Status", "legal_regulatory", 0.0, 1.0, 0.05, ("district_admin_orders", "news_api")),
    _spec(115, "photography_banned_area_risk", "Photography Banned Area Risk", "legal_regulatory", 0.0, 1.0, 0.08, ("mha_notifications", "state_advisories")),
    _spec(116, "foreigner_registration_requirement_risk", "Foreigner Registration Requirement", "legal_regulatory", 0.0, 1.0, 0.06, ("frro_requirements", "mha_notifications")),
    _spec(117, "local_laws_customs_awareness_score", "Local Laws/Customs Awareness", "legal_regulatory", 0.0, 100.0, 55.0, ("law_database", "tourism_board")),
    _spec(118, "national_park_entry_requirement_risk", "National Park Entry Requirement", "legal_regulatory", 0.0, 1.0, 0.08, ("forest_dept", "tourism_board")),
    _spec(119, "embassy_consulate_proximity_km", "Embassy/Consulate Proximity", "legal_regulatory", 0.0, 4000.0, 900.0, ("mfa_data", "google_places")),

    # Category 12 - Environmental Quality (120-125)
    _spec(120, "air_quality_index", "Air Quality Index", "environmental_quality", 0.0, 500.0, 75.0, ("google_air_quality", "cpcb"), ("aqi",)),
    _spec(121, "water_quality_nearby_score", "Water Quality Nearby", "environmental_quality", 0.0, 100.0, 62.0, ("jal_shakti", "health_dept")),
    _spec(122, "industrial_hazard_proximity_risk", "Industrial Hazard Proximity", "environmental_quality", 0.0, 1.0, 0.06, ("pollution_control_board", "osm_overpass")),
    _spec(123, "noise_level_proxy_risk", "Noise Level Proxy", "environmental_quality", 0.0, 1.0, 0.20, ("google_places", "yatrax_backend")),
    _spec(124, "active_fire_smoke_risk", "Active Fire/Smoke Risk", "environmental_quality", 0.0, 1.0, 0.03, ("nasa_firms", "forest_dept")),
    _spec(125, "soil_stability_risk", "Soil Stability Risk", "environmental_quality", 0.0, 1.0, 0.12, ("gsi_geohazards", "srtm")),

    # Category 13 - Digital and Cyber Safety (126-128)
    _spec(126, "public_wifi_safety_risk", "Public WiFi Safety", "digital_cyber", 0.0, 1.0, 0.20, ("device_network", "cyber_advisories")),
    _spec(127, "sim_scam_prevalence_risk", "SIM Scam Prevalence", "digital_cyber", 0.0, 1.0, 0.10, ("tourist_police", "yatrax_backend")),
    _spec(128, "digital_payment_acceptance_score", "Digital Payment Acceptance", "digital_cyber", 0.0, 100.0, 62.0, ("payment_aggregators", "google_places")),

    # Category 14 - Tourism Infrastructure (129-138)
    _spec(129, "tourist_police_presence_score", "Tourist Police Presence", "tourism_infrastructure", 0.0, 100.0, 48.0, ("tourist_police", "yatrax_backend")),
    _spec(130, "similar_event_global_incidents_risk", "Similar Event Global Incidents", "external_intelligence", 0.0, 1.0, 0.08, ("global_incident_db", "news_api")),
    _spec(131, "accommodation_safety_rating_score", "Accommodation Safety Rating", "tourism_infrastructure", 0.0, 100.0, 58.0, ("tourism_board", "tripadvisor_reviews")),
    _spec(132, "emergency_helpdesk_access_score", "Emergency Helpdesk Access", "tourism_infrastructure", 0.0, 100.0, 50.0, ("tourism_board", "yatrax_backend")),
    _spec(133, "signage_quality_score", "Signage Quality", "tourism_infrastructure", 0.0, 100.0, 55.0, ("tourism_board", "osm_overpass")),
    _spec(134, "rescue_team_proximity_km", "Rescue Team Proximity", "tourism_infrastructure", 0.0, 500.0, 40.0, ("ndrf_sdrf", "mountain_rescue")),
    _spec(135, "safety_equipment_availability_score", "Safety Equipment Availability", "tourism_infrastructure", 0.0, 100.0, 52.0, ("tourism_board", "yatrax_backend")),
    _spec(136, "tourist_review_sentiment_score", "Tourist Review Sentiment", "tourism_infrastructure", 0.0, 100.0, 64.0, ("tripadvisor_reviews", "google_places")),
    _spec(137, "visit_frequency_score", "Visit Frequency", "tourism_infrastructure", 0.0, 100.0, 55.0, ("tourism_board", "google_places")),
    _spec(138, "waste_cleanliness_index", "Waste/Cleanliness Index", "tourism_infrastructure", 0.0, 100.0, 58.0, ("swachh_bharat", "tripadvisor_reviews")),

    # Category 15 - Historical and Predictive Patterns (139-148)
    _spec(139, "incident_count_recent", "Incident Count", "historical_predictive", 0.0, 2000.0, 1.0, ("yatrax_backend",)),
    _spec(140, "incident_type_breakdown_risk", "Incident Type Breakdown", "historical_predictive", 0.0, 1.0, 0.20, ("yatrax_backend",)),
    _spec(141, "incident_trend_index", "Incident Trend", "historical_predictive", -1.0, 1.0, 0.0, ("yatrax_backend",)),
    _spec(142, "time_of_day_incident_distribution_risk", "Time-of-Day Incident Distribution", "historical_predictive", 0.0, 1.0, 0.18, ("yatrax_backend",)),
    _spec(143, "similar_location_incident_rate_risk", "Similar Location Incident Rate", "historical_predictive", 0.0, 1.0, 0.20, ("yatrax_backend", "global_incident_db")),
    _spec(144, "seasonal_incident_pattern_risk", "Seasonal Incident Pattern", "historical_predictive", 0.0, 1.0, 0.18, ("yatrax_backend", "datetime_derived")),
    _spec(145, "sos_trigger_frequency", "SOS Trigger Frequency", "historical_predictive", 0.0, 500.0, 0.0, ("yatrax_backend",), ("sos_triggers_30d",)),
    _spec(146, "prealert_frequency", "Pre-alert Frequency", "historical_predictive", 0.0, 500.0, 1.0, ("yatrax_backend",), ("prealerts_30d",)),
    _spec(147, "nearby_tourist_density_index", "Nearby Tourist Density", "historical_predictive", 0.0, 1.0, 0.35, ("yatrax_backend",)),
    _spec(148, "predicted_score_next_3h", "Predicted Score for Next Horizon", "historical_predictive", 0.0, 100.0, 60.0, ("yatrax_backend", "time_series_models")),

    # Category 16 - External Intelligence (149-153)
    _spec(149, "government_travel_advisory_level", "Government Travel Advisory Level", "external_intelligence", 0.0, 1.0, 0.08, ("mea_advisory",)),
    _spec(150, "ndma_disaster_alert_level", "NDMA Disaster Alerts", "external_intelligence", 0.0, 1.0, 0.05, ("ndma_alerts",), ("ndma_alert_level",)),
    _spec(151, "local_news_sentiment_risk", "Local News Sentiment Risk", "external_intelligence", 0.0, 1.0, 0.10, ("news_api",)),
    _spec(152, "social_media_risk_signals", "Social Media Risk Signals", "external_intelligence", 0.0, 1.0, 0.10, ("social_media",)),
    _spec(153, "community_safety_reports_index", "Community Safety Reports", "external_intelligence", 0.0, 1.0, 0.08, ("yatrax_backend",)),
]


FACTOR_SPECS: tuple[FactorSpec, ...] = tuple(_FACTOR_ROWS)
FACTOR_KEYS: tuple[str, ...] = tuple(spec.key for spec in FACTOR_SPECS)
FACTOR_BY_KEY: dict[str, FactorSpec] = {spec.key: spec for spec in FACTOR_SPECS}
FACTOR_ALIAS_TO_KEY: dict[str, str] = {
    alias: spec.key
    for spec in FACTOR_SPECS
    for alias in spec.aliases
}
TOTAL_FACTOR_COUNT = len(FACTOR_SPECS)


def _to_float(value: Any, default: float) -> float:
    if isinstance(value, bool):
        return 1.0 if value else 0.0
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "yes", "y", "on"}:
            return 1.0
        if lowered in {"false", "no", "n", "off"}:
            return 0.0
        try:
            return float(lowered)
        except ValueError:
            return default
    return default


def clamp_factor_value(key: str, value: Any) -> float:
    spec = FACTOR_BY_KEY[key]
    v = _to_float(value, spec.default)
    if v < spec.minimum:
        return spec.minimum
    if v > spec.maximum:
        return spec.maximum
    return v


def canonical_factor_key(key: str) -> str | None:
    if key in FACTOR_BY_KEY:
        return key
    return FACTOR_ALIAS_TO_KEY.get(key)


def factor_defaults() -> dict[str, float]:
    return {spec.key: spec.default for spec in FACTOR_SPECS}


def normalize_factor_map(raw_values: dict[str, Any] | None) -> dict[str, float]:
    values = factor_defaults()
    if not raw_values:
        return values

    for key, raw in raw_values.items():
        canonical = canonical_factor_key(str(key))
        if canonical is None:
            continue
        values[canonical] = clamp_factor_value(canonical, raw)

    return values


def factor_source_map() -> dict[str, tuple[str, ...]]:
    return {spec.key: spec.source_keys for spec in FACTOR_SPECS}


def factor_label_map() -> dict[str, str]:
    return {spec.key: spec.label for spec in FACTOR_SPECS}


def factor_category_map() -> dict[str, str]:
    return {spec.key: spec.category for spec in FACTOR_SPECS}
