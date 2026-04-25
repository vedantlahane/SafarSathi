"""
Ingest and normalize all weather datasets.

Input:  data/raw/weather/*.csv
Output: data/processed/weather_grid.parquet
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from config.settings import RAW_WEATHER, PROCESSED_DIR, SEASONS


# Column name mappings across different weather datasets
TEMP_COLS = ["temperature_celsius", "temp_c", "temperature", "tavg", "meantemp", "Temp_C"]
HUMIDITY_COLS = ["humidity", "relative_humidity", "humidity_pct", "Humidity"]
WIND_COLS = ["wind_speed", "wind_kph", "wind_speed_kmph", "wspd", "Wind_Speed"]
RAINFALL_COLS = ["precip_mm", "precipitation", "rainfall", "rain_mm", "Rainfall"]
VISIBILITY_COLS = ["visibility_km", "visibility", "vis", "Visibility"]
UV_COLS = ["uv_index", "uv", "UV_Index"]
PRESSURE_COLS = ["pressure_mb", "pressure", "sea_level_pressure"]
LAT_COLS = ["latitude", "lat", "Latitude"]
LON_COLS = ["longitude", "lon", "lng", "Longitude"]
DATE_COLS = ["date", "datetime", "last_updated", "Date", "date_time"]
CITY_COLS = ["location_name", "city", "station", "City", "city_name"]


def _find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for c in candidates:
        if c in df.columns:
            return c
    lower_map = {col.lower().strip(): col for col in df.columns}
    for c in candidates:
        if c.lower().strip() in lower_map:
            return lower_map[c.lower().strip()]
    return None


def _safe_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce")


def _get_season(month: int) -> str:
    for season, months in SEASONS.items():
        if month in months:
            return season
    return "post_monsoon"


def ingest_weather_file(file_path: Path) -> pd.DataFrame | None:
    """Parse a single weather CSV into normalized format."""
    try:
        df = pd.read_csv(file_path, low_memory=False)
    except Exception as e:
        print(f"  Cannot read {file_path.name}: {e}")
        return None

    if df.empty:
        return None

    result = pd.DataFrame()

    # Location
    lat_col = _find_col(df, LAT_COLS)
    lon_col = _find_col(df, LON_COLS)
    city_col = _find_col(df, CITY_COLS)

    if lat_col and lon_col:
        result["latitude"] = _safe_numeric(df[lat_col])
        result["longitude"] = _safe_numeric(df[lon_col])
    elif city_col:
        # Will need geocoding later — for now store city name
        result["city"] = df[city_col].astype(str).str.strip().str.lower()
        result["latitude"] = np.nan
        result["longitude"] = np.nan
    else:
        return None

    # Date and time
    date_col = _find_col(df, DATE_COLS)
    if date_col:
        dates = pd.to_datetime(df[date_col], errors="coerce")
        result["date"] = dates
        result["month"] = dates.dt.month
        result["hour"] = dates.dt.hour.fillna(12).astype(int)
        result["day_of_week"] = dates.dt.dayofweek
    else:
        result["date"] = pd.NaT
        result["month"] = 6  # default monsoon
        result["hour"] = 12
        result["day_of_week"] = 3

    # Weather features
    temp_col = _find_col(df, TEMP_COLS)
    if temp_col:
        result["temperature_c"] = _safe_numeric(df[temp_col]).clip(-30, 55)
    else:
        result["temperature_c"] = np.nan

    humidity_col = _find_col(df, HUMIDITY_COLS)
    if humidity_col:
        result["humidity_pct"] = _safe_numeric(df[humidity_col]).clip(0, 100)
    else:
        result["humidity_pct"] = np.nan

    wind_col = _find_col(df, WIND_COLS)
    if wind_col:
        result["wind_speed_kmph"] = _safe_numeric(df[wind_col]).clip(0, 220)
    else:
        result["wind_speed_kmph"] = np.nan

    rain_col = _find_col(df, RAINFALL_COLS)
    if rain_col:
        result["rainfall_mmph"] = _safe_numeric(df[rain_col]).clip(0, 180)
    else:
        result["rainfall_mmph"] = np.nan

    vis_col = _find_col(df, VISIBILITY_COLS)
    if vis_col:
        result["visibility_km"] = _safe_numeric(df[vis_col]).clip(0, 30)
    else:
        result["visibility_km"] = np.nan

    uv_col = _find_col(df, UV_COLS)
    if uv_col:
        result["uv_index"] = _safe_numeric(df[uv_col]).clip(0, 15)
    else:
        result["uv_index"] = np.nan

    pressure_col = _find_col(df, PRESSURE_COLS)
    if pressure_col:
        result["pressure_mb"] = _safe_numeric(df[pressure_col])
    else:
        result["pressure_mb"] = np.nan

    # Derived: weather severity composite
    result["weather_severity"] = _compute_weather_severity(result)

    # Derived: season
    result["season"] = result["month"].apply(
        lambda m: _get_season(int(m)) if pd.notna(m) else "post_monsoon"
    )

    # Drop rows with no location AND no weather data
    weather_cols = ["temperature_c", "humidity_pct", "wind_speed_kmph", "rainfall_mmph"]
    has_weather = result[weather_cols].notna().any(axis=1)
    result = result[has_weather].copy()

    result["source_file"] = file_path.name
    return result


def _compute_weather_severity(df: pd.DataFrame) -> pd.Series:
    """
    Composite weather severity score (0-100).
    Higher = more severe/dangerous weather.
    """
    severity = pd.Series(0.0, index=df.index)

    # Rainfall contribution (0-35 points)
    if "rainfall_mmph" in df.columns:
        severity += df["rainfall_mmph"].fillna(0).clip(0, 100) * 0.35

    # Wind contribution (0-25 points)
    if "wind_speed_kmph" in df.columns:
        severity += (df["wind_speed_kmph"].fillna(0).clip(0, 120) / 120.0) * 25.0

    # Low visibility contribution (0-20 points)
    if "visibility_km" in df.columns:
        vis = df["visibility_km"].fillna(10).clip(0.1, 20)
        severity += ((20.0 - vis) / 20.0) * 20.0

    # Extreme temperature contribution (0-20 points)
    if "temperature_c" in df.columns:
        temp = df["temperature_c"].fillna(25)
        # Both very hot (>42) and very cold (<5) are dangerous
        heat_stress = ((temp - 35).clip(lower=0) / 15.0) * 10.0
        cold_stress = ((5 - temp).clip(lower=0) / 15.0) * 10.0
        severity += heat_stress + cold_stress

    return severity.clip(0, 100)


def _geocode_cities(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill in lat/lon for rows that only have city names.
    Uses a pre-built city coordinate lookup.
    """
    # Major Indian city coordinates
    city_coords: dict[str, tuple[float, float]] = {
        "delhi": (28.6139, 77.2090),
        "new delhi": (28.6139, 77.2090),
        "mumbai": (19.0760, 72.8777),
        "bangalore": (12.9716, 77.5946),
        "bengaluru": (12.9716, 77.5946),
        "chennai": (13.0827, 80.2707),
        "kolkata": (22.5726, 88.3639),
        "hyderabad": (17.3850, 78.4867),
        "pune": (18.5204, 73.8567),
        "ahmedabad": (23.0225, 72.5714),
        "jaipur": (26.9124, 75.7873),
        "lucknow": (26.8467, 80.9462),
        "guwahati": (26.1445, 91.7362),
        "bhopal": (23.2599, 77.4126),
        "patna": (25.6093, 85.1376),
        "thiruvananthapuram": (8.5241, 76.9366),
        "chandigarh": (30.7333, 76.7794),
        "dehradun": (30.3165, 78.0322),
        "shimla": (31.1048, 77.1734),
        "srinagar": (34.0837, 74.7973),
        "imphal": (24.8170, 93.9368),
        "shillong": (25.5788, 91.8933),
        "gangtok": (27.3389, 88.6065),
        "agartala": (23.8315, 91.2868),
        "kohima": (25.6751, 94.1086),
        "aizawl": (23.7271, 92.7176),
        "itanagar": (27.0844, 93.6053),
        "ranchi": (23.3441, 85.3096),
        "raipur": (21.2514, 81.6296),
        "bhubaneswar": (20.2961, 85.8245),
        "panaji": (15.4909, 73.8278),
        "port blair": (11.6234, 92.7265),
        "coimbatore": (11.0168, 76.9558),
        "visakhapatnam": (17.6868, 83.2185),
        "nagpur": (21.1458, 79.0882),
        "indore": (22.7196, 75.8577),
        "varanasi": (25.3176, 83.0064),
        "amritsar": (31.6340, 74.8723),
        "kochi": (9.9312, 76.2673),
        "madurai": (9.9252, 78.1198),
        "jodhpur": (26.2389, 73.0243),
        "udaipur": (24.5854, 73.7125),
        "goa": (15.2993, 74.1240),
        "darjeeling": (27.0360, 88.2627),
        "manali": (32.2396, 77.1887),
        "rishikesh": (30.0869, 78.2676),
        "leh": (34.1526, 77.5771),
        "munnar": (10.0889, 77.0595),
    }

    if "city" not in df.columns:
        return df

    mask = df["latitude"].isna() & df["city"].notna()
    for idx in df[mask].index:
        city = str(df.at[idx, "city"]).lower().strip()
        if city in city_coords:
            df.at[idx, "latitude"] = city_coords[city][0]
            df.at[idx, "longitude"] = city_coords[city][1]

    return df


def ingest_all_weather() -> pd.DataFrame:
    """Main entry point: process all weather CSVs."""
    csv_files = list(RAW_WEATHER.glob("**/*.csv"))
    print(f"Found {len(csv_files)} weather CSV files")

    all_frames = []
    for f in csv_files:
        df = ingest_weather_file(f)
        if df is not None and not df.empty:
            all_frames.append(df)
            print(f"  Parsed {f.name}: {len(df)} rows")

    if not all_frames:
        print("No weather data found!")
        return pd.DataFrame()

    combined = pd.concat(all_frames, ignore_index=True)
    combined = _geocode_cities(combined)

    # Drop rows without coordinates
    combined = combined.dropna(subset=["latitude", "longitude"]).copy()

    print(f"Combined weather data: {len(combined)} rows with coordinates")

    output_path = PROCESSED_DIR / "weather_grid.parquet"
    combined.to_parquet(output_path, index=False)
    print(f"Saved: {output_path}")

    return combined


if __name__ == "__main__":
    ingest_all_weather()