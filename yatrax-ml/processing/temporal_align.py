"""
Temporal alignment — normalize timestamps across data sources.

Different datasets have different time resolutions:
- Crime: yearly
- Weather: daily or hourly
- AQI: daily
- Disasters: event-based (specific dates)
- Census: decadal

This module aligns everything to a common temporal reference
so the merged grid has consistent time semantics.
"""

from __future__ import annotations

from datetime import datetime

import numpy as np
import pandas as pd

from config.settings import SEASONS


def get_season(month: int) -> str:
    """Map month to Indian season."""
    for season, months in SEASONS.items():
        if month in months:
            return season
    return "post_monsoon"


def get_time_period(hour: int) -> str:
    """Map hour to time period."""
    if 5 <= hour < 8:
        return "early_morning"
    elif 8 <= hour < 12:
        return "morning"
    elif 12 <= hour < 16:
        return "afternoon"
    elif 16 <= hour < 19:
        return "evening"
    elif 19 <= hour < 22:
        return "night"
    else:
        return "late_night"


def is_night(hour: int) -> bool:
    return hour >= 21 or hour < 6


def expand_yearly_to_monthly(
    df: pd.DataFrame,
    year_col: str = "year",
    value_cols: list[str] | None = None,
) -> pd.DataFrame:
    """
    Expand yearly data to monthly rows.
    Values stay the same (yearly aggregates), but we get
    a month column for joining with monthly data.
    """
    if value_cols is None:
        value_cols = [c for c in df.columns if c != year_col]

    rows = []
    for _, row in df.iterrows():
        for month in range(1, 13):
            new_row = {col: row[col] for col in value_cols if col in row.index}
            new_row[year_col] = row[year_col]
            new_row["month"] = month
            new_row["season"] = get_season(month)
            rows.append(new_row)

    return pd.DataFrame(rows)


def apply_seasonal_modifiers(
    df: pd.DataFrame,
    column: str,
    modifiers: dict[str, float],
    month_col: str = "month",
) -> pd.DataFrame:
    """
    Apply seasonal multipliers to a column.

    modifiers: season_name → multiplier
    Example: {"monsoon": 1.3, "winter": 0.8}
    """
    result = df.copy()

    def _get_modifier(month: int) -> float:
        season = get_season(int(month))
        return modifiers.get(season, 1.0)

    if month_col in result.columns:
        multipliers = result[month_col].apply(_get_modifier)
        result[column] = result[column] * multipliers

    return result


def add_temporal_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add standard temporal features to any DataFrame that has
    month and/or hour columns.
    """
    result = df.copy()

    # ... continuing from add_temporal_features

    if "month" in result.columns:
        result["season"] = result["month"].apply(
            lambda m: get_season(int(m)) if pd.notna(m) else "post_monsoon"
        )
        # Cyclical encoding for month (ML models don't understand 12→1 wrap)
        result["month_sin"] = np.sin(2 * np.pi * result["month"] / 12)
        result["month_cos"] = np.cos(2 * np.pi * result["month"] / 12)

        # Monsoon flag
        result["is_monsoon"] = result["month"].isin([6, 7, 8, 9]).astype(int)

        # Winter fog season (important for North India)
        result["is_fog_season"] = (
            (result["month"].isin([12, 1])) |
            ((result["month"] == 11) & True)  # Nov-Jan
        ).astype(int)

    if "hour" in result.columns:
        result["time_period"] = result["hour"].apply(
            lambda h: get_time_period(int(h)) if pd.notna(h) else "afternoon"
        )
        result["is_night"] = result["hour"].apply(
            lambda h: int(is_night(int(h))) if pd.notna(h) else 0
        )
        # Cyclical encoding for hour
        result["hour_sin"] = np.sin(2 * np.pi * result["hour"] / 24)
        result["hour_cos"] = np.cos(2 * np.pi * result["hour"] / 24)

        # Rush hour (higher accident risk)
        result["is_rush_hour"] = result["hour"].isin([8, 9, 17, 18, 19]).astype(int)

    if "day_of_week" in result.columns:
        result["is_weekend"] = result["day_of_week"].isin([5, 6]).astype(int)
        result["dow_sin"] = np.sin(2 * np.pi * result["day_of_week"] / 7)
        result["dow_cos"] = np.cos(2 * np.pi * result["day_of_week"] / 7)

    return result


def interpolate_time_gaps(
    df: pd.DataFrame,
    date_col: str = "date",
    value_cols: list[str] | None = None,
    freq: str = "D",
    method: str = "linear",
) -> pd.DataFrame:
    """
    Fill time gaps in a time series by interpolation.

    Used when weather data has missing days, AQI has gaps, etc.
    """
    if date_col not in df.columns:
        return df

    result = df.copy()
    result[date_col] = pd.to_datetime(result[date_col], errors="coerce")
    result = result.dropna(subset=[date_col])

    if result.empty:
        return result

    result = result.set_index(date_col).sort_index()

    # Reindex to fill gaps
    full_range = pd.date_range(result.index.min(), result.index.max(), freq=freq)
    result = result.reindex(full_range)

    # Interpolate numeric columns
    if value_cols is None:
        value_cols = result.select_dtypes(include=[np.number]).columns.tolist()

    for col in value_cols:
        if col in result.columns:
            result[col] = result[col].interpolate(method=method, limit=7)

    result = result.reset_index().rename(columns={"index": date_col})
    return result


def aggregate_to_monthly(
    df: pd.DataFrame,
    date_col: str = "date",
    group_cols: list[str] | None = None,
    agg_dict: dict[str, str] | None = None,
) -> pd.DataFrame:
    """
    Aggregate daily/hourly data to monthly summaries.

    Useful for creating consistent time resolution across sources.
    """
    result = df.copy()

    if date_col in result.columns:
        result[date_col] = pd.to_datetime(result[date_col], errors="coerce")
        result["year"] = result[date_col].dt.year
        result["month"] = result[date_col].dt.month

    if group_cols is None:
        group_cols = []

    group_by = group_cols + ["year", "month"]
    group_by = [c for c in group_by if c in result.columns]

    if not group_by:
        return result

    if agg_dict is None:
        # Default: mean for all numeric columns
        numeric_cols = result.select_dtypes(include=[np.number]).columns
        numeric_cols = [c for c in numeric_cols if c not in group_by]
        agg_dict = {col: "mean" for col in numeric_cols}

    return result.groupby(group_by).agg(agg_dict).reset_index()   