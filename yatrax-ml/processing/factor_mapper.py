"""
Map raw processed data columns to the 153 YatraX safety factors.

This is the bridge between "what the data gives us" and
"what the safety model expects."

Each factor has:
- A canonical name
- Expected range
- Which processed data source provides it
- A fallback default value
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass
class FactorDefinition:
    name: str
    category: str
    source_file: str          # which processed parquet
    source_column: str        # column name in that file
    min_val: float
    max_val: float
    default_val: float
    description: str
    weight_in_score: float    # how much this matters (0-1)


# Master factor registry — every factor the model uses
FACTOR_DEFINITIONS: list[FactorDefinition] = [
    # ─── WEATHER & CLIMATE ───
    FactorDefinition("temperature_c", "weather", "weather_grid.parquet", "temperature_c",
                     -20, 55, 28.0, "Current temperature in Celsius", 0.03),
    FactorDefinition("humidity_pct", "weather", "weather_grid.parquet", "humidity_pct",
                     0, 100, 60.0, "Relative humidity percentage", 0.02),
    FactorDefinition("rainfall_mmph", "weather", "weather_grid.parquet", "rainfall_mmph",
                     0, 150, 2.0, "Rainfall intensity mm per hour", 0.06),
    FactorDefinition("wind_speed_kmph", "weather", "weather_grid.parquet", "wind_speed_kmph",
                     0, 200, 12.0, "Wind speed km/h", 0.03),
    FactorDefinition("visibility_km", "weather", "weather_grid.parquet", "visibility_km",
                     0, 30, 8.0, "Visibility in km", 0.04),
    FactorDefinition("uv_index", "weather", "weather_grid.parquet", "uv_index",
                     0, 15, 5.0, "UV radiation index", 0.01),
    FactorDefinition("weather_severity", "weather", "weather_grid.parquet", "weather_severity",
                     0, 100, 20.0, "Composite weather danger score", 0.05),

    # ─── AIR QUALITY ───
    FactorDefinition("aqi", "environment", "aqi_grid.parquet", "aqi",
                     0, 500, 75.0, "Air Quality Index", 0.03),
    FactorDefinition("pm25", "environment", "aqi_grid.parquet", "pm25",
                     0, 500, 40.0, "PM2.5 concentration", 0.02),

    # ─── WATER QUALITY ───
    FactorDefinition("water_safety_score", "environment", "water_quality_grid.parquet", "water_safety_score",
                     0, 100, 70.0, "Water safety score 0-100", 0.02),
    FactorDefinition("water_contamination_risk", "environment", "water_quality_grid.parquet", "water_contamination_risk",
                     0, 1, 0.15, "Water contamination risk 0-1", 0.02),

    # ─── CRIME ───
    FactorDefinition("crime_rate_per_100k", "crime", "crime_grid.parquet", "crime_rate_per_100k",
                     0, 1500, 190.0, "Total IPC crimes per 100k population", 0.08),
    FactorDefinition("crime_type_distribution_risk", "crime", "crime_grid.parquet", "crime_type_distribution_risk",
                     0, 1, 0.22, "Ratio of violent crimes to total", 0.04),
    FactorDefinition("gender_safety_index", "crime", "crime_grid.parquet", "gender_safety_index",
                     0, 1, 0.65, "Gender safety index (1=safest)", 0.03),
    FactorDefinition("tourist_targeted_crime_index", "crime", "crime_grid.parquet", "tourist_targeted_crime_index",
                     0, 1, 0.16, "Robbery+theft ratio", 0.03),

    # ─── ROAD ACCIDENTS ───
    FactorDefinition("road_accident_hotspot_risk", "transport", "accident_grid.parquet", "road_accident_hotspot_risk",
                     0, 1, 0.20, "Accident hotspot risk 0-1", 0.05),
    FactorDefinition("accident_severity_index", "transport", "accident_grid.parquet", "accident_severity_index",
                     0, 1, 0.40, "Average accident severity 0-1", 0.03),
    FactorDefinition("fatality_rate", "transport", "accident_grid.parquet", "fatality_rate",
                     0, 1, 0.10, "Deaths per accident", 0.03),

    # ─── DISASTERS ───
    FactorDefinition("flood_risk", "disaster", "disaster_grid.parquet", "flood_risk",
                     0, 1, 0.10, "Historical flood risk index", 0.05),
    FactorDefinition("earthquake_risk", "disaster", "disaster_grid.parquet", "earthquake_risk",
                     0, 1, 0.20, "Historical earthquake risk index", 0.04),
    FactorDefinition("cyclone_risk", "disaster", "disaster_grid.parquet", "cyclone_risk",
                     0, 1, 0.05, "Historical cyclone risk index", 0.03),
    FactorDefinition("landslide_risk", "disaster", "disaster_grid.parquet", "landslide_risk",
                     0, 1, 0.08, "Historical landslide risk index", 0.03),

    # ─── TERRAIN ───
    FactorDefinition("elevation_m", "terrain", "terrain_grid.parquet", "elevation_m",
                     -50, 9000, 200.0, "Elevation in meters", 0.02),
    FactorDefinition("slope_deg", "terrain", "terrain_grid.parquet", "slope_deg",
                     0, 90, 5.0, "Terrain slope in degrees", 0.02),
    FactorDefinition("landslide_prone_index", "terrain", "terrain_grid.parquet", "landslide_prone_index",
                     0, 1, 0.05, "Landslide susceptibility", 0.03),
    FactorDefinition("terrain_difficulty_score", "terrain", "terrain_grid.parquet", "terrain_difficulty_score",
                     0, 1, 0.15, "Composite terrain difficulty", 0.03),
    FactorDefinition("altitude_sickness_risk", "terrain", "terrain_grid.parquet", "altitude_sickness_risk",
                     0, 1, 0.0, "Altitude sickness risk", 0.02),

    # ─── HEALTH INFRASTRUCTURE ───
    FactorDefinition("hospital_level_score", "health", "health_grid.parquet", "hospital_level_score",
                     0, 100, 50.0, "Average hospital capability score", 0.04),
    FactorDefinition("emergency_availability_score", "health", "health_grid.parquet", "emergency_availability_score",
                     0, 100, 40.0, "Emergency department availability", 0.03),
    FactorDefinition("ambulance_response_score", "health", "health_grid.parquet", "ambulance_response_score",
                     0, 100, 35.0, "Ambulance response coverage", 0.03),
    FactorDefinition("nearest_hospital_proxy_km", "health", "health_grid.parquet", "nearest_hospital_proxy_km",
                     0, 200, 25.0, "Estimated distance to nearest hospital", 0.04),

    # ─── FIRE ───
    FactorDefinition("fire_risk_index", "disaster", "fire_grid.parquet", "fire_risk_index",
                     0, 1, 0.05, "Historical fire risk index", 0.02),
    FactorDefinition("fire_intensity_score", "disaster", "fire_grid.parquet", "fire_intensity_score",
                     0, 1, 0.03, "Average fire intensity", 0.01),

    # ─── POPULATION ───
    FactorDefinition("population_density_per_km2", "social", "population_grid.parquet", "population_density_per_km2",
                     0, 50000, 400.0, "People per sq km", 0.02),
    FactorDefinition("isolation_score", "social", "population_grid.parquet", "isolation_score",
                     0, 1, 0.3, "How isolated the area is (1=very)", 0.03),

    # ─── NOISE ───
    FactorDefinition("noise_level_proxy", "environment", "noise_grid.parquet", "noise_level_proxy",
                     0, 1, 0.20, "Noise violation level", 0.01),

    # ─── TOURISM ───
    FactorDefinition("nearby_tourist_density_index", "tourism", "tourism_grid.parquet", "nearby_tourist_density_index",
                     0, 1, 0.0, "Tourist spot density", 0.01),
    FactorDefinition("tourism_infrastructure_proxy", "tourism", "tourism_grid.parquet", "tourism_infrastructure_proxy",
                     0, 1, 0.5, "Tourism infrastructure quality proxy", 0.01),
]


def get_factor_names() -> list[str]:
    """Return all factor names in order."""
    return [f.name for f in FACTOR_DEFINITIONS]


def get_factor_defaults() -> dict[str, float]:
    """Return default values for all factors."""
    return {f.name: f.default_val for f in FACTOR_DEFINITIONS}


def get_factor_ranges() -> dict[str, tuple[float, float]]:
    """Return (min, max) for each factor."""
    return {f.name: (f.min_val, f.max_val) for f in FACTOR_DEFINITIONS}


def get_factors_by_category() -> dict[str, list[str]]:
    """Group factor names by category."""
    cats: dict[str, list[str]] = {}
    for f in FACTOR_DEFINITIONS:
        cats.setdefault(f.category, []).append(f.name)
    return cats


def validate_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Validate and clip feature values to expected ranges.
    Fill missing values with defaults.
    """
    result = df.copy()

    for factor in FACTOR_DEFINITIONS:
        col = factor.name
        if col in result.columns:
            result[col] = pd.to_numeric(result[col], errors="coerce")
            result[col] = result[col].fillna(factor.default_val)
            result[col] = result[col].clip(factor.min_val, factor.max_val)
        else:
            result[col] = factor.default_val

    return result


def map_unified_grid_to_factors(unified_grid: pd.DataFrame) -> pd.DataFrame:
    """
    Map columns from the unified grid to canonical factor names.

    Some columns already match. Others need renaming.
    Missing columns get default values.
    """
    result = unified_grid.copy()

    for factor in FACTOR_DEFINITIONS:
        if factor.name in result.columns:
            continue  # already present

        if factor.source_column in result.columns and factor.source_column != factor.name:
            result[factor.name] = result[factor.source_column]
        else:
            result[factor.name] = factor.default_val

    return validate_features(result)