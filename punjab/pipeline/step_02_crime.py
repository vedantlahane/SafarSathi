# ============================================================
# step_02_crime.py
# Punjab Tourist Safety Intelligence Platform
#
# Input files (RAW_DIR/crime/):
#   MurderCases.csv
#   KidnappingAbduction.csv
#   DacoityCases.csv
#
# Output:
#   CLEAN_DIR/crime_master.parquet
#
# Features built:
#   murder_cases, kidnapping_cases, dacoity_cases
#   violent_crime_index, organized_crime_index, women_threat_proxy
#   rolling means, YoY changes, trend direction
#   lat, lon
# ============================================================

import numpy as np
import pandas as pd

from utils import (
    CRIME_DIR,
    CLEAN_DIR,
    safe_read_csv,
    wide_to_long,
    add_coordinates,
)


# ============================================================
# Load Raw Files
# ============================================================

def load_raw() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    murder_df  = safe_read_csv(CRIME_DIR / "MurderCases.csv")
    kidnap_df  = safe_read_csv(CRIME_DIR / "KidnappingAbduction.csv")
    dacoity_df = safe_read_csv(CRIME_DIR / "DacoityCases.csv")

    print(f"Murder shape    : {murder_df.shape}")
    print(f"Kidnapping shape: {kidnap_df.shape}")
    print(f"Dacoity shape   : {dacoity_df.shape}")

    return murder_df, kidnap_df, dacoity_df


# ============================================================
# Merge + Feature Engineering
# ============================================================

def build_crime_master(
    murder_df:  pd.DataFrame,
    kidnap_df:  pd.DataFrame,
    dacoity_df: pd.DataFrame,
) -> pd.DataFrame:

    murder_long  = wide_to_long(murder_df,  "murder_cases")
    kidnap_long  = wide_to_long(kidnap_df,  "kidnapping_cases")
    dacoity_long = wide_to_long(dacoity_df, "dacoity_cases")

    master = (
        murder_long
        .merge(kidnap_long,  on=["district", "year"], how="outer")
        .merge(dacoity_long, on=["district", "year"], how="outer")
    )

    master = add_coordinates(master)
    master = master.sort_values(["district", "year"])

    # ── Core risk indices ──────────────────────────────────
    master["violent_crime_index"] = (
        master["murder_cases"]      * 3
        + master["kidnapping_cases"] * 2
        + master["dacoity_cases"]    * 2
    )
    master["organized_crime_index"] = master["dacoity_cases"] * 3
    master["women_threat_proxy"]    = master["kidnapping_cases"] * 2

    # ── Rolling temporal features ──────────────────────────
    grp = master.groupby("district")["violent_crime_index"]

    master["violent_crime_3yr_mean"] = grp.transform(
        lambda s: s.rolling(3, min_periods=1).mean()
    )
    master["violent_crime_3yr_std"] = grp.transform(
        lambda s: s.rolling(3, min_periods=1).std()
    )
    master["violent_crime_yoy_change"] = (
        master.groupby("district")["violent_crime_index"].pct_change()
    )
    master["murder_yoy_change"] = (
        master.groupby("district")["murder_cases"].pct_change()
    )
    master["kidnap_yoy_change"] = (
        master.groupby("district")["kidnapping_cases"].pct_change()
    )
    master["violent_trend_direction"] = np.where(
        master["violent_crime_yoy_change"] > 0, "RISING", "FALLING"
    )

    print(f"Crime master shape: {master.shape}")
    return master


# ============================================================
# Save
# ============================================================

def save(df: pd.DataFrame) -> None:
    out = CLEAN_DIR / "crime_master.parquet"
    df.to_parquet(out, index=False)
    print(f"Saved → {out}")


# ============================================================
# Entry Point
# ============================================================

def run() -> pd.DataFrame:
    murder_df, kidnap_df, dacoity_df = load_raw()
    master = build_crime_master(murder_df, kidnap_df, dacoity_df)
    save(master)
    return master


if __name__ == "__main__":
    run()
