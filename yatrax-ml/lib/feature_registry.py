"""
Unified Feature Registry System.

Centralizes feature definitions, coverage tracking, validation, and metadata.
Addresses:
- Dead feature pruning (< 1% coverage)
- Feature manifest generation during merge
- Coverage-aware training
- Unified confidence semantics
- Type-safe feature schemas
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field, asdict
from enum import Enum
from pathlib import Path
from typing import Any, Optional

import numpy as np
import pandas as pd


class FeatureType(Enum):
    """Feature semantic categories."""
    CRIME = "crime"
    WEATHER = "weather"
    AIR_QUALITY = "aqi"
    WATER = "water"
    HEALTH = "health"
    DISASTER = "disaster"
    ACCIDENT = "accident"
    FIRE = "fire"
    TERRAIN = "terrain"
    POPULATION = "population"
    NOISE = "noise"
    TEMPORAL = "temporal"
    DERIVED = "derived"


class FeatureDataType(Enum):
    """Data types for schema validation."""
    FLOAT32 = "float32"
    FLOAT64 = "float64"
    INT32 = "int32"
    INT64 = "int64"
    BOOLEAN = "boolean"


@dataclass(frozen=True)
class FeatureSpec:
    """Complete specification for a single feature."""
    name: str
    domain: FeatureType
    data_type: FeatureDataType
    description: str
    
    # Coverage expectations (for validation)
    min_coverage_pct: float = 0.0  # Minimum % of non-NaN values
    
    # Training hints
    exclude_from_training: bool = False
    temporal_encoding: Optional[str] = None  # "cyclical", "seasonal", etc.
    
    # Metadata
    source_file: str = ""
    units: Optional[str] = None
    expected_range: Optional[tuple[float, float]] = None
    
    # Flags
    is_metadata: bool = False  # Not a model feature (grid_lat, cell_id, etc.)


@dataclass
class CoverageMetrics:
    """Coverage statistics for a feature."""
    feature_name: str
    total_cells: int
    non_null_count: int
    non_null_pct: float
    min_val: Optional[float] = None
    max_val: Optional[float] = None
    mean_val: Optional[float] = None
    std_val: Optional[float] = None
    
    def is_dead(self, threshold_pct: float = 1.0) -> bool:
        """True if coverage is below threshold."""
        return self.non_null_pct < threshold_pct
    
    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class DomainCoverageMetrics:
    """Coverage metrics grouped by domain."""
    domain: FeatureType
    features: dict[str, CoverageMetrics] = field(default_factory=dict)
    
    @property
    def live_features(self) -> list[str]:
        """Features with real data (>0% coverage)."""
        return [
            name for name, metrics in self.features.items()
            if metrics.non_null_pct > 0.0
        ]
    
    @property
    def dead_features(self) -> list[str]:
        """Features with <1% coverage."""
        return [
            name for name, metrics in self.features.items()
            if metrics.is_dead(1.0)
        ]
    
    def to_dict(self) -> dict:
        return {
            "domain": self.domain.value,
            "features": {
                name: metrics.to_dict()
                for name, metrics in self.features.items()
            },
        }


@dataclass
class FeatureManifest:
    """Complete feature catalog with coverage analysis."""
    timestamp: str
    grid_shape: tuple[int, int]  # (n_cells, n_features)
    features: dict[str, FeatureSpec] = field(default_factory=dict)
    coverage_by_domain: dict[str, DomainCoverageMetrics] = field(default_factory=dict)
    dead_features: list[str] = field(default_factory=list)
    live_features: list[str] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        return {
            "timestamp": self.timestamp,
            "grid_shape": self.grid_shape,
            "total_features": len(self.features),
            "live_features_count": len(self.live_features),
            "dead_features_count": len(self.dead_features),
            "features": {
                name: asdict(spec)
                for name, spec in self.features.items()
            },
            "coverage_by_domain": {
                domain: metrics.to_dict()
                for domain, metrics in self.coverage_by_domain.items()
            },
            "dead_features": self.dead_features,
        }
    
    def save(self, path: Path) -> None:
        """Persist manifest to JSON."""
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            json.dump(self.to_dict(), f, indent=2)
    
    @classmethod
    def load(cls, path: Path) -> FeatureManifest:
        """Load manifest from JSON."""
        with open(path) as f:
            data = json.load(f)
        # Simplified load - full implementation would rebuild objects
        return cls(
            timestamp=data["timestamp"],
            grid_shape=tuple(data["grid_shape"]),
        )


class FeatureRegistry:
    """
    Central registry for all features in the system.
    
    Maintains:
    - Feature definitions with types and ranges
    - Domain groupings
    - Coverage tracking
    - Training-vs-inference feature sets
    - Validation rules
    """
    
    def __init__(self):
        self.features: dict[str, FeatureSpec] = {}
        self.coverage: dict[str, CoverageMetrics] = {}
    
    def register(self, spec: FeatureSpec) -> None:
        """Register a feature specification."""
        self.features[spec.name] = spec
    
    def register_batch(self, specs: list[FeatureSpec]) -> None:
        """Register multiple features."""
        for spec in specs:
            self.register(spec)
    
    def unregister(self, name: str) -> None:
        """Remove a feature."""
        self.features.pop(name, None)
        self.coverage.pop(name, None)
    
    def get_by_domain(self, domain: FeatureType) -> list[FeatureSpec]:
        """Get all features in a domain."""
        return [
            spec for spec in self.features.values()
            if spec.domain == domain
        ]
    
    def get_training_features(self) -> list[FeatureSpec]:
        """Get features that should be used for training."""
        return [
            spec for spec in self.features.values()
            if not spec.is_metadata and not spec.exclude_from_training
        ]
    
    def get_inference_features(self) -> list[FeatureSpec]:
        """Get features available at inference time."""
        return [
            spec for spec in self.features.values()
            if not spec.is_metadata
        ]
    
    def compute_coverage(self, grid: pd.DataFrame) -> FeatureManifest:
        """
        Analyze data coverage for all registered features.
        
        Returns:
            FeatureManifest with coverage analysis
        """
        from datetime import datetime
        
        timestamp = datetime.utcnow().isoformat()
        n_cells = len(grid)
        n_features = len(self.features)
        
        coverage_by_domain: dict[str, DomainCoverageMetrics] = {}
        dead_features: list[str] = []
        live_features: list[str] = []
        
        for feature_name, spec in self.features.items():
            if feature_name not in grid.columns:
                # Feature missing entirely
                metrics = CoverageMetrics(
                    feature_name=feature_name,
                    total_cells=n_cells,
                    non_null_count=0,
                    non_null_pct=0.0,
                )
            else:
                col = grid[feature_name]
                non_null_count = col.notna().sum()
                non_null_pct = (non_null_count / n_cells) * 100 if n_cells > 0 else 0.0
                
                numeric_col = pd.to_numeric(col, errors="coerce")
                metrics = CoverageMetrics(
                    feature_name=feature_name,
                    total_cells=n_cells,
                    non_null_count=int(non_null_count),
                    non_null_pct=float(non_null_pct),
                    min_val=float(numeric_col.min()) if numeric_col.notna().any() else None,
                    max_val=float(numeric_col.max()) if numeric_col.notna().any() else None,
                    mean_val=float(numeric_col.mean()) if numeric_col.notna().any() else None,
                    std_val=float(numeric_col.std()) if numeric_col.notna().any() else None,
                )
            
            # Track coverage
            self.coverage[feature_name] = metrics
            
            # Track by domain
            domain = spec.domain
            if domain not in coverage_by_domain:
                coverage_by_domain[domain] = DomainCoverageMetrics(domain=domain)
            coverage_by_domain[domain].features[feature_name] = metrics
            
            # Categorize
            if metrics.is_dead(1.0):
                dead_features.append(feature_name)
            else:
                live_features.append(feature_name)
        
        return FeatureManifest(
            timestamp=timestamp,
            grid_shape=(n_cells, n_features),
            features=self.features,
            coverage_by_domain=coverage_by_domain,
            dead_features=dead_features,
            live_features=live_features,
        )
    
    def report_coverage(self, manifest: FeatureManifest) -> str:
        """Generate human-readable coverage report."""
        lines = [
            "\n" + "=" * 70,
            "FEATURE COVERAGE ANALYSIS",
            "=" * 70,
        ]
        
        lines.append(f"\nGrid shape: {manifest.grid_shape}")
        lines.append(f"Total features: {len(manifest.features)}")
        lines.append(f"Live features (>0% real): {len(manifest.live_features)}")
        lines.append(f"Dead features (<1% real): {len(manifest.dead_features)}")
        
        # By domain
        lines.append("\n" + "─" * 70)
        lines.append("Coverage by Domain:")
        lines.append("─" * 70)
        
        for domain_name, domain_metrics in manifest.coverage_by_domain.items():
            domain_str = domain_metrics.domain.value.upper()
            lines.append(f"\n{domain_str}:")
            
            for feat_name, cov in domain_metrics.features.items():
                status = "✅" if not cov.is_dead(1.0) else "❌"
                lines.append(
                    f"  {status} {feat_name:40s} "
                    f"{cov.non_null_pct:6.1f}% real ({cov.non_null_count:6d}/{cov.total_cells:6d})"
                )
        
        # Dead features summary
        if manifest.dead_features:
            lines.append("\n" + "─" * 70)
            lines.append("⚠️  DEAD FEATURES (should be pruned):")
            lines.append("─" * 70)
            for feat_name in sorted(manifest.dead_features):
                cov = self.coverage[feat_name]
                lines.append(
                    f"  ❌ {feat_name:40s} {cov.non_null_pct:6.1f}% real"
                )
        
        lines.append("\n" + "=" * 70 + "\n")
        
        return "\n".join(lines)


# ============================================================
# BUILT-IN FEATURE REGISTRY
# ============================================================

def create_standard_registry() -> FeatureRegistry:
    """Create the standard registry with all known features."""
    registry = FeatureRegistry()
    
    # METADATA (excluded from training)
    metadata_specs = [
        FeatureSpec(
            name="grid_lat", domain=FeatureType.DERIVED,
            data_type=FeatureDataType.FLOAT32,
            description="Grid cell center latitude",
            is_metadata=True,
        ),
        FeatureSpec(
            name="grid_lon", domain=FeatureType.DERIVED,
            data_type=FeatureDataType.FLOAT32,
            description="Grid cell center longitude",
            is_metadata=True,
        ),
        FeatureSpec(
            name="cell_id", domain=FeatureType.DERIVED,
            data_type=FeatureDataType.FLOAT32,  # Actually string but for schema
            description="Unique grid cell identifier",
            is_metadata=True,
        ),
        FeatureSpec(
            name="coverage_score", domain=FeatureType.DERIVED,
            data_type=FeatureDataType.FLOAT32,
            description="Proportion of domains with real data",
            is_metadata=True,
            expected_range=(0.0, 1.0),
        ),
        FeatureSpec(
            name="feature_completeness", domain=FeatureType.DERIVED,
            data_type=FeatureDataType.FLOAT32,
            description="Proportion of features with real values",
            is_metadata=True,
            expected_range=(0.0, 1.0),
        ),
    ]
    
    # CRIME DOMAIN
    crime_specs = [
        FeatureSpec(
            name="crime_rate_per_100k", domain=FeatureType.CRIME,
            data_type=FeatureDataType.FLOAT32,
            description="Crime incidents per 100k population",
            min_coverage_pct=5.0,
            units="count/100k",
            expected_range=(0.0, 600.0),
        ),
        FeatureSpec(
            name="crime_type_distribution_risk", domain=FeatureType.CRIME,
            data_type=FeatureDataType.FLOAT32,
            description="Risk score from crime type distribution",
            min_coverage_pct=5.0,
            expected_range=(0.0, 1.0),
        ),
        FeatureSpec(
            name="gender_safety_index", domain=FeatureType.CRIME,
            data_type=FeatureDataType.FLOAT32,
            description="Safety index for gender-based crimes",
            expected_range=(0.0, 1.0),
        ),
        FeatureSpec(
            name="tourist_targeted_crime_index", domain=FeatureType.CRIME,
            data_type=FeatureDataType.FLOAT32,
            description="Risk of crime targeting tourists",
            expected_range=(0.0, 1.0),
        ),
    ]
    
    # WEATHER DOMAIN
    weather_specs = [
        FeatureSpec(
            name="temperature_c", domain=FeatureType.WEATHER,
            data_type=FeatureDataType.FLOAT32,
            description="Temperature in Celsius",
            units="°C",
            expected_range=(-20.0, 55.0),
        ),
        FeatureSpec(
            name="humidity_pct", domain=FeatureType.WEATHER,
            data_type=FeatureDataType.FLOAT32,
            description="Relative humidity percentage",
            units="%",
            expected_range=(0.0, 100.0),
        ),
        FeatureSpec(
            name="wind_speed_kmph", domain=FeatureType.WEATHER,
            data_type=FeatureDataType.FLOAT32,
            description="Wind speed in km/h",
            units="km/h",
            expected_range=(0.0, 220.0),
        ),
        FeatureSpec(
            name="rainfall_mmph", domain=FeatureType.WEATHER,
            data_type=FeatureDataType.FLOAT32,
            description="Rainfall rate in mm/hour",
            units="mm/h",
            expected_range=(0.0, 400.0),
        ),
        FeatureSpec(
            name="weather_severity", domain=FeatureType.WEATHER,
            data_type=FeatureDataType.FLOAT32,
            description="Composite weather hazard severity score",
            expected_range=(0.0, 100.0),
        ),
    ]
    
    # AQI DOMAIN
    aqi_specs = [
        FeatureSpec(
            name="aqi", domain=FeatureType.AIR_QUALITY,
            data_type=FeatureDataType.FLOAT32,
            description="Air Quality Index",
            expected_range=(0.0, 500.0),
        ),
        FeatureSpec(
            name="pm25", domain=FeatureType.AIR_QUALITY,
            data_type=FeatureDataType.FLOAT32,
            description="PM2.5 concentration (μg/m³)",
            units="μg/m³",
            expected_range=(0.0, 300.0),
        ),
        FeatureSpec(
            name="pm10", domain=FeatureType.AIR_QUALITY,
            data_type=FeatureDataType.FLOAT32,
            description="PM10 concentration (μg/m³)",
            units="μg/m³",
            expected_range=(0.0, 500.0),
        ),
    ]
    
    # WATER DOMAIN
    water_specs = [
        FeatureSpec(
            name="water_safety_score", domain=FeatureType.WATER,
            data_type=FeatureDataType.FLOAT32,
            description="Water quality safety score",
            expected_range=(0.0, 100.0),
        ),
        FeatureSpec(
            name="water_contamination_risk", domain=FeatureType.WATER,
            data_type=FeatureDataType.FLOAT32,
            description="Risk of water contamination",
            expected_range=(0.0, 1.0),
        ),
    ]
    
    # HEALTH DOMAIN
    health_specs = [
        FeatureSpec(
            name="ambulance_response_score", domain=FeatureType.HEALTH,
            data_type=FeatureDataType.FLOAT32,
            description="Ambulance response capability score",
            expected_range=(0.0, 100.0),
        ),
        FeatureSpec(
            name="nearest_hospital_proxy_km", domain=FeatureType.HEALTH,
            data_type=FeatureDataType.FLOAT32,
            description="Distance to nearest hospital in km",
            units="km",
            expected_range=(0.0, 100.0),
        ),
    ]
    
    # DISASTER DOMAIN
    disaster_specs = [
        FeatureSpec(
            name="flood_risk", domain=FeatureType.DISASTER,
            data_type=FeatureDataType.FLOAT32,
            description="Flood hazard risk",
            expected_range=(0.0, 1.0),
        ),
        FeatureSpec(
            name="earthquake_risk", domain=FeatureType.DISASTER,
            data_type=FeatureDataType.FLOAT32,
            description="Earthquake seismic risk",
            expected_range=(0.0, 1.0),
        ),
        FeatureSpec(
            name="cyclone_risk", domain=FeatureType.DISASTER,
            data_type=FeatureDataType.FLOAT32,
            description="Cyclone/typhoon risk",
            expected_range=(0.0, 1.0),
        ),
        FeatureSpec(
            name="landslide_risk", domain=FeatureType.DISASTER,
            data_type=FeatureDataType.FLOAT32,
            description="Landslide hazard risk",
            expected_range=(0.0, 1.0),
        ),
    ]
    
    # ACCIDENT DOMAIN
    accident_specs = [
        FeatureSpec(
            name="road_accident_hotspot_risk", domain=FeatureType.ACCIDENT,
            data_type=FeatureDataType.FLOAT32,
            description="Risk from road accident hotspots",
            expected_range=(0.0, 1.0),
        ),
        FeatureSpec(
            name="accident_severity_index", domain=FeatureType.ACCIDENT,
            data_type=FeatureDataType.FLOAT32,
            description="Severity index of past accidents",
            expected_range=(0.0, 1.0),
        ),
    ]
    
    # FIRE DOMAIN
    fire_specs = [
        FeatureSpec(
            name="fire_risk_index", domain=FeatureType.FIRE,
            data_type=FeatureDataType.FLOAT32,
            description="Fire hazard risk index",
            expected_range=(0.0, 1.0),
        ),
        FeatureSpec(
            name="fire_intensity_score", domain=FeatureType.FIRE,
            data_type=FeatureDataType.FLOAT32,
            description="Intensity of past fire events",
            expected_range=(0.0, 1.0),
        ),
    ]
    
    # TERRAIN DOMAIN
    terrain_specs = [
        FeatureSpec(
            name="elevation_m", domain=FeatureType.TERRAIN,
            data_type=FeatureDataType.FLOAT32,
            description="Elevation above sea level",
            units="m",
            expected_range=(-100.0, 8000.0),
        ),
    ]
    
    # POPULATION DOMAIN
    population_specs = [
        FeatureSpec(
            name="population_density_per_km2", domain=FeatureType.POPULATION,
            data_type=FeatureDataType.FLOAT32,
            description="Population density",
            units="people/km²",
            expected_range=(0.0, 50000.0),
        ),
        FeatureSpec(
            name="isolation_score", domain=FeatureType.POPULATION,
            data_type=FeatureDataType.FLOAT32,
            description="Isolation index (distance to help)",
            expected_range=(0.0, 1.0),
        ),
        FeatureSpec(
            name="urbanization_rate", domain=FeatureType.POPULATION,
            data_type=FeatureDataType.FLOAT32,
            description="Fraction of population in urban areas",
            expected_range=(0.0, 1.0),
        ),
        FeatureSpec(
            name="literacy_rate", domain=FeatureType.POPULATION,
            data_type=FeatureDataType.FLOAT32,
            description="Literacy rate (social infrastructure proxy)",
            expected_range=(0.0, 1.0),
        ),
    ]
    
    # NOISE DOMAIN
    noise_specs = [
        FeatureSpec(
            name="noise_level_proxy", domain=FeatureType.NOISE,
            data_type=FeatureDataType.FLOAT32,
            description="Proxy noise level indicator",
            units="dB",
            expected_range=(0.0, 200.0),
        ),
    ]
    
    # TEMPORAL FEATURES (excluded from base grid, added during label generation)
    temporal_specs = [
        FeatureSpec(
            name="hour", domain=FeatureType.TEMPORAL,
            data_type=FeatureDataType.INT32,
            description="Hour of day (0-23)",
            exclude_from_training=False,  # Include in training
            temporal_encoding="cyclical",
            expected_range=(0.0, 23.0),
        ),
        FeatureSpec(
            name="month", domain=FeatureType.TEMPORAL,
            data_type=FeatureDataType.INT32,
            description="Month of year (1-12)",
            exclude_from_training=False,
            temporal_encoding="seasonal",
            expected_range=(1.0, 12.0),
        ),
        FeatureSpec(
            name="day_of_week", domain=FeatureType.TEMPORAL,
            data_type=FeatureDataType.INT32,
            description="Day of week (0=Monday, 6=Sunday)",
            exclude_from_training=False,
            temporal_encoding="cyclical",
            expected_range=(0.0, 6.0),
        ),
    ]
    
    # Register all specs
    registry.register_batch(metadata_specs)
    registry.register_batch(crime_specs)
    registry.register_batch(weather_specs)
    registry.register_batch(aqi_specs)
    registry.register_batch(water_specs)
    registry.register_batch(health_specs)
    registry.register_batch(disaster_specs)
    registry.register_batch(accident_specs)
    registry.register_batch(fire_specs)
    registry.register_batch(terrain_specs)
    registry.register_batch(population_specs)
    registry.register_batch(noise_specs)
    registry.register_batch(temporal_specs)
    
    return registry
