# ============================================================
# step_09_master_merge.py
# Punjab Tourist Safety Intelligence Platform
#
# FINAL PHASE 1B VERSION
#
# Features:
#   - Relative + absolute safety semantics
#   - Resilience-aware scoring
#   - Confidence estimation
#   - Feature contribution auditing
#   - Explainability layer
#   - Tourism safety categorization
#
# Output:
#   CLEAN_DIR/punjab_master_features.parquet
# ============================================================

import numpy as np
import pandas as pd

from utils import (
    CLEAN_DIR,
    normalize_0_100,
    DISTRICT_CENTROIDS,
)

VALID_DISTRICTS = set(DISTRICT_CENTROIDS.keys())


# ============================================================
# Load Layers
# ============================================================

def load_layers() -> dict[str, pd.DataFrame]:
    layers = {
        "accident": pd.read_parquet(
            CLEAN_DIR / "accident_master.parquet"
        ),

        "crime": pd.read_parquet(
            CLEAN_DIR / "crime_master.parquet"
        ),

        "social": pd.read_parquet(
            CLEAN_DIR / "social_health_master.parquet"
        ),

        "environment": pd.read_parquet(
            CLEAN_DIR / "environment_master.parquet"
        ),

        "context": pd.read_parquet(
            CLEAN_DIR / "contextual_intelligence.parquet"
        ),
    }

    for name, df in layers.items():
        print(f"{name:12s}: {df.shape}")

    return layers


# ============================================================
# Utilities
# ============================================================

def latest_snapshot(df: pd.DataFrame) -> pd.DataFrame:
    return df[df["year"] == df["year"].max()].copy()


ACC_COLS = [
    "district",
    "lat",
    "lon",
    "accidents",
    "injured",
    "killed",
    "fatality_rate",
    "injury_rate",
    "severity_index",
    "accident_confidence",
]

CRIME_COLS = [
    "district",
    "violent_crime_index",
    "organized_crime_index",
    "women_threat_proxy",
    "violent_crime_3yr_mean",
]


def _select(
    df: pd.DataFrame,
    cols: list[str]
) -> pd.DataFrame:

    return df[
        [c for c in cols if c in df.columns]
    ].copy()


def _drop_coords_year(
    df: pd.DataFrame
) -> pd.DataFrame:

    return df.drop(
        columns=[
            c for c in ["lat", "lon", "year"]
            if c in df.columns
        ],
        errors="ignore",
    )


def _ensure_numeric(
    master: pd.DataFrame,
    col: str,
    fallback: float = 50.0,
) -> None:

    if col not in master.columns:
        master[col] = fallback
        return

    master[col] = pd.to_numeric(
        master[col],
        errors="coerce",
    )

    if master[col].isna().all():
        master[col] = fallback

    else:
        master[col] = (
            master[col]
            .fillna(master[col].median())
        )


# ============================================================
# Build Master Table
# ============================================================

def build_master(
    layers: dict[str, pd.DataFrame]
) -> pd.DataFrame:

    acc_latest = latest_snapshot(
        layers["accident"]
    )

    crime_latest = latest_snapshot(
        layers["crime"]
    )

    social_latest = layers["social"].copy()

    env_latest = layers["environment"].copy()

    acc_s = _select(acc_latest, ACC_COLS)

    crime_s = _select(crime_latest, CRIME_COLS)

    social_s = _drop_coords_year(
        social_latest
    )

    env_s = _drop_coords_year(
        env_latest
    )

    master = (
        acc_s
        .merge(crime_s, on="district", how="outer")
        .merge(social_s, on="district", how="outer")
        .merge(env_s, on="district", how="outer")
    )

    master["district"] = (
        master["district"]
        .astype(str)
        .str.strip()
    )

    master = (
        master[
            master["district"]
            .isin(VALID_DISTRICTS)
        ]
        .copy()
    )

    # ========================================================
    # Track missing data BEFORE imputation
    # ========================================================

    numeric_cols = master.select_dtypes(
        include=np.number
    ).columns

    missing_before_fill = (
        master[numeric_cols]
        .isna()
    )

    # ========================================================
    # Numeric fills
    # ========================================================

    for c in numeric_cols:

        if master[c].isna().all():
            master[c] = 50

        else:
            master[c] = (
                master[c]
                .fillna(master[c].median())
            )

    # ========================================================
    # Object fills
    # ========================================================

    for c in master.select_dtypes(
        include="object"
    ).columns:

        master[c] = (
            master[c]
            .fillna("UNKNOWN")
        )

    # ========================================================
    # REAL completeness tracking
    # ========================================================

    master["feature_completeness"] = (
        100
        - (
            missing_before_fill.sum(axis=1)
            / missing_before_fill.shape[1]
            * 100
        )
    )

    print(
        f"Master shape after merge: {master.shape}"
    )

    return master


# ============================================================
# Score Master
# ============================================================

def score_master(
    master: pd.DataFrame
) -> pd.DataFrame:

    # ========================================================
    # Ensure required numeric fields
    # ========================================================

    for col in [
        "violent_crime_index",
        "severity_index",
        "environmental_risk_score",
        "social_resilience_score",
        "fatality_rate",
    ]:

        _ensure_numeric(master, col)

    # ========================================================
    # Relative risk normalization
    # ========================================================

    master["crime_risk_score"] = (
        normalize_0_100(
            master["violent_crime_index"]
        )
    )

    master["accident_risk_score"] = (
        normalize_0_100(
            master["severity_index"]
        )
    )

    master["environment_risk_score"] = (
        normalize_0_100(
            master["environmental_risk_score"]
        )
    )

    master["social_vulnerability_score"] = (
        100
        - normalize_0_100(
            master["social_resilience_score"]
        )
    )

    # ========================================================
    # Relative risk layer
    # ========================================================

    master["relative_risk_score"] = (
        master["crime_risk_score"] * 0.40
        + master["accident_risk_score"] * 0.30
        + master["social_vulnerability_score"] * 0.20
        + master["environment_risk_score"] * 0.10
    )

    # ========================================================
    # Absolute danger semantics
    # ========================================================

    master["absolute_danger_score"] = 0

    # Fatality severity
    master.loc[
        master["fatality_rate"] > 0.60,
        "absolute_danger_score"
    ] += 25

    # Violent crime spike
    master.loc[
        master["violent_crime_index"]
        >
        master["violent_crime_index"]
        .quantile(0.85),

        "absolute_danger_score"
    ] += 25

    # Environmental danger
    master.loc[
        master["environment_risk_score"] > 75,
        "absolute_danger_score"
    ] += 15

    # Social vulnerability
    master.loc[
        master["social_vulnerability_score"] > 70,
        "absolute_danger_score"
    ] += 15

    # ========================================================
    # Blend relative + absolute semantics
    # ========================================================

    master["tourist_safety_risk"] = (
        master["relative_risk_score"] * 0.80
        + master["absolute_danger_score"] * 0.20
    )

    # ========================================================
    # Resilience Buffer
    # ========================================================

    for col in [
        "healthcare_access_score",
        "basic_infra_score",
        "women_empowerment_score",
        "transport_accessibility_score",
    ]:

        _ensure_numeric(master, col)

    master["resilience_buffer"] = (
        normalize_0_100(
            master["healthcare_access_score"]
        ) * 0.4

        +

        normalize_0_100(
            master["basic_infra_score"]
        ) * 0.3

        +

        normalize_0_100(
            master["women_empowerment_score"]
        ) * 0.2

        +

        normalize_0_100(
            master["transport_accessibility_score"]
        ) * 0.1
    )

    # Moderate resilience correction (0.10 multiplier)
    # Resilience should MODERATE risk, not erase it.
    # Strong infrastructure can offset ~10 points of raw risk.
    master["tourist_safety_risk"] = (
        master["tourist_safety_risk"]
        - master["resilience_buffer"] * 0.10
    )

    master["tourist_safety_risk"] = (
        master["tourist_safety_risk"]
        .clip(0, 100)
    )

    # ========================================================
    # Final safety score
    # ========================================================

    master["tourist_safety_score"] = (
        100
        - master["tourist_safety_risk"]
    )

    # ========================================================
    # Contribution audit
    # ========================================================

    master["crime_contribution"] = (
        master["crime_risk_score"] * 0.40
    )

    master["accident_contribution"] = (
        master["accident_risk_score"] * 0.30
    )

    master["social_contribution"] = (
        master["social_vulnerability_score"] * 0.20
    )

    master["environment_contribution"] = (
        master["environment_risk_score"] * 0.10
    )

    master["resilience_contribution"] = (
        master["resilience_buffer"] * 0.10  # Updated: 0.10 multiplier
    )

    # ========================================================
    # Confidence layer
    # ========================================================

    if "accident_confidence" not in master.columns:

        master["accident_confidence"] = (
            "MEDIUM"
        )

    else:

        master["accident_confidence"] = (
            master["accident_confidence"]
            .fillna("MEDIUM")
        )

    accident_conf_weight = (
        master["accident_confidence"]
        .map({
            "HIGH": 3.0,
            "MEDIUM": 2.0,
            "LOW": 1.0,
            "UNKNOWN": 1.5,
        })
        .fillna(2.0)
    )

    # Calculate overall confidence (bounded to 0-100)
    # Accident confidence weight: 20% of score
    # Feature completeness: 40% of score
    # This prevents overflow (max = 3*20 + 1*40 = 100)
    master["overall_confidence"] = (
        accident_conf_weight * 20
        + (
            master["feature_completeness"]
            / 100
        ) * 40
    )
    
    # Ensure confidence stays within 0-100 range
    master["overall_confidence"] = (
        master["overall_confidence"].clip(0, 100)
    )

    master["confidence_level"] = pd.cut(
        master["overall_confidence"],
        bins=[0, 50, 75, 100],
        labels=[
            "LOW_CONFIDENCE",
            "MEDIUM_CONFIDENCE",
            "HIGH_CONFIDENCE",
        ],
    )

    # ========================================================
    # Semantic safety categories
    # ========================================================

    master["tourism_safety_category"] = (
        pd.cut(
            master["tourist_safety_score"],
            bins=[0, 35, 50, 65, 80, 100],
            labels=[
                "CRITICAL_RISK",
                "HIGH_RISK",
                "MODERATE_RISK",
                "RELATIVELY_SAFE",
                "HIGH_RESILIENCE",
            ],
        )
    )

    return master


# ============================================================
# Explainability
# ============================================================

def explain_risk(
    row: pd.Series
) -> str:

    reasons = []

    if row.get(
        "crime_risk_score",
        0
    ) > 75:

        reasons.append(
            "Elevated violent crime pressure"
        )

    if row.get(
        "accident_risk_score",
        0
    ) > 75:

        reasons.append(
            "Severe road accident conditions"
        )

    if row.get(
        "environment_risk_score",
        0
    ) > 75:

        reasons.append(
            "Environmental/public-health concerns"
        )

    if row.get(
        "social_vulnerability_score",
        0
    ) > 75:

        reasons.append(
            "Weak social resilience indicators"
        )

    if row.get(
        "ecological_context_score",
        0
    ) > 70:

        reasons.append(
            "Ecologically sensitive tourism zone"
        )

    if row.get(
        "absolute_danger_score",
        0
    ) > 40:

        reasons.append(
            "High absolute danger indicators"
        )

    return (
        "; ".join(reasons)
        if reasons
        else "Relatively stable tourism district"
    )


def add_explainability(
    master: pd.DataFrame
) -> pd.DataFrame:

    master["risk_explanation"] = (
        master.apply(
            explain_risk,
            axis=1,
        )
    )

    master["district_rank"] = (
        master["tourist_safety_score"]
        .rank(
            ascending=False,
            method="dense",
        )
    )

    master["ranking_note"] = (
        master["confidence_level"]
        .astype(str)
    )

    return master


# ============================================================
# Save
# ============================================================

def save(
    df: pd.DataFrame
) -> None:

    out = (
        CLEAN_DIR
        / "punjab_master_features.parquet"
    )

    df.to_parquet(
        out,
        index=False,
    )

    print(f"Saved → {out}")


# ============================================================
# Entry Point
# ============================================================

def run() -> pd.DataFrame:

    layers = load_layers()

    master = build_master(layers)

    # ========================================================
    # Broadcast scalar context values
    # ========================================================

    ctx = layers["context"].iloc[0].to_dict()

    for k, v in ctx.items():
        master[k] = v

    master = score_master(master)

    master = add_explainability(master)

    print("\n── District Safety Ranking ──")

    print(
        master[
            [
                "district",
                "tourist_safety_score",
                "district_rank",
                "tourism_safety_category",
                "confidence_level",
                "risk_explanation",
            ]
        ]
        .sort_values("district_rank")
        .to_string(index=False)
    )

    save(master)

    return master


if __name__ == "__main__":
    run()