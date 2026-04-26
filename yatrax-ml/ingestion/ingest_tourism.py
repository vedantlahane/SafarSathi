"""
Ingest tourism datasets.

Input:  data/raw/tourism/*.csv
Output: data/processed/tourism_grid.parquet

Sources:
  - kumarperiya/explore-india-a-tourist-destination-dataset
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from config.settings import RAW_TOURISM, PROCESSED_DIR


# Major Indian tourist city coordinates for geocoding fallback
TOURIST_CITY_COORDS = {
    "agra": (27.1767, 78.0081),
    "jaipur": (26.9124, 75.7873),
    "varanasi": (25.3176, 83.0064),
    "goa": (15.2993, 74.1240),
    "udaipur": (24.5854, 73.7125),
    "shimla": (31.1048, 77.1734),
    "manali": (32.2396, 77.1887),
    "darjeeling": (27.0360, 88.2627),
    "munnar": (10.0889, 77.0595),
    "rishikesh": (30.0869, 78.2676),
    "leh": (34.1526, 77.5771),
    "ooty": (11.4102, 76.6950),
    "kochi": (9.9312, 76.2673),
    "jodhpur": (26.2389, 73.0243),
    "mysore": (12.2958, 76.6394),
    "mysuru": (12.2958, 76.6394),
    "hampi": (15.3350, 76.4600),
    "khajuraho": (24.8318, 79.9199),
    "amritsar": (31.6340, 74.8723),
    "pondicherry": (11.9416, 79.8083),
    "puducherry": (11.9416, 79.8083),
    "kodaikanal": (10.2381, 77.4892),
    "alleppey": (9.4981, 76.3388),
    "alappuzha": (9.4981, 76.3388),
    "gangtok": (27.3389, 88.6065),
    "mcleodganj": (32.2426, 76.3213),
    "pushkar": (26.4898, 74.5511),
    "ranthambore": (26.0173, 76.5026),
    "jim corbett": (29.5300, 78.7747),
    "kaziranga": (26.5775, 93.1711),
    "andaman": (11.7401, 92.6586),
    "ladakh": (34.1526, 77.5771),
    "spiti": (32.2460, 78.0349),
    "coorg": (12.3375, 75.8069),
    "kovalam": (8.3988, 76.9780),
    "varkala": (8.7379, 76.7163),
    "bikaner": (28.0229, 73.3119),
    "jaisalmer": (26.9157, 70.9083),
    "mount abu": (24.5926, 72.7156),
    "nainital": (29.3803, 79.4636),
    "mussoorie": (30.4598, 78.0644),
    "auli": (30.5269, 79.5666),
    "srinagar": (34.0837, 74.7973),
    "pahalgam": (34.0161, 75.3150),
    "gulmarg": (34.0484, 74.3805),
}


def _find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for c in candidates:
        if c in df.columns:
            return c
    lower_map = {col.lower().strip(): col for col in df.columns}
    for c in candidates:
        if c.lower().strip() in lower_map:
            return lower_map[c.lower().strip()]
    return None


def ingest_tourism_file(file_path: Path) -> pd.DataFrame | None:
    """Parse a single tourism CSV."""
    try:
        df = pd.read_csv(file_path, low_memory=False)
    except Exception as e:
        print(f"  Cannot read {file_path.name}: {e}")
        return None

    if df.empty:
        return None

    result = pd.DataFrame()

    # Location
    lat_col = _find_col(df, ["latitude", "lat", "Latitude"])
    lon_col = _find_col(df, ["longitude", "lon", "lng", "Longitude"])
    city_col = _find_col(df, [
        "city", "City", "place", "Place",
        "Destination Name", "destination_name", "destination",
        "Destination", "name", "Name", "location", "Location",
    ])
    state_col = _find_col(df, ["state", "State", "STATE"])

    if lat_col and lon_col:
        result["latitude"] = pd.to_numeric(df[lat_col], errors="coerce")
        result["longitude"] = pd.to_numeric(df[lon_col], errors="coerce")
    else:
        result["latitude"] = np.nan
        result["longitude"] = np.nan

    if city_col:
        result["place_name"] = df[city_col].astype(str).str.strip()
        # Geocode from known tourist cities
        for idx in result.index:
            if pd.isna(result.at[idx, "latitude"]):
                name = str(result.at[idx, "place_name"]).lower().strip()
                for city_key, (lat, lon) in TOURIST_CITY_COORDS.items():
                    if city_key in name or name in city_key:
                        result.at[idx, "latitude"] = lat
                        result.at[idx, "longitude"] = lon
                        break
    else:
        result["place_name"] = "unknown"

    if state_col:
        result["state"] = df[state_col].astype(str).str.strip().str.lower()

    # Tourist type / category
    type_col = _find_col(df, [
        "type", "Type", "category", "Category",
        "place_type", "attraction_type",
    ])
    if type_col:
        result["tourism_type"] = df[type_col].astype(str).str.strip().str.lower()
    else:
        result["tourism_type"] = "general"

    # Rating / popularity
    rating_col = _find_col(df, [
        "rating", "Rating", "google_rating", "review_rating",
        "star_rating", "ratings",
    ])
    if rating_col:
        result["rating"] = pd.to_numeric(df[rating_col], errors="coerce").clip(0, 5)
    else:
        result["rating"] = np.nan

    # Visitor count / popularity proxy
    visitor_col = _find_col(df, [
        "visitors", "annual_visitors", "footfall",
        "tourist_count", "visit_count", "reviews",
        "number_of_reviews", "review_count",
    ])
    if visitor_col:
        result["visitor_proxy"] = pd.to_numeric(df[visitor_col], errors="coerce")
    else:
        result["visitor_proxy"] = np.nan

    # Best time to visit (season safety proxy)
    best_time_col = _find_col(df, [
        "best_time", "Best_Time", "best_season",
        "best_time_to_visit", "Best_Time_to_Visit",
    ])
    if best_time_col:
        result["best_time"] = df[best_time_col].astype(str).str.strip().str.lower()
    else:
        result["best_time"] = "unknown"

    result["source_file"] = file_path.name
    return result


def compute_tourism_factors(tourism_df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute tourism-related safety factors per grid cell.

    Outputs:
    - nearby_tourist_density_index (0-1): how many tourist spots nearby
    - tourism_infrastructure_proxy (0-1): rated/popular = better infrastructure
    - visit_frequency_score (0-1): how visited the area is
    """
    if tourism_df.empty:
        return pd.DataFrame()

    geo = tourism_df.dropna(subset=["latitude", "longitude"]).copy()

    if geo.empty:
        return pd.DataFrame()

    geo["grid_lat"] = (geo["latitude"] / 0.1).round() * 0.1
    geo["grid_lon"] = (geo["longitude"] / 0.1).round() * 0.1

    grouped = geo.groupby(["grid_lat", "grid_lon"]).agg(
        tourist_spot_count=("place_name", "size"),
        avg_rating=("rating", "mean"),
        total_visitors=("visitor_proxy", "sum"),
    ).reset_index()

    # Normalize
    max_spots = grouped["tourist_spot_count"].quantile(0.95)
    if max_spots > 0:
        grouped["nearby_tourist_density_index"] = (
            grouped["tourist_spot_count"] / max_spots
        ).clip(0, 1)
    else:
        grouped["nearby_tourist_density_index"] = 0.0

    # Higher rating = better infrastructure (proxy)
    grouped["tourism_infrastructure_proxy"] = (
        grouped["avg_rating"].fillna(3.0) / 5.0
    ).clip(0, 1)

    # Visit frequency
    max_visitors = grouped["total_visitors"].quantile(0.95)
    if max_visitors > 0:
        grouped["visit_frequency_score"] = (
            grouped["total_visitors"].fillna(0) / max_visitors
        ).clip(0, 1)
    else:
        grouped["visit_frequency_score"] = 0.0

    grouped["latitude"] = grouped["grid_lat"]
    grouped["longitude"] = grouped["grid_lon"]

    return grouped


def ingest_all_tourism() -> pd.DataFrame:
    csv_files = list(RAW_TOURISM.glob("**/*.csv"))
    print(f"Found {len(csv_files)} tourism CSV files")

    all_frames = []
    for f in csv_files:
        df = ingest_tourism_file(f)
        if df is not None and not df.empty:
            all_frames.append(df)
            print(f"  Parsed {f.name}: {len(df)} places")

    if not all_frames:
        print("No tourism data found!")
        return pd.DataFrame()

    combined = pd.concat(all_frames, ignore_index=True)
    print(f"Combined: {len(combined)} tourist locations")

    factors = compute_tourism_factors(combined)

    output_path = PROCESSED_DIR / "tourism_grid.parquet"
    factors.to_parquet(output_path, index=False)
    print(f"Saved: {output_path} ({len(factors)} grid cells)")

    return factors


if __name__ == "__main__":
    ingest_all_tourism()