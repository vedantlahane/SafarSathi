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

    master["tourist_safety_score"] = 100 - master["tourist_safety_risk"]
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