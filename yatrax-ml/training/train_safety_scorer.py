"""
Model 1: Main Safety Score Predictor

Improved version:
- LightGBM regressor with robust feature filtering
- strict spatial split by cell_id / grid coordinates
- coverage-aware training weights
- safer feature-importance analysis
- proper permutation importance wrapper
- stronger metadata logging
"""

from __future__ import annotations
from lib.gpu_utils import validate_lgbm_params

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

from config.settings import (
    TRAINING_DIR,
    MODELS_DIR,
    SAFETY_SCORER_PARAMS,
    RANDOM_SEED,
)

MODEL_VERSION = "5.1.0-lgbm-hardened"
MODEL_DIR = MODELS_DIR / "safety_scorer"
TARGET_COL = "safety_score_target"


# ============================================================
# FEATURE SELECTION
# ============================================================

def _is_numeric_series(s: pd.Series) -> bool:
    return pd.api.types.is_numeric_dtype(s)


def _get_feature_columns(df: pd.DataFrame) -> list[str]:
    """
    Select usable numeric features while excluding identifiers,
    metadata columns, and near-constants.
    """
    exclude = {
        TARGET_COL,
        "grid_lat",
        "grid_lon",
        "cell_id",
        "source_file",
        "date",
        "city",
        "state",
        "district",
        "base_danger",
        "coverage_score",
        "feature_completeness",
        "population_coverage_score",
    }

    # Exclude all metadata/availability columns
    exclude.update(c for c in df.columns if c.endswith("_data_available"))
    exclude.update(c for c in df.columns if c.endswith("_confidence"))

    numeric_cols = [
        c for c in df.columns
        if c not in exclude and _is_numeric_series(df[c])
    ]

    good: list[str] = []
    for col in numeric_cols:
        n_unique = df[col].nunique(dropna=True)

        # Ignore all-NaN columns and true near-constants
        if n_unique >= 3:
            good.append(col)
        else:
            print(f"  ⚠️ Dropping constant/near-constant feature: {col} (unique={n_unique})")

    return good


# ============================================================
# SPLIT HELPERS
# ============================================================

def _split_by_groups(
    data: pd.DataFrame,
    group_cols: list[str],
    train_frac: float = 0.70,
    val_frac: float = 0.15,
    seed: int = RANDOM_SEED,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Split by unique groups to prevent leakage.
    Prefers cell_id, otherwise grid_lat/grid_lon.
    """
    if not all(col in data.columns for col in group_cols):
        # Fallback to random split
        train_df, temp_df = train_test_split(data, test_size=(1.0 - train_frac), random_state=seed)
        val_df, test_df = train_test_split(temp_df, test_size=0.5, random_state=seed)
        return train_df, val_df, test_df

    group_keys = data[group_cols].drop_duplicates().reset_index(drop=True)
    group_keys = group_keys.sample(frac=1.0, random_state=seed).reset_index(drop=True)

    n_groups = len(group_keys)
    n_train = int(n_groups * train_frac)
    n_val = int(n_groups * val_frac)

    train_keys = group_keys.iloc[:n_train]
    val_keys = group_keys.iloc[n_train:n_train + n_val]
    test_keys = group_keys.iloc[n_train + n_val:]

    train_df = data.merge(train_keys, on=group_cols, how="inner")
    val_df = data.merge(val_keys, on=group_cols, how="inner")
    test_df = data.merge(test_keys, on=group_cols, how="inner")

    # Sanity check: no overlap
    train_ids = set(map(tuple, train_keys[group_cols].to_numpy()))
    val_ids = set(map(tuple, val_keys[group_cols].to_numpy()))
    test_ids = set(map(tuple, test_keys[group_cols].to_numpy()))

    assert train_ids.isdisjoint(val_ids)
    assert train_ids.isdisjoint(test_ids)
    assert val_ids.isdisjoint(test_ids)

    return train_df, val_df, test_df


def _load_or_create_splits() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    samples_path = TRAINING_DIR / "training_samples.parquet"
    train_path = TRAINING_DIR / "safety_score_train.parquet"
    val_path = TRAINING_DIR / "safety_score_val.parquet"
    test_path = TRAINING_DIR / "safety_score_test.parquet"

    if train_path.exists() and val_path.exists() and test_path.exists():
        train_df = pd.read_parquet(train_path)
        val_df = pd.read_parquet(val_path)
        test_df = pd.read_parquet(test_path)
        return train_df, val_df, test_df

    if not samples_path.exists():
        raise FileNotFoundError(
            f"Neither {samples_path} nor pre-split files found. Run label generation first."
        )

    print("Splitting training samples into train/val/test...")
    all_data = pd.read_parquet(samples_path)

    # Prefer strict group split to avoid leakage
    if "cell_id" in all_data.columns:
        train_df, val_df, test_df = _split_by_groups(all_data, ["cell_id"])
    elif {"grid_lat", "grid_lon"}.issubset(all_data.columns):
        train_df, val_df, test_df = _split_by_groups(all_data, ["grid_lat", "grid_lon"])
    else:
        train_df, val_df, test_df = _split_by_groups(all_data, ["__fallback__"])  # triggers random fallback

    train_df.to_parquet(train_path, index=False)
    val_df.to_parquet(val_path, index=False)
    test_df.to_parquet(test_path, index=False)

    print(f"  Saved splits: train={len(train_df)}, val={len(val_df)}, test={len(test_df)}")
    return train_df, val_df, test_df


# ============================================================
# PREDICTION WRAPPER FOR PERMUTATION IMPORTANCE
# ============================================================

@dataclass
class _BoosterEstimator:
    booster: lgb.Booster

    def fit(self, X, y=None):
        return self

    def predict(self, X):
        if isinstance(X, pd.DataFrame):
            X = X.to_numpy()
        return self.booster.predict(X)


# ============================================================
# TRAINING
# ============================================================

def _build_sample_weights(df: pd.DataFrame) -> np.ndarray:
    """
    Downweight sparse/low-confidence samples so the model does not overfit
    noisy cells with weak coverage.
    """
    weight = np.ones(len(df), dtype=float)

    if "feature_completeness" in df.columns:
        comp = pd.to_numeric(df["feature_completeness"], errors="coerce").fillna(0.5).to_numpy()
        weight *= (0.7 + 0.6 * comp)  # 0.7..1.3

    if "coverage_score" in df.columns:
        cov = pd.to_numeric(df["coverage_score"], errors="coerce").fillna(0.5).to_numpy()
        weight *= (0.8 + 0.4 * cov)  # 0.8..1.2

    # Clip to keep training stable
    return np.clip(weight, 0.5, 1.5)


def train_safety_scorer() -> dict:
    """
    Train the main safety score model on the generated training labels.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    train_df, val_df, test_df = _load_or_create_splits()

    print(f"Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")

    if TARGET_COL not in train_df.columns:
        raise KeyError(f"Missing target column: {TARGET_COL}")

    feature_cols = _get_feature_columns(train_df)
    print(f"Feature columns: {len(feature_cols)}")

    if len(feature_cols) < 5:
        raise RuntimeError(
            f"Only {len(feature_cols)} usable features found — check the label generation or merge pipeline."
        )

    X_train = train_df[feature_cols]
    y_train = train_df[TARGET_COL].astype(float)

    X_val = val_df[feature_cols]
    y_val = val_df[TARGET_COL].astype(float)

    X_test = test_df[feature_cols]
    y_test = test_df[TARGET_COL].astype(float)

    train_weight = _build_sample_weights(train_df)
    val_weight = _build_sample_weights(val_df)

    train_data = lgb.Dataset(
        X_train,
        label=y_train,
        weight=train_weight,
        feature_name=feature_cols,
        free_raw_data=False,
    )

    val_data = lgb.Dataset(
        X_val,
        label=y_val,
        weight=val_weight,
        reference=train_data,
        feature_name=feature_cols,
        free_raw_data=False,
    )

    print("\nTraining LightGBM safety scorer...")

    # Keep defaults sane, but allow settings file to override
    params = {
        "objective": "regression",
        "metric": ["l1", "l2"],
        "learning_rate": 0.03,
        "num_leaves": 63,
        "min_data_in_leaf": 80,
        "feature_fraction": 0.85,
        "bagging_fraction": 0.80,
        "bagging_freq": 1,
        "lambda_l2": 1.0,
        "verbosity": -1,
        "seed": RANDOM_SEED,
        "feature_fraction_seed": RANDOM_SEED,
        "bagging_seed": RANDOM_SEED,
        "data_random_seed": RANDOM_SEED,
        # ⚠️ "force_col_wise": True has been REMOVED to allow GPU training
    }
    params.update(SAFETY_SCORER_PARAMS or {})
    params = validate_lgbm_params(params, 'Safety Scorer')

    num_boost_round = int(params.pop("n_estimators", 1200))

    callbacks = [
        lgb.early_stopping(stopping_rounds=100),
        lgb.log_evaluation(period=100),
    ]

    print(f'\n?? Training with device={params.get('device')}, device_type={params.get('device_type')}')
    model = lgb.train(
        params=params,
        train_set=train_data,
        valid_sets=[train_data, val_data],
        valid_names=["train", "val"],
        num_boost_round=num_boost_round,
        callbacks=callbacks,
    )

    # --------------------------------------------------------
    # TEST EVALUATION
    # --------------------------------------------------------
    y_pred = np.clip(model.predict(X_test), 0, 100)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    print(f"\n{'=' * 50}")
    print("  TEST SET RESULTS")
    print(f"{'=' * 50}")
    print(f"  MAE:  {mae:.2f} points (out of 100)")
    print(f"  RMSE: {rmse:.2f}")
    print(f"  R²:   {r2:.4f}")
    print(f"{'=' * 50}")

    # --------------------------------------------------------
    # FEATURE IMPORTANCE
    # --------------------------------------------------------
    importance = model.feature_importance(importance_type="gain")
    importance_df = pd.DataFrame(
        {
            "feature": feature_cols,
            "importance_gain": importance,
        }
    ).sort_values("importance_gain", ascending=False)

    total_gain = float(importance_df["importance_gain"].sum())
    if total_gain <= 0:
        importance_df["pct_gain"] = 0.0
    else:
        importance_df["pct_gain"] = (importance_df["importance_gain"] / total_gain * 100).round(2)

    print("\nTop 15 features (LightGBM gain):")
    for _, row in importance_df.head(15).iterrows():
        print(f"  {row['feature']:40s} {row['pct_gain']:5.1f}%")

    # --------------------------------------------------------
    # FEATURE DOMINANCE AUDIT
    # --------------------------------------------------------
    top1_pct = float(importance_df.iloc[0]["pct_gain"]) if len(importance_df) > 0 else 0.0
    top3_pct = float(importance_df.head(3)["pct_gain"].sum()) if len(importance_df) >= 3 else 0.0

    cumsum = 0.0
    n_features_50pct = 0
    for _, row in importance_df.iterrows():
        cumsum += float(row["pct_gain"])
        n_features_50pct += 1
        if cumsum >= 50:
            break

    print("\n🔍 Feature dominance audit:")
    print(f"  Top-1 feature:   {importance_df.iloc[0]['feature'] if len(importance_df) else None} ({top1_pct:.1f}%)")
    print(f"  Top-3 features:  {top3_pct:.1f}% of total importance")
    print(f"  Features for 50%: {n_features_50pct} features needed")
    print(f"  Diversity index:  {len(feature_cols)} total, {(importance_df['pct_gain'] > 1.0).sum()} contribute >1%")

    if top1_pct > 40:
        print(f"  ⚠️ WARNING: Top feature has {top1_pct:.0f}% importance — model over-relies on one signal.")
    elif top3_pct > 70:
        print(f"  ⚠️ WARNING: Top 3 features have {top3_pct:.0f}% — model may lack diversity.")
    elif n_features_50pct >= 5:
        print(f"  ✅ Good diversity — {n_features_50pct} features needed for 50% importance")

    # --------------------------------------------------------
    # PERMUTATION IMPORTANCE
    # --------------------------------------------------------
    print("\nRunning permutation importance on test set...")
    try:
        from sklearn.inspection import permutation_importance as perm_imp

        wrapper = _BoosterEstimator(model)
        perm_result = perm_imp(
            wrapper,
            X_test,
            y_test,
            n_repeats=8,
            random_state=RANDOM_SEED,
            n_jobs=-1,
            scoring="neg_mean_absolute_error",
        )

        perm_df = pd.DataFrame(
            {
                "feature": feature_cols,
                "perm_importance_mean": perm_result.importances_mean,
                "perm_importance_std": perm_result.importances_std,
            }
        ).sort_values("perm_importance_mean", ascending=False)

        print("\nTop 10 features (permutation importance):")
        for _, row in perm_df.head(10).iterrows():
            print(f"  {row['feature']:40s} {row['perm_importance_mean']:.4f} ± {row['perm_importance_std']:.4f}")

        gain_top5 = set(importance_df.head(5)["feature"])
        perm_top5 = set(perm_df.head(5)["feature"])
        overlap = gain_top5 & perm_top5
        print(
            f"\n  Gain vs Perm top-5 overlap: {len(overlap)}/5 "
            f"({', '.join(sorted(overlap)) if overlap else 'none'})"
        )
        if len(overlap) < 2:
            print("  ⚠️ Low agreement between importance methods — some features may be artifacts.")

        importance_df = importance_df.merge(perm_df, on="feature", how="left")
        importance_df.to_csv(MODEL_DIR / "feature_importance_full.csv", index=False)

    except Exception as exc:
        print(f"  ⚠️ Permutation importance failed: {exc}")

    # --------------------------------------------------------
    # SPATIAL DISCRIMINATION CHECK
    # --------------------------------------------------------
    print("\nSpatial discrimination check:")
    print(f"  Prediction range: {y_pred.min():.1f} — {y_pred.max():.1f}")
    print(f"  Prediction std:   {y_pred.std():.1f}")
    if y_pred.std() < 3.0:
        print("  ⚠️ WARNING: Very low prediction variance — model may not be spatially discriminating.")

    # --------------------------------------------------------
    # ERROR DISTRIBUTION
    # --------------------------------------------------------
    errors = y_test.values - y_pred
    print("\nError distribution:")
    print(f"  Mean error:   {errors.mean():.2f}")
    print(f"  Std error:    {errors.std():.2f}")
    print(f"  Within ±5:    {(np.abs(errors) <= 5).mean() * 100:.1f}%")
    print(f"  Within ±10:   {(np.abs(errors) <= 10).mean() * 100:.1f}%")
    print(f"  Worst error:  {np.abs(errors).max():.1f}")

    # --------------------------------------------------------
    # SAVE ARTIFACTS
    # --------------------------------------------------------
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
        "params": {**params, "n_estimators": num_boost_round},
        "feature_importance": importance_df.head(30).to_dict(orient="records"),
        "feature_dominance": {
            "top1_feature": importance_df.iloc[0]["feature"] if len(importance_df) > 0 else None,
            "top1_pct": top1_pct,
            "top3_pct": top3_pct,
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

    with open(MODEL_DIR / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    importance_df.to_csv(MODEL_DIR / "feature_importance.csv", index=False)

    print(f"\nModel saved: {model_path}")
    print(f"Metadata saved: {MODEL_DIR / 'metadata.json'}")

    return metadata["metrics"]


# ============================================================
# LOADING / INFERENCE
# ============================================================

def load_safety_scorer() -> tuple[lgb.Booster, list[str]]:
    """
    Load the trained LightGBM booster and feature column order.
    """
    model_path = MODEL_DIR / "safety_scorer.lgb"
    metadata_path = MODEL_DIR / "metadata.json"

    if not model_path.exists():
        raise FileNotFoundError(f"No trained model at {model_path}. Run training first.")

    model = lgb.Booster(model_file=str(model_path))

    with open(metadata_path, encoding="utf-8") as f:
        metadata = json.load(f)

    return model, metadata["feature_columns"]


def predict_safety(
    model: lgb.Booster,
    feature_cols: list[str],
    features: dict[str, float],
) -> dict:
    """
    Predict safety score for a single point.
    """
    vector = np.array([[features.get(col, np.nan) for col in feature_cols]], dtype=float)
    score = float(np.clip(model.predict(vector)[0], 0, 100))

    if score >= 70:
        level = "safe"
    elif score >= 45:
        level = "caution"
    elif score >= 25:
        level = "unsafe"
    else:
        level = "dangerous"

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
        val = features.get(feat)
        if val is not None and pd.notna(val) and float(val) > threshold:
            risk_factors.append(f"{desc} ({feat}={float(val):.1f})")

    hour = features.get("hour", 12)
    if hour is not None and pd.notna(hour) and (int(hour) >= 22 or int(hour) < 5):
        risk_factors.append("Late night hours")

    return {
        "safety_score": round(score, 1),
        "safety_level": level,
        "risk_factors": risk_factors if risk_factors else ["No significant risks detected"],
    }


if __name__ == "__main__":
    metrics = train_safety_scorer()
    print(f"\nFinal metrics: {metrics}")

