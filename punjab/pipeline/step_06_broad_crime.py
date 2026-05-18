# ============================================================
# step_06_broad_crime.py
# Punjab Tourist Safety Intelligence Platform
#
# Input file (RAW_DIR/crime/):
#   27_3IncidenceOfCrimes.csv
#
# Output:
#   CLEAN_DIR/broad_crime_master.parquet
#
# Why this exists separately from step_02_crime.py:
#   This dataset is state-level (not district-level) and covers
#   a much wider crime category mix, powering the ecosystem-level
#   civil instability and property crime signals.
#
# Features built:
#   violent_crime_ecosystem, property_crime_ecosystem
#   civil_instability_score, overall_crime_pressure
#   crime_pressure_3yr_mean, crime_pressure_yoy_change
#   violent_crime_yoy_change
# ============================================================

import pandas as pd

from utils import (
    CRIME_DIR,
    CLEAN_DIR,
    safe_read_csv,
    safe_float,
    get_year_columns,
)


# ============================================================
# High-Signal Crime Categories
# ============================================================

HIGH_SIGNAL_CRIMES = [
    "Murder",
    "Attempt to murder",
    "Riots",
    "Kidnapping & Abduction",
    "Burglary",
    "Robbery",
    "Dacoity",
    "Theft",
    "Culpable homicide not amounting to murder",
]


# ============================================================
# Load + Pivot
# ============================================================

def load_raw() -> pd.DataFrame:
    df = safe_read_csv(CRIME_DIR / "27_3IncidenceOfCrimes.csv")
    print(f"Broad crime raw shape: {df.shape}")
    return df


def build_broad_crime_master(df: pd.DataFrame) -> pd.DataFrame:
    df = df.rename(columns={df.columns[0]: "crime_category"})
    df["crime_category"] = df["crime_category"].astype(str).str.strip()

    year_cols = get_year_columns(df)

    # Wide → Long
    long_df = df.melt(
        id_vars=["crime_category"],
        value_vars=year_cols,
        var_name="year",
        value_name="cases",
    )
    long_df["cases"] = safe_float(long_df["cases"])
    long_df["year"]  = long_df["year"].astype(int)

    # Filter to high-signal categories
    long_df = long_df[long_df["crime_category"].isin(HIGH_SIGNAL_CRIMES)].copy()

    # Pivot to year × crime_category
    pivot = (
        long_df
        .pivot_table(
            index="year",
            columns="crime_category",
            values="cases",
            aggfunc="sum",
        )
        .reset_index()
    )

    # Flatten column names
    pivot.columns = [
        str(c).lower()
                .replace(" ", "_")
                .replace("&", "and")
                .replace("-", "_")
                .replace("__", "_")
        for c in pivot.columns
    ]

    # ── Composite features ─────────────────────────────────
    def _get(col, default=0):
        return pivot.get(col, pd.Series([default] * len(pivot), index=pivot.index))

    pivot["violent_crime_ecosystem"] = (
        _get("murder")                                          * 3
        + _get("attempt_to_murder")                             * 2
        + _get("kidnapping_and_abduction")                      * 2
        + _get("culpable_homicide_not_amounting_to_murder")     * 2
    )
    pivot["property_crime_ecosystem"] = (
        _get("burglary")
        + _get("theft")
        + _get("robbery") * 2
        + _get("dacoity") * 3
    )
    pivot["civil_instability_score"] = _get("riots") * 3

    pivot["overall_crime_pressure"] = (
        pivot["violent_crime_ecosystem"]
        + pivot["property_crime_ecosystem"]
        + pivot["civil_instability_score"]
    )

    # ── Temporal trends ────────────────────────────────────
    pivot = pivot.sort_values("year")

    pivot["crime_pressure_3yr_mean"]   = (
        pivot["overall_crime_pressure"].rolling(3, min_periods=1).mean()
    )
    pivot["crime_pressure_yoy_change"] = pivot["overall_crime_pressure"].pct_change()
    pivot["violent_crime_yoy_change"]  = pivot["violent_crime_ecosystem"].pct_change()

    print(f"Broad crime master shape: {pivot.shape}")
    return pivot


# ============================================================
# Save
# ============================================================

def save(df: pd.DataFrame) -> None:
    out = CLEAN_DIR / "broad_crime_master.parquet"
    df.to_parquet(out, index=False)
    print(f"Saved → {out}")


# ============================================================
# Entry Point
# ============================================================

def run() -> pd.DataFrame:
    raw    = load_raw()
    master = build_broad_crime_master(raw)
    save(master)
    return master


if __name__ == "__main__":
    run()
