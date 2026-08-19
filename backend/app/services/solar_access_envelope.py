"""
Solar Access Planning Envelope Engine for Suryavedh.
Calculates the maximum allowable building height envelope and minimum setback distances
required to preserve solar rights (e.g., 85% or 90% solar access threshold) for protected solar assets.
"""

import math
from typing import List, Dict, Tuple
from app.models.schemas import (
    BuildingFootprint,
    ProposedFutureBuilding,
    SolarAccessEnvelopeResponse,
    ProvenanceMetadata,
    DataSourceType,
)
from datetime import datetime, timezone


def compute_solar_access_envelope(
    protected_building: BuildingFootprint,
    proposed_building: ProposedFutureBuilding,
    target_retention_pct: float = 85.0,
    critical_solar_elevation_deg: float = 32.0  # Winter solstice design sun elevation in Central India
) -> SolarAccessEnvelopeResponse:
    """
    Computes maximum permissible height and minimum setback distance to preserve solar access.
    """
    # Vector from target building center to proposed building center
    target_cx = sum(c[0] for c in protected_building.footprint_coordinates) / len(protected_building.footprint_coordinates)
    target_cz = sum(c[1] for c in protected_building.footprint_coordinates) / len(protected_building.footprint_coordinates)

    dx = proposed_building.center_x - target_cx
    dz = proposed_building.center_z - target_cz
    current_distance = math.sqrt(dx**2 + dz**2)

    # Critical solar access angle theta (based on winter solar altitude)
    # delta_h_max = distance * tan(critical_elevation)
    crit_rad = math.radians(critical_solar_elevation_deg)
    allowable_delta_h = current_distance * math.tan(crit_rad)

    # Max recommended height = target_height + allowable_delta_h * retention_factor
    retention_factor = (target_retention_pct / 100.0)
    # The higher the retention target, the stricter the allowable height
    stricter_factor = 1.0 - (1.0 - retention_factor) * 1.5
    max_rec_height = protected_building.height + allowable_delta_h * max(0.4, min(1.0, stricter_factor))
    max_rec_height = round(max(protected_building.height, max_rec_height), 1)

    # Minimum recommended setback for current proposed height
    # setback = (proposed_height - target_height) / tan(critical_elevation)
    height_excess = max(0.0, proposed_building.height_m - protected_building.height)
    min_rec_setback = round(height_excess / math.tan(crit_rad) * (target_retention_pct / 85.0), 1)
    min_rec_setback = max(6.0, min_rec_setback)

    is_height_compliant = proposed_building.height_m <= max_rec_height
    is_setback_compliant = proposed_building.setback_distance_m >= min_rec_setback

    acceptable_h_range = [round(protected_building.height, 1), round(max_rec_height, 1)]
    acceptable_sb_range = [round(min_rec_setback, 1), round(min_rec_setback + 25.0, 1)]

    notes = (
        f"Planning Envelope Advisory: To preserve >= {target_retention_pct}% solar access on "
        f"'{protected_building.name}', the proposed structure should not exceed {max_rec_height}m "
        f"or should maintain a minimum setback of {min_rec_setback}m along the solar azimuth corridor."
    )

    provenance = ProvenanceMetadata(
        source="Suryavedh Solar Access Planning Envelope Geometric Model",
        retrieval_timestamp=datetime.now(timezone.utc).isoformat(),
        confidence=0.95,
        data_type=DataSourceType.MODELED,
        methodology="Winter Solstice 32° Critical Solar Altitude Angular Envelope Formulation (SIH1739 Planning Model)",
        notes=notes
    )

    return SolarAccessEnvelopeResponse(
        protected_building_id=protected_building.id,
        target_solar_access_retention_pct=target_retention_pct,
        maximum_recommended_height_m=max_rec_height,
        current_proposed_height_m=proposed_building.height_m,
        is_height_compliant=is_height_compliant,
        recommended_minimum_setback_m=min_rec_setback,
        current_proposed_setback_m=proposed_building.setback_distance_m,
        is_setback_compliant=is_setback_compliant,
        acceptable_height_range_m=acceptable_h_range,
        acceptable_setback_range_m=acceptable_sb_range,
        planning_guideline_notes=notes,
        provenance=provenance
    )
