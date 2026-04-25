"""
Infrastructure data → safety factor values.
Covers roads, police stations, settlements.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


def compute_infrastructure_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Outputs:
    - overall_infrastructure_score (0-100)
    - connectivity_score (0-1)
    - emergency_services_access (0-1)
    """
    result = df.copy()

    hosp_km = result.get("nearest_hospital_proxy_km", pd.Series(25.0, index=result.index))
    pop_density = result.get("population_density_per_km2", pd.Series(400.0, index=result.index))
    isolation = result.get("isolation_score", pd.Series(0.3, index=result.index))
    tourism_infra = result.get("tourism_infrastructure_proxy", pd.Series(0.5, index=result.index))

    # Connectivity: inverse of isolation, boosted by population
    connectivity = (1.0 - isolation) * 0.6 + (pop_density / 5000).clip(0, 0.4)
    result["connectivity_score"] = connectivity.clip(0, 1)

    # Emergency services access
    hosp_access = (1.0 - (hosp_km / 50).clip(0, 1))
    result["emergency_services_access"] = hosp_access.clip(0, 1)

    # Overall infrastructure
    result["overall_infrastructure_score"] = (
        result["connectivity_score"] * 30 +
        result["emergency_services_access"] * 40 +
        tourism_infra * 15 +
        (pop_density / 5000).clip(0, 1) * 15
    ).clip(0, 100)

    return result