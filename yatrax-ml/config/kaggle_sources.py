"""
Registry of all Kaggle datasets used for training.
Run download_all.py to fetch everything.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class KaggleDataset:
    slug: str                   # kaggle dataset slug
    target_dir: str             # subdirectory under data/raw/
    description: str
    factors_covered: list[str]  # which factor categories this feeds


KAGGLE_DATASETS: list[KaggleDataset] = [
    # ─── CRIME (Category 6) ───
    KaggleDataset(
        slug="rajanand/crime-in-india",
        target_dir="crime",
        description="NCRB crime data 2001+, 40+ factors, 75+ CSVs",
        factors_covered=["crime_rate_per_100k", "crime_type_distribution_risk"],
    ),
    KaggleDataset(
        slug="nehaprabhavalkar/crime-in-india",
        target_dir="crime",
        description="Multi-year NCRB crime data",
        factors_covered=["crime_rate_per_100k"],
    ),
    KaggleDataset(
        slug="ananya0001/crimes-against-women-in-india-2022",
        target_dir="crime",
        description="Gender safety proxy — crimes against women",
        factors_covered=["gender_safety_index"],
    ),

    # ─── WEATHER (Category 2) ───
    KaggleDataset(
        slug="nelgiriyewithana/indian-weather-repository-daily-snapshot",
        target_dir="weather",
        description="Live-updating daily weather across Indian cities",
        factors_covered=[
            "current_temperature_c", "rainfall_intensity_mmph", "visibility_km",
            "wind_speed_kmph", "humidity_pct", "uv_index",
        ],
    ),
    KaggleDataset(
        slug="mukeshdevrath007/indian-5000-cities-weather-data",
        target_dir="weather",
        description="5000+ Indian cities weather 2010-2024",
        factors_covered=[
            "current_temperature_c", "humidity_pct", "wind_speed_kmph", "visibility_km",
        ],
    ),
    KaggleDataset(
        slug="vijayveersingh/indias-rainfall-data",
        target_dir="weather",
        description="State/district rainfall data",
        factors_covered=["rainfall_intensity_mmph", "flood_warning_status"],
    ),

    # ─── AIR QUALITY (Category 12) ───
    KaggleDataset(
        slug="ankushpanday1/air-quality-data-in-india-2015-2024",
        target_dir="air_quality",
        description="9 years CPCB station AQI data",
        factors_covered=["air_quality_index"],
    ),
    KaggleDataset(
        slug="rohanrao/air-quality-data-in-india",
        target_dir="air_quality",
        description="CPCB station-level AQI 2015-2020",
        factors_covered=["air_quality_index"],
    ),

    # ─── WATER QUALITY (Category 12) ───
    KaggleDataset(
        slug="anbarivan/indian-water-quality-data",
        target_dir="water_quality",
        description="Water pollution levels across India",
        factors_covered=["water_safety_score", "water_quality_nearby_score"],
    ),
    KaggleDataset(
        slug="balabaskar/water-quality-data-india",
        target_dir="water_quality",
        description="Lakes, ponds, tanks, wetlands quality",
        factors_covered=["water_safety_score", "water_contamination_risk"],
    ),

    # ─── ROAD ACCIDENTS (Category 9) ───
    KaggleDataset(
        slug="khushikyad001/india-road-accident-dataset-predictive-analysis",
        target_dir="road_accidents",
        description="ML-ready accident prediction data",
        factors_covered=["road_accident_hotspot_risk", "traffic_density_index"],
    ),
    KaggleDataset(
        slug="s3programmer/road-accident-severity-in-india",
        target_dir="road_accidents",
        description="Accident severity classification data",
        factors_covered=["road_accident_hotspot_risk"],
    ),

    # ─── DISASTERS (Category 15-16) ───
    KaggleDataset(
        slug="s3programmer/flood-risk-in-india",
        target_dir="disasters",
        description="Flood risk zones and factors",
        factors_covered=["flood_zone_proximity_km", "flood_warning_status"],
    ),
    KaggleDataset(
        slug="aditya2803/india-floods-inventory",
        target_dir="disasters",
        description="Geolocated flood events across India",
        factors_covered=["flood_zone_proximity_km", "river_current_season_risk"],
    ),
    KaggleDataset(
        slug="parulpandey/indian-earthquakes-dataset2018-onwards",
        target_dir="disasters",
        description="Geolocated earthquake events",
        factors_covered=["earthquake_zone_risk"],
    ),
    KaggleDataset(
        slug="victoraesthete/indian-disaster-dataset",
        target_dir="disasters",
        description="Multi-hazard disaster records",
        factors_covered=["ndma_disaster_alert_level", "cyclone_storm_risk"],
    ),

    # ─── TERRAIN (Category 1) ───
    KaggleDataset(
        slug="jaisreenivasan/elevation-of-indian-districts",
        target_dir="terrain",
        description="District-wise elevation data",
        factors_covered=["elevation_m"],
    ),
    KaggleDataset(
        slug="kkhandekar/lanslide-recent-incidents-india",
        target_dir="terrain",
        description="Landslide incidents 2016-2020",
        factors_covered=["landslide_prone_index"],
    ),
    KaggleDataset(
        slug="nehaprabhavalkar/india-gis-data",
        target_dir="terrain",
        description="GIS shapefiles for India",
        factors_covered=["border_proximity_km"],
    ),

    # ─── HEALTH (Category 7) ───
    KaggleDataset(
        slug="fringewidth/hospitals-in-india",
        target_dir="health",
        description="Hospital locations across India",
        factors_covered=["hospital_travel_time_min", "hospital_level_score"],
    ),
    KaggleDataset(
        slug="webaccess/india-primary-health-care-data",
        target_dir="health",
        description="Primary health center locations and capacity",
        factors_covered=["ambulance_response_coverage_score"],
    ),

    # ─── POPULATION (Category 6) ───
    KaggleDataset(
        slug="sirpunch/indian-census-data-with-geospatial-indexing",
        target_dir="population",
        description="Census with lat/lon indexing",
        factors_covered=["population_density_per_km2"],
    ),
    KaggleDataset(
        slug="webaccess/all-census-data",
        target_dir="population",
        description="District-level census data",
        factors_covered=["population_density_per_km2"],
    ),

    # ─── FIRE (Category 3/12) ───
    KaggleDataset(
        slug="sherkhan15/indian-wildfire-nasa-dataset-8-years",
        target_dir="fire",
        description="NASA satellite fire data 2012-2020",
        factors_covered=["active_fire_smoke_risk"],
    ),

    # ─── NOISE (Category 12) ───
    KaggleDataset(
        slug="rohanrao/noise-monitoring-data-in-india",
        target_dir="noise",
        description="Decibel readings across Indian cities",
        factors_covered=["noise_level_proxy_risk"],
    ),

    # ─── TOURISM (Category 14) ───
    KaggleDataset(
        slug="kumarperiya/explore-india-a-tourist-destination-dataset",
        target_dir="tourism",
        description="Tourist destination metadata",
        factors_covered=["nearby_tourist_density_index", "visit_frequency_score"],
    ),
]