"""
Ingest and normalize all weather datasets.

Input:
    data/raw/weather/*.csv

Output:
    data/processed/weather_grid.parquet

Major improvements:
- metadata-driven city geocoding
- nonlinear weather severity model
- preserves extreme weather instead of averaging it away
- robust schema matching
- safer numeric parsing
- percentile-aware aggregation
- deterministic grid snapping
"""

from __future__ import annotations

import sys
from functools import lru_cache
from pathlib import Path

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------
# Repo bootstrap for standalone execution / Colab
# ---------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.config import get_settings
from processing.geo_grid import snap_dataframe

cfg = get_settings()

RAW_WEATHER = PROJECT_ROOT / "data" / "raw" / "weather"
PROCESSED_DIR = PROJECT_ROOT / cfg.data_processed_dir
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

SEASONS = {
    "winter": [12, 1, 2],
    "pre_monsoon": [3, 4, 5],
    "monsoon": [6, 7, 8, 9],
    "post_monsoon": [10, 11],
}


# ============================================================
# COLUMN MATCHING
# ============================================================

TEMP_COLS = [
    "temperature_celsius",
    "temp_c",
    "temperature",
    "tavg",
    "meantemp",
    "Temp_C",
    "temperature_2m",
]

HUMIDITY_COLS = [
    "humidity",
    "relative_humidity",
    "humidity_pct",
    "Humidity",
    "relative_humidity_2m",
]

WIND_COLS = [
    "wind_speed",
    "wind_kph",
    "wind_speed_kmph",
    "wspd",
    "Wind_Speed",
    "wind_speed_10m",
]

RAINFALL_COLS = [
    "precip_mm",
    "precipitation",
    "rainfall",
    "rain_mm",
    "Rainfall",
    "Precipitation",
    "rain",
]

VISIBILITY_COLS = [
    "visibility_km",
    "visibility",
    "vis",
    "Visibility",
]

UV_COLS = [
    "uv_index",
    "uv",
    "UV_Index",
]

PRESSURE_COLS = [
    "pressure_mb",
    "pressure",
    "sea_level_pressure",
    "pressure_msl",
]

LAT_COLS = [
    "latitude",
    "lat",
    "Latitude",
]

LON_COLS = [
    "longitude",
    "lon",
    "lng",
    "Longitude",
]

DATE_COLS = [
    "date",
    "datetime",
    "last_updated",
    "Date",
    "date_time",
]

CITY_COLS = [
    "location_name",
    "city",
    "station",
    "City",
    "city_name",
    "SUBDIVISION",
    "subdivision",
    "Sub_Division",
]


# ============================================================
# BASIC HELPERS
# ============================================================

def _normalize_text(value: object) -> str:
    return (
        str(value)
        .strip()
        .lower()
        .replace("&", " and ")
        .replace("_", " ")
        .replace("-", " ")
        .replace(".", " ")
    )


def _find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
    normalized = {
        _normalize_text(col): col
        for col in df.columns
    }

    for cand in candidates:
        key = _normalize_text(cand)
        if key in normalized:
            return normalized[key]

    for cand in candidates:
        cand_key = _normalize_text(cand)
        for norm_key, original_col in normalized.items():
            if cand_key in norm_key or norm_key in cand_key:
                return original_col

    return None


def _safe_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(
        series.astype(str)
        .str.replace(",", "", regex=False)
        .str.strip(),
        errors="coerce",
    )


def _safe_percentile(series: pd.Series, q: float) -> float:
    s = pd.to_numeric(series, errors="coerce").dropna()
    if s.empty:
        return np.nan
    return float(np.nanpercentile(s, q))


def _get_season(month: int) -> str:
    for season, months in SEASONS.items():
        if month in months:
            return season
    return "post_monsoon"


def _filename_to_city(file_path: Path) -> str:
    return (
        file_path.stem
        .replace("_", " ")
        .replace("-", " ")
        .strip()
        .lower()
    )


# ============================================================
# CITY LOOKUPS
# ============================================================

FALLBACK_CITY_COORDS = {
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
    "ranchi": (23.3441, 85.3096),
    "raipur": (21.2514, 81.6296),
    "bhubaneswar": (20.2961, 85.8245),
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
}


@lru_cache(maxsize=1)
def _build_city_lookup_from_metadata() -> dict[str, tuple[float, float]]:
    """
    Build city -> coordinates lookup from weather files that already
    contain coordinates.
    """
    lookup: dict[str, list[tuple[float, float]]] = {}

    for csv_path in RAW_WEATHER.glob("**/*.csv"):
        try:
            sample = pd.read_csv(csv_path, nrows=5, low_memory=False)

            city_col = _find_col(sample, CITY_COLS)
            lat_col = _find_col(sample, LAT_COLS)
            lon_col = _find_col(sample, LON_COLS)

            if not (city_col and lat_col and lon_col):
                continue

            meta = pd.read_csv(
                csv_path,
                usecols=[city_col, lat_col, lon_col],
                low_memory=False,
            )

            if meta.empty:
                continue

            meta[lat_col] = _safe_numeric(meta[lat_col])
            meta[lon_col] = _safe_numeric(meta[lon_col])

            meta = meta.dropna(subset=[city_col, lat_col, lon_col])

            if meta.empty:
                continue

            for _, row in meta.iterrows():

                city = _normalize_text(row[city_col])

                lat = float(row[lat_col])
                lon = float(row[lon_col])

                if 6 <= lat <= 37 and 68 <= lon <= 98:
                    lookup.setdefault(city, []).append((lat, lon))

        except Exception:
            continue

    final: dict[str, tuple[float, float]] = {}

    for city, coords in lookup.items():
        lats = [c[0] for c in coords]
        lons = [c[1] for c in coords]
        final[city] = (
            float(np.mean(lats)),
            float(np.mean(lons)),
        )

    print(f"  Built weather metadata lookup: {len(final)} cities")

    return final


def _geocode_cities(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill missing coordinates using metadata-derived lookup first,
    then fallback anchors.
    """
    if "city" not in df.columns:
        return df

    lookup = {
        **FALLBACK_CITY_COORDS,
        **_build_city_lookup_from_metadata(),
    }

    missing = df["latitude"].isna() | df["longitude"].isna()

    if not missing.any():
        return df

    matched = 0

    for idx in df[missing].index:

        city = _normalize_text(df.at[idx, "city"])

        coords = lookup.get(city)

        if coords is not None:
            df.at[idx, "latitude"] = coords[0]
            df.at[idx, "longitude"] = coords[1]
            matched += 1

    print(f"  Geocoded {matched}/{int(missing.sum())} weather rows")

    return df


# ============================================================
# WEATHER SEVERITY
# ============================================================

def _compute_weather_severity(df: pd.DataFrame) -> pd.Series:
    """
    Nonlinear weather danger model.
    Better represents cyclones, cloudbursts, heatwaves, etc.
    """
    rain = df["rainfall_mmph"].fillna(0)
    wind = df["wind_speed_kmph"].fillna(0)
    temp = df["temperature_c"].fillna(25)
    vis = df["visibility_km"].fillna(10)
    uv = df["uv_index"].fillna(3)

    # Rain grows nonlinearly
    rain_score = np.clip((rain / 150.0) ** 1.7, 0, 1) * 40

    # Cyclone / storm winds
    wind_score = np.clip((wind / 140.0) ** 1.8, 0, 1) * 30

    # Heatwaves
    heat_score = np.clip((temp - 38) / 10.0, 0, 1) * 15

    # Cold stress
    cold_score = np.clip((8 - temp) / 12.0, 0, 1) * 10

    # Fog / smog
    visibility_score = np.clip((10 - vis) / 10.0, 0, 1) * 15

    # UV stress
    uv_score = np.clip((uv - 8) / 6.0, 0, 1) * 5

    severity = (
        rain_score
        + wind_score
        + heat_score
        + cold_score
        + visibility_score
        + uv_score
    )

    return severity.clip(0, 100)


# ============================================================
# INGEST SINGLE FILE
# ============================================================

def ingest_weather_file(file_path: Path) -> pd.DataFrame | None:
    """
    Parse one weather CSV into normalized format.
    """
    try:
        df = pd.read_csv(file_path, low_memory=False)
    except Exception as exc:
        print(f"  Cannot read {file_path.name}: {exc}")
        return None

    if df.empty:
        return None

    result = pd.DataFrame(index=df.index)

    # --------------------------------------------------------
    # LOCATION
    # --------------------------------------------------------
    lat_col = _find_col(df, LAT_COLS)
    lon_col = _find_col(df, LON_COLS)
    city_col = _find_col(df, CITY_COLS)

    if lat_col and lon_col:
        result["latitude"] = _safe_numeric(df[lat_col])
        result["longitude"] = _safe_numeric(df[lon_col])
    else:
        result["latitude"] = np.nan
        result["longitude"] = np.nan

    if city_col:
        result["city"] = df[city_col].astype(str).map(_normalize_text)
    else:
        result["city"] = pd.Series(
            _filename_to_city(file_path),
            index=df.index,
        )

    # --------------------------------------------------------
    # DATE / TIME
    # --------------------------------------------------------
    date_col = _find_col(df, DATE_COLS)
    month_col = _find_col(df, ["month", "Month", "MONTH"])
    year_col = _find_col(df, ["year", "Year", "YEAR"])

    if date_col:
        dates = pd.to_datetime(df[date_col], errors="coerce")

        if dates.notna().mean() > 0.3:
            result["date"] = dates
            result["month"] = dates.dt.month
            result["hour"] = dates.dt.hour.fillna(12).astype("Int64")
            result["day_of_week"] = dates.dt.dayofweek
            result["year"] = dates.dt.year
        else:
            result["date"] = pd.NaT
            result["month"] = (
                _safe_numeric(df[month_col]).fillna(6)
                if month_col else 6
            )
            result["hour"] = 12
            result["day_of_week"] = 3
            result["year"] = (
                _safe_numeric(df[year_col])
                if year_col else np.nan
            )
    else:
        result["date"] = pd.NaT
        result["month"] = (
            _safe_numeric(df[month_col]).fillna(6)
            if month_col else 6
        )
        result["hour"] = 12
        result["day_of_week"] = 3
        result["year"] = (
            _safe_numeric(df[year_col])
            if year_col else np.nan
        )

    # --------------------------------------------------------
    # WEATHER FEATURES
    # --------------------------------------------------------
    mappings = [
        ("temperature_c", TEMP_COLS, -30, 55),
        ("humidity_pct", HUMIDITY_COLS, 0, 100),
        ("wind_speed_kmph", WIND_COLS, 0, 220),
        ("rainfall_mmph", RAINFALL_COLS, 0, 400),
        ("visibility_km", VISIBILITY_COLS, 0, 30),
        ("uv_index", UV_COLS, 0, 20),
    ]

    for out_col, candidates, min_v, max_v in mappings:

        col = _find_col(df, candidates)

        if col:
            result[out_col] = (
                _safe_numeric(df[col])
                .clip(min_v, max_v)
            )
        else:
            result[out_col] = np.nan

    pressure_col = _find_col(df, PRESSURE_COLS)

    if pressure_col:
        result["pressure_mb"] = _safe_numeric(df[pressure_col])
    else:
        result["pressure_mb"] = np.nan

    # --------------------------------------------------------
    # DERIVED FEATURES
    # --------------------------------------------------------
    result["weather_severity"] = _compute_weather_severity(result)

    result["season"] = result["month"].apply(
        lambda m: _get_season(int(m))
        if pd.notna(m)
        else "post_monsoon"
    )

    # Keep rows with at least one weather signal
    weather_cols = [
        "temperature_c",
        "humidity_pct",
        "wind_speed_kmph",
        "rainfall_mmph",
        "visibility_km",
    ]

    has_weather = result[weather_cols].notna().any(axis=1)
    result = result[has_weather].copy()

    result["source_file"] = file_path.name

    return result


# ============================================================
# GRID AGGREGATION
# ============================================================

def compute_weather_factors(weather_df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate weather observations into grid-level baseline factors.

    Important:
    - preserve extreme rainfall/wind events
    - avoid averaging away disasters
    """
    if weather_df.empty:
        return pd.DataFrame()

    geo = weather_df.dropna(subset=["latitude", "longitude"]).copy()

    if geo.empty:
        return pd.DataFrame()

    geo = snap_dataframe(
        geo,
        lat_col="latitude",
        lon_col="longitude",
    )

    def p75(s):
        return _safe_percentile(s, 75)

    def p90(s):
        return _safe_percentile(s, 90)

    grouped = (
        geo.groupby(["grid_lat", "grid_lon"], as_index=False)
        .agg(
            temperature_c=("temperature_c", "mean"),
            humidity_pct=("humidity_pct", "mean"),

            # Preserve strong storms / cyclones
            wind_speed_kmph=("wind_speed_kmph", "max"),
            rainfall_mmph=("rainfall_mmph", "max"),

            visibility_km=("visibility_km", "mean"),
            uv_index=("uv_index", "mean"),
            pressure_mb=("pressure_mb", "mean"),

            # Preserve dangerous weather peaks
            weather_severity=("weather_severity", "max"),

            # Distribution-aware summaries
            rainfall_p75=("rainfall_mmph", p75),
            rainfall_p90=("rainfall_mmph", p90),

            wind_p75=("wind_speed_kmph", p75),

            sample_count=("weather_severity", "size"),
        )
    )

    grouped["latitude"] = grouped["grid_lat"]
    grouped["longitude"] = grouped["grid_lon"]

    return grouped


# ============================================================
# MAIN ENTRY
# ============================================================

def ingest_all_weather() -> pd.DataFrame:
    csv_files = list(RAW_WEATHER.glob("**/*.csv"))

    print(f"Found {len(csv_files)} weather CSV files")

    all_frames: list[pd.DataFrame] = []

    for f in csv_files:

        df = ingest_weather_file(f)

        if df is not None and not df.empty:
            all_frames.append(df)
            print(f"  Parsed {f.name}: {len(df)} rows")

    if not all_frames:
        print("No weather data found!")
        return pd.DataFrame()

    combined = pd.concat(all_frames, ignore_index=True)

    print(f"Combined raw weather rows: {len(combined)}")

    # --------------------------------------------------------
    # GEOCODING
    # --------------------------------------------------------
    combined = _geocode_cities(combined)

    combined = combined.dropna(
        subset=["latitude", "longitude"]
    ).copy()

    coord_pct = (
        combined["latitude"].notna().mean() * 100
        if "latitude" in combined.columns
        else 0
    )

    print(f"Coordinate coverage: {coord_pct:.1f}%")

    if coord_pct < 50:
        print("  ⚠️ Weather coordinate coverage is low")

    # --------------------------------------------------------
    # FACTORS
    # --------------------------------------------------------
    factors = compute_weather_factors(combined)

    if factors.empty:
        print("No weather factors could be computed!")
        return pd.DataFrame()

    output_path = PROCESSED_DIR / "weather_grid.parquet"

    factors.to_parquet(output_path, index=False)

    print(f"Saved: {output_path} ({len(factors)} grid cells)")

    return factors


if __name__ == "__main__":
    ingest_all_weather()