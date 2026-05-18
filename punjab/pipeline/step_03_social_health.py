# ============================================================
# step_03_social_health.py
# Punjab Tourist Safety Intelligence Platform
#
# Input file (RAW_DIR/health/):
#   NFHS4_PB_District_All_1_1.csv
#
# Output:
#   CLEAN_DIR/social_health_master.parquet
#
# Features built:
#   electricity_pct, drinking_water_pct, sanitation_pct
#   female_schooling_pct, women_higher_education_pct
#   institutional_birth_pct, women_insurance_pct
#   women_financial_independence_pct, child_stunting_pct
#   sex_ratio, sex_ratio_birth
#   basic_infra_score, women_empowerment_score
#   healthcare_access_score, social_resilience_score
#   lat, lon
# ============================================================

import pandas as pd

from utils import (
    HEALTH_DIR,
    CLEAN_DIR,
    safe_read_csv,
    safe_float,
    canonical_district,
    add_coordinates,
)


# ============================================================
# Indicators to Keep
# ============================================================

IMPORTANT_INDICATORS = [
    "3. Sex ratio of the total population (females per 1,000 males)",
    "4. Sex ratio at birth for children born in the last five years (females per 1,000 males)",
    "6. Households with electricity (%)",
    "7. Households with an improved drinking-water source (%)",
    "9. Households using improved sanitation facility (%)",
    "Population (female) age 6+ years who ever attended school (%)",
    "Women age 15-49 years who have completed 10 or more years of schooling (%)",
    "Institutional births (%)",
    "Women age 15-49 years covered by health insurance/financing scheme (%)",
    "Children under age 5 years who are stunted (%)",
    "Women who have a bank or savings account that they themselves use (%)",
]


# ============================================================
# Column → Short Name Mapping
# ============================================================

RENAME_KEYWORDS = {
    "electricity":             "electricity_pct",
    "drinking-water":          "drinking_water_pct",
    "drinking water":          "drinking_water_pct",
    "sanitation":              "sanitation_pct",
    "ever attended school":    "female_schooling_pct",
    "10 or more years of schooling": "women_higher_education_pct",
    "institutional births":    "institutional_birth_pct",
    "health insurance":        "women_insurance_pct",
    "bank or savings account": "women_financial_independence_pct",
    "stunted":                 "child_stunting_pct",
    "sex ratio of the total":  "sex_ratio",
    "sex ratio at birth":      "sex_ratio_birth",
}


# ============================================================
# Load + Filter
# ============================================================

def load_nfhs() -> pd.DataFrame:
    nfhs = safe_read_csv(HEALTH_DIR / "NFHS4_PB_District_All_1_1.csv")
    print(f"NFHS raw shape: {nfhs.shape}")

    # Keep only district-total columns (drop Rural/Urban/Note columns)
    keep_cols = ["Residence"]
    for c in nfhs.columns:
        if "- Total" in str(c) and "Note" not in str(c):
            keep_cols.append(c)

    nfhs = nfhs[keep_cols]
    print(f"After column filter: {nfhs.shape}")
    return nfhs


# ============================================================
# Filter Rows → Transpose → Clean
# ============================================================

def build_social_master(nfhs: pd.DataFrame) -> pd.DataFrame:

    # Keep only selected indicator rows
    filtered = nfhs[nfhs["Residence"].isin(IMPORTANT_INDICATORS)].copy()

    # Pivot: indicators become columns, districts become rows
    transposed = (
        filtered
        .set_index("Residence")
        .T
        .reset_index()
        .rename(columns={"index": "district_raw"})
    )

    # Clean district names
    transposed["district"] = (
        transposed["district_raw"]
        .str.replace("- Total", "", regex=False)
        .str.strip()
        .apply(canonical_district)
    )
    transposed = transposed.drop(columns=["district_raw"])

    # Numeric cleanup
    for c in transposed.columns:
        if c != "district":
            transposed[c] = safe_float(transposed[c])

    # ── Rename columns to short names ─────────────────────
    rename_map = {}
    for col in transposed.columns:
        for kw, short in RENAME_KEYWORDS.items():
            if kw.lower() in str(col).lower() and col not in rename_map:
                rename_map[col] = short
    transposed = transposed.rename(columns=rename_map)

    # ── Composite scores ───────────────────────────────────
    def _mean_available(df, cols):
        present = [c for c in cols if c in df.columns]
        return df[present].mean(axis=1) if present else 0

    transposed["basic_infra_score"] = _mean_available(
        transposed, ["electricity_pct", "drinking_water_pct", "sanitation_pct"]
    )
    transposed["women_empowerment_score"] = _mean_available(
        transposed, ["female_schooling_pct", "women_higher_education_pct",
                     "women_financial_independence_pct"]
    )
    transposed["healthcare_access_score"] = _mean_available(
        transposed, ["institutional_birth_pct", "women_insurance_pct"]
    )
    transposed["social_resilience_score"] = _mean_available(
        transposed, ["basic_infra_score", "women_empowerment_score",
                     "healthcare_access_score"]
    )

    transposed = add_coordinates(transposed)

    print(f"Social master shape: {transposed.shape}")
    return transposed


# ============================================================
# Save
# ============================================================

def save(df: pd.DataFrame) -> None:
    out = CLEAN_DIR / "social_health_master.parquet"
    df.to_parquet(out, index=False)
    print(f"Saved → {out}")


# ============================================================
# Entry Point
# ============================================================

def run() -> pd.DataFrame:
    nfhs = load_nfhs()
    master = build_social_master(nfhs)
    save(master)
    return master


if __name__ == "__main__":
    run()
