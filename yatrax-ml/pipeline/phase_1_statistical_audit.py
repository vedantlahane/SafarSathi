#!/usr/bin/env python3
# ============================================================
# phase_1_statistical_audit.py
# Punjab Tourist Safety Intelligence Platform
#
# Phase 1.2 — Statistical Calibration Audit
#
# Tasks:
# 1. Feature Contribution Audit — what drives rankings
# 2. Correlation Audit — feature dominance
# 3. Distribution Audit — score spreads and realism
# 4. Confidence Layer Audit — data quality flags
# 5. Ranking Aggression — compression effectiveness
# ============================================================

import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path("C:/Users/Admin/Desktop/YatraX/punjab")
CLEAN_DIR = BASE_DIR / "data" / "clean"


def load_master() -> pd.DataFrame:
    """Load the final merged master features."""
    master = pd.read_parquet(CLEAN_DIR / "punjab_master_features.parquet")
    print(f"Master loaded: {master.shape}")
    return master


def audit_1_feature_contributions(master: pd.DataFrame) -> None:
    """
    TASK 1: Feature Contribution Audit
    
    Show how much each factor contributes to the final score.
    Identifies feature dominance issues.
    """
    print("\n" + "=" * 80)
    print("AUDIT 1: FEATURE CONTRIBUTION ANALYSIS")
    print("=" * 80)
    
    contrib_cols = [
        "crime_contribution",
        "accident_contribution",
        "social_contribution",
        "environment_contribution",
        "resilience_contribution",
    ]
    
    # Only use columns that exist
    contrib_cols = [c for c in contrib_cols if c in master.columns]
    
    if not contrib_cols:
        print("No contribution columns found. Skipping.")
        return
    
    contrib_df = master[["district"] + contrib_cols].copy()
    
    print("\nFeature Contributions by District (top 10 by safety score):")
    print(contrib_df.head(10).to_string(index=False))
    
    print("\n\nFeature Contributions by District (bottom 10 by safety score):")
    print(contrib_df.tail(10).to_string(index=False))
    
    print("\n\nMean Contributions Across All Districts:")
    means = master[contrib_cols].mean()
    print(means.to_string())
    
    print("\n\nStandard Deviations (variability of each factor):")
    stds = master[contrib_cols].std()
    print(stds.to_string())
    
    print("\n\nKey Observation:")
    dominant_col = means.idxmax()
    print(f"  → {dominant_col}: {means[dominant_col]:.2f} points (MOST DOMINANT)")
    for col in contrib_cols:
        if col != dominant_col:
            pct = (means[col] / means[dominant_col] * 100)
            print(f"  → {col}: {means[col]:.2f} points ({pct:.1f}% of dominant)")


def audit_2_correlation_analysis(master: pd.DataFrame) -> None:
    """
    TASK 2: Correlation Audit
    
    Find feature dominance and duplicated signals.
    High correlations indicate redundant features.
    """
    print("\n" + "=" * 80)
    print("AUDIT 2: CORRELATION & FEATURE DOMINANCE ANALYSIS")
    print("=" * 80)
    
    numeric_cols = master.select_dtypes(include=np.number).columns.tolist()
    
    if len(numeric_cols) < 2:
        print("Not enough numeric columns for correlation analysis.")
        return
    
    corr_matrix = master[numeric_cols].corr()
    
    # Find high correlations (but not self-correlations)
    print("\n\nHigh Correlations (|r| > 0.70) - Potential Redundancy:")
    high_corr_pairs = []
    for i in range(len(corr_matrix.columns)):
        for j in range(i + 1, len(corr_matrix.columns)):
            val = corr_matrix.iloc[i, j]
            if abs(val) > 0.70:
                col1 = corr_matrix.columns[i]
                col2 = corr_matrix.columns[j]
                high_corr_pairs.append((col1, col2, val))
    
    if high_corr_pairs:
        for col1, col2, val in sorted(high_corr_pairs, key=lambda x: abs(x[2]), reverse=True):
            print(f"  {col1:40s} <---> {col2:40s}  r={val:+.3f}")
    else:
        print("  (None found — good feature independence)")
    
    print("\n\nCorrelation with Final Score (tourist_safety_score):")
    if "tourist_safety_score" in master.columns:
        score_corr = corr_matrix["tourist_safety_score"].sort_values(ascending=False)
        print(score_corr.head(15).to_string())


def audit_3_distribution_analysis(master: pd.DataFrame) -> None:
    """
    TASK 3: Distribution Audit
    
    Check if score spreads are realistic.
    Extreme min/max indicates ranking aggression.
    """
    print("\n" + "=" * 80)
    print("AUDIT 3: DISTRIBUTION & SCORE SPREAD ANALYSIS")
    print("=" * 80)
    
    key_cols = [
        "tourist_safety_score",
        "crime_risk_score",
        "accident_risk_score",
        "social_vulnerability_score",
        "environment_risk_score",
        "resilience_buffer",
    ]
    
    key_cols = [c for c in key_cols if c in master.columns]
    
    print("\n\nDescriptive Statistics (Full Distribution):")
    print(master[key_cols].describe().to_string())
    
    print("\n\nScore Spread Analysis:")
    for col in key_cols:
        if col in master.columns:
            min_val = master[col].min()
            max_val = master[col].max()
            mean_val = master[col].mean()
            spread = max_val - min_val
            
            print(f"\n  {col}:")
            print(f"    Range:  {min_val:.2f} to {max_val:.2f}")
            print(f"    Spread: {spread:.2f} points")
            print(f"    Mean:   {mean_val:.2f}")
    
    print("\n\nKey Observation:")
    if "tourist_safety_score" in master.columns:
        spread = master["tourist_safety_score"].max() - master["tourist_safety_score"].min()
        print(f"  → Final score spread: {spread:.2f} points")
        if spread > 40:
            print(f"  → ⚠️  STILL AGGRESSIVE (compression target: 20-30 points)")
        else:
            print(f"  → ✓ GOOD COMPRESSION (realistic differences)")


def audit_4_confidence_layer(master: pd.DataFrame) -> None:
    """
    TASK 4: Confidence Layer Audit
    
    Check data quality and confidence flags.
    Identifies low-confidence rankings.
    """
    print("\n" + "=" * 80)
    print("AUDIT 4: CONFIDENCE LAYER & DATA QUALITY ANALYSIS")
    print("=" * 80)
    
    if "confidence_level" not in master.columns:
        print("No confidence_level column. Skipping.")
        return
    
    print("\n\nConfidence Distribution:")
    conf_counts = master["confidence_level"].value_counts()
    print(conf_counts)
    
    print("\n\nDistricts by Confidence Level:")
    for level in ["HIGH_CONFIDENCE", "MEDIUM_CONFIDENCE", "LOW_CONFIDENCE"]:
        districts = master[master["confidence_level"] == level]["district"].tolist()
        if districts:
            print(f"\n  {level}: {', '.join(districts)}")
    
    print("\n\nFeature Completeness Distribution:")
    if "feature_completeness" in master.columns:
        print(master[["district", "feature_completeness", "confidence_level"]].sort_values("feature_completeness").to_string(index=False))
    
    print("\n\nKey Observation:")
    high_conf = (master["confidence_level"] == "HIGH_CONFIDENCE").sum()
    total = len(master)
    pct = (high_conf / total * 100)
    print(f"  → {high_conf}/{total} districts ({pct:.1f}%) have HIGH confidence")
    print(f"  → Rankings for LOW_CONFIDENCE districts should be treated cautiously")


def audit_5_ranking_stability(master: pd.DataFrame) -> None:
    """
    TASK 5: Ranking Aggression Assessment
    
    Check if compression fixed the ranking aggression problem.
    """
    print("\n" + "=" * 80)
    print("AUDIT 5: RANKING COMPRESSION & STABILITY ASSESSMENT")
    print("=" * 80)
    
    if "tourist_safety_score" not in master.columns:
        print("No tourist_safety_score column. Skipping.")
        return
    
    scores = master["tourist_safety_score"]
    
    print("\n\nFinal Ranking Spread:")
    print(f"  Min Score:     {scores.min():.2f}")
    print(f"  Max Score:     {scores.max():.2f}")
    print(f"  Spread:        {scores.max() - scores.min():.2f} points")
    print(f"  Mean:          {scores.mean():.2f}")
    print(f"  Median:        {scores.median():.2f}")
    print(f"  Std Dev:       {scores.std():.2f}")
    
    print("\n\nScore Distribution in Ranges:")
    ranges = [
        (80, 100, "Excellent (80-100)"),
        (70, 80, "Good (70-80)"),
        (60, 70, "Fair (60-70)"),
        (50, 60, "Poor (50-60)"),
        (0, 50, "Critical (<50)"),
    ]
    
    for low, high, label in ranges:
        count = ((scores >= low) & (scores < high)).sum()
        pct = (count / len(scores) * 100)
        print(f"  {label:30s}: {count:2d} districts ({pct:5.1f}%)")
    
    print("\n\nCompression Assessment:")
    spread = scores.max() - scores.min()
    if spread > 40:
        print(f"  → STILL AGGRESSIVE: spread of {spread:.2f} points")
        print(f"  → Target: 20-30 point spread for realistic differences")
    elif spread > 30:
        print(f"  → MODERATE: spread of {spread:.2f} points")
        print(f"  → Acceptable but could be compressed further")
    else:
        print(f"  → GOOD: spread of {spread:.2f} points")
        print(f"  → Realistic district safety differences captured")
    
    print("\n\nFinal Rankings by Confidence:")
    ranking_cols = ["district", "tourist_safety_score", "district_rank", "confidence_level"]
    ranking_cols = [c for c in ranking_cols if c in master.columns]
    print(master[ranking_cols].sort_values("district_rank").to_string(index=False))


def main():
    master = load_master()
    
    audit_1_feature_contributions(master)
    audit_2_correlation_analysis(master)
    audit_3_distribution_analysis(master)
    audit_4_confidence_layer(master)
    audit_5_ranking_stability(master)
    
    print("\n" + "=" * 80)
    print("PHASE 1.2 AUDIT COMPLETE")
    print("=" * 80)
    print("\nNext Steps:")
    print("  1. Review feature dominance — is accident over-weighted?")
    print("  2. Check confidence flags — trust only HIGH_CONFIDENCE rankings")
    print("  3. Verify score compression — are ranges realistic?")
    print("  4. Consider further weight adjustments if needed")
    print("  5. Document findings before Phase 1 schema freeze")


if __name__ == "__main__":
    main()
