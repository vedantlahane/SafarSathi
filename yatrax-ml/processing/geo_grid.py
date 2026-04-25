"""
Spatial gridding system.
All data sources get mapped onto a common geographic grid.

Grid spec:
- Resolution: 0.1° × 0.1° (~11km × 11km at Indian latitudes)
- India bounding box: 6°N-37°N, 68°E-98°E
- Total cells: ~310 × 300 = ~93,000
- Each cell has a unique (grid_lat, grid_lon) identifier
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from config.settings import (
    INDIA_LAT_MIN, INDIA_LAT_MAX,
    INDIA_LON_MIN, INDIA_LON_MAX,
    GRID_RESOLUTION_DEG,
)


@dataclass(frozen=True)
class GridCell:
    grid_lat: float
    grid_lon: float

    @property
    def cell_id(self) -> str:
        return f"{self.grid_lat:.1f}_{self.grid_lon:.1f}"

    @property
    def bounds(self) -> tuple[float, float, float, float]:
        """(lat_min, lat_max, lon_min, lon_max)"""
        half = GRID_RESOLUTION_DEG / 2
        return (
            self.grid_lat - half,
            self.grid_lat + half,
            self.grid_lon - half,
            self.grid_lon + half,
        )


def snap_to_grid(lat: float, lon: float) -> tuple[float, float]:
    """Snap a point to the nearest grid cell center."""
    grid_lat = round(round(lat / GRID_RESOLUTION_DEG) * GRID_RESOLUTION_DEG, 1)
    grid_lon = round(round(lon / GRID_RESOLUTION_DEG) * GRID_RESOLUTION_DEG, 1)
    return grid_lat, grid_lon


def snap_dataframe(
    df: pd.DataFrame,
    lat_col: str = "latitude",
    lon_col: str = "longitude",
) -> pd.DataFrame:
    """Add grid_lat, grid_lon columns to a DataFrame."""
    result = df.copy()
    result["grid_lat"] = (result[lat_col] / GRID_RESOLUTION_DEG).round() * GRID_RESOLUTION_DEG
    result["grid_lon"] = (result[lon_col] / GRID_RESOLUTION_DEG).round() * GRID_RESOLUTION_DEG
    result["grid_lat"] = result["grid_lat"].round(1)
    result["grid_lon"] = result["grid_lon"].round(1)
    return result


def generate_india_grid() -> pd.DataFrame:
    """
    Generate the complete India grid as a DataFrame.
    Each row is one grid cell with its center coordinates.
    """
    lats = np.arange(INDIA_LAT_MIN, INDIA_LAT_MAX + GRID_RESOLUTION_DEG, GRID_RESOLUTION_DEG)
    lons = np.arange(INDIA_LON_MIN, INDIA_LON_MAX + GRID_RESOLUTION_DEG, GRID_RESOLUTION_DEG)

    grid_lats, grid_lons = np.meshgrid(lats, lons, indexing="ij")

    grid = pd.DataFrame({
        "grid_lat": grid_lats.ravel().round(1),
        "grid_lon": grid_lons.ravel().round(1),
    })

    grid["cell_id"] = grid.apply(
        lambda r: f"{r['grid_lat']:.1f}_{r['grid_lon']:.1f}", axis=1
    )

    return grid


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine distance in km between two points."""
    R = 6371.0
    lat1_r, lat2_r = np.radians(lat1), np.radians(lat2)
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1_r) * np.cos(lat2_r) * np.sin(dlon / 2) ** 2
    return R * 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))


def find_nearest_cells(
    point_lat: float,
    point_lon: float,
    grid: pd.DataFrame,
    radius_km: float = 50.0,
) -> pd.DataFrame:
    """Find all grid cells within radius_km of a point."""
    # Quick bounding box filter first (1 degree ≈ 111km)
    deg_buffer = radius_km / 111.0 * 1.5
    candidates = grid[
        (grid["grid_lat"] >= point_lat - deg_buffer) &
        (grid["grid_lat"] <= point_lat + deg_buffer) &
        (grid["grid_lon"] >= point_lon - deg_buffer) &
        (grid["grid_lon"] <= point_lon + deg_buffer)
    ].copy()

    if candidates.empty:
        return candidates

    candidates["distance_km"] = candidates.apply(
        lambda r: haversine_km(point_lat, point_lon, r["grid_lat"], r["grid_lon"]),
        axis=1,
    )

    return candidates[candidates["distance_km"] <= radius_km].sort_values("distance_km")


def spatial_interpolate(
    source_df: pd.DataFrame,
    target_grid: pd.DataFrame,
    value_columns: list[str],
    radius_km: float = 30.0,
    method: str = "idw",
) -> pd.DataFrame:
    """
    Interpolate values from source points onto the target grid.

    Methods:
    - "idw": Inverse Distance Weighting
    - "nearest": Nearest neighbor
    """
    result = target_grid.copy()

    for col in value_columns:
        result[col] = np.nan

    if source_df.empty:
        return result

    source_with_grid = snap_dataframe(source_df)

    if method == "nearest":
        # Simple: for each grid cell, take the nearest source value
        for col in value_columns:
            cell_values = source_with_grid.groupby(["grid_lat", "grid_lon"])[col].mean()
            result = result.set_index(["grid_lat", "grid_lon"])
            result[col] = cell_values
            result = result.reset_index()
    else:
        # IDW interpolation
        source_lats = source_with_grid["latitude"].values
        source_lons = source_with_grid["longitude"].values

        for col in value_columns:
            source_vals = source_with_grid[col].values
            valid_mask = ~np.isnan(source_vals)

            if valid_mask.sum() == 0:
                continue

            s_lats = source_lats[valid_mask]
            s_lons = source_lons[valid_mask]
            s_vals = source_vals[valid_mask]

            interpolated = np.full(len(result), np.nan)

            for i, (glat, glon) in enumerate(zip(result["grid_lat"], result["grid_lon"])):
                # Quick distance approximation
                dlat = (s_lats - glat) * 111.0
                dlon = (s_lons - glon) * 111.0 * np.cos(np.radians(glat))
                dists = np.sqrt(dlat ** 2 + dlon ** 2)

                within_radius = dists <= radius_km
                if within_radius.sum() == 0:
                    continue

                nearby_dists = dists[within_radius].clip(min=0.1)
                nearby_vals = s_vals[within_radius]

                weights = 1.0 / (nearby_dists ** 2)
                interpolated[i] = np.average(nearby_vals, weights=weights)

            result[col] = interpolated

    return result