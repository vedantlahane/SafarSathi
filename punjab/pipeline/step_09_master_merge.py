import numpy as np
import pandas as pd

from utils import CLEAN_DIR, normalize_0_100, DISTRICT_CENTROIDS

VALID_DISTRICTS = set(DISTRICT_CENTROIDS.keys())


def load_layers() -> dict[str, pd.DataFrame]:
    layers = {
        "accident":    pd.read_parquet(CLEAN_DIR / "accident_master.parquet"),
        "crime":       pd.read_parquet(CLEAN_DIR / "crime_master.parquet"),
        "social":      pd.read_parquet(CLEAN_DIR / "social_health_master.parquet"),
        "environment": pd.read_parquet(CLEAN_DIR / "environment_master.parquet"),
        "context":     pd.read_parquet(CLEAN_DIR / "contextual_intelligence.parquet"),
    }
    for name, df in layers.items():
        print(f"{name:12s}: {df.shape}")
    return layers


def latest_snapshot(df: pd.DataFrame) -> pd.DataFrame:
    return df[df["year"] == df["year"].max()].copy()


ACC_COLS = [
    "district", "lat", "lon",
    "accidents", "injured", "killed",
    "fatality_rate", "injury_rate", "severity_index",
]

CRIME_COLS = [
    "district",
    "violent_crime_index", "organized_crime_index",
    "women_threat_proxy", "violent_crime_3yr_mean",
]

def _select(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    return df[[c for c in cols if c in df.columns]].copy()


def _drop_coords_year(df: pd.DataFrame) -> pd.DataFrame:
    return df.drop(columns=[c for c in ["lat", "lon", "year"] if c in df.columns], errors="ignore")


def _ensure_numeric(master: pd.DataFrame, col: str, fallback: float = 50.0) -> None:
    if col not in master.columns:
        master[col] = fallback
        return

    master[col] = pd.to_numeric(master[col], errors="coerce")
    if master[col].isna().all():
        master[col] = fallback
    else:
        master[col] = master[col].fillna(master[col].median())


def build_master(layers: dict[str, pd.DataFrame]) -> pd.DataFrame:
    acc_latest   = latest_snapshot(layers["accident"])
    crime_latest = latest_snapshot(layers["crime"])
    social_latest = layers["social"].copy()
    env_latest    = layers["environment"].copy()

    acc_s    = _select(acc_latest, ACC_COLS)
    crime_s  = _select(crime_latest, CRIME_COLS)
    social_s = _drop_coords_year(social_latest)
    env_s    = _drop_coords_year(env_latest)

    master = (
        acc_s
        .merge(crime_s,  on="district", how="outer")
        .merge(social_s, on="district", how="outer")
        .merge(env_s,    on="district", how="outer")
    )

    master["district"] = master["district"].astype(str).str.strip()
    master = master[master["district"].isin(VALID_DISTRICTS)].copy()

    for c in master.select_dtypes(include=np.number).columns:
        master[c] = master[c].fillna(master[c].median())

    for c in master.select_dtypes(include="object").columns:
        master[c] = master[c].fillna("UNKNOWN")

    print(f"Master shape after merge: {master.shape}")
    return master


def score_master(master: pd.DataFrame) -> pd.DataFrame:
    # Ensure all required numeric inputs exist and are usable
    for col in [
        "violent_crime_index",
        "severity_index",
        "environmental_risk_score",
        "social_resilience_score",
    ]:
        _ensure_numeric(master, col, fallback=50.0)

    master["crime_risk_score"] = normalize_0_100(master["violent_crime_index"])
    master["accident_risk_score"] = normalize_0_100(master["severity_index"])
    master["environment_risk_score"] = normalize_0_100(master["environmental_risk_score"])
    master["social_vulnerability_score"] = 100 - normalize_0_100(master["social_resilience_score"])

    # Updated weights: environment reduced from 15% to 10%
    # Crime and accident importance increased
    master["tourist_safety_risk"] = (
        master["crime_risk_score"] * 0.40
        + master["accident_risk_score"] * 0.30
        + master["social_vulnerability_score"] * 0.20
        + master["environment_risk_score"] * 0.10
    )

    # ============================================================
    # Urban/Institutional Resilience Buffer
    # ============================================================
    # CRITICAL INSIGHT:
    # Tourist safety is NOT just "absence of incidents"
    # It is: "danger adjusted by resilience capacity"
    #
    # Urban districts naturally have more activity (accidents, crime)
    # BUT ALSO more capacity (hospitals, infrastructure, response)
    #
    # This buffer prevents unfair penalization of urban centers
    # where high incident density is offset by high institutional strength.
    
    _ensure_numeric(master, "healthcare_access_score", fallback=50.0)
    _ensure_numeric(master, "basic_infra_score", fallback=50.0)
    _ensure_numeric(master, "women_empowerment_score", fallback=50.0)
    _ensure_numeric(master, "transport_accessibility_score", fallback=50.0)
    
    # Build resilience from institutional capacity
    master["resilience_buffer"] = (
        normalize_0_100(master["healthcare_access_score"]) * 0.4
        + normalize_0_100(master["basic_infra_score"]) * 0.3
        + normalize_0_100(master["women_empowerment_score"]) * 0.2
        + normalize_0_100(master["transport_accessibility_score"]) * 0.1
    )
    
    # Reduce raw risk by resilience offset (25% of buffer strength)
    # This means: strong infrastructure can mitigate up to 25 points of risk
    master["tourist_safety_risk"] = (
        master["tourist_safety_risk"]
        - master["resilience_buffer"] * 0.25
    )
    
    # Ensure risk remains in valid [0, 100] range
    master["tourist_safety_risk"] = master["tourist_safety_risk"].clip(0, 100)

    master["tourist_safety_score"] = 100 - master["tourist_safety_risk"]
    
    # ============================================================
    # Feature Contribution Audit
    # ============================================================
    # CRITICAL FOR TRANSPARENCY:
    # Show exactly how much each factor contributes to final score.
    # Helps identify feature dominance and unrealistic weighting.
    
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
        master["resilience_buffer"] * 0.25  # How much resilience reduced risk
    )
    
    # ============================================================
    # Confidence Layer
    # ============================================================
    # NOT all districts should be treated equally.
    # Some have sparse data, weak coverage, or low-confidence estimates.
    # This layer flags which rankings are trustworthy.
    
    _ensure_numeric(master, "accident_confidence", fallback="MEDIUM")
    
    # Calculate data completeness (how many non-missing numeric features)
    numeric_cols = master.select_dtypes(include=np.number).columns
    master["feature_completeness"] = (
        master[numeric_cols].notna().sum(axis=1) / len(numeric_cols) * 100
    )
    
    # Overall confidence based on:
    # - accident data confidence (HIGH/MEDIUM/LOW)
    # - feature completeness (% of non-missing features)
    # - accident volume (more data = more confidence)
    
    accident_conf_weight = master["accident_confidence"].map({
        "HIGH": 3.0,
        "MEDIUM": 2.0,
        "LOW": 1.0,
        "UNKNOWN": 1.5
    }).fillna(2.0)
    
    master["overall_confidence"] = (
        accident_conf_weight * 25
        + (master["feature_completeness"] / 100) * 75
    )
    
    # Confidence categories
    master["confidence_level"] = pd.cut(
        master["overall_confidence"],
        bins=[0, 50, 75, 100],
        labels=["LOW_CONFIDENCE", "MEDIUM_CONFIDENCE", "HIGH_CONFIDENCE"]
    )
    
    return master


def explain_risk(row: pd.Series) -> str:
    """
    Explain safety risk using actual danger signals.
    Separates danger from ecological/tourism context.
    """
    reasons = []

    if row.get("crime_risk_score", 0) > 75:
        reasons.append("Elevated violent crime pressure")

    if row.get("accident_risk_score", 0) > 75:
        reasons.append("Severe road accident conditions")

    if row.get("environment_risk_score", 0) > 75:
        reasons.append("Environmental/public-health concerns")

    if row.get("social_vulnerability_score", 0) > 75:
        reasons.append("Weak social resilience indicators")

    # Distinguish between danger and ecological richness
    if row.get("ecological_context_score", 0) > 70:
        reasons.append("Ecologically sensitive tourism zone")

    return (
        "; ".join(reasons)
        if reasons
        else "Relatively stable tourism district"
    )


def add_explainability(master: pd.DataFrame) -> pd.DataFrame:
    master["risk_explanation"] = master.apply(explain_risk, axis=1)
    master["district_rank"] = master["tourist_safety_score"].rank(ascending=False, method="dense")
    
    # Add confidence indicator to ranking output
    master["ranking_note"] = master["confidence_level"].astype(str)
    
    return master


def save(df: pd.DataFrame) -> None:
    out = CLEAN_DIR / "punjab_master_features.parquet"
    df.to_parquet(out, index=False)
    print(f"Saved → {out}")


def run() -> pd.DataFrame:
    layers = load_layers()
    master = build_master(layers)

    # broadcast scalar context values to all districts
    ctx = layers["context"].iloc[0].to_dict()
    for k, v in ctx.items():
        master[k] = v

    master = score_master(master)
    master = add_explainability(master)

    print("\n── District Safety Ranking ──")
    print(
        master[["district", "tourist_safety_score", "district_rank", "risk_explanation"]]
        .sort_values("district_rank")
        .to_string(index=False)
    )

    save(master)
    return master


if __name__ == "__main__":
    run()