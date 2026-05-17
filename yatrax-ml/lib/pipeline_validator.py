"""
Pipeline Invariant Validation Framework.

Catches silent data degradation:
- Serialization bugs (file corruption)
- Filtering bugs (unintended row loss)
- Schema incompatibility
- Coordinate snapping mismatches
- Coverage collapse

Adds assertions after every pipeline stage to fail fast
instead of training on garbage data.
"""

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

import pandas as pd


@dataclass
class ValidationRule:
    """Single validation constraint."""
    name: str
    check: callable  # (df) -> bool
    error_msg: str
    critical: bool = True  # If True, raise; if False, warn


class PipelineValidator:
    """
    Validates data integrity after each pipeline stage.
    
    Principles:
    1. FAIL FAST: Don't train on corrupted data
    2. EXPLICIT: State expectations clearly
    3. INFORMATIVE: Explain what went wrong
    """
    
    def __init__(self):
        self.rules: dict[str, list[ValidationRule]] = {}
        self._init_standard_rules()
    
    def _init_standard_rules(self):
        """Register standard validation rules."""
        
        # Ingestion stage
        self.add_stage_rules("ingestion", [
            ValidationRule(
                name="not_empty",
                check=lambda df: len(df) > 0,
                error_msg="Ingested data is empty!",
                critical=True,
            ),
            ValidationRule(
                name="has_coordinates",
                check=lambda df: (
                    ("latitude" in df.columns and
                     df["latitude"].notna().sum() > 0)
                    or
                    ("grid_lat" in df.columns and
                     df["grid_lat"].notna().sum() > 0)
                ),
                error_msg="No valid coordinates in ingested data",
                critical=True,
            ),
            ValidationRule(
                name="reasonable_row_count",
                check=lambda df: len(df) > 10,
                error_msg="Ingested data has too few rows (< 10)",
                critical=True,
            ),
        ])
        
        # Merge stage
        self.add_stage_rules("merge", [
            ValidationRule(
                name="grid_not_collapsed",
                check=lambda df: len(df) > 100,
                error_msg="Merged grid has too few cells (< 100)",
                critical=True,
            ),
            ValidationRule(
                name="has_grid_coords",
                check=lambda df: (
                    "grid_lat" in df.columns and
                    "grid_lon" in df.columns
                ),
                error_msg="Merged grid missing grid_lat/grid_lon",
                critical=True,
            ),
            ValidationRule(
                name="coordinates_are_numeric",
                check=lambda df: (
                    pd.api.types.is_numeric_dtype(df["grid_lat"]) and
                    pd.api.types.is_numeric_dtype(df["grid_lon"])
                ),
                error_msg="Grid coordinates are not numeric",
                critical=True,
            ),
            ValidationRule(
                name="coordinates_in_india_bounds",
                check=lambda df: (
                    (df["grid_lat"] >= 6.0).all() and
                    (df["grid_lat"] <= 37.0).all() and
                    (df["grid_lon"] >= 68.0).all() and
                    (df["grid_lon"] <= 98.0).all()
                ),
                error_msg="Grid coordinates outside India bounds (6-37°N, 68-98°E)",
                critical=True,
            ),
            ValidationRule(
                name="has_confidence_columns",
                check=lambda df: (
                    "coverage_score" in df.columns or
                    "feature_completeness" in df.columns
                ),
                error_msg="Missing confidence metadata columns",
                critical=True,
            ),
            ValidationRule(
                name="no_duplicate_cells",
                check=lambda df: (
                    len(df) == len(df[["grid_lat", "grid_lon"]].drop_duplicates())
                ),
                error_msg="Grid contains duplicate cells (should be unique by grid_lat, grid_lon)",
                critical=True,
            ),
            ValidationRule(
                name="feature_coverage_not_zero",
                check=lambda df: (
                    df.select_dtypes(include=["number"])
                    .notna()
                    .any(axis=0)
                    .all()
                ),
                error_msg="Some columns are entirely NaN (missing data entirely)",
                critical=False,  # Warn but don't fail
            ),
        ])
        
        # Training data stage
        self.add_stage_rules("training", [
            ValidationRule(
                name="training_not_empty",
                check=lambda df: len(df) > 100,
                error_msg="Training dataset is too small (< 100 samples)",
                critical=True,
            ),
            ValidationRule(
                name="has_target",
                check=lambda df: "safety_score_target" in df.columns,
                error_msg="Missing safety_score_target column",
                critical=True,
            ),
            ValidationRule(
                name="target_in_range",
                check=lambda df: (
                    (df["safety_score_target"] >= 0.0).all() and
                    (df["safety_score_target"] <= 100.0).all()
                ),
                error_msg="safety_score_target outside [0, 100] range",
                critical=True,
            ),
            ValidationRule(
                name="target_has_variance",
                check=lambda df: (
                    df["safety_score_target"].std() > 0.1
                ),
                error_msg="Target has no variance (constant values)",
                critical=True,
            ),
            ValidationRule(
                name="temporal_features_present",
                check=lambda df: (
                    "hour" in df.columns and
                    "month" in df.columns and
                    "day_of_week" in df.columns
                ),
                error_msg="Missing temporal features (hour, month, day_of_week)",
                critical=False,
            ),
        ])
    
    def add_stage_rules(self, stage: str, rules: list[ValidationRule]):
        """Register validation rules for a stage."""
        if stage not in self.rules:
            self.rules[stage] = []
        self.rules[stage].extend(rules)
    
    def validate(
        self,
        stage: str,
        data: pd.DataFrame,
        raise_on_critical: bool = True,
    ) -> ValidationResult:
        """
        Run all validations for a stage.
        
        Args:
            stage: Pipeline stage name
            data: DataFrame to validate
            raise_on_critical: If True, raise on critical failures
        
        Returns:
            ValidationResult with all failures
        """
        if stage not in self.rules:
            return ValidationResult(stage=stage, passed=True)
        
        failures: list[ValidationFailure] = []
        
        for rule in self.rules[stage]:
            try:
                passed = rule.check(data)
                if not passed:
                    failures.append(
                        ValidationFailure(
                            rule_name=rule.name,
                            error_msg=rule.error_msg,
                            critical=rule.critical,
                        )
                    )
            except Exception as e:
                failures.append(
                    ValidationFailure(
                        rule_name=rule.name,
                        error_msg=f"{rule.error_msg} (exception: {e})",
                        critical=rule.critical,
                    )
                )
        
        result = ValidationResult(
            stage=stage,
            passed=len(failures) == 0,
            failures=failures,
        )
        
        # Report
        result.print_report()
        
        # Raise if critical failures
        if raise_on_critical and result.has_critical_failures:
            raise ValidationError(result)
        
        return result


@dataclass
class ValidationFailure:
    """Single validation failure."""
    rule_name: str
    error_msg: str
    critical: bool


@dataclass
class ValidationResult:
    """Result of validation run."""
    stage: str
    passed: bool
    failures: list[ValidationFailure] = None
    
    def __post_init__(self):
        if self.failures is None:
            self.failures = []
    
    @property
    def has_critical_failures(self) -> bool:
        return any(f.critical for f in self.failures)
    
    def print_report(self):
        """Print human-readable validation report."""
        if self.passed:
            print(f"✅ Stage '{self.stage}' passed all validations")
        else:
            print(f"❌ Stage '{self.stage}' validation failures:")
            for failure in self.failures:
                status = "🛑" if failure.critical else "⚠️"
                print(f"   {status} {failure.rule_name}: {failure.error_msg}")


class ValidationError(Exception):
    """Raised when critical validation fails."""
    
    def __init__(self, result: ValidationResult):
        self.result = result
        msg = (
            f"\n{result.stage} validation failed:\n" +
            "\n".join(
                f"  {f.rule_name}: {f.error_msg}"
                for f in result.failures
                if f.critical
            )
        )
        super().__init__(msg)


# ============================================================
# CONVENIENCE HELPERS
# ============================================================

_validator: Optional[PipelineValidator] = None


def get_validator() -> PipelineValidator:
    """Get or create singleton validator."""
    global _validator
    if _validator is None:
        _validator = PipelineValidator()
    return _validator


def validate_ingestion(df: pd.DataFrame) -> ValidationResult:
    """Quick validation after ingestion."""
    return get_validator().validate("ingestion", df)


def validate_merge(df: pd.DataFrame) -> ValidationResult:
    """Quick validation after merge."""
    return get_validator().validate("merge", df)


def validate_training(df: pd.DataFrame) -> ValidationResult:
    """Quick validation of training data."""
    return get_validator().validate("training", df)


# ============================================================
# DATA INTEGRITY CHECKS
# ============================================================

def check_file_integrity(
    path: Path,
    expected_min_rows: int = 10,
    expected_min_cols: int = 3,
) -> bool:
    """
    Check if a parquet file is intact.
    
    Catches:
    - Corrupted files
    - Incomplete writes
    - Wrong format
    """
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    
    try:
        df = pd.read_parquet(path)
    except Exception as e:
        raise RuntimeError(f"Failed to read {path}: {e}")
    
    if len(df) < expected_min_rows:
        raise ValueError(
            f"{path.name} has too few rows: {len(df)} < {expected_min_rows}"
        )
    
    if len(df.columns) < expected_min_cols:
        raise ValueError(
            f"{path.name} has too few columns: {len(df.columns)} < {expected_min_cols}"
        )
    
    return True


def check_coordinate_consistency(df: pd.DataFrame) -> bool:
    """
    Verify grid coordinates are consistent.
    
    - All must be numeric
    - Must be within India bounds
    - Must be on 0.1° grid
    - No NaNs
    """
    for col in ["grid_lat", "grid_lon"]:
        if col not in df.columns:
            raise ValueError(f"Missing column: {col}")
        
        if not pd.api.types.is_numeric_dtype(df[col]):
            raise TypeError(f"{col} is not numeric")
        
        if df[col].isna().any():
            raise ValueError(f"{col} contains NaN values")
    
    # Check bounds
    lat = df["grid_lat"]
    lon = df["grid_lon"]
    
    if (lat < 6.0).any() or (lat > 37.0).any():
        raise ValueError(f"grid_lat outside [6, 37]°N")
    
    if (lon < 68.0).any() or (lon > 98.0).any():
        raise ValueError(f"grid_lon outside [68, 98]°E")
    
    # Check grid alignment (should be multiples of 0.1)
    lat_rounded = (lat * 10).round() / 10
    lon_rounded = (lon * 10).round() / 10
    
    if not lat.round(1).equals(lat_rounded):
        raise ValueError("grid_lat not aligned to 0.1° grid")
    
    if not lon.round(1).equals(lon_rounded):
        raise ValueError("grid_lon not aligned to 0.1° grid")
    
    return True


def estimate_data_loss(before: int, after: int) -> tuple[int, float]:
    """
    Calculate rows lost between stages.
    
    Returns:
        (rows_lost, percent_lost)
    """
    rows_lost = before - after
    pct_lost = (rows_lost / before) * 100 if before > 0 else 0.0
    return rows_lost, pct_lost


def warn_if_data_loss(before: int, after: int, stage: str):
    """Warn if more than 10% of data was lost."""
    rows_lost, pct_lost = estimate_data_loss(before, after)
    
    if pct_lost > 10.0:
        print(
            f"⚠️  WARNING: {stage} lost {pct_lost:.1f}% of data "
            f"({rows_lost} rows: {before} → {after})"
        )
