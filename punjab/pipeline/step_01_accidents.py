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
    safe_acc = master["accidents"].replace(0, np.nan)

    master["fatality_rate"]  = master["killed"]  / safe_acc
    master["injury_rate"]    = master["injured"]  / safe_acc
    master["severity_index"] = (master["killed"] * 3 + master["injured"]) / safe_acc

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
