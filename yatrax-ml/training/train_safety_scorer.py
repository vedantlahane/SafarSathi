"""
Model 1: Main Safety Score Predictor

Replaces the TensorFlow neural network with LightGBM.

REFACTORED: Drops constant/indicator columns, handles NaN natively,
and validates that the model is actually learning spatial patterns.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from config.settings import (
    TRAINING_DIR, MODELS_DIR, SAFETY_SCORER_PARAMS, RANDOM_SEED,
)

MODEL_VERSION = "5.0.0-lgbm-refactored"
MODEL_DIR = MODELS_DIR / "safety_scorer"


def _get_feature_columns(df: pd.DataFrame) -> list[str]:
    """
    Select feature columns — everything except target, identifiers,
    constant columns, and data-availability indicators.
    """
    exclude = {
        # Target and identifiers
        "safety_score_target",
        "grid_lat", "grid_lon", "cell_id",
        "source_file", "date", "city", "state", "district",
        "base_danger",
        # Confidence metadata (not spatial features)
        "coverage_score", "feature_completeness",
    }

    # Also exclude any *_data_available and *_confidence columns (metadata, not features)
    exclude.update(c for c in df.columns if c.endswith("_data_available"))
    exclude.update(c for c in df.columns if c.endswith("_confidence"))

    candidates = [
        c for c in df.columns
        if c not in exclude
        and df[c].dtype in [np.float64, np.float32, np.int64, np.int32, float, int]
    ]

    # Drop columns with <3 unique values (constants or near-constants)
    good = []
    for c in candidates:
        n_unique = df[c].nunique(dropna=True)
        if n_unique >= 3:
            good.append(c)
        else:
            print(f"  ⚠️ Dropping constant/near-constant feature: {c} (unique={n_unique})")

    return good


def train_safety_scorer() -> dict:
    """
    Train the main safety score model on real data.

    Returns metrics dict.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # ─── LOAD DATA ───
    # The label generator saves a single file; we split here
    samples_path = TRAINING_DIR / "training_samples.parquet"

    # Also check for pre-split files
    train_path = TRAINING_DIR / "safety_score_train.parquet"
    val_path = TRAINING_DIR / "safety_score_val.parquet"
    test_path = TRAINING_DIR / "safety_score_test.parquet"

    if train_path.exists() and val_path.exists() and test_path.exists():
        train_df = pd.read_parquet(train_path)
        val_df = pd.read_parquet(val_path)
        test_df = pd.read_parquet(test_path)
    elif samples_path.exists():
        print("Splitting training samples into train/val/test...")
        all_data = pd.read_parquet(samples_path)

        # Geographic split: split by grid cell, not randomly, to prevent leakage
        if "grid_lat" in all_data.columns and "grid_lon" in all_data.columns:
            cells = all_data[["grid_lat", "grid_lon"]].drop_duplicates()
            cells = cells.sample(frac=1.0, random_state=RANDOM_SEED).reset_index(drop=True)
            n = len(cells)
            n_train = int(n * 0.70)
            n_val = int(n * 0.15)

            train_cells = cells.iloc[:n_train]
            val_cells = cells.iloc[n_train:n_train+n_val]
            test_cells = cells.iloc[n_train+n_val:]

            train_df = all_data.merge(train_cells, on=["grid_lat", "grid_lon"])
            val_df = all_data.merge(val_cells, on=["grid_lat", "grid_lon"])
            test_df = all_data.merge(test_cells, on=["grid_lat", "grid_lon"])
        else:
            # Random split fallback
            from sklearn.model_selection import train_test_split
            train_df, temp = train_test_split(all_data, test_size=0.30, random_state=RANDOM_SEED)
            val_df, test_df = train_test_split(temp, test_size=0.50, random_state=RANDOM_SEED)

        # Save splits
        train_df.to_parquet(train_path, index=False)
        val_df.to_parquet(val_path, index=False)
        test_df.to_parquet(test_path, index=False)
        print(f"  Saved splits: train={len(train_df)}, val={len(val_df)}, test={len(test_df)}")
    else:
        raise FileNotFoundError(
            f"Neither {samples_path} nor pre-split files found. Run label_generator.py first."
        )

    print(f"Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")

    # ─── PREPARE FEATURES ───
    feature_cols = _get_feature_columns(train_df)
    print(f"Feature columns: {len(feature_cols)}")

    if len(feature_cols) < 5:
        raise RuntimeError(f"Only {len(feature_cols)} features — something went wrong with data.")

    X_train = train_df[feature_cols]
    y_train = train_df["safety_score_target"]

    X_val = val_df[feature_cols]
    y_val = val_df["safety_score_target"]

    X_test = test_df[feature_cols]
    y_test = test_df["safety_score_target"]

    # ─── CREATE LGBM DATASETS ───
    train_data = lgb.Dataset(X_train, label=y_train)
    val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)

    # ─── TRAIN ───
    print("\nTraining LightGBM safety scorer...")

    params = {
        **SAFETY_SCORER_PARAMS,
        "objective": "regression",
        "metric": ["mae", "rmse"],
        "verbose": -1,
    }

    callbacks = [
        lgb.early_stopping(stopping_rounds=50),
        lgb.log_evaluation(period=100),
    ]

    model = lgb.train(
        params=params,
        train_set=train_data,
        valid_sets=[train_data, val_data],
        valid_names=["train", "val"],
        num_boost_round=params.pop("n_estimators", 800),
        callbacks=callbacks,
    )

    # ─── EVALUATE ───
    y_pred = model.predict(X_test)
    y_pred = np.clip(y_pred, 0, 100)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    print(f"\n{'='*50}")
    print(f"  TEST SET RESULTS")
    print(f"{'='*50}")
    print(f"  MAE:  {mae:.2f} points (out of 100)")
    print(f"  RMSE: {rmse:.2f}")
    print(f"  R²:   {r2:.4f}")
    print(f"{'='*50}")

    # ─── FEATURE IMPORTANCE (GAIN) ───
    importance = model.feature_importance(importance_type="gain")
    importance_df = pd.DataFrame({
        "feature": feature_cols,
        "importance_gain": importance,
    }).sort_values("importance_gain", ascending=False)

    # Normalize to percentages
    total_gain = importance_df["importance_gain"].sum()
    importance_df["pct_gain"] = (importance_df["importance_gain"] / max(total_gain, 1) * 100).round(2)

    print(f"\nTop 15 features (LightGBM gain):")
    for _, row in importance_df.head(15).iterrows():
        print(f"  {row['feature']:40s} {row['pct_gain']:5.1f}%")

    # ─── FEATURE DOMINANCE AUDIT ───
    top1_pct = importance_df.iloc[0]["pct_gain"] if len(importance_df) > 0 else 0
    top3_pct = importance_df.head(3)["pct_gain"].sum() if len(importance_df) >= 3 else 0
    n_features_50pct = 0  # how many features needed to reach 50% of importance
    cumsum = 0
    for _, row in importance_df.iterrows():
        cumsum += row["pct_gain"]
        n_features_50pct += 1
        if cumsum >= 50:
            break

    print(f"\n🔍 Feature dominance audit:")
    print(f"  Top-1 feature:   {importance_df.iloc[0]['feature']} ({top1_pct:.1f}%)")
    print(f"  Top-3 features:  {top3_pct:.1f}% of total importance")
    print(f"  Features for 50%: {n_features_50pct} features needed")
    print(f"  Diversity index:  {len(feature_cols)} total, "
          f"{(importance_df['pct_gain'] > 1.0).sum()} contribute >1%")

    if top1_pct > 40:
        print(f"  ⚠️ WARNING: Top feature has {top1_pct:.0f}% importance — model over-relies on one signal!")
    elif top3_pct > 70:
        print(f"  ⚠️ WARNING: Top 3 features have {top3_pct:.0f}% — model may lack diversity")
    elif n_features_50pct >= 5:
        print(f"  ✅ Good diversity — {n_features_50pct} features needed for 50% importance")

    # ─── PERMUTATION IMPORTANCE ───
    print(f"\nRunning permutation importance on test set...")
    try:
        from sklearn.inspection import permutation_importance as perm_imp
        # Use the raw prediction function
        class _LGBWrapper:
            def __init__(self, booster):
                self.booster = booster
            def predict(self, X):
                return self.booster.predict(X)
            def fit(self, X, y):
                return self

        wrapper = _LGBWrapper(model)
        perm_result = perm_imp(
            wrapper, X_test.values, y_test.values,
            n_repeats=10, random_state=RANDOM_SEED, n_jobs=-1,
            scoring="neg_mean_absolute_error",
        )
        perm_df = pd.DataFrame({
            "feature": feature_cols,
            "perm_importance_mean": perm_result.importances_mean,
            "perm_importance_std": perm_result.importances_std,
        }).sort_values("perm_importance_mean", ascending=False)

        print(f"\nTop 10 features (permutation importance):")
        for _, row in perm_df.head(10).iterrows():
            print(f"  {row['feature']:40s} {row['perm_importance_mean']:.4f} ± {row['perm_importance_std']:.4f}")

        # Check agreement between gain and permutation importance
        gain_top5 = set(importance_df.head(5)["feature"])
        perm_top5 = set(perm_df.head(5)["feature"])
        overlap = gain_top5 & perm_top5
        print(f"\n  Gain vs Perm top-5 overlap: {len(overlap)}/5 ({', '.join(overlap) if overlap else 'none'})")
        if len(overlap) < 2:
            print(f"  ⚠️ Low agreement between importance methods — some features may be artifacts")

        # Merge permutation importance into main df
        importance_df = importance_df.merge(perm_df, on="feature", how="left")
        importance_df.to_csv(MODEL_DIR / "feature_importance_full.csv", index=False)
    except ImportError:
        print("  ⚠️ sklearn not available for permutation importance — skipping")
    except Exception as exc:
        print(f"  ⚠️ Permutation importance failed: {exc}")

    # ─── SPATIAL DISCRIMINATION CHECK ───
    print(f"\nSpatial discrimination check:")
    print(f"  Prediction range: {y_pred.min():.1f} — {y_pred.max():.1f}")
    print(f"  Prediction std:   {y_pred.std():.1f}")
    if y_pred.std() < 3.0:
        print(f"  ⚠️ WARNING: Very low prediction variance — model may not be spatially discriminating!")

    # ─── ERROR DISTRIBUTION ───
    errors = y_test.values - y_pred
    print(f"\nError distribution:")
    print(f"  Mean error:   {errors.mean():.2f}")
    print(f"  Std error:    {errors.std():.2f}")
    print(f"  Within ±5:    {(np.abs(errors) <= 5).mean()*100:.1f}%")
    print(f"  Within ±10:   {(np.abs(errors) <= 10).mean()*100:.1f}%")
    print(f"  Worst error:  {np.abs(errors).max():.1f}")

    # ─── SAVE ───
    model_path = MODEL_DIR / "safety_scorer.lgb"
    model.save_model(str(model_path))

    metadata = {
        "model_version": MODEL_VERSION,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "feature_columns": feature_cols,
        "n_features": len(feature_cols),
        "n_train_samples": len(train_df),
        "n_val_samples": len(val_df),
        "n_test_samples": len(test_df),
        "metrics": {
            "mae": mae,
            "rmse": rmse,
            "r2": r2,
            "within_5_pct": float((np.abs(errors) <= 5).mean()),
            "within_10_pct": float((np.abs(errors) <= 10).mean()),
        },
        "params": SAFETY_SCORER_PARAMS,
        "feature_importance": importance_df.head(30).to_dict(orient="records"),
        "feature_dominance": {
            "top1_feature": importance_df.iloc[0]["feature"] if len(importance_df) > 0 else None,
            "top1_pct": float(top1_pct),
            "top3_pct": float(top3_pct),
            "features_for_50pct": n_features_50pct,
            "n_features_above_1pct": int((importance_df["pct_gain"] > 1.0).sum()),
        },
        "prediction_stats": {
            "min": float(y_pred.min()),
            "max": float(y_pred.max()),
            "mean": float(y_pred.mean()),
            "std": float(y_pred.std()),
        },
    }

    with open(MODEL_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    importance_df.to_csv(MODEL_DIR / "feature_importance.csv", index=False)

    print(f"\nModel saved: {model_path}")
    print(f"Metadata saved: {MODEL_DIR / 'metadata.json'}")

    return metadata["metrics"]


def load_safety_scorer() -> tuple[lgb.Booster, list[str]]:
    """Load trained model and feature columns."""
    model_path = MODEL_DIR / "safety_scorer.lgb"
    metadata_path = MODEL_DIR / "metadata.json"

    if not model_path.exists():
        raise FileNotFoundError(f"No trained model at {model_path}. Run training first.")

    model = lgb.Booster(model_file=str(model_path))

    with open(metadata_path) as f:
        metadata = json.load(f)

    return model, metadata["feature_columns"]


def predict_safety(
    model: lgb.Booster,
    feature_cols: list[str],
    features: dict[str, float],
) -> dict:
    """
    Predict safety score for a single point.

    Args:
        model: trained LightGBM booster
        feature_cols: ordered feature column names
        features: dict of feature_name → value

    Returns:
        dict with score, level, risk_factors
    """
    vector = np.array([[features.get(col, np.nan) for col in feature_cols]])
    score = float(np.clip(model.predict(vector)[0], 0, 100))

    # Classify
    if score >= 70:
        level = "safe"
    elif score >= 45:
        level = "caution"
    elif score >= 25:
        level = "unsafe"
    else:
        level = "dangerous"

    # Identify top risk factors
    risk_factors = []
    thresholds = {
        "crime_rate_per_100k": (300, "High crime area"),
        "road_accident_hotspot_risk": (0.6, "Accident hotspot"),
        "flood_risk": (0.5, "Flood risk zone"),
        "earthquake_risk": (0.5, "Earthquake risk zone"),
        "aqi": (200, "Unhealthy air quality"),
        "weather_severity": (50, "Severe weather conditions"),
        "nearest_hospital_proxy_km": (20, "Far from hospital"),
        "fire_risk_index": (0.5, "Fire risk area"),
        "water_contamination_risk": (0.5, "Water contamination risk"),
    }

    for feat, (threshold, desc) in thresholds.items():
        val = features.get(feat, 0)
        if val is not None and val > threshold:
            risk_factors.append(f"{desc} ({feat}={val:.1f})")

    # Night risk
    hour = features.get("hour", 12)
    if hour is not None and (hour >= 22 or hour < 5):
        risk_factors.append("Late night hours")

    return {
        "safety_score": round(score, 1),
        "safety_level": level,
        "risk_factors": risk_factors if risk_factors else ["No significant risks detected"],
    }


if __name__ == "__main__":
    metrics = train_safety_scorer()
    print(f"\nFinal metrics: {metrics}")