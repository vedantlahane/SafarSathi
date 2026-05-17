"""
Unified Confidence Metrics Engine.

Consolidates all confidence calculations into a single, consistent model.
Replaces:
- coverage_score (merge layer)
- per-domain *_confidence fields
- grid_lookup confidence calculation
- inference.py manual confidence layer

Single source of truth for confidence semantics across:
- Merge stage
- Training data generation
- Grid cell lookups
- Inference responses
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Optional

import numpy as np
import pandas as pd


@dataclass
class ConfidenceMetrics:
    """
    Complete confidence assessment for a grid cell or prediction.
    
    Semantics:
    - overall: Composite confidence (0-1), weighted across all factors
    - domains: Per-domain confidence indicating data availability
    - completeness: Feature completeness (% of features with real values)
    - propagation_distance_km: How far data was extrapolated
    - real_data_count: Number of data sources with real (non-default) values
    - reasons: Human-readable explanation of low confidence
    """
    
    overall: float  # Primary confidence score (0-1)
    domains: dict[str, float] = field(default_factory=dict)  # {domain: conf}
    completeness: float = 0.5  # Feature completeness (0-1)
    propagation_distance_km: float = 0.0  # Distance to nearest real data
    real_data_count: int = 0  # Number of domains with real data
    total_domains: int = 0  # Total domains in system
    
    # Confidence breakdown
    data_availability_component: float = 0.5
    completeness_component: float = 0.5
    proximity_component: float = 1.0
    
    # Reasoning
    reasons: list[str] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        """Convert to dict for JSON serialization."""
        return asdict(self)
    
    def to_response_dict(self) -> dict:
        """Format for API response."""
        return {
            "overall": round(float(self.overall), 3),
            "domains": {
                domain: round(conf, 2)
                for domain, conf in self.domains.items()
            },
            "completeness": round(float(self.completeness), 2),
            "propagation_distance_km": round(float(self.propagation_distance_km), 1),
            "data_available_domains": self.real_data_count,
            "total_domains": self.total_domains,
        }


class ConfidenceEngine:
    """
    Single engine for computing confidence across all stages.
    
    Design principles:
    1. Deterministic: same inputs → same output
    2. Transparent: breakdown shows which factors matter
    3. Unified: used in merge, training, inference
    4. Observable: explains low confidence to users
    """
    
    # Weighting for confidence components
    DATA_WEIGHT = 0.40  # Domain data availability
    COMPLETENESS_WEIGHT = 0.40  # Feature completeness
    PROXIMITY_WEIGHT = 0.20  # Proximity penalty
    
    def __init__(self):
        """Initialize with standard domain list."""
        self.domains = [
            "crime",
            "weather",
            "aqi",
            "water",
            "health",
            "disaster",
            "accident",
            "fire",
            "terrain",
            "population",
            "noise",
        ]
    
    def compute_from_grid(
        self,
        grid_row: pd.Series,
        feature_columns: Optional[list[str]] = None,
    ) -> ConfidenceMetrics:
        """
        Compute confidence from a grid cell row.
        
        Used during merge stage to assess data quality.
        
        Args:
            grid_row: One row from unified grid
            feature_columns: List of features to check for completeness
        
        Returns:
            ConfidenceMetrics for this cell
        """
        # Extract per-domain confidence
        domain_conf: dict[str, float] = {}
        real_data_count = 0
        
        for domain in self.domains:
            conf_col = f"{domain}_confidence"
            if conf_col in grid_row.index:
                conf = float(grid_row[conf_col])
            else:
                conf = 0.0
            
            domain_conf[domain] = conf
            if conf > 0.0:
                real_data_count += 1
        
        # Feature completeness
        if feature_columns:
            completeness = float(
                grid_row[feature_columns].notna().mean()
            )
        else:
            completeness_col = "feature_completeness"
            completeness = float(
                grid_row[completeness_col]
                if completeness_col in grid_row.index
                else 0.5
            )
        
        # Compute components
        data_component = real_data_count / max(len(self.domains), 1)
        completeness_component = completeness
        proximity_component = 1.0  # No propagation at merge stage
        
        # Composite confidence
        overall = (
            self.DATA_WEIGHT * data_component +
            self.COMPLETENESS_WEIGHT * completeness_component +
            self.PROXIMITY_WEIGHT * proximity_component
        )
        overall = float(np.clip(overall, 0.0, 1.0))
        
        # Reasoning
        reasons = []
        if real_data_count < len(self.domains) / 2:
            missing = [d for d in self.domains if domain_conf.get(d, 0) == 0]
            reasons.append(f"Missing data: {', '.join(missing[:3])}")
        
        if completeness < 0.3:
            reasons.append("Many missing feature values")
        
        return ConfidenceMetrics(
            overall=overall,
            domains=domain_conf,
            completeness=completeness,
            propagation_distance_km=0.0,
            real_data_count=real_data_count,
            total_domains=len(self.domains),
            data_availability_component=data_component,
            completeness_component=completeness_component,
            proximity_component=proximity_component,
            reasons=reasons,
        )
    
    def compute_from_lookup(
        self,
        base_confidence: float,
        domain_confidence: dict[str, float],
        feature_completeness: float,
        nearest_distance_km: float,
        is_fallback: bool = False,
    ) -> ConfidenceMetrics:
        """
        Compute confidence for grid lookup.
        
        Used when looking up a cell during inference.
        
        Args:
            base_confidence: Coverage score from grid
            domain_confidence: Per-domain confidence dict
            feature_completeness: Feature completeness ratio
            nearest_distance_km: Distance to nearest real data
            is_fallback: Whether using fallback defaults
        
        Returns:
            ConfidenceMetrics for inference
        """
        if is_fallback:
            return ConfidenceMetrics(
                overall=0.1,
                domains={d: 0.0 for d in self.domains},
                completeness=0.0,
                propagation_distance_km=999.0,
                real_data_count=0,
                total_domains=len(self.domains),
                reasons=["Using fallback defaults — no grid data found"],
            )
        
        # Distance penalty (0-1, decreasing with distance)
        max_acceptable_km = 200.0
        proximity_score = max(
            0.0,
            1.0 - (nearest_distance_km / max_acceptable_km),
        )
        
        # Real data count
        real_data_count = sum(
            1 for d in self.domains
            if domain_confidence.get(d, 0) > 0.0
        )
        
        # Components
        data_component = real_data_count / max(len(self.domains), 1)
        completeness_component = float(feature_completeness)
        proximity_component = proximity_score
        
        # Composite
        overall = (
            self.DATA_WEIGHT * data_component +
            self.COMPLETENESS_WEIGHT * completeness_component +
            self.PROXIMITY_WEIGHT * proximity_component
        )
        overall = float(np.clip(overall, 0.05, 1.0))
        
        # Reasoning
        reasons = []
        if nearest_distance_km > 50:
            reasons.append(
                f"Data propagated from {nearest_distance_km:.0f}km away"
            )
        
        missing_domains = [
            d for d in self.domains
            if domain_confidence.get(d, 0) == 0.0
        ]
        if missing_domains:
            reasons.append(f"Missing: {', '.join(missing_domains[:3])}")
        
        if feature_completeness < 0.3:
            reasons.append("Many missing feature values")
        
        return ConfidenceMetrics(
            overall=overall,
            domains=domain_confidence,
            completeness=completeness_component,
            propagation_distance_km=nearest_distance_km,
            real_data_count=real_data_count,
            total_domains=len(self.domains),
            data_availability_component=data_component,
            completeness_component=completeness_component,
            proximity_component=proximity_component,
            reasons=reasons,
        )
    
    def compute_prediction_confidence(
        self,
        grid_confidence: ConfidenceMetrics,
        model_prediction_variance: float = 0.0,
        model_name: str = "safety_scorer",
    ) -> ConfidenceMetrics:
        """
        Adjust grid confidence for model prediction uncertainty.
        
        Final confidence for API response combines:
        - Data quality (from grid)
        - Model prediction variance
        - Feature importance weighting
        
        Args:
            grid_confidence: ConfidenceMetrics from grid lookup
            model_prediction_variance: Prediction uncertainty from model
            model_name: Which model made the prediction
        
        Returns:
            Final ConfidenceMetrics for API response
        """
        # Model confidence: lower variance = higher confidence
        model_conf = max(0.0, 1.0 - (model_prediction_variance * 0.5))
        
        # Blend with grid confidence
        # Grid quality dominates (80%) vs model variance (20%)
        blended_overall = (
            0.8 * grid_confidence.overall +
            0.2 * model_conf
        )
        
        return ConfidenceMetrics(
            overall=float(np.clip(blended_overall, 0.0, 1.0)),
            domains=grid_confidence.domains,
            completeness=grid_confidence.completeness,
            propagation_distance_km=grid_confidence.propagation_distance_km,
            real_data_count=grid_confidence.real_data_count,
            total_domains=grid_confidence.total_domains,
            data_availability_component=grid_confidence.data_availability_component,
            completeness_component=grid_confidence.completeness_component,
            proximity_component=grid_confidence.proximity_component * (1.0 - model_prediction_variance * 0.2),
            reasons=grid_confidence.reasons,
        )
    
    def is_high_confidence(
        self,
        metrics: ConfidenceMetrics,
        threshold: float = 0.6,
    ) -> bool:
        """Check if confidence exceeds threshold."""
        return metrics.overall >= threshold
    
    def is_low_confidence(
        self,
        metrics: ConfidenceMetrics,
        threshold: float = 0.3,
    ) -> bool:
        """Check if confidence is dangerously low."""
        return metrics.overall < threshold


# Singleton engine instance
_engine: Optional[ConfidenceEngine] = None


def get_confidence_engine() -> ConfidenceEngine:
    """Get or create singleton confidence engine."""
    global _engine
    if _engine is None:
        _engine = ConfidenceEngine()
    return _engine
