"""
Ingest air quality datasets.

Input:  data/raw/air_quality/*.csv
Output: data/processed/aqi_grid.parquet
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from config.settings import RAW_AQI, PROCESSED_DIR


AQI_COLS = ["aqi", "AQI", "air_quality_index", "AQI_Value"]
PM25_COLS = ["pm2.5", "PM2.5", "pm25", "PM25"]
PM10_COLS = ["pm10", "PM10"]
NO2_COLS = ["no2", "NO2"]
SO2_COLS = ["so2", "SO2"]
CO_COLS = ["co", "CO"]
O3_COLS = ["ozone", "o3", "O3"]
DATE_COLS = ["date", "Date", "datetime", "Datetime", "sampling_date"]
CITY_COLS = ["city", "City", "station", "StationId", "location"]
STATE_COLS = ["state", "State"]
LAT_COLS = ["latitude", "lat"]
LON_COLS = ["longitude", "lon", "lng"]


def _find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for c in candidates:
        if c in df.columns:
            return c
    lower_map = {col.lower().strip(): col for col in df.columns}
    for c in candidates:
        if c.lower().strip() in lower_map:
            return lower_map[c.lower().strip()]
    return None


def _compute_aqi_from_pollutants(df: pd.DataFrame) -> pd.Series:
    """
    If AQI column is missing, estimate from individual pollutants.
    Uses India's National AQI breakpoint system (simplified).
    """
    aqi = pd.Series(np.nan, index=df.index)

    # PM2.5 based AQI (dominant pollutant in India)
    pm25_col = _find_col(df, PM25_COLS)
    if pm25_col:
        pm25 = pd.to_numeric(df[pm25_col], errors="coerce")
        # Simplified Indian AQI breakpoints for PM2.5
        conditions = [
            pm25 <= 30,       # Good (0-50)
            pm25 <= 60,       # Satisfactory (51-100)
            pm25 <= 90,       # Moderate (101-200)
            pm25 <= 120,      # Poor (201-300)
            pm25 <= 250,      # Very Poor (301-400)
            pm25 > 250,       # Severe (401-500)
        ]
        values = [
            pm25 / 30.0 * 50.0,
            50.0 + (pm25 - 30.0) / 30.0 * 50.0,
            100.0 + (pm25 - 60.0) / 30.0 * 100.0,
            200.0 + (pm25 - 90.0) / 30.0 * 100.0,
            300.0 + (pm25 - 120.0) / 130.0 * 100.0,
            400.0 + (pm25 - 250.0) / 130.0 * 100.0,
        ]
        aqi = np.select(conditions, values, default=np.nan)
        aqi = pd.Series(aqi, index=df.index).clip(0, 500)

    return aqi


def ingest_aqi_file(file_path: Path) -> pd.DataFrame | None:
    """Parse a single AQI CSV."""
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
    state_col = _find_col(df, STATE_COLS)

    if lat_col and lon_col:
        result["latitude"] = pd.to_numeric(df[lat_col], errors="coerce")
        result["longitude"] = pd.to_numeric(df[lon_col], errors="coerce")

    if city_col:
        result["city"] = df[city_col].astype(str).str.strip().str.lower()
    if state_col:
        result["state"] = df[state_col].astype(str).str.strip().str.lower()

    # Date
    date_col = _find_col(df, DATE_COLS)
    if date_col:
        result["date"] = pd.to_datetime(df[date_col], errors="coerce")
        result["month"] = result["date"].dt.month
        result["year"] = result["date"].dt.year
    else:
        result["date"] = pd.NaT
        result["month"] = np.nan
        result["year"] = np.nan

    # AQI
    aqi_col = _find_col(df, AQI_COLS)
    if aqi_col:
        result["aqi"] = pd.to_numeric(df[aqi_col], errors="coerce").clip(0, 500)
    else:
        result["aqi"] = _compute_aqi_from_pollutants(df)

    # Individual pollutants
    for name, cols in [
        ("pm25", PM25_COLS), ("pm10", PM10_COLS),
        ("no2", NO2_COLS), ("so2", SO2_COLS),
        ("co", CO_COLS), ("o3", O3_COLS),
    ]:
        col = _find_col(df, cols)
        if col:
            result[name] = pd.to_numeric(df[col], errors="coerce")
        else:
            result[name] = np.nan

    # Drop rows with no AQI data at all
    result = result.dropna(subset=["aqi"]).copy()
    result["source_file"] = file_path.name

    return result


def ingest_all_aqi() -> pd.DataFrame:
    csv_files = list(RAW_AQI.glob("**/*.csv"))
    print(f"Found {len(csv_files)} AQI CSV files")

    all_frames = []
    for f in csv_files:
        df = ingest_aqi_file(f)
        if df is not None and not df.empty:
            all_frames.append(df)
            print(f"  Parsed {f.name}: {len(df)} rows, AQI range: {df['aqi'].min():.0f}-{df['aqi'].max():.0f}")

    if not all_frames:
        print("No AQI data found!")
        return pd.DataFrame()

    combined = pd.concat(all_frames, ignore_index=True)
    print(f"Combined AQI data: {len(combined)} rows")

    output_path = PROCESSED_DIR / "aqi_grid.parquet"
    combined.to_parquet(output_path, index=False)
    print(f"Saved: {output_path}")

    return combined


if __name__ == "__main__":
    ingest_all_aqi()