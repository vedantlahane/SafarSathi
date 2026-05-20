# ============================================================
# step_08_contextual.py
# Punjab Tourist Safety Intelligence Platform
#
# Input files:
#   RAW_DIR/context/27_8NumberOfPrisoners.csv
#   RAW_DIR/context/HottestColdPlaces20011995.csv
#
# Output:
#   CLEAN_DIR/contextual_intelligence.parquet
#
# Why this step exists:
#   Prison burden and climate severity are state-level scalar
#   signals — not district-level — so they are stored as a
#   single-row summary table and joined at the final merge.
#
# Features built:
#   prison_pressure_latest
#   avg_tourist_climate_comfort
#
# NOTE: These scalars are intentionally not district-split
#       (data does not support it). They are applied uniformly
#       at the master merge stage.
# ============================================================

import numpy as np
import pandas as pd

from utils import (
    CONTEXT_DIR,
    CLEAN_DIR,
    safe_read_csv,
    safe_float,
    get_year_columns,
    normalize_0_100,
)


# ============================================================
# 1. Prison Burden
# ============================================================

def build_prison_pressure() -> float:
    df = safe_read_csv(CONTEXT_DIR / "27_8NumberOfPrisoners.csv")
    print(f"Prison raw shape: {df.shape}")

    df = df.rename(columns={df.columns[0]: "category"})

    year_cols = get_year_columns(df)

    long_df = df.melt(
        id_vars=["category"],
        value_vars=year_cols,
        var_name="year",
        value_name="value",
    )
    long_df["value"] = safe_float(long_df["value"])
    long_df["year"]  = long_df["year"].astype(int)

    pivot = (
        long_df
        .pivot_table(index="year", columns="category", values="value", aggfunc="sum")
        .reset_index()
    )
    pivot.columns = [
        str(c).lower().replace(" ", "_").replace("-", "_").replace("/", "_")
        for c in pivot.columns
    ]

    numeric_cols = [c for c in pivot.columns if c != "year"]
    pivot["institutional_pressure_score"] = pivot[numeric_cols].sum(axis=1)

    latest_pressure = float(pivot["institutional_pressure_score"].iloc[-1])
    print(f"Prison pressure (latest year): {latest_pressure:,.0f}")
    return latest_pressure


# ============================================================
# 2. Climate Comfort
# ============================================================

def build_climate_comfort() -> float:
    df = safe_read_csv(CONTEXT_DIR / "HottestColdPlaces20011995.csv")
    print(f"Climate raw shape: {df.shape}")

    df.columns = [str(c).strip() for c in df.columns]

    for c in df.columns:
        df[c] = safe_float(df[c])

    numeric_cols = df.select_dtypes(include=np.number).columns

    df["heat_severity_index"]  = df[numeric_cols].max(axis=1)
    df["tourist_climate_comfort"] = 100 - normalize_0_100(df["heat_severity_index"])

    avg_comfort = float(df["tourist_climate_comfort"].mean())
    print(f"Avg climate comfort: {avg_comfort:.1f}/100")
    return avg_comfort


# ============================================================
# Save
# ============================================================

def save(prison_pressure: float, climate_comfort: float) -> None:
    df = pd.DataFrame([{
        "prison_pressure_latest":    prison_pressure,
        "avg_tourist_climate_comfort": climate_comfort,
    }])
    out = CLEAN_DIR / "contextual_intelligence.parquet"
    df.to_parquet(out, index=False)
    print(f"Saved → {out}")


# ============================================================
# Entry Point
# ============================================================

def run() -> pd.DataFrame:
    prison_pressure  = build_prison_pressure()
    climate_comfort  = build_climate_comfort()
    save(prison_pressure, climate_comfort)

    return pd.DataFrame([{
        "prison_pressure_latest":      prison_pressure,
        "avg_tourist_climate_comfort": climate_comfort,
    }])


if __name__ == "__main__":
    run()
