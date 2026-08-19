/**
 * TypeScript Data Models for Suryavedh Platform.
 */

export type DataSourceType = 
  | 'REAL / RETRIEVED'
  | 'MODELED'
  | 'ESTIMATED'
  | 'USER-PROVIDED'
  | 'TEST / FALLBACK';

export interface ProvenanceMetadata {
  source: string;
  retrieval_timestamp: string;
  confidence: number;
  data_type: DataSourceType;
  methodology: string;
  notes?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationSearchResult {
  id: string;
  display_name: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  coordinates: Coordinates;
  bbox: number[];
  category: string;
  provenance: ProvenanceMetadata;
}

export interface BuildingFootprint {
  id: string;
  name: string;
  footprint_coordinates: [number, number][]; // local metric [x, z]
  geo_coordinates?: [number, number][];
  height: number;
  floors: number;
  height_source: string;
  gross_roof_area: number;
  usable_roof_area: number;
  category: string;
  is_target_site: boolean;
  is_protected_solar_asset: boolean;
}

export interface DigitalTwinSite {
  site_id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  bounds_size_m: number;
  buildings: BuildingFootprint[];
  target_building_id: string;
  provenance: ProvenanceMetadata;
}

export interface SolarPositionResponse {
  timestamp: string;
  latitude: number;
  longitude: number;
  azimuth_deg: number;
  elevation_deg: number;
  zenith_deg: number;
  sunrise_time: string;
  sunset_time: string;
  is_daylight: boolean;
  sun_vector: [number, number, number]; // [x, y, z]
  declination_deg: number;
  equation_of_time_min: number;
  hour_angle_deg: number;
  daylight_hours: number;
  provenance: ProvenanceMetadata;
}

export interface MonthlySolarData {
  month: string;
  month_index: number;
  ghi_kwh_m2_day: number;
  dni_kwh_m2_day: number;
  dhi_kwh_m2_day: number;
  avg_temp_c: number;
  monthly_irradiation_kwh_m2: number;
}

export interface SolarResourceResponse {
  location_name: string;
  latitude: number;
  longitude: number;
  annual_ghi_kwh_m2: number;
  annual_dni_kwh_m2: number;
  annual_dhi_kwh_m2: number;
  monthly_data: MonthlySolarData[];
  provenance: ProvenanceMetadata;
}

export interface PlacedPanel3D {
  id: string;
  center_x: number;
  center_y: number;
  center_z: number;
  rotation_y_deg: number;
  tilt_deg: number;
  width: number;
  length: number;
  wattage: number;
  is_shaded: boolean;
  annual_yield_kwh: number;
}

export interface RooftopPVResponse {
  building_id: string;
  gross_area_m2: number;
  usable_area_m2: number;
  setback_buffer_m2: number;
  installed_capacity_kwp: number;
  total_panels_count: number;
  panel_layout_grid: PlacedPanel3D[];
  annual_generation_kwh: number;
  monthly_generation_kwh: Record<string, number>;
  specific_yield_kwh_per_kwp: number;
  capacity_utilization_factor_pct: number;
  annual_shading_loss_kwh: number;
  effective_tilt_deg: number;
  effective_azimuth_deg: number;
  solar_suitability_score: number;
  best_solar_zone_description: string;
  provenance: ProvenanceMetadata;
}

export interface FacadePotential {
  orientation: string;
  azimuth_deg: number;
  surface_area_m2: number;
  usable_bipv_area_m2: number;
  annual_incident_radiation_kwh_m2: number;
  annual_bipv_generation_kwh: number;
  capacity_kwp: number;
  suitability_score: number;
  recommendation: string;
}

export interface BIPVResponse {
  building_id: string;
  facades: FacadePotential[];
  total_bipv_capacity_kwp: number;
  total_bipv_annual_generation_kwh: number;
  best_facade: string;
  provenance: ProvenanceMetadata;
}

export interface ProposedFutureBuilding {
  id: string;
  name: string;
  center_x: number;
  center_z: number;
  width_m: number;
  length_m: number;
  height_m: number;
  floors: number;
  setback_distance_m: number;
  rotation_deg: number;
}

export type ConflictSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface AffectedAssetConflict {
  building_id: string;
  building_name: string;
  severity: ConflictSeverity;
  baseline_generation_kwh: number;
  post_construction_generation_kwh: number;
  annual_energy_loss_kwh: number;
  percentage_loss_pct: number;
  annual_financial_loss_inr: number;
  affected_roof_area_m2: number;
  bipv_loss_kwh: number;
  reason: string;
  critical_shading_hours: string[];
}

export interface FutureImpactResponse {
  future_building: ProposedFutureBuilding;
  baseline_total_generation_kwh: number;
  post_construction_total_generation_kwh: number;
  total_annual_energy_loss_kwh: number;
  overall_percentage_loss_pct: number;
  total_annual_revenue_loss_inr: number;
  affected_buildings_count: number;
  affected_conflicts: AffectedAssetConflict[];
  summary_verdict: string;
  provenance: ProvenanceMetadata;
}

export interface SolarAccessEnvelopeResponse {
  protected_building_id: string;
  target_solar_access_retention_pct: number;
  maximum_recommended_height_m: number;
  current_proposed_height_m: number;
  is_height_compliant: boolean;
  recommended_minimum_setback_m: number;
  current_proposed_setback_m: number;
  is_setback_compliant: boolean;
  acceptable_height_range_m: [number, number];
  acceptable_setback_range_m: [number, number];
  planning_guideline_notes: string;
  provenance: ProvenanceMetadata;
}

export interface OptimizationCandidate {
  scenario_id: string;
  scenario_label: string;
  proposed_height_m: number;
  proposed_setback_m: number;
  floor_area_sqm: number;
  developer_fsi_yield_pct: number;
  neighbor_solar_retention_pct: number;
  total_neighbor_annual_loss_kwh: number;
  annual_neighbor_loss_inr: number;
  is_pareto_optimal: boolean;
  trade_off_explanation: string;
}

export interface ScenarioOptimizerResponse {
  recommended_scenario: OptimizationCandidate;
  alternative_scenarios: OptimizationCandidate[];
  trade_off_analysis: string;
  provenance: ProvenanceMetadata;
}

export interface FinancialAnalysisResponse {
  total_capex_inr: number;
  year_1_gross_savings_inr: number;
  simple_payback_years: number;
  lifetime_25yr_net_savings_inr: number;
  levelized_cost_of_electricity_inr_kwh: number;
  net_present_value_inr: number;
  internal_rate_of_return_pct: number;
  cash_flow_timeline: Array<{
    year: number;
    generation_kwh: number;
    gross_savings_inr: number;
    om_cost_inr: number;
    net_cash_flow_inr: number;
    cumulative_savings_inr: number;
  }>;
  state_subsidy_applicable_inr: number;
  provenance: ProvenanceMetadata;
}

export interface EnvironmentalAnalysisResponse {
  annual_co2_reduction_metric_tons: number;
  lifetime_25yr_co2_reduction_metric_tons: number;
  equivalent_trees_planted_count: number;
  coal_burned_avoided_metric_tons: number;
  grid_emission_factor_kg_co2_per_kwh: number;
  provenance: ProvenanceMetadata;
}

export interface SolarPassport {
  passport_id: string;
  issue_timestamp: string;
  property_name: string;
  locality: string;
  city: string;
  state: string;
  coordinates: Coordinates;
  data_source: string;
  geometry_quality_grade: string;
  overall_solar_suitability_grade: string;
  solar_score: number;
  rooftop_capacity_kwp: number;
  rooftop_annual_generation_kwh: number;
  bipv_potential_kwp: number;
  bipv_annual_generation_kwh: number;
  combined_annual_generation_kwh: number;
  specific_yield_kwh_kwp: number;
  estimated_annual_savings_inr: number;
  lifetime_savings_inr: number;
  simple_payback_years: number;
  annual_co2_offset_tonnes: number;
  future_risk_severity: string;
  model_version: string;
  confidence_level: number;
  provenance: ProvenanceMetadata;
}

export interface SolarSiteReport {
  passport: SolarPassport;
  sections: Array<{
    num: number;
    title: string;
    content: any;
  }>;
  generated_at: string;
}
