"""
Registry-Driven Pipeline Orchestration.

Replaces hardcoded lists in pipeline.py with plugin/decorator pattern.

Before:
```python
trainers = [
    ("Safety Scorer", "training.train_safety_scorer", "train_safety_scorer"),
    # ...
]
```

After:
```python
@register_trainer("safety_scorer", priority=10)
def train_safety_scorer():
    ...
```

Benefits:
- No central touching needed to add new data sources/models
- Models are self-registering
- Easy to disable by priority or tags
- Clear dependencies and ordering
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Optional

import importlib


class PipelineStage(Enum):
    """Pipeline execution stages in order."""
    DOWNLOAD = 1
    INGEST = 2
    MERGE = 3
    GENERATE_LABELS = 4
    TRAIN = 5
    EVALUATE = 6


@dataclass
class ComponentMetadata:
    """Metadata for a pipeline component."""
    name: str
    stage: PipelineStage
    module_path: str
    function_name: str
    
    # Ordering and dependencies
    priority: int = 100  # Lower = earlier execution
    dependencies: list[str] = field(default_factory=list)  # [component names]
    tags: list[str] = field(default_factory=list)  # ["nlp", "vision", "optional"]
    
    # Configuration
    enabled: bool = True
    skip_on_error: bool = False  # If True, continue if this fails
    description: str = ""


class PipelineRegistry:
    """
    Central registry for all pipeline components.
    
    Supports:
    - Flexible registration (decorators, programmatic)
    - Filtering by stage, tags, priority
    - Dependency resolution
    - Execution control
    """
    
    def __init__(self):
        self.components: dict[str, ComponentMetadata] = {}
    
    def register(self, metadata: ComponentMetadata) -> None:
        """Register a pipeline component."""
        self.components[metadata.name] = metadata
    
    def unregister(self, name: str) -> None:
        """Remove a component."""
        self.components.pop(name, None)
    
    def get_by_stage(self, stage: PipelineStage) -> list[ComponentMetadata]:
        """Get all components for a stage, sorted by priority."""
        components = [
            c for c in self.components.values()
            if c.stage == stage and c.enabled
        ]
        return sorted(components, key=lambda c: c.priority)
    
    def get_by_tag(self, tag: str) -> list[ComponentMetadata]:
        """Get all components with a given tag."""
        return [
            c for c in self.components.values()
            if tag in c.tags
        ]
    
    def get(self, name: str) -> Optional[ComponentMetadata]:
        """Get a specific component."""
        return self.components.get(name)
    
    def list_components(self, stage: Optional[PipelineStage] = None) -> list[str]:
        """List all component names, optionally filtered by stage."""
        if stage:
            return [
                c.name for c in self.get_by_stage(stage)
            ]
        return list(self.components.keys())
    
    def enable(self, name: str) -> None:
        """Enable a component."""
        if name in self.components:
            self.components[name].enabled = True
    
    def disable(self, name: str) -> None:
        """Disable a component."""
        if name in self.components:
            self.components[name].enabled = False
    
    def resolve_dependencies(self) -> dict[str, list[str]]:
        """
        Compute execution order respecting dependencies.
        
        Returns:
            {component_name: [dependencies to run first]}
        """
        order = {}
        visited = set()
        
        def visit(name: str, path: list[str] = None):
            if path is None:
                path = []
            
            if name in visited:
                return
            
            if name in path:
                raise ValueError(f"Circular dependency: {' -> '.join(path + [name])}")
            
            component = self.components.get(name)
            if not component:
                return
            
            for dep in component.dependencies:
                visit(dep, path + [name])
            
            visited.add(name)
            order[name] = component.dependencies
        
        for name in self.components:
            visit(name)
        
        return order


# Global registry instance
_registry: Optional[PipelineRegistry] = None


def get_registry() -> PipelineRegistry:
    """Get or create singleton registry."""
    global _registry
    if _registry is None:
        _registry = PipelineRegistry()
    return _registry


# ============================================================
# DECORATORS FOR SELF-REGISTERING COMPONENTS
# ============================================================

def register_ingestor(
    name: str,
    priority: int = 100,
    tags: list[str] = None,
    module_path: str = None,
    function_name: str = None,
):
    """
    Decorator to register an ingestor function.
    
    Usage:
        @register_ingestor("weather", priority=50)
        def ingest_all_weather():
            ...
    """
    def decorator(func: Callable) -> Callable:
        _module = module_path or func.__module__
        _func = function_name or func.__name__
        
        metadata = ComponentMetadata(
            name=name,
            stage=PipelineStage.INGEST,
            module_path=_module,
            function_name=_func,
            priority=priority,
            tags=tags or [],
            description=func.__doc__ or "",
        )
        
        get_registry().register(metadata)
        return func
    
    return decorator


def register_trainer(
    name: str,
    priority: int = 100,
    tags: list[str] = None,
    module_path: str = None,
    function_name: str = None,
    dependencies: list[str] = None,
):
    """
    Decorator to register a training function.
    
    Usage:
        @register_trainer("safety_scorer", priority=10)
        def train_safety_scorer():
            ...
    """
    def decorator(func: Callable) -> Callable:
        _module = module_path or func.__module__
        _func = function_name or func.__name__
        
        metadata = ComponentMetadata(
            name=name,
            stage=PipelineStage.TRAIN,
            module_path=_module,
            function_name=_func,
            priority=priority,
            tags=tags or [],
            dependencies=dependencies or [],
            description=func.__doc__ or "",
        )
        
        get_registry().register(metadata)
        return func
    
    return decorator


# ============================================================
# COMPONENT LOADING AND EXECUTION
# ============================================================

def load_component(metadata: ComponentMetadata) -> Callable:
    """
    Dynamically load a component function.
    
    Args:
        metadata: ComponentMetadata
    
    Returns:
        The callable function
    """
    try:
        module = importlib.import_module(metadata.module_path)
        func = getattr(module, metadata.function_name)
        return func
    except Exception as e:
        raise RuntimeError(
            f"Failed to load {metadata.module_path}.{metadata.function_name}: {e}"
        )


def execute_component(
    metadata: ComponentMetadata,
    **kwargs,
) -> Any:
    """
    Execute a single component.
    
    Args:
        metadata: ComponentMetadata
        kwargs: Arguments to pass to function
    
    Returns:
        Function result
    """
    print(f"\n── {metadata.name} ──")
    
    try:
        func = load_component(metadata)
        return func(**kwargs)
    except FileNotFoundError as e:
        print(f"  ⚠️  Skipped (data not found): {e}")
        return None
    except Exception as e:
        if metadata.skip_on_error:
            print(f"  ⚠️  Error (continuing): {e}")
            return None
        else:
            raise


def execute_stage(
    stage: PipelineStage,
    filter_tags: Optional[list[str]] = None,
    **kwargs,
) -> dict[str, Any]:
    """
    Execute all components in a stage.
    
    Args:
        stage: PipelineStage to execute
        filter_tags: Only run components with these tags
        kwargs: Arguments to pass to components
    
    Returns:
        {component_name: result}
    """
    registry = get_registry()
    components = registry.get_by_stage(stage)
    
    # Filter by tags if provided
    if filter_tags:
        components = [
            c for c in components
            if any(tag in c.tags for tag in filter_tags)
        ]
    
    results = {}
    for component in components:
        result = execute_component(component, **kwargs)
        results[component.name] = result
    
    return results


# ============================================================
# STANDARD REGISTRY POPULATION
# ============================================================

def register_standard_components():
    """
    Register all standard ingestion and training components.
    Called once at startup.
    """
    registry = get_registry()
    
    # INGESTORS (in priority order)
    ingestors = [
        ("crime", "ingestion.ingest_crime", "ingest_all_crime", 10),
        ("weather", "ingestion.ingest_weather", "ingest_all_weather", 20),
        ("aqi", "ingestion.ingest_aqi", "ingest_all_aqi", 30),
        ("water", "ingestion.ingest_water", "ingest_all_water", 40),
        ("disasters", "ingestion.ingest_disasters", "ingest_all_disasters", 50),
        ("accidents", "ingestion.ingest_accidents", "ingest_all_accidents", 60),
        ("health", "ingestion.ingest_health", "ingest_all_health", 70),
        ("terrain", "ingestion.ingest_terrain", "ingest_all_terrain", 80),
        ("population", "ingestion.ingest_population", "ingest_all_population", 90),
        ("tourism", "ingestion.ingest_tourism", "ingest_all_tourism", 100),
        ("fire", "ingestion.ingest_fire", "ingest_all_fire", 110),
        ("noise", "ingestion.ingest_noise", "ingest_all_noise", 120),
    ]
    
    for name, module, func, priority in ingestors:
        registry.register(ComponentMetadata(
            name=name,
            stage=PipelineStage.INGEST,
            module_path=module,
            function_name=func,
            priority=priority,
        ))
    
    # TRAINERS (in priority order)
    trainers = [
        ("safety_scorer", "training.train_safety_scorer", "train_safety_scorer", 10),
        ("incident_classifier", "training.train_incident_classifier", "train_incident_classifier", 20),
        ("anomaly_detector", "training.train_anomaly", "train_anomaly_detector", 30),
        ("trajectory_forecaster", "training.train_trajectory", "train_trajectory_model", 40),
        ("spatial_risk", "training.train_spatial_risk", "save_propagation_profiles", 50),
        ("alert_timing", "training.train_alert_timing", "save_alert_model", 60),
    ]
    
    for name, module, func, priority in trainers:
        registry.register(ComponentMetadata(
            name=name,
            stage=PipelineStage.TRAIN,
            module_path=module,
            function_name=func,
            priority=priority,
        ))
