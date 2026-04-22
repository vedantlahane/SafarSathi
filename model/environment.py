# path: model/environment.py
from __future__ import annotations

from .schemas import SafetyFeatures


def detect_environment(features: SafetyFeatures) -> str:
    """Classify the current location context.

    The logic follows the city-to-wilderness progression described in the
    safety taxonomy: service density, connectivity, distance to settlement,
    and population density are the primary separators.
    """

    nearby_place_count = features.nearby_place_count
    network_type = features.network_type
    distance_to_settlement_m = features.distance_to_settlement_km * 1000.0
    population_density = features.population_density_per_km2

    if (
        nearby_place_count == 0
        and network_type == "none"
        and distance_to_settlement_m > 10000
    ):
        return "wilderness"

    if (
        nearby_place_count <= 2
        and network_type in {"none", "2g"}
        and distance_to_settlement_m > 5000
    ):
        return "remote"

    if (
        nearby_place_count <= 8
        and population_density < 500
        and distance_to_settlement_m > 1000
    ):
        return "rural"

    if population_density < 3000 and nearby_place_count <= 15:
        return "suburban"

    return "urban"
