from __future__ import annotations

import argparse
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from .constants import DEFAULT_LEGACY_CSV, DEFAULT_MODEL_PATH
from .feature_builder import CATEGORICAL_COLUMNS, NUMERIC_COLUMNS
from .synthetic_data import convert_legacy_csv, generate_synthetic_training_frame


MODEL_VERSION = "2.0.0"


def build_dataset(synthetic_samples: int, seed: int, legacy_csv: Path | None) -> pd.DataFrame:
    synthetic_df = generate_synthetic_training_frame(samples=synthetic_samples, seed=seed)

    if legacy_csv is None:
        return synthetic_df

    legacy_df = convert_legacy_csv(str(legacy_csv))
    if legacy_df.empty:
        return synthetic_df

    return pd.concat([synthetic_df, legacy_df], ignore_index=True)


def train_model(df: pd.DataFrame, seed: int) -> dict:
    x = df[NUMERIC_COLUMNS + CATEGORICAL_COLUMNS].copy()
    y = df["safety_score_target"].astype(float)

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=seed,
    )

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                    ]
                ),
                NUMERIC_COLUMNS,
            ),
            (
                "cat",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                    ]
                ),
                CATEGORICAL_COLUMNS,
            ),
        ]
    )

    regressor = RandomForestRegressor(
        n_estimators=520,
        max_depth=20,
        min_samples_leaf=2,
        random_state=seed,
        n_jobs=-1,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", regressor),
        ]
    )

    pipeline.fit(x_train, y_train)

    y_pred = pipeline.predict(x_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    return {
        "pipeline": pipeline,
        "metrics": {
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2": round(r2, 4),
            "rows": int(len(df)),
            "train_rows": int(len(x_train)),
            "test_rows": int(len(x_test)),
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Train YatraX safety model v2")
    parser.add_argument("--synthetic-samples", type=int, default=42000)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--legacy-csv", type=str, default=str(DEFAULT_LEGACY_CSV))
    parser.add_argument("--disable-legacy", action="store_true")
    parser.add_argument("--model-path", type=str, default=str(DEFAULT_MODEL_PATH))

    args = parser.parse_args()

    legacy_path = None if args.disable_legacy else Path(args.legacy_csv)
    if legacy_path is not None and not legacy_path.exists():
        legacy_path = None

    dataset = build_dataset(
        synthetic_samples=int(args.synthetic_samples),
        seed=int(args.seed),
        legacy_csv=legacy_path,
    )

    trained = train_model(dataset, seed=int(args.seed))

    model_path = Path(args.model_path)
    artifact = {
        "model_version": MODEL_VERSION,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "numeric_columns": NUMERIC_COLUMNS,
        "categorical_columns": CATEGORICAL_COLUMNS,
        "metrics": trained["metrics"],
        "pipeline": trained["pipeline"],
    }

    joblib.dump(artifact, model_path)

    print(f"Model saved to: {model_path}")
    print("Metrics:")
    for k, v in trained["metrics"].items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
