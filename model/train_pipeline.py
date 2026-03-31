from __future__ import annotations

import argparse
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from .constants import DEFAULT_LEGACY_CSV, DEFAULT_MODEL_PATH
from .factor_registry import TOTAL_FACTOR_COUNT
from .feature_builder import NUMERIC_COLUMNS
from .synthetic_data import convert_legacy_csv, generate_synthetic_training_frame


MODEL_VERSION = "3.0.0-tf"


def build_dataset(synthetic_samples: int, seed: int, legacy_csv: Path | None) -> pd.DataFrame:
    synthetic_df = generate_synthetic_training_frame(samples=synthetic_samples, seed=seed)

    if legacy_csv is None:
        return synthetic_df

    legacy_df = convert_legacy_csv(str(legacy_csv))
    if legacy_df.empty:
        return synthetic_df

    return pd.concat([synthetic_df, legacy_df], ignore_index=True)


def _build_tf_model(input_dim: int, seed: int) -> Any:
    try:
        import tensorflow as tf  # type: ignore
    except Exception as exc:
        raise RuntimeError(
            "TensorFlow is required for model training. Install requirements in your backend/cloud venv."
        ) from exc

    tf.keras.utils.set_random_seed(seed)

    inputs = tf.keras.Input(shape=(input_dim,), name="safety_features")
    x = tf.keras.layers.Dense(384, activation="relu")(inputs)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Dropout(0.28)(x)

    x = tf.keras.layers.Dense(256, activation="relu")(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Dropout(0.22)(x)

    x = tf.keras.layers.Dense(128, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.14)(x)

    x = tf.keras.layers.Dense(64, activation="relu")(x)
    output = tf.keras.layers.Dense(1, activation="sigmoid", name="safety_score_norm")(x)

    model = tf.keras.Model(inputs=inputs, outputs=output, name="yatrax_safety_tf")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss=tf.keras.losses.Huber(delta=0.8),
        metrics=[
            tf.keras.metrics.MeanAbsoluteError(name="mae"),
            tf.keras.metrics.RootMeanSquaredError(name="rmse"),
        ],
    )

    return model


def train_model(df: pd.DataFrame, seed: int) -> dict[str, Any]:
    x = df[NUMERIC_COLUMNS].copy()
    y = df["safety_score_target"].astype(float)

    x_train_full, x_test, y_train_full, y_test = train_test_split(
        x,
        y,
        test_size=0.15,
        random_state=seed,
    )

    x_train, x_val, y_train, y_val = train_test_split(
        x_train_full,
        y_train_full,
        test_size=0.18,
        random_state=seed,
    )

    imputer = SimpleImputer(strategy="median")
    scaler = StandardScaler()

    x_train_imputed = imputer.fit_transform(x_train)
    x_val_imputed = imputer.transform(x_val)
    x_test_imputed = imputer.transform(x_test)

    x_train_scaled = scaler.fit_transform(x_train_imputed).astype(np.float32)
    x_val_scaled = scaler.transform(x_val_imputed).astype(np.float32)
    x_test_scaled = scaler.transform(x_test_imputed).astype(np.float32)

    y_train_arr = y_train.to_numpy(dtype=np.float32) / 100.0
    y_val_arr = y_val.to_numpy(dtype=np.float32) / 100.0
    y_test_arr = y_test.to_numpy(dtype=np.float32)

    model = _build_tf_model(input_dim=x_train_scaled.shape[1], seed=seed)

    try:
        import tensorflow as tf  # type: ignore
    except Exception as exc:
        raise RuntimeError(
            "TensorFlow is required for model training. Install requirements in your backend/cloud venv."
        ) from exc

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=20,
            restore_best_weights=True,
            min_delta=1e-4,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.6,
            patience=7,
            min_lr=1e-5,
        ),
    ]

    model.fit(
        x_train_scaled,
        y_train_arr,
        validation_data=(x_val_scaled, y_val_arr),
        epochs=180,
        batch_size=256,
        callbacks=callbacks,
        verbose=0,
    )

    y_pred_norm = model.predict(x_test_scaled, verbose=0).reshape(-1)
    y_pred = np.clip(y_pred_norm * 100.0, 0.0, 100.0)

    mae = float(mean_absolute_error(y_test_arr, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test_arr, y_pred)))
    r2 = float(r2_score(y_test_arr, y_pred))

    return {
        "model": model,
        "preprocessor": {
            "imputer": imputer,
            "scaler": scaler,
            "columns": list(NUMERIC_COLUMNS),
        },
        "metrics": {
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2": round(r2, 4),
            "rows": int(len(df)),
            "train_rows": int(len(x_train)),
            "val_rows": int(len(x_val)),
            "test_rows": int(len(x_test)),
            "feature_columns": int(len(NUMERIC_COLUMNS)),
            "taxonomy_factor_count": int(TOTAL_FACTOR_COUNT),
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Train YatraX safety model v3 (TensorFlow)")
    parser.add_argument("--synthetic-samples", type=int, default=52000)
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
    model_path.parent.mkdir(parents=True, exist_ok=True)

    tf_model_path = model_path.with_suffix(".tf.keras")
    preprocessor_path = model_path.with_suffix(".preprocessor.pkl")

    trained["model"].save(tf_model_path)
    joblib.dump(trained["preprocessor"], preprocessor_path)

    artifact = {
        "model_version": MODEL_VERSION,
        "backend": "tensorflow",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "numeric_columns": list(NUMERIC_COLUMNS),
        "metrics": trained["metrics"],
        "tensorflow_model_path": tf_model_path.name,
        "preprocessor_path": preprocessor_path.name,
    }

    joblib.dump(artifact, model_path)

    print(f"Model metadata saved to: {model_path}")
    print(f"TensorFlow model saved to: {tf_model_path}")
    print(f"Preprocessor saved to: {preprocessor_path}")
    print("Metrics:")
    for k, v in trained["metrics"].items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
