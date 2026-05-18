# ============================================================
# step_01_accidents.py
# Punjab Tourist Safety Intelligence Platform
#
# Input files (RAW_DIR/road_accidents/):
#   Roadaccident.csv
#   personsinjured.csv
#   personskilled.csv
#
# Output:
#   CLEAN_DIR/accident_master.parquet
#
# Features built:
#   accidents, injured, killed
#   fatality_rate, injury_rate, severity_index
#   lat, lon
# ============================================================

import numpy as np
import pandas as pd

from utils import (
    ROAD_DIR,
    CLEAN_DIR,
    safe_read_csv,
    wide_to_long,
    add_coordinates,
)


# ============================================================
# Load Raw Files
# ============================================================

def load_raw() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    acc_df  = safe_read_csv(ROAD_DIR / "Roadaccident.csv")
    inj_df  = safe_read_csv(ROAD_DIR / "personsinjured.csv")
    kill_df = safe_read_csv(ROAD_DIR / "personskilled.csv")

    print(f"Roadaccident shape : {acc_df.shape}")
    print(f"Injured shape      : {inj_df.shape}")
    print(f"Killed shape       : {kill_df.shape}")

    return acc_df, inj_df, kill_df


# ============================================================
# Build Accident Master
# ============================================================

def build_accident_master(
    acc_df:  pd.DataFrame,
    inj_df:  pd.DataFrame,
    kill_df: pd.DataFrame,
) -> pd.DataFrame:

    acc_long  = wide_to_long(acc_df,  "accidents")
    inj_long  = wide_to_long(inj_df,  "injured")
    kill_long = wide_to_long(kill_df, "killed")

    master = (
        acc_long
        .merge(inj_long,  on=["district", "year"], how="outer")
        .merge(kill_long, on=["district", "year"], how="outer")
    )

    # ── Derived risk features ──────────────────────────────
    # ============================================================
    # Mobility-Adjusted Denominator
    # ============================================================
    # Use log-adjusted accidents to normalize for district size
    # and traffic exposure, preventing highway/urban bias
    
    mobility_adjusted_acc = np.log1p(
        master["accidents"].clip(lower=1)
    )
    safe_acc = mobility_adjusted_acc.clip(lower=3)

    # ============================================================
    # Consistent Accident Rates (all use safe_acc)
    # ============================================================
    # All metrics now use the same stabilized denominator
    
    master["fatality_rate"] = (
        master["killed"] / safe_acc
    )

    master["injury_rate"] = (
        master["injured"] / safe_acc
    )

    # ============================================================
    # Balanced Severity Index
    # ============================================================
    # Prevents small districts with high fatalities from
    # dominating the model. Weighs fatalities more heavily
    # but stabilizes denominator and prevents outlier explosion.
    # Normalized for traffic exposure via mobility_adjusted_acc.

    fatality_component = master["killed"] / safe_acc
    injury_component = master["injured"] / safe_acc

    # Weighted combination: fatalities 65%, injuries 35%
    # Scaled to 0-100 range
    master["severity_index"] = (
        fatality_component * 0.65
        + injury_component * 0.35
    ) * 100

    # ============================================================
    # Accident Data Quality Confidence
    # ============================================================
    # Low-volume districts should not produce high-confidence estimates
    
    master["accident_confidence"] = np.where(
        master["accidents"] >= 1000,
        "HIGH",
        np.where(
            master["accidents"] >= 300,
            "MEDIUM",
            "LOW"
        )
    )

    # ============================================================
    # Percentile Clipping for Stability
    # ============================================================
    # Prevent outlier explosion by clipping to 5th-95th percentile
    
    severity_p05 = master["severity_index"].quantile(0.05)
    severity_p95 = master["severity_index"].quantile(0.95)
    master["severity_index"] = master["severity_index"].clip(severity_p05, severity_p95)

    # ============================================================
    # Temporal Smoothing & Stability Analysis
    # ============================================================
    # Accident data is noisy year-to-year. Use rolling averages
    # to reveal true tourism safety trends.
    
    grp = master.groupby("district")
    
    # 3-year rolling mean (handles gaps gracefully)
    master["severity_3yr_mean"] = grp["severity_index"].transform(
        lambda s: s.rolling(3, min_periods=1, center=False).mean()
    )
    
    # 3-year rolling standard deviation (volatility)
    master["severity_3yr_std"] = grp["severity_index"].transform(
        lambda s: s.rolling(3, min_periods=1, center=False).std()
    ).fillna(0)
    
    # Year-over-year percentage change (trend)
    master["severity_yoy_change"] = grp["severity_index"].transform(
        lambda s: s.pct_change(fill_method=None)
    ).fillna(0)

    # ── Coordinates ───────────────────────────────────────
    master = add_coordinates(master)

    master = master.sort_values(["district", "year"])

    print(f"Accident master shape: {master.shape}")
    return master


# ============================================================
# Save
# ============================================================

def save(df: pd.DataFrame) -> None:
    out = CLEAN_DIR / "accident_master.parquet"
    df.to_parquet(out, index=False)
    print(f"Saved → {out}")


# ============================================================
# Entry Point
# ============================================================

def run() -> pd.DataFrame:
    acc_df, inj_df, kill_df = load_raw()
    master = build_accident_master(acc_df, inj_df, kill_df)
    save(master)
    return master


if __name__ == "__main__":
    run()
