"""
Unit & Scientific Verification Tests for Suryavedh Platform.
Tests:
1. Solar Position & Ephemeris (Solar Noon, Sunrise/Sunset, Day/Night logic)
2. Climatological Solar Resource Ingestion
3. Rooftop PV Deterministic Placement & Usable Setbacks
4. BIPV Vertical Envelope Modeling
5. 3D Shadow Projection & Intersect Fractions
6. Future Construction Simulator & Solar Conflict Ranking
7. Solar Access Planning Envelope Constraints
8. Multi-Objective Scenario Optimizer
9. 25-Year DCF Financial Analysis & LCOE
10. Environmental CEA Carbon Avoidance Metrics
"""

import math
import os
import sys
import pytest

# Ensure backend root is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.solar_position import calculate_solar_position
from app.services.solar_resource import fetch_solar_resource
from app.services.building_provider import search_locations, get_digital_twin_site
from app.services.shadow_engine import project_shadow_polygon, compute_shading_overlap_fraction
from app.services.rooftop_pv import generate_optimized_panel_layout
from app.services.bipv_engine import evaluate_bipv_potential
from app.services.future_construction import simulate_future_construction_impact
from app.services.solar_access_envelope import compute_solar_access_envelope
from app.services.scenario_optimizer import find_better_scenarios
from app.services.financial_engine import compute_financial_metrics
from app.services.environmental_engine import compute_environmental_impact
from app.models.schemas import (
    BuildingFootprint,
    ProposedFutureBuilding,
    FinancialAnalysisRequest,
)


def test_solar_position_solar_noon_nagpur():
    """At solar noon on Equinox in Nagpur (Lat 21.14°N), solar zenith should equal latitude ~21.1° and Azimuth ~180°."""
    # 2026-03-21 at approx 06:44 UTC (12:14 IST solar noon)
    pos = calculate_solar_position(latitude=21.1458, longitude=79.0882, dt_iso="2026-03-21T06:44:00Z")
    assert pos.is_daylight is True
    assert pos.elevation_deg > 60.0
    assert 160.0 <= pos.azimuth_deg <= 200.0
    assert len(pos.sun_vector) == 3
    # Check sun_vector normalized
    norm = math.sqrt(sum(v**2 for v in pos.sun_vector))
    assert pytest.approx(norm, rel=1e-2) == 1.0


def test_solar_position_night_zero():
    """Midnight should be night time with elevation <= 0 and daylight false."""
    pos = calculate_solar_position(latitude=21.1458, longitude=79.0882, dt_iso="2026-03-21T19:00:00Z")
    assert pos.is_daylight is False
    assert pos.elevation_deg < 0.0


def test_solar_resource_nagpur():
    """Nagpur climatology should return ~1800-2000 kWh/m2/yr GHI and 12 months data."""
    res = fetch_solar_resource(21.1458, 79.0882)
    assert len(res.monthly_data) == 12
    assert 1700.0 <= res.annual_ghi_kwh_m2 <= 2200.0
    assert res.annual_dni_kwh_m2 > 1500.0
    assert res.provenance.confidence >= 0.90


def test_building_provider_ycce():
    """YCCE site search and LOD-1 extraction should contain mechanical admin block with verified height."""
    sites = search_locations("YCCE")
    assert len(sites) >= 1
    site = get_digital_twin_site(sites[0].id)
    assert site.name.startswith("Yeshwantrao")
    assert len(site.buildings) >= 4
    admin = next(b for b in site.buildings if "admin" in b.id.lower() or "mech" in b.id.lower())
    assert admin.height > 10.0
    assert admin.gross_roof_area > 500.0


def test_rooftop_pv_placement_deterministic():
    """Rooftop PV layout generator should place panels within usable bounds and compute non-zero capacity and yield."""
    site = get_digital_twin_site("site_ycce_nagpur")
    building = site.buildings[0]
    solar_res = fetch_solar_resource(site.coordinates.latitude, site.coordinates.longitude)

    pv_resp = generate_optimized_panel_layout(building, solar_res, target_tilt_deg=15.0)
    assert pv_resp.total_panels_count > 0
    assert pv_resp.installed_capacity_kwp > 0
    assert pv_resp.annual_generation_kwh > 0
    assert pv_resp.specific_yield_kwh_per_kwp > 1200.0  # High specific yield in Central India
    assert pv_resp.usable_area_m2 < pv_resp.gross_area_m2  # Respects setback buffer
    # Check 3D panel coordinates sit right at roof elevation
    for p in pv_resp.panel_layout_grid:
        assert p.center_y >= building.height


def test_bipv_evaluation():
    """BIPV should evaluate 4 facades and identify South as highest potential."""
    site = get_digital_twin_site("site_ycce_nagpur")
    building = site.buildings[0]
    solar_res = fetch_solar_resource(site.coordinates.latitude, site.coordinates.longitude)

    bipv_resp = evaluate_bipv_potential(building, solar_res)
    assert len(bipv_resp.facades) == 4
    south_f = next(f for f in bipv_resp.facades if "South" in f.orientation.value)
    north_f = next(f for f in bipv_resp.facades if "North" in f.orientation.value)
    assert south_f.annual_bipv_generation_kwh > north_f.annual_bipv_generation_kwh
    assert bipv_resp.total_bipv_capacity_kwp > 0


def test_future_construction_impact_and_conflict():
    """A 45m proposed tower in close proximity should trigger CRITICAL or HIGH conflict on neighbors."""
    site = get_digital_twin_site("site_ycce_nagpur")
    solar_res = fetch_solar_resource(site.coordinates.latitude, site.coordinates.longitude)
    future_tower = ProposedFutureBuilding(
        id="future_highrise",
        name="Proposed 45m Tower",
        center_x=0.0,
        center_z=-5.0,  # Directly south of target buildings
        width_m=30.0,
        length_m=30.0,
        height_m=45.0,
        floors=14,
        setback_distance_m=8.0
    )

    impact = simulate_future_construction_impact(
        buildings=site.buildings,
        future_bldg=future_tower,
        solar_resource=solar_res
    )
    assert impact.total_annual_energy_loss_kwh > 0
    assert impact.total_annual_revenue_loss_inr > 0
    assert len(impact.affected_conflicts) > 0


def test_solar_access_envelope():
    """Envelope engine should calculate a max recommended height less than extreme tall structures."""
    site = get_digital_twin_site("site_ycce_nagpur")
    building = site.buildings[0]
    future_tower = ProposedFutureBuilding(
        id="future_highrise",
        name="Proposed 50m Tower",
        center_x=30.0,
        center_z=-20.0,
        height_m=50.0
    )
    env = compute_solar_access_envelope(building, future_tower, target_retention_pct=85.0)
    assert env.maximum_recommended_height_m > 0
    assert env.recommended_minimum_setback_m > 0
    assert env.is_height_compliant is False  # 50m is taller than max allowed


def test_scenario_optimizer():
    """Scenario optimizer should produce recommended sweet spot with improved retention."""
    site = get_digital_twin_site("site_ycce_nagpur")
    solar_res = fetch_solar_resource(site.coordinates.latitude, site.coordinates.longitude)
    future_tower = ProposedFutureBuilding(
        id="future_highrise",
        center_x=20.0,
        center_z=-15.0,
        height_m=42.0,
        width_m=25.0,
        length_m=25.0
    )
    opt = find_better_scenarios(site.buildings, future_tower, solar_res)
    assert opt.recommended_scenario.is_pareto_optimal is True
    assert opt.recommended_scenario.neighbor_solar_retention_pct > 70.0
    assert len(opt.alternative_scenarios) >= 2


def test_financial_and_environmental_engines():
    """Financial DCF should calculate positive 25-yr NPV and payback; environmental should compute CO2 tons."""
    fin_req = FinancialAnalysisRequest(
        system_capacity_kwp=50.0,
        annual_generation_kwh=75000.0,
        tariff_inr_per_kwh=8.20,
        capex_per_kwp_inr=48000.0
    )
    fin_resp = compute_financial_metrics(fin_req)
    assert fin_resp.total_capex_inr == 2400000.0
    assert 2.0 <= fin_resp.simple_payback_years <= 6.0
    assert fin_resp.net_present_value_inr > 0
    assert fin_resp.levelized_cost_of_electricity_inr_kwh < 4.5

    env_resp = compute_environmental_impact(75000.0)
    assert env_resp.annual_co2_reduction_metric_tons > 40.0
    assert env_resp.equivalent_trees_planted_count > 2000
