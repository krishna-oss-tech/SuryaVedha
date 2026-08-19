"""
Pydantic Schemas for Suryavedh: Urban Solar Intelligence & Digital Twin.
Every data structure enforces provenance, traceable sources, and calculation metadata.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class DataSourceType(str, Enum):
    REAL_RETRIEVED = "REAL / RETRIEVED"
    MODELED = "MODELED"
    ESTIMATED = "ESTIMATED"
    USER_PROVIDED = "USER-PROVIDED"
    TEST_FALLBACK = "TEST / FALLBACK"


class ProvenanceMetadata(BaseModel):
    source: str = Field(..., description="Data provider or model source")
    retrieval_timestamp: str = Field(..., description="ISO timestamp of data retrieval / computation")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    data_type: DataSourceType = Field(..., description="Classification of provenance")
    methodology: str = Field(..., description="Scientific equation or algorithm description")
    notes: Optional[str] = None


class Coordinates(BaseModel):
    latitude: float
    longitude: float


class LocationSearchResult(BaseModel):
    id: str
    display_name: str
    locality: str
    city: str
    state: str
    country: str = "India"
    coordinates: Coordinates
    bbox: List[float] = Field(..., description="[min_lon, min_lat, max_lon, max_lat]")
    category: str = Field(default="institution", description="property | campus | commercial | urban | custom")
    provenance: ProvenanceMetadata


class BuildingPolygonPoint(BaseModel):
    x: float = Field(..., description="Local metric x in meters (East-West)")
    y: float = Field(..., description="Local metric y in meters (Elevation/Height in 3D is Z or Y)")
    z: float = Field(..., description="Local metric z in meters (North-South)")


class BuildingFootprint(BaseModel):
    id: str
    name: str
    footprint_coordinates: List[List[float]] = Field(..., description="Local metric polygon coordinates [[x, z], ...]")
    geo_coordinates: Optional[List[List[float]]] = Field(None, description="[[lon, lat], ...]")
    height: float = Field(..., ge=2.0, description="Building height in meters")
    floors: int = Field(default=1, ge=1)
    height_source: str = Field(default="verified_osm", description="verified | estimated | user_provided")
    gross_roof_area: float = Field(..., description="Square meters")
    usable_roof_area: float = Field(..., description="Square meters after setback & buffer")
    category: str = Field(default="residential", description="residential | educational | commercial | industrial")
    is_target_site: bool = False
    is_protected_solar_asset: bool = False


class DigitalTwinSite(BaseModel):
    site_id: str
    name: str
    address: str
    coordinates: Coordinates
    bounds_size_m: float = 300.0  # 300m x 300m bounding neighborhood
    buildings: List[BuildingFootprint]
    target_building_id: str
    provenance: ProvenanceMetadata


# --- Scientific Models ---

class SolarPositionRequest(BaseModel):
    latitude: float
    longitude: float
    datetime_iso: Optional[str] = None  # None => Live Now


class SolarPositionResponse(BaseModel):
    timestamp: str
    latitude: float
    longitude: float
    azimuth_deg: float = Field(..., description="Degrees clockwise from North (0=N, 90=E, 180=S, 270=W)")
    elevation_deg: float = Field(..., description="Degrees above horizon")
    zenith_deg: float = Field(..., description="Degrees from vertical zenith")
    sunrise_time: str
    sunset_time: str
    is_daylight: bool
    sun_vector: List[float] = Field(..., description="Normalized 3D vector [x, y, z] for Three.js lighting")
    declination_deg: float
    equation_of_time_min: float
    hour_angle_deg: float
    daylight_hours: float
    provenance: ProvenanceMetadata


class SolarResourceRequest(BaseModel):
    latitude: float
    longitude: float


class MonthlySolarData(BaseModel):
    month: str
    month_index: int
    ghi_kwh_m2_day: float
    dni_kwh_m2_day: float
    dhi_kwh_m2_day: float
    avg_temp_c: float
    monthly_irradiation_kwh_m2: float


class SolarResourceResponse(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    annual_ghi_kwh_m2: float
    annual_dni_kwh_m2: float
    annual_dhi_kwh_m2: float
    monthly_data: List[MonthlySolarData]
    provenance: ProvenanceMetadata


# --- Rooftop PV Engine ---

class PanelSpec(BaseModel):
    name: str = "540W Monocrystalline PERC"
    wattage_wp: float = 540.0
    length_m: float = 2.278
    width_m: float = 1.134
    efficiency_pct: float = 21.3
    temp_coefficient_pct_c: float = -0.35
    degradation_annual_pct: float = 0.55


class PlacedPanel3D(BaseModel):
    id: str
    center_x: float
    center_y: float  # height on roof
    center_z: float
    rotation_y_deg: float
    tilt_deg: float
    width: float
    length: float
    wattage: float
    is_shaded: bool = False
    annual_yield_kwh: float


class RooftopPVRequest(BaseModel):
    building: BuildingFootprint
    solar_resource: SolarResourceResponse
    panel_spec: Optional[PanelSpec] = None
    target_tilt_deg: float = 15.0
    azimuth_deg: float = 180.0  # True South
    setback_m: float = 1.0
    performance_ratio: float = 0.78
    shading_loss_factor: float = 0.05


class RooftopPVResponse(BaseModel):
    building_id: str
    gross_area_m2: float
    usable_area_m2: float
    setback_buffer_m2: float
    installed_capacity_kwp: float
    total_panels_count: int
    panel_layout_grid: List[PlacedPanel3D]
    annual_generation_kwh: float
    monthly_generation_kwh: Dict[str, float]
    specific_yield_kwh_per_kwp: float
    capacity_utilization_factor_pct: float
    annual_shading_loss_kwh: float
    effective_tilt_deg: float
    effective_azimuth_deg: float
    solar_suitability_score: float = Field(..., ge=0, le=100)
    best_solar_zone_description: str
    provenance: ProvenanceMetadata


# --- BIPV Engine ---

class FacadeOrientation(str, Enum):
    NORTH = "North (0°)"
    EAST = "East (90°)"
    SOUTH = "South (180°)"
    WEST = "West (270°)"


class FacadePotential(BaseModel):
    orientation: FacadeOrientation
    azimuth_deg: float
    surface_area_m2: float
    usable_bipv_area_m2: float
    annual_incident_radiation_kwh_m2: float
    annual_bipv_generation_kwh: float
    capacity_kwp: float
    suitability_score: float = Field(..., ge=0, le=100)
    recommendation: str


class BIPVResponse(BaseModel):
    building_id: str
    facades: List[FacadePotential]
    total_bipv_capacity_kwp: float
    total_bipv_annual_generation_kwh: float
    best_facade: FacadeOrientation
    provenance: ProvenanceMetadata


# --- Future Construction Simulator & Solar Conflict ---

class ProposedFutureBuilding(BaseModel):
    id: str = "future_bldg_01"
    name: str = "Proposed High-Rise Construction"
    center_x: float = 35.0  # Local metric offset in meters
    center_z: float = -20.0
    width_m: float = 24.0   # X dimension
    length_m: float = 28.0  # Z dimension
    height_m: float = 38.0  # Proposed height
    floors: int = 12
    setback_distance_m: float = 12.0
    rotation_deg: float = 0.0


class ConflictSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MODERATE = "MODERATE"
    LOW = "LOW"


class AffectedAssetConflict(BaseModel):
    building_id: str
    building_name: str
    severity: ConflictSeverity
    baseline_generation_kwh: float
    post_construction_generation_kwh: float
    annual_energy_loss_kwh: float
    percentage_loss_pct: float
    annual_financial_loss_inr: float
    affected_roof_area_m2: float
    bipv_loss_kwh: float
    reason: str
    critical_shading_hours: List[str]


class FutureImpactResponse(BaseModel):
    future_building: ProposedFutureBuilding
    baseline_total_generation_kwh: float
    post_construction_total_generation_kwh: float
    total_annual_energy_loss_kwh: float
    overall_percentage_loss_pct: float
    total_annual_revenue_loss_inr: float
    affected_buildings_count: int
    affected_conflicts: List[AffectedAssetConflict]
    summary_verdict: str
    provenance: ProvenanceMetadata


# --- Solar Access Planning Envelope ---

class SolarAccessEnvelopeResponse(BaseModel):
    protected_building_id: str
    target_solar_access_retention_pct: float = 85.0
    maximum_recommended_height_m: float
    current_proposed_height_m: float
    is_height_compliant: bool
    recommended_minimum_setback_m: float
    current_proposed_setback_m: float
    is_setback_compliant: bool
    acceptable_height_range_m: List[float] = Field(..., description="[min_h, max_h]")
    acceptable_setback_range_m: List[float] = Field(..., description="[min_setback, max_setback]")
    planning_guideline_notes: str
    provenance: ProvenanceMetadata


# --- Scenario Optimizer ---

class OptimizationCandidate(BaseModel):
    scenario_id: str
    scenario_label: str
    proposed_height_m: float
    proposed_setback_m: float
    floor_area_sqm: float
    developer_fsi_yield_pct: float
    neighbor_solar_retention_pct: float
    total_neighbor_annual_loss_kwh: float
    annual_neighbor_loss_inr: float
    is_pareto_optimal: bool
    trade_off_explanation: str


class ScenarioOptimizerResponse(BaseModel):
    recommended_scenario: OptimizationCandidate
    alternative_scenarios: List[OptimizationCandidate]
    trade_off_analysis: str
    provenance: ProvenanceMetadata


# --- Financial & Environmental Engines ---

class FinancialAnalysisRequest(BaseModel):
    system_capacity_kwp: float
    annual_generation_kwh: float
    tariff_inr_per_kwh: float = 8.20  # MSEDCL blended slab
    capex_per_kwp_inr: float = 48000.0  # Includes Tier-1 module, inverter, structure, net-metering
    om_annual_cost_pct: float = 1.5
    annual_tariff_escalation_pct: float = 3.5
    annual_module_degradation_pct: float = 0.6
    discount_rate_pct: float = 8.5
    project_lifetime_years: int = 25


class FinancialAnalysisResponse(BaseModel):
    total_capex_inr: float
    year_1_gross_savings_inr: float
    simple_payback_years: float
    lifetime_25yr_net_savings_inr: float
    levelized_cost_of_electricity_inr_kwh: float
    net_present_value_inr: float
    internal_rate_of_return_pct: float
    cash_flow_timeline: List[Dict[str, float]]
    state_subsidy_applicable_inr: float
    provenance: ProvenanceMetadata


class EnvironmentalAnalysisResponse(BaseModel):
    annual_co2_reduction_metric_tons: float
    lifetime_25yr_co2_reduction_metric_tons: float
    equivalent_trees_planted_count: int
    coal_burned_avoided_metric_tons: float
    grid_emission_factor_kg_co2_per_kwh: float = 0.716  # CEA India v19
    provenance: ProvenanceMetadata


# --- Solar Passport & Full Report ---

class SolarPassport(BaseModel):
    passport_id: str
    issue_timestamp: str
    property_name: str
    locality: str
    city: str
    state: str
    coordinates: Coordinates
    data_source: str
    geometry_quality_grade: str  # LOD-1 Verified | Estimated
    overall_solar_suitability_grade: str  # A+ / A / B / C
    solar_score: float = Field(..., ge=0, le=100)
    rooftop_capacity_kwp: float
    rooftop_annual_generation_kwh: float
    bipv_potential_kwp: float
    bipv_annual_generation_kwh: float
    combined_annual_generation_kwh: float
    specific_yield_kwh_kwp: float
    estimated_annual_savings_inr: float
    lifetime_savings_inr: float
    simple_payback_years: float
    annual_co2_offset_tonnes: float
    future_risk_severity: str
    model_version: str = "Suryavedh-v2.4-Core"
    confidence_level: float = 0.94
    provenance: ProvenanceMetadata
