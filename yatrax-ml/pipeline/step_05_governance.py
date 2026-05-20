# ============================================================
# step_05_governance.py
# Punjab Tourist Safety Intelligence Platform
#
# Input files (RAW_DIR/crime/):
#   PersonsProsecutedUnderMurderCases.csv
#   PersonsProsecutedUnderDacoity.csv
#   PersonsProsecutedUnderRobbery.csv
#
# Also reads (already saved):
#   CLEAN_DIR/crime_master.parquet  (to compute prosecution efficiency)
#
# Output:
#   CLEAN_DIR/governance_master.parquet
#
# Features built:
#   murder_prosecuted, dacoity_prosecuted, robbery_prosecuted
#   murder_prosecution_efficiency, dacoity_prosecution_efficiency
#   governance_reliability_score, weak_governance_flag
#   governance_3yr_mean, governance_yoy_change
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
    murder_df  = safe_read_csv(CRIME_DIR / "PersonsProsecutedUnderMurderCases.csv")
    dacoity_df = safe_read_csv(CRIME_DIR / "PersonsProsecutedUnderDacoity.csv")
    robbery_df = safe_read_csv(CRIME_DIR / "PersonsProsecutedUnderRobbery.csv")

    print(f"Murder prosecution  shape: {murder_df.shape}")
    print(f"Dacoity prosecution shape: {dacoity_df.shape}")
    print(f"Robbery prosecution shape: {robbery_df.shape}")

    return murder_df, dacoity_df, robbery_df


# ============================================================
# Build Governance Master
# ============================================================

def build_governance_master(
    murder_df:  pd.DataFrame,
    dacoity_df: pd.DataFrame,
    robbery_df: pd.DataFrame,
) -> pd.DataFrame:

    murder_long  = wide_to_long(murder_df,  "murder_prosecuted")
    dacoity_long = wide_to_long(dacoity_df, "dacoity_prosecuted")
    robbery_long = wide_to_long(robbery_df, "robbery_prosecuted")

    gov = (
        murder_long
        .merge(dacoity_long, on=["district", "year"], how="outer")
        .merge(robbery_long, on=["district", "year"], how="outer")
    )

    gov = add_coordinates(gov)

    # ── Merge crime counts to compute efficiency ───────────
    crime = pd.read_parquet(CLEAN_DIR / "crime_master.parquet")[
        ["district", "year", "murder_cases", "dacoity_cases"]
    ]
    gov = gov.merge(crime, on=["district", "year"], how="left")

    gov["murder_prosecution_efficiency"]  = (
        gov["murder_prosecuted"]  / gov["murder_cases"].replace(0, np.nan)
    )
    gov["dacoity_prosecution_efficiency"] = (
        gov["dacoity_prosecuted"] / gov["dacoity_cases"].replace(0, np.nan)
    )

    gov["governance_reliability_score"] = (
        gov["murder_prosecution_efficiency"]  * 0.6
        + gov["dacoity_prosecution_efficiency"] * 0.4
    )
    gov["weak_governance_flag"] = np.where(
        gov["governance_reliability_score"] < 0.5, 1, 0
    )

    # ── Rolling trends ─────────────────────────────────────
    gov = gov.sort_values(["district", "year"])

    gov["governance_3yr_mean"] = (
        gov.groupby("district")["governance_reliability_score"]
           .transform(lambda s: s.rolling(3, min_periods=1).mean())
    )
    gov["governance_yoy_change"] = (
        gov.groupby("district")["governance_reliability_score"]
           .pct_change()
    )

    print(f"Governance master shape: {gov.shape}")
    return gov


# ============================================================
# Save
# ============================================================

def save(df: pd.DataFrame) -> None:
    out = CLEAN_DIR / "governance_master.parquet"
    df.to_parquet(out, index=False)
    print(f"Saved → {out}")


# ============================================================
# Entry Point
# ============================================================

def run() -> pd.DataFrame:
    murder_df, dacoity_df, robbery_df = load_raw()
    master = build_governance_master(murder_df, dacoity_df, robbery_df)
    save(master)
    return master


if __name__ == "__main__":
    run()
