"""
Population + tourism data → safety factor values.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


def compute_social_risk_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Outputs:
    - crowding_risk (0-1): extremely dense = crowd crush risk
    - isolation_risk (0-1): extremely sparse = no help nearby
    - tourist_safety_proxy (0-1): tourist areas tend to be better policed
    """
    result = df.copy()

    pop_density = result.get("population_density_per_km2", pd.Series(400.0, index=result.index))
    isolation = result.get("isolation_score", pd.Series(0.3, index=result.index))
    tourist_density = result.get("nearby_tourist_density_index", pd.Series(0.0, index=result.index))

    # Crowding risk: extreme density (>10000/km²) = crowd dangers
    result["crowding_risk"] = np.where(
        pop_density > 5000,
        ((pop_density - 5000) / 20000).clip(0, 1),
        0.0,
    )

    # Isolation risk: very low density = far from help
    result["isolation_risk"] = isolation.clip(0, 1)

    # Tourist areas tend to have better infrastructure/policing
    result["tourist_safety_proxy"] = (tourist_density * 0.3).clip(0, 1)

    return result