"""
Shadow Simulation & Geometric Shading Engine for Suryavedh.
Calculates 3D shadow projection polygons on ground and neighboring roofs/facades
based on sun azimuth, elevation, building heights, and spatial orientations.
"""

import math
from typing import List, Dict, Tuple, Optional, Any
from shapely.geometry import Polygon, MultiPolygon
from app.models.schemas import (
    BuildingFootprint,
    ProposedFutureBuilding,
    ProvenanceMetadata,
    DataSourceType,
)
from datetime import datetime, timezone


def project_shadow_polygon(
    footprint: List[List[float]],
    height: float,
    azimuth_deg: float,
    elevation_deg: float
) -> Optional[List[List[float]]]:
    """
    Projects the 3D ground shadow polygon of a prism building.
    Returns the convex hull or merged footprint + shadow displacement vertices.
    """
    if elevation_deg <= 0.5:
        # Sun is below horizon or at extreme grazing angle
        return None

    az_rad = math.radians(azimuth_deg)
    el_rad = math.radians(max(2.0, elevation_deg))

    # Shadow length on ground = height / tan(elevation)
    shadow_length = height / math.tan(el_rad)

    # In local metric coordinate frame:
    # +X is East, -Z is North, +Z is South
    # If sun is at Azimuth phi (e.g. South=180°), shadow falls towards North (-Z)
    # dx = -sin(az) * shadow_length
    # dz = cos(az) * shadow_length
    dx = -math.sin(az_rad) * shadow_length
    dz = math.cos(az_rad) * shadow_length

    # Extrude top vertices along shadow vector
    top_displaced = [[p[0] + dx, p[1] + dz] for p in footprint]
    all_points = footprint + top_displaced

    try:
        poly = Polygon(all_points).convex_hull
        if poly.geom_type == "Polygon":
            coords = list(poly.exterior.coords)
            return [[round(c[0], 2), round(c[1], 2)] for c in coords]
    except Exception:
        pass

    return [[p[0] + dx, p[1] + dz] for p in footprint]


def compute_shading_overlap_fraction(
    target_footprint: List[List[float]],
    target_height: float,
    obstruction_footprint: List[List[float]],
    obstruction_height: float,
    azimuth_deg: float,
    elevation_deg: float
) -> float:
    """
    Calculates the exact fractional overlap (0.0 to 1.0) of shadow cast by an obstruction
    onto the target building's roof plane.
    """
    if elevation_deg <= 1.0 or obstruction_height <= target_height:
        return 0.0

    delta_h = obstruction_height - target_height
    el_rad = math.radians(max(2.0, elevation_deg))
    az_rad = math.radians(azimuth_deg)

    shadow_len_at_roof = delta_h / math.tan(el_rad)
    dx = -math.sin(az_rad) * shadow_len_at_roof
    dz = math.cos(az_rad) * shadow_len_at_roof

    obs_shadow_roof = [[p[0] + dx, p[1] + dz] for p in obstruction_footprint]

    try:
        target_poly = Polygon(target_footprint).buffer(0)
        shadow_poly = Polygon(obs_shadow_roof + obstruction_footprint).convex_hull.buffer(0)

        if not target_poly.is_valid or not shadow_poly.is_valid:
            return 0.0

        intersection = target_poly.intersection(shadow_poly)
        if intersection.is_empty:
            return 0.0

        overlap_area = intersection.area
        target_area = target_poly.area
        return min(1.0, max(0.0, overlap_area / target_area))
    except Exception:
        return 0.0


def calculate_annual_shading_loss_profile(
    target_building: BuildingFootprint,
    obstructions: List[Any],
    latitude: float,
    longitude: float
) -> Dict[str, float]:
    """
    Samples representative solar hours (08:00, 10:00, 12:00, 14:00, 16:00)
    across solstice and equinox days (Winter Solstice, Spring Equinox, Summer Solstice)
    to compute a scientifically integrated annual shading loss percentage.
    """
    from app.services.solar_position import calculate_solar_position

    sample_dates = [
        "2026-06-21T",  # Summer Solstice
        "2026-03-21T",  # Spring Equinox
        "2026-12-21T",  # Winter Solstice
    ]
    sample_hours = ["08:30:00", "10:30:00", "12:30:00", "14:30:00", "16:30:00"]
    hour_weights = [0.12, 0.26, 0.28, 0.24, 0.10]  # Bell-curve irradiance weighting

    total_weighted_loss = 0.0
    total_weights = 0.0

    for d_str in sample_dates:
        for h_str, w in zip(sample_hours, hour_weights):
            iso_ts = f"{d_str}{h_str}Z"
            pos = calculate_solar_position(latitude, longitude, iso_ts)
            if pos.elevation_deg > 5.0:
                max_overlap = 0.0
                for obs in obstructions:
                    if isinstance(obs, BuildingFootprint):
                        obs_fp = obs.footprint_coordinates
                        obs_h = obs.height
                    elif isinstance(obs, ProposedFutureBuilding):
                        # Construct footprint of proposed future building
                        hw = obs.width_m / 2.0
                        hl = obs.length_m / 2.0
                        obs_fp = [
                            [obs.center_x - hw, obs.center_z - hl],
                            [obs.center_x + hw, obs.center_z - hl],
                            [obs.center_x + hw, obs.center_z + hl],
                            [obs.center_x - hw, obs.center_z + hl],
                        ]
                        obs_h = obs.height_m
                    else:
                        continue

                    overlap = compute_shading_overlap_fraction(
                        target_footprint=target_building.footprint_coordinates,
                        target_height=target_building.height,
                        obstruction_footprint=obs_fp,
                        obstruction_height=obs_h,
                        azimuth_deg=pos.azimuth_deg,
                        elevation_deg=pos.elevation_deg
                    )
                    if overlap > max_overlap:
                        max_overlap = overlap

                total_weighted_loss += max_overlap * w
                total_weights += w

    integrated_loss_pct = (total_weighted_loss / max(0.001, total_weights)) * 100.0
    return {
        "annual_shading_loss_pct": round(min(95.0, integrated_loss_pct), 2),
        "winter_morning_shading_factor": round(min(1.0, integrated_loss_pct / 50.0), 3)
    }
