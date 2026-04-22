# path: model/predictor.py
from __future__ import annotations

from copy import deepcopy
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from .constants import DEFAULT_MODEL_PATH, FORECAST_HOURS_DEFAULT, STATUS_THRESHOLDS
from .environment import detect_environment
from .factor_registry import TOTAL_FACTOR_COUNT
from .feature_builder import CATEGORICAL_COLUMNS, NUMERIC_COLUMNS, build_model_features
from .rule_engine import calculate_rule_score
from .schemas import ForecastPoint, PredictionResult, SafetyFeatures


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _status(score: float) -> str:
    if score >= STATUS_THRESHOLDS["safe"]:
        return "safe"
    if score >= STATUS_THRESHOLDS["caution"]:
        return "caution"
    return "danger"


class SafetyPredictor:
    def __init__(self, model_path: str | None = None):
        self.model_path = model_path or str(DEFAULT_MODEL_PATH)
        self.artifact: dict[str, Any] | None = None

        self.backend = "rule-only"
        self.pipeline = None
        self.tf_model = None
        self.tf = None
        self.preprocessor: dict[str, Any] | None = None
        self.numeric_columns = list(NUMERIC_COLUMNS)
        self.categorical_columns = list(CATEGORICAL_COLUMNS)

        self._load_artifact()

    def _load_artifact(self) -> None:
        try:
            artifact = joblib.load(self.model_path)
        except Exception:
            return

        if not isinstance(artifact, dict):
            return

        self.artifact = artifact
        self.numeric_columns = list(artifact.get("numeric_columns", NUMERIC_COLUMNS))
        self.categorical_columns = list(artifact.get("categorical_columns", CATEGORICAL_COLUMNS))

        backend = str(artifact.get("backend", "sklearn")).lower()
        if backend == "tensorflow":
            model_root = Path(self.model_path).resolve().parent
            tf_model_rel = str(artifact.get("tensorflow_model_path", ""))
            preprocessor_rel = str(artifact.get("preprocessor_path", ""))

            tf_model_path = model_root / tf_model_rel
            preprocessor_path = model_root / preprocessor_rel

            try:
                import tensorflow as tf  # type: ignore

                self.tf = tf
                if tf_model_path.exists() and preprocessor_path.exists():
                    self.tf_model = tf.keras.models.load_model(tf_model_path)
                    self.preprocessor = joblib.load(preprocessor_path)
                    self.backend = "tensorflow"
                    return
            except Exception:
                # Fallback to possible sklearn payload in mixed artifacts.
                pass

        pipeline = artifact.get("pipeline")
        if pipeline is not None:
            self.pipeline = pipeline
            self.backend = "sklearn"

    @property
    def model_version(self) -> str:
        if not self.artifact:
            return "rule-only"
        return str(self.artifact.get("model_version", "unknown"))

    def is_model_loaded(self) -> bool:
        return self.tf_model is not None or self.pipeline is not None

    def _predict_tf(self, row: dict[str, Any]) -> float:
        if self.tf_model is None or self.preprocessor is None:
            raise RuntimeError("TensorFlow model is not loaded")

        frame = pd.DataFrame([{col: row.get(col) for col in self.numeric_columns}])
        imputer = self.preprocessor.get("imputer")
        scaler = self.preprocessor.get("scaler")

        x = imputer.transform(frame)
        x = scaler.transform(x).astype(np.float32)

        pred_norm = float(self.tf_model.predict(x, verbose=0).reshape(-1)[0])
        return _clamp(pred_norm * 100.0, 0.0, 100.0)

    def _predict_ml(self, features: SafetyFeatures, environment: str, rule_score: float) -> float:
        row = build_model_features(features, environment=environment, rule_score=rule_score)

        if self.backend == "tensorflow" and self.tf_model is not None and self.preprocessor is not None:
            return self._predict_tf(row)

        if self.pipeline is not None:
            columns = self.numeric_columns + self.categorical_columns
            data = {col: row.get(col) for col in columns}
            frame = pd.DataFrame([data])
            raw = float(self.pipeline.predict(frame)[0])
            return _clamp(raw, 0.0, 100.0)

        return rule_score

    def _confidence(self, provided_feature_count: int) -> float:
        if not self.is_model_loaded():
            return 0.45

        completion = _clamp(provided_feature_count / float(TOTAL_FACTOR_COUNT), 0.0, 1.0)
        conf = 0.60 + completion * 0.34
        return round(_clamp(conf, 0.0, 0.97), 3)

    def _blend_score(self, rule_score: float, ml_score: float, provided_feature_count: int) -> float:
        if not self.is_model_loaded():
            return round(rule_score, 2)

        completion = _clamp(provided_feature_count / float(TOTAL_FACTOR_COUNT), 0.0, 1.0)
        ml_weight = 0.48 + 0.24 * completion
        blended = (1.0 - ml_weight) * rule_score + ml_weight * ml_score
        return round(_clamp(blended, 0.0, 100.0), 2)

    def _predict_core(
        self,
        features: SafetyFeatures,
        provided_feature_count: int,
    ) -> PredictionResult:
        normalized = deepcopy(features).normalize()
        environment = detect_environment(normalized)
        rule_result = calculate_rule_score(normalized, environment)
        ml_score = self._predict_ml(normalized, environment, rule_result.safety_score)
        final_score = self._blend_score(rule_result.safety_score, ml_score, provided_feature_count)

        # Preserve strict caps from the safety rules.
        capped_by = rule_result.capped_by
        if capped_by is not None and final_score > rule_result.safety_score:
            final_score = rule_result.safety_score

        status = _status(final_score)
        danger = round((100.0 - final_score) / 100.0, 4)

        factors = sorted(rule_result.factors, key=lambda item: item["score"])
        factors.append(
            {
                "id": "ml_adjustment",
                "label": "ML Adjustment",
                "score": round(ml_score, 2),
                "weight": 0.0,
                "detail": "TensorFlow model-adjusted safety estimate before blending",
            }
        )

        return PredictionResult(
            safety_score=round(final_score, 2),
            danger_score=danger,
            status=status,
            environment=environment,
            rule_score=round(rule_result.safety_score, 2),
            ml_score=round(ml_score, 2),
            confidence=self._confidence(provided_feature_count),
            capped_by=capped_by,
            recommendation=rule_result.recommendation,
            factors=factors,
            forecast=[],
        )

    def _forecast_variant(self, base: SafetyFeatures, horizon_hours: int) -> SafetyFeatures:
        f = deepcopy(base)

        f.hour = (f.hour + horizon_hours) % 24
        f.minutes_to_sunset -= 60.0 * horizon_hours
        f.hours_since_checkin += horizon_hours
        f.battery_pct = _clamp(f.battery_pct - (5.5 * horizon_hours), 0.0, 100.0)

        if f.hour >= 20 or f.hour < 6:
            f.open_business_count = int(max(0, round(f.open_business_count * 0.35)))
            f.risky_place_count = int(round(f.risky_place_count * 1.2 + 1))
            f.recent_wildlife_reports_7d = int(round(f.recent_wildlife_reports_7d * 1.1 + 1))
        else:
            f.open_business_count = int(round(max(f.open_business_count, f.nearby_place_count * 0.25)))

        # Conservative weather drift toward uncertainty for longer horizons.
        drift = 2.2 * horizon_hours
        if 6 <= f.month <= 9:
            drift += 1.5 * horizon_hours
        f.weather_severity = _clamp(f.weather_severity + drift, 0.0, 100.0)

        # As time passes without check-in, uncertainty and alert pressure rise.
        if f.hours_since_checkin > 6:
            f.active_alerts_nearby += 1
            f.prealerts_30d += 1

        return f.normalize()

    def _forecast_rationale(self, base_score: float, predicted_score: float, result: PredictionResult) -> str:
        delta = round(predicted_score - base_score, 1)
        worst = sorted(result.factors, key=lambda item: item["score"])[0]
        if delta <= -15:
            return f"Rapid deterioration expected ({delta}). Main driver: {worst['label']}."
        if delta <= -5:
            return f"Conditions worsen ({delta}) mainly due to {worst['label']}."
        if delta < 5:
            return f"Conditions mostly stable. Watch {worst['label']}."
        return f"Conditions improve ({delta}) if current trajectory continues."

    def predict(
        self,
        features: SafetyFeatures,
        provided_feature_count: int = 0,
        forecast_hours: list[int] | None = None,
    ) -> PredictionResult:
        base_result = self._predict_core(features, provided_feature_count=provided_feature_count)

        horizons = forecast_hours if forecast_hours is not None else FORECAST_HOURS_DEFAULT
        horizon_list = [int(h) for h in horizons if int(h) > 0]

        forecasts: list[ForecastPoint] = []
        for h in sorted(set(horizon_list)):
            variant = self._forecast_variant(features, h)
            point_result = self._predict_core(variant, provided_feature_count=max(24, provided_feature_count))
            rationale = self._forecast_rationale(
                base_score=base_result.safety_score,
                predicted_score=point_result.safety_score,
                result=point_result,
            )
            forecasts.append(
                ForecastPoint(
                    horizon_hours=h,
                    safety_score=point_result.safety_score,
                    danger_score=point_result.danger_score,
                    status=point_result.status,
                    rationale=rationale,
                )
            )

        base_result.forecast = forecasts
        return base_result
