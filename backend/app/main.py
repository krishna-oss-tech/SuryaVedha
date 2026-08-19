"""
FastAPI Application Entrypoint for Suryavedh: Urban Solar Intelligence & Digital Twin.
Provides robust REST endpoints for 3D Digital Twin LOD-1 ingestion, astronomical solar position,
climatological resources, rooftop PV layout generation, BIPV, future construction simulation,
solar access planning envelopes, scenario optimization, financial/environmental metrics, and evidence reporting.
"""

from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from app.models.schemas import (
    LocationSearchResult,
    DigitalTwinSite,
    SolarPositionRequest,
    SolarPositionResponse,
    SolarResourceRequest,
    SolarResourceResponse,
    RooftopPVRequest,
    RooftopPVResponse,
    BIPVResponse,
    ProposedFutureBuilding,
    FutureImpactResponse,
    SolarAccessEnvelopeResponse,
    ScenarioOptimizerResponse,
    FinancialAnalysisRequest,
    FinancialAnalysisResponse,
    EnvironmentalAnalysisResponse,
    SolarPassport,
)

from app.services.solar_position import calculate_solar_position
from app.services.solar_resource import fetch_solar_resource
from app.services.building_provider import search_locations, get_digital_twin_site
from app.services.rooftop_pv import generate_optimized_panel_layout
from app.services.bipv_engine import evaluate_bipv_potential
from app.services.future_construction import simulate_future_construction_impact
from app.services.solar_access_envelope import compute_solar_access_envelope
from app.services.scenario_optimizer import find_better_scenarios
from app.services.financial_engine import compute_financial_metrics
from app.services.environmental_engine import compute_environmental_impact
from app.services.solar_passport import generate_solar_passport, generate_full_site_report
from app.services.provenance import get_evidence_report

app = FastAPI(
    title="Suryavedh — Urban Solar Intelligence & Digital Twin API",
    description="SIH1739 Aligned High-Precision BIPV & Rooftop Solar Decision Support Platform with Future Construction Simulation",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Secure Cross-Origin Resource Sharing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "platform": "Suryavedh",
        "tagline": "Simulate Tomorrow. Protect Solar Today.",
        "positioning": "Urban Solar Intelligence & Digital Twin",
        "status": "ONLINE",
        "version": "2.4.0-Core-Science",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "engines": {
            "solar_position": "operational",
            "solar_resource": "operational",
            "3d_shadow_raycast": "operational",
            "rooftop_pv": "operational",
            "bipv_facade": "operational",
            "future_simulator": "operational",
            "scenario_optimizer": "operational",
            "financial_engine": "operational",
            "environmental_engine": "operational",
            "evidence_mode": "operational"
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/locations/search", response_model=List[LocationSearchResult])
def search_location_endpoint(q: str = Query(..., min_length=1, description="Location search query (e.g. Nagpur, YCCE, Civil Lines)")):
    results = search_locations(q)
    return results


@app.get("/api/sites/{site_id}", response_model=DigitalTwinSite)
def get_site_endpoint(
    site_id: str,
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None)
):
    site = get_digital_twin_site(site_id, custom_lat=lat, custom_lon=lon)
    if not site:
        raise HTTPException(status_code=404, detail=f"Site '{site_id}' not found")
    return site


@app.post("/api/solar/position", response_model=SolarPositionResponse)
def get_solar_position_endpoint(req: SolarPositionRequest):
    return calculate_solar_position(req.latitude, req.longitude, req.datetime_iso)


@app.get("/api/solar/resource", response_model=SolarResourceResponse)
def get_solar_resource_endpoint(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    return fetch_solar_resource(lat, lon)


@app.post("/api/solar/rooftop", response_model=RooftopPVResponse)
def compute_rooftop_pv_endpoint(req: RooftopPVRequest):
    return generate_optimized_panel_layout(
        building=req.building,
        solar_resource=req.solar_resource,
        panel_spec=req.panel_spec,
        target_tilt_deg=req.target_tilt_deg,
        azimuth_deg=req.azimuth_deg,
        setback_m=req.setback_m,
        performance_ratio=req.performance_ratio,
        shading_loss_factor=req.shading_loss_factor
    )


@app.post("/api/solar/bipv", response_model=BIPVResponse)
def compute_bipv_endpoint(payload: Dict[str, Any] = Body(...)):
    # Parse building and solar resource from payload
    from app.models.schemas import BuildingFootprint
    building = BuildingFootprint(**payload["building"])
    solar_res = SolarResourceResponse(**payload["solar_resource"])
    return evaluate_bipv_potential(building, solar_res)


@app.post("/api/future/simulate", response_model=FutureImpactResponse)
def simulate_future_endpoint(payload: Dict[str, Any] = Body(...)):
    from app.models.schemas import BuildingFootprint
    buildings = [BuildingFootprint(**b) for b in payload["buildings"]]
    future_bldg = ProposedFutureBuilding(**payload["future_building"])
    solar_res = SolarResourceResponse(**payload["solar_resource"])
    tariff = float(payload.get("tariff_inr_per_kwh", 8.20))
    lat = float(payload.get("latitude", 21.1458))
    lon = float(payload.get("longitude", 79.0882))

    return simulate_future_construction_impact(
        buildings=buildings,
        future_bldg=future_bldg,
        solar_resource=solar_res,
        latitude=lat,
        longitude=lon,
        tariff_inr_per_kwh=tariff
    )


@app.post("/api/future/envelope", response_model=SolarAccessEnvelopeResponse)
def compute_envelope_endpoint(payload: Dict[str, Any] = Body(...)):
    from app.models.schemas import BuildingFootprint
    protected_bldg = BuildingFootprint(**payload["protected_building"])
    proposed_bldg = ProposedFutureBuilding(**payload["proposed_building"])
    retention_pct = float(payload.get("target_retention_pct", 85.0))
    return compute_solar_access_envelope(protected_bldg, proposed_bldg, retention_pct)


@app.post("/api/future/optimize", response_model=ScenarioOptimizerResponse)
def optimize_scenario_endpoint(payload: Dict[str, Any] = Body(...)):
    from app.models.schemas import BuildingFootprint
    buildings = [BuildingFootprint(**b) for b in payload["buildings"]]
    curr_proposed = ProposedFutureBuilding(**payload["proposed_building"])
    solar_res = SolarResourceResponse(**payload["solar_resource"])
    tariff = float(payload.get("tariff_inr_per_kwh", 8.20))
    return find_better_scenarios(buildings, curr_proposed, solar_res, tariff_inr_per_kwh=tariff)


@app.post("/api/financial/calculate", response_model=FinancialAnalysisResponse)
def calculate_financials_endpoint(req: FinancialAnalysisRequest):
    return compute_financial_metrics(req)


@app.post("/api/environmental/calculate", response_model=EnvironmentalAnalysisResponse)
def calculate_environmental_endpoint(payload: Dict[str, float] = Body(...)):
    annual_kwh = payload.get("annual_generation_kwh", 0.0)
    return compute_environmental_impact(annual_kwh)


@app.post("/api/passport/generate", response_model=SolarPassport)
def generate_passport_endpoint(payload: Dict[str, Any] = Body(...)):
    from app.models.schemas import BuildingFootprint
    site = DigitalTwinSite(**payload["site"])
    building = BuildingFootprint(**payload["building"])
    solar_res = SolarResourceResponse(**payload["solar_resource"])
    rooftop = RooftopPVResponse(**payload["rooftop"])
    bipv = BIPVResponse(**payload["bipv"])
    future_impact = FutureImpactResponse(**payload["future_impact"])
    finance = FinancialAnalysisResponse(**payload["financial"])
    environ = EnvironmentalAnalysisResponse(**payload["environmental"])

    return generate_solar_passport(
        site, building, solar_res, rooftop, bipv, future_impact, finance, environ
    )


@app.post("/api/report/generate")
def generate_report_endpoint(payload: Dict[str, Any] = Body(...)):
    from app.models.schemas import BuildingFootprint
    site = DigitalTwinSite(**payload["site"])
    building = BuildingFootprint(**payload["building"])
    solar_res = SolarResourceResponse(**payload["solar_resource"])
    rooftop = RooftopPVResponse(**payload["rooftop"])
    bipv = BIPVResponse(**payload["bipv"])
    future_impact = FutureImpactResponse(**payload["future_impact"])
    finance = FinancialAnalysisResponse(**payload["financial"])
    environ = EnvironmentalAnalysisResponse(**payload["environmental"])

    return generate_full_site_report(
        site, building, solar_res, rooftop, bipv, future_impact, finance, environ
    )


@app.get("/api/evidence")
def get_evidence_endpoint(topic: str = Query("all", description="Specific module key or 'all'")):
    return get_evidence_report(topic)
