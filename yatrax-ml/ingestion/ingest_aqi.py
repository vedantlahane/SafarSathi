"""
Ingest air quality datasets.

Input:  data/raw/air_quality/*.csv
Output: data/processed/aqi_grid.parquet

Improvements:
- metadata-driven city geocoding
- no coarse station-prefix coordinate hallucination
- pollutant-derived AQI fallback
- robust spatial aggregation with percentile-based summaries
- deterministic 0.1° grid snapping
- safer numeric parsing
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

RAW_AQI = PROJECT_ROOT / "data" / "raw" / "air_quality"
PROCESSED_DIR = PROJECT_ROOT / cfg.data_processed_dir
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


AQI_COLS = ["aqi", "AQI", "air_quality_index", "AQI_Value"]
PM25_COLS = ["pm2.5", "PM2.5", "pm25", "PM25"]
PM10_COLS = ["pm10", "PM10"]
NO2_COLS = ["no2", "NO2"]
SO2_COLS = ["so2", "SO2"]
CO_COLS = ["co", "CO"]
O3_COLS = ["ozone", "o3", "O3"]
DATE_COLS = ["date", "Date", "datetime", "Datetime", "sampling_date"]
CITY_COLS = ["city", "City", "station", "StationId", "location", "location_name"]
STATE_COLS = ["state", "State"]
LAT_COLS = ["latitude", "lat", "Latitude"]
LON_COLS = ["longitude", "lon", "lng", "Longitude"]


# A compact set of reliable, high-frequency Indian city anchors.
# Real metadata lookup from raw files takes priority over these.
AQI_CITY_COORDS = {
    "agra": (27.1767, 78.0081),
    "ahmedabad": (23.0225, 72.5714),
    "amritsar": (31.6340, 74.8723),
    "bangalore": (12.9716, 77.5946),
    "bengaluru": (12.9716, 77.5946),
    "bhopal": (23.2599, 77.4126),
    "bhubaneswar": (20.2961, 85.8245),
    "chandigarh": (30.7333, 76.7794),
    "chennai": (13.0827, 80.2707),
    "coimbatore": (11.0168, 76.9558),
    "delhi": (28.6139, 77.2090),
    "faridabad": (28.4089, 77.3178),
    "ghaziabad": (28.6692, 77.4538),
    "gurgaon": (28.4595, 77.0266),
    "gurugram": (28.4595, 77.0266),
    "guwahati": (26.1445, 91.7362),
    "hyderabad": (17.3850, 78.4867),
    "indore": (22.7196, 75.8577),
    "jaipur": (26.9124, 75.7873),
    "jodhpur": (26.2389, 73.0243),
    "kanpur": (26.4499, 80.3319),
    "kochi": (9.9312, 76.2673),
    "kolkata": (22.5726, 88.3639),
    "lucknow": (26.8467, 80.9462),
    "ludhiana": (30.9010, 75.8573),
    "mumbai": (19.0760, 72.8777),
    "mysore": (12.2958, 76.6394),
    "mysuru": (12.2958, 76.6394),
    "nagpur": (21.1458, 79.0882),
    "navi mumbai": (19.0330, 73.0297),
    "noida": (28.5355, 77.3910),
    "patna": (25.6093, 85.1376),
    "pune": (18.5204, 73.8567),
    "rajkot": (22.3039, 70.8022),
    "ranchi": (23.3441, 85.3096),
    "surat": (21.1702, 72.8311),
    "thiruvananthapuram": (8.5241, 76.9366),
    "trivandrum": (8.5241, 76.9366),
    "udaipur": (24.5854, 73.7125),
    "varanasi": (25.3176, 83.0064),
    "visakhapatnam": (17.6868, 83.2185),
    "vijayawada": (16.5062, 80.6480),
}


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
    normalized = {_normalize_text(col): col for col in df.columns}

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


def _lookup_city_coords(name: str) -> tuple[float, float] | None:
    text = _normalize_text(name)
    if text in {"", "nan", "none", "null"}:
        return None

    if text in AQI_CITY_COORDS:
        return AQI_CITY_COORDS[text]

    # Gentle substring matching for station/city variants.
    for city, coords in AQI_CITY_COORDS.items():
        if city in text or (len(text) >= 4 and text in city):
            return coords

    return None


@lru_cache(maxsize=1)
def _build_city_lookup_from_metadata() -> dict[str, tuple[float, float]]:
    """
    Build a city/station -> coordinates lookup from raw AQI files that already
    contain lat/lon. This is preferred over any coarse fallback mapping.
    """
    lookup: dict[str, list[tuple[float, float]]] = {}

    for csv_path in RAW_AQI.glob("**/*.csv"):
        try:
            sample = pd.read_csv(csv_path, nrows=3, low_memory=False)
            city_col = _find_col(sample, CITY_COLS)
            lat_col = _find_col(sample, LAT_COLS)
            lon_col = _find_col(sample, LON_COLS)

            if not (city_col and lat_col and lon_col):
                continue

            meta = pd.read_csv(csv_path, usecols=[city_col, lat_col, lon_col], low_memory=False)
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
                if 6.0 <= lat <= 37.5 and 68.0 <= lon <= 98.5:
                    lookup.setdefault(city, []).append((lat, lon))
        except Exception:
            continue

    final: dict[str, tuple[float, float]] = {}
    for city, coords in lookup.items():
        lats = [c[0] for c in coords]
        lons = [c[1] for c in coords]
        final[city] = (float(np.mean(lats)), float(np.mean(lons)))

    if final:
        print(f"  Built city lookup from metadata: {len(final)} cities")

    return final


def _assign_spatial_fallbacks(result: pd.DataFrame) -> pd.DataFrame:
    """
    Fill missing lat/lon using metadata-derived city lookups first,
    then compact major-city anchors.
    """
    if "latitude" not in result.columns:
        result["latitude"] = np.nan
    if "longitude" not in result.columns:
        result["longitude"] = np.nan

    if "city" not in result.columns:
        return result

    meta_lookup = _build_city_lookup_from_metadata()
    fallback_lookup = {**AQI_CITY_COORDS, **meta_lookup}

    missing = result["latitude"].isna() | result["longitude"].isna()
    if not missing.any():
        return result

    matched = 0
    for idx in result[missing].index:
        city = _normalize_text(result.at[idx, "city"])
        coords = fallback_lookup.get(city)
        if coords is None:
            coords = _lookup_city_coords(city)

        if coords is not None:
            result.at[idx, "latitude"] = coords[0]
            result.at[idx, "longitude"] = coords[1]
            matched += 1

    if missing.any():
        print(f"  Geocoded {matched}/{int(missing.sum())} AQI rows from city metadata / anchors")

    return result


def _aqi_subindex(values: pd.Series, breakpoints: list[tuple[float, float, float, float]]) -> pd.Series:
    """
    Convert pollutant values to AQI-like subindices via piecewise linear breakpoints.
    Each breakpoint tuple is (low_conc, high_conc, low_aqi, high_aqi).
    """
    x = pd.to_numeric(values, errors="coerce")
    out = pd.Series(np.nan, index=x.index, dtype=float)

    for low_c, high_c, low_a, high_a in breakpoints:
        if np.isinf(high_c):
            mask = x > low_c
            out.loc[mask] = low_a + (x.loc[mask] - low_c) * (high_a - low_a) / max(1e-9, (high_c - low_c if np.isfinite(high_c) else max(1.0, x.loc[mask].max() - low_c)))
        else:
            mask = (x > low_c) & (x <= high_c)
            out.loc[mask] = low_a + (x.loc[mask] - low_c) * (high_a - low_a) / max(1e-9, (high_c - low_c))

    # Values below the first breakpoint
    first_low_c, _, first_low_a, first_high_a = breakpoints[0]
    out.loc[x <= first_low_c] = first_low_a + (x.loc[x <= first_low_c] / max(1e-9, first_low_c)) * (first_high_a - first_low_a)

    return out.clip(0, 500)


def _compute_aqi_from_pollutants(df: pd.DataFrame) -> pd.Series:
    """
    Compute AQI from available pollutants.
    Uses the max of available pollutant subindices.
    """
    subindices: list[pd.Series] = []

    pm25_col = _find_col(df, PM25_COLS)
    if pm25_col:
        pm25 = _safe_numeric(df[pm25_col])
        pm25_breaks = [
            (0, 30, 0, 50),
            (30, 60, 50, 100),
            (60, 90, 100, 200),
            (90, 120, 200, 300),
            (120, 250, 300, 400),
            (250, np.inf, 400, 500),
        ]
        subindices.append(_aqi_subindex(pm25, pm25_breaks))

    pm10_col = _find_col(df, PM10_COLS)
    if pm10_col:
        pm10 = _safe_numeric(df[pm10_col])
        pm10_breaks = [
            (0, 50, 0, 50),
            (50, 100, 50, 100),
            (100, 250, 100, 200),
            (250, 350, 200, 300),
            (350, 430, 300, 400),
            (430, np.inf, 400, 500),
        ]
        subindices.append(_aqi_subindex(pm10, pm10_breaks))

    no2_col = _find_col(df, NO2_COLS)
    if no2_col:
        no2 = _safe_numeric(df[no2_col])
        no2_breaks = [
            (0, 40, 0, 50),
            (40, 80, 50, 100),
            (80, 180, 100, 200),
            (180, 280, 200, 300),
            (280, 400, 300, 400),
            (400, np.inf, 400, 500),
        ]
        subindices.append(_aqi_subindex(no2, no2_breaks))

    so2_col = _find_col(df, SO2_COLS)
    if so2_col:
        so2 = _safe_numeric(df[so2_col])
        so2_breaks = [
            (0, 40, 0, 50),
            (40, 80, 50, 100),
            (80, 380, 100, 200),
            (380, 800, 200, 300),
            (800, 1600, 300, 400),
            (1600, np.inf, 400, 500),
        ]
        subindices.append(_aqi_subindex(so2, so2_breaks))

    co_col = _find_col(df, CO_COLS)
    if co_col:
        co = _safe_numeric(df[co_col])
        co_breaks = [
            (0, 1, 0, 50),
            (1, 2, 50, 100),
            (2, 10, 100, 200),
            (10, 17, 200, 300),
            (17, 34, 300, 400),
            (34, np.inf, 400, 500),
        ]
        subindices.append(_aqi_subindex(co, co_breaks))

    o3_col = _find_col(df, O3_COLS)
    if o3_col:
        o3 = _safe_numeric(df[o3_col])
        o3_breaks = [
            (0, 50, 0, 50),
            (50, 100, 50, 100),
            (100, 168, 100, 200),
            (168, 208, 200, 300),
            (208, 748, 300, 400),
            (748, np.inf, 400, 500),
        ]
        subindices.append(_aqi_subindex(o3, o3_breaks))

    if not subindices:
        return pd.Series(np.nan, index=df.index, dtype=float)

    combined = pd.concat(subindices, axis=1).max(axis=1)
    return combined.clip(0, 500)


def compute_aqi_factors(aqi_df: pd.DataFrame) -> pd.DataFrame:
    """
    Collapse time-series AQI records into static spatial features per grid cell.
    """
    if aqi_df.empty:
        return pd.DataFrame()

    geo = aqi_df.dropna(subset=["latitude", "longitude"]).copy()
    if geo.empty:
        return pd.DataFrame()

    # Ensure required columns exist
    for col in ["aqi", "pm25", "pm10"]:
        if col not in geo.columns:
            geo[col] = np.nan

    geo = snap_dataframe(geo, lat_col="latitude", lon_col="longitude")

    def _p75(s: pd.Series) -> float:
        return _safe_percentile(s, 75)

    def _p90(s: pd.Series) -> float:
        return _safe_percentile(s, 90)

    grouped = (
        geo.groupby(["grid_lat", "grid_lon"], as_index=False)
        .agg(
            aqi_mean=("aqi", "mean"),
            aqi_p75=("aqi", _p75),
            aqi_p90=("aqi", _p90),
            aqi_max=("aqi", "max"),
            pm25=("pm25", "mean"),
            pm10=("pm10", "mean"),
            sample_count=("aqi", "size"),
        )
    )

    # Main AQI signal used downstream
    grouped["aqi"] = grouped["aqi_p75"].fillna(grouped["aqi_mean"]).fillna(grouped["aqi_max"])
    grouped["latitude"] = grouped["grid_lat"]
    grouped["longitude"] = grouped["grid_lon"]

    return grouped


def ingest_aqi_file(file_path: Path) -> pd.DataFrame | None:
    """Parse a single AQI CSV."""
    try:
        df = pd.read_csv(file_path, low_memory=False)
    except Exception as exc:
        print(f"  Cannot read {file_path.name}: {exc}")
        return None

    if df.empty:
        return None

    result = pd.DataFrame(index=df.index)

    # --------------------------------------------------------
    # Location
    # --------------------------------------------------------
    lat_col = _find_col(df, LAT_COLS)
    lon_col = _find_col(df, LON_COLS)
    city_col = _find_col(df, CITY_COLS)
    state_col = _find_col(df, STATE_COLS)

    if lat_col and lon_col:
        result["latitude"] = _safe_numeric(df[lat_col])
        result["longitude"] = _safe_numeric(df[lon_col])
    else:
        result["latitude"] = np.nan
        result["longitude"] = np.nan

    if city_col:
        result["city"] = df[city_col].astype(str).map(_normalize_text)
    if state_col:
        result["state"] = df[state_col].astype(str).map(_normalize_text)

    result = _assign_spatial_fallbacks(result)

    # --------------------------------------------------------
    # Date / time
    # --------------------------------------------------------
    date_col = _find_col(df, DATE_COLS)
    if date_col:
        dates = pd.to_datetime(df[date_col], errors="coerce")
        result["date"] = dates
        result["month"] = dates.dt.month
        result["year"] = dates.dt.year
        result["day_of_week"] = dates.dt.dayofweek
        result["hour"] = dates.dt.hour.fillna(12).astype("Int64")
    else:
        result["date"] = pd.NaT
        result["month"] = np.nan
        result["year"] = np.nan
        result["day_of_week"] = np.nan
        result["hour"] = 12

    # --------------------------------------------------------
    # AQI
    # --------------------------------------------------------
    aqi_col = _find_col(df, AQI_COLS)
    if aqi_col:
        result["aqi"] = _safe_numeric(df[aqi_col]).clip(0, 500)
    else:
        result["aqi"] = _compute_aqi_from_pollutants(df)

    # If AQI is still missing but pollutants exist, keep the row only if one
    # pollutant-driven AQI estimate can be formed.
    if result["aqi"].notna().sum() == 0:
        return None

    # --------------------------------------------------------
    # Pollutants
    # --------------------------------------------------------
    for out_name, cols in [
        ("pm25", PM25_COLS),
        ("pm10", PM10_COLS),
        ("no2", NO2_COLS),
        ("so2", SO2_COLS),
        ("co", CO_COLS),
        ("o3", O3_COLS),
    ]:
        col = _find_col(df, cols)
        if col:
            result[out_name] = _safe_numeric(df[col])
        else:
            result[out_name] = np.nan

    result["source_file"] = file_path.name

    return result


def ingest_all_aqi() -> pd.DataFrame:
    csv_files = list(RAW_AQI.glob("**/*.csv"))
    print(f"Found {len(csv_files)} AQI CSV files")

    all_frames: list[pd.DataFrame] = []
    for f in csv_files:
        df = ingest_aqi_file(f)
        if df is not None and not df.empty:
            all_frames.append(df)
            aqi_min = df["aqi"].min()
            aqi_max = df["aqi"].max()
            print(f"  Parsed {f.name}: {len(df)} rows, AQI range: {aqi_min:.0f}-{aqi_max:.0f}")

    if not all_frames:
        print("No AQI data found!")
        return pd.DataFrame()

    combined = pd.concat(all_frames, ignore_index=True)
    print(f"Combined AQI data: {len(combined)} rows")

    coord_pct = float(combined["latitude"].notna().mean() * 100) if "latitude" in combined.columns else 0.0
    print(f"Coordinate coverage: {coord_pct:.1f}%")

    if "city" in combined.columns:
        print(f"Unique cities/stations: {combined['city'].nunique()}")
    else:
        print("Unique cities/stations: 0")

    print(f"AQI value range: {combined['aqi'].min():.1f} - {combined['aqi'].max():.1f}")

    factors = compute_aqi_factors(combined)
    if factors.empty:
        print("No spatial AQI factors could be computed!")
        return pd.DataFrame()

    output_path = PROCESSED_DIR / "aqi_grid.parquet"
    factors.to_parquet(output_path, index=False)
    print(f"Saved: {output_path} ({len(factors)} grid cells)")

    return factors


if __name__ == "__main__":
    ingest_all_aqi()