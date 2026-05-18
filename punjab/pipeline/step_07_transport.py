# ============================================================
# step_07_transport.py
# Punjab Tourist Safety Intelligence Platform
#
# Input files (RAW_DIR/transport/):
#   Transport18.4.csv
#   Transport18.10.csv
#
# Output:
#   CLEAN_DIR/transport_master.parquet
#
# Features built:
#   transport_metric_1, transport_metric_2
#   transport_accessibility_score
#   emergency_mobility_score  (= accessibility score, extendable)
#   tourist_mobility_score    (= accessibility score, extendable)
#   lat, lon
# ============================================================

import pandas as pd

from utils import (
    TRANSPORT_DIR,
    CLEAN_DIR,
    safe_read_csv,
    wide_to_long,
    add_coordinates,
    normalize_0_100,
)


# ============================================================
# Load
# ============================================================

def load_raw() -> tuple[pd.DataFrame, pd.DataFrame]:
    t4  = safe_read_csv(TRANSPORT_DIR / "Transport18.4.csv")
    t10 = safe_read_csv(TRANSPORT_DIR / "Transport18.10.csv")

    # Normalise column names
    t4.columns  = [str(c).strip() for c in t4.columns]
    t10.columns = [str(c).strip() for c in t10.columns]

    print(f"Transport18.4  shape: {t4.shape}")
    print(f"Transport18.10 shape: {t10.shape}")

    return t4, t10


# ============================================================
# Build Transport Master
# ============================================================

def build_transport_master(
    t4:  pd.DataFrame,
    t10: pd.DataFrame,
) -> pd.DataFrame:

    t4_long  = wide_to_long(t4,  "transport_metric_1")
    t10_long = wide_to_long(t10, "transport_metric_2")

    master = t4_long.merge(t10_long, on=["district", "year"], how="outer")

    master = add_coordinates(master)

    # ── Accessibility composite ────────────────────────────
    m1_norm = normalize_0_100(master["transport_metric_1"])
    m2_norm = normalize_0_100(master["transport_metric_2"])

    master["transport_accessibility_score"] = m1_norm * 0.5 + m2_norm * 0.5

    # Aliases — extend logic here when more data is available
    master["emergency_mobility_score"] = master["transport_accessibility_score"]
    master["tourist_mobility_score"]   = master["transport_accessibility_score"]

    print(f"Transport master shape: {master.shape}")
    return master


# ============================================================
# Save
# ============================================================

def save(df: pd.DataFrame) -> None:
    out = CLEAN_DIR / "transport_master.parquet"
    df.to_parquet(out, index=False)
    print(f"Saved → {out}")


# ============================================================
# Entry Point
# ============================================================

def run() -> pd.DataFrame:
    t4, t10 = load_raw()
    master  = build_transport_master(t4, t10)
    save(master)
    return master


if __name__ == "__main__":
    run()
