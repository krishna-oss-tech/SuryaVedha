/**
 * Suryavedh Main Application Container.
 * Orchestrates real-world location ingestion, scientific solar ephemeris,
 * 3D LOD-1 digital twin, dynamic shadows, automatic panel placement,
 * BIPV, future construction simulator, and decision-support exports.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import type {
  DigitalTwinSite,
  BuildingFootprint,
  SolarPositionResponse,
  SolarResourceResponse,
  RooftopPVResponse,
  BIPVResponse,
  ProposedFutureBuilding,
  FutureImpactResponse,
  SolarAccessEnvelopeResponse,
  ScenarioOptimizerResponse,
  FinancialAnalysisResponse,
  EnvironmentalAnalysisResponse,
  SolarPassport,
  SolarSiteReport,
  LocationSearchResult,
} from './types';
import { api } from './services/api';
import { HeaderNav } from './components/HeaderNav';
import { DigitalTwin3D } from './components/DigitalTwin3D';
import { SiteControlsSidebar } from './components/SiteControlsSidebar';
import { DecisionPanel } from './components/DecisionPanel';
import { SunTimeline } from './components/SunTimeline';
import { LandingHero } from './components/LandingHero';
import { EvidenceModal } from './components/EvidenceModal';
import { SolarPassportModal } from './components/SolarPassportModal';
import { CampusModeModal } from './components/CampusModeModal';
import { AnyPropertyDrawerModal } from './components/AnyPropertyDrawerModal';
import { Sparkles, ShieldCheck, Sun, DollarSign, Leaf } from 'lucide-react';

export function App() {
  // Application View Mode: 'landing' | 'workspace'
  const [viewState, setViewState] = useState<'landing' | 'workspace'>('landing');
  const [activeWorkspaceMode, setActiveWorkspaceMode] = useState<
    'standard' | 'homeowner' | 'campus' | 'advanced'
  >('standard');

  // Digital Twin Core Data
  const [site, setSite] = useState<DigitalTwinSite | null>(null);
  const [targetBuildingId, setTargetBuildingId] = useState<string>('');
  const [solarPosition, setSolarPosition] = useState<SolarPositionResponse | null>(null);
  const [solarResource, setSolarResource] = useState<SolarResourceResponse | null>(null);
  const [rooftopData, setRooftopData] = useState<RooftopPVResponse | null>(null);
  const [bipvData, setBIPVData] = useState<BIPVResponse | null>(null);

  // Future Construction Simulator State
  const [isFutureEnabled, setIsFutureEnabled] = useState<boolean>(false);
  const [futureBuilding, setFutureBuilding] = useState<ProposedFutureBuilding>({
    id: 'future_tower_01',
    name: 'Proposed High-Rise Construction',
    center_x: 35.0,
    center_z: -18.0,
    width_m: 24.0,
    length_m: 28.0,
    height_m: 38.0,
    floors: 12,
    setback_distance_m: 12.0,
    rotation_deg: 0.0
  });
  const [futureImpact, setFutureImpact] = useState<FutureImpactResponse | null>(null);
  const [envelopeData, setEnvelopeData] = useState<SolarAccessEnvelopeResponse | null>(null);
  const [scenarioOptimizerData, setScenarioOptimizerData] = useState<ScenarioOptimizerResponse | null>(null);

  // Financial & Environmental Metrics
  const [financialData, setFinancialData] = useState<FinancialAnalysisResponse | null>(null);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalAnalysisResponse | null>(null);

  // Solar Passport & Reports
  const [passport, setPassport] = useState<SolarPassport | null>(null);
  const [report, setReport] = useState<SolarSiteReport | null>(null);

  // Solar Timeline State
  const [currentHour, setCurrentHour] = useState<number>(12.2); // 12:12 Solar Noon in Nagpur
  const [selectedDate, setSelectedDate] = useState<string>('2026-03-21'); // Equinox baseline
  const [isLiveNow, setIsLiveNow] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [heatmapMode, setHeatmapMode] = useState<boolean>(true);

  // Modal Dialogs
  const [isEvidenceOpen, setIsEvidenceOpen] = useState<boolean>(false);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [passportModalMode, setPassportModalMode] = useState<'passport' | 'report'>('passport');
  const [isCampusModalOpen, setIsCampusModalOpen] = useState<boolean>(false);
  const [isAnyPropertyModalOpen, setIsAnyPropertyModalOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Load Initial Site (Default: YCCE Campus Nagpur)
  const loadSite = useCallback(async (siteId: string = 'site_ycce_nagpur') => {
    try {
      const siteData = await api.getDigitalTwinSite(siteId);
      setSite(siteData);
      setTargetBuildingId(siteData.target_building_id || siteData.buildings[0]?.id || '');

      // Load Climatological Solar Resource
      const res = await api.getSolarResource(
        siteData.coordinates.latitude,
        siteData.coordinates.longitude
      );
      setSolarResource(res);
    } catch (err) {
      console.error('Error loading site:', err);
    }
  }, []);

  useEffect(() => {
    loadSite();
  }, [loadSite]);

  // Update Solar Position when time/date changes
  const updateSolarPosition = useCallback(async () => {
    if (!site) return;
    try {
      let isoStr: string | undefined = undefined;
      if (!isLiveNow) {
        const hours = Math.floor(currentHour);
        const minutes = Math.floor((currentHour - hours) * 60);
        // UTC time offset for +5:30 IST
        const utcMinutesTotal = hours * 60 + minutes - 330;
        const normalizedUtcHours = Math.floor((utcMinutesTotal + 1440) % 1440 / 60);
        const normalizedUtcMin = (utcMinutesTotal + 1440) % 60;
        isoStr = `${selectedDate}T${normalizedUtcHours.toString().padStart(2, '0')}:${normalizedUtcMin.toString().padStart(2, '0')}:00Z`;
      }

      const pos = await api.getSolarPosition(
        site.coordinates.latitude,
        site.coordinates.longitude,
        isoStr
      );
      setSolarPosition(pos);
    } catch (err) {
      console.error('Error updating solar position:', err);
    }
  }, [site, currentHour, selectedDate, isLiveNow]);

  useEffect(() => {
    updateSolarPosition();
  }, [updateSolarPosition]);

  // Active Target Building
  const activeBuilding = React.useMemo(() => {
    if (!site || !site.buildings) return null;
    return site.buildings.find((b) => b.id === targetBuildingId) || site.buildings[0];
  }, [site, targetBuildingId]);

  // Compute Rooftop PV, BIPV, Financials, and Carbon whenever active building changes
  const recomputeBuildingSolar = useCallback(async () => {
    if (!activeBuilding || !solarResource || !site) return;

    try {
      // 1. Rooftop PV Layout
      const pv = await api.computeRooftopPV(activeBuilding, solarResource, 15.0, 1.0);
      setRooftopData(pv);

      // 2. BIPV Facade Potential
      const bipv = await api.computeBIPV(activeBuilding, solarResource);
      setBIPVData(bipv);

      // 3. Financial Analysis
      const fin = await api.calculateFinancials(
        pv.installed_capacity_kwp,
        pv.annual_generation_kwh,
        8.20
      );
      setFinancialData(fin);

      // 4. Environmental Carbon Avoidance
      const env = await api.calculateEnvironmental(pv.annual_generation_kwh);
      setEnvironmentalData(env);

      // 5. Future Construction Simulation
      if (isFutureEnabled && futureBuilding) {
        const impact = await api.simulateFutureImpact(
          site.buildings,
          futureBuilding,
          solarResource,
          8.20
        );
        setFutureImpact(impact);

        const envlp = await api.computeEnvelope(activeBuilding, futureBuilding, 85.0);
        setEnvelopeData(envlp);
      }
    } catch (err) {
      console.error('Error computing solar analytics:', err);
    }
  }, [activeBuilding, solarResource, site, isFutureEnabled, futureBuilding]);

  useEffect(() => {
    recomputeBuildingSolar();
  }, [recomputeBuildingSolar]);

  // Re-simulate Future Impact when sliders move
  useEffect(() => {
    if (isFutureEnabled && site && futureBuilding && solarResource && activeBuilding) {
      api.simulateFutureImpact(site.buildings, futureBuilding, solarResource, 8.20)
        .then(setFutureImpact)
        .catch(console.error);

      api.computeEnvelope(activeBuilding, futureBuilding, 85.0)
        .then(setEnvelopeData)
        .catch(console.error);
    }
  }, [isFutureEnabled, futureBuilding, site, solarResource, activeBuilding]);

  // Auto-play Animation Loop for Sun Scrubbing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentHour((prev) => {
        const next = prev + 0.15;
        return next > 18.2 ? 6.5 : next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle Scenario Optimizer
  const handleRunScenarioOptimizer = async () => {
    if (!site || !futureBuilding || !solarResource) return;
    setIsSimulating(true);
    try {
      const opt = await api.optimizeScenario(site.buildings, futureBuilding, solarResource, 8.20);
      setScenarioOptimizerData(opt);
      // Trigger celebrate confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Generate Official Solar Passport & Certified Site Report
  const handleOpenPassport = async () => {
    if (!site || !activeBuilding || !solarResource || !rooftopData || !bipvData || !financialData || !environmentalData) return;

    try {
      const fallbackImpact = futureImpact || {
        future_building: futureBuilding,
        baseline_total_generation_kwh: rooftopData.annual_generation_kwh,
        post_construction_total_generation_kwh: rooftopData.annual_generation_kwh,
        total_annual_energy_loss_kwh: 0,
        overall_percentage_loss_pct: 0,
        total_annual_revenue_loss_inr: 0,
        affected_buildings_count: 0,
        affected_conflicts: [],
        summary_verdict: 'Optimal Solar Clearance Maintained',
        provenance: rooftopData.provenance
      };

      const payload = {
        site,
        building: activeBuilding,
        solar_resource: solarResource,
        rooftop: rooftopData,
        bipv: bipvData,
        future_impact: fallbackImpact,
        financial: financialData,
        environmental: environmentalData
      };

      const pass = await api.generatePassport(payload);
      setPassport(pass);
      const rep = await api.generateSiteReport(payload);
      setReport(rep);

      setPassportModalMode('passport');
      setIsPassportOpen(true);
    } catch (err) {
      console.error('Error generating passport:', err);
    }
  };

  const handleOpenReport = async () => {
    await handleOpenPassport();
    setPassportModalMode('report');
  };

  // Apply Optimized Scenario to 3D Scene
  const handleApplyScenario = (scenario: any) => {
    setFutureBuilding((prev) => ({
      ...prev,
      height_m: scenario.proposed_height_m,
      floors: Math.max(3, Math.floor(scenario.proposed_height_m / 3.2)),
      setback_distance_m: scenario.proposed_setback_m,
      center_x: 20 + scenario.proposed_setback_m * 0.8
    }));
  };

  // Custom Building Addition (Any-Property Mode)
  const handleAddCustomBuilding = (bldg: BuildingFootprint) => {
    if (!site) return;
    const updatedSite: DigitalTwinSite = {
      ...site,
      name: bldg.name,
      buildings: [bldg, ...site.buildings.filter((b) => b.id !== bldg.id)],
      target_building_id: bldg.id
    };
    setSite(updatedSite);
    setTargetBuildingId(bldg.id);
  };

  // Public Landing View
  if (viewState === 'landing') {
    return (
      <LandingHero
        onEnterWorkspace={(locId) => {
          if (locId) loadSite(locId);
          setViewState('workspace');
        }}
        onSearch={api.searchLocations}
      />
    );
  }

  return (
    <div className="w-screen h-screen bg-[#07090E] text-slate-100 overflow-hidden flex flex-col relative select-none">
      {/* Top Header Navigation */}
      <HeaderNav
        site={site}
        solarPosition={solarPosition}
        activeMode={activeWorkspaceMode}
        onSelectMode={(m) => {
          setActiveWorkspaceMode(m);
          if (m === 'campus') setIsCampusModalOpen(true);
        }}
        onOpenEvidence={() => setIsEvidenceOpen(true)}
        onOpenPassport={handleOpenPassport}
        onOpenReport={handleOpenReport}
        onOpenLanding={() => setViewState('landing')}
        heatmapMode={heatmapMode}
        onToggleHeatmap={() => setHeatmapMode((prev) => !prev)}
      />

      {/* Main 3D Digital Twin Spatial Canvas */}
      <div className="flex-1 relative w-full h-full">
        {site && (
          <DigitalTwin3D
            buildings={site.buildings}
            targetBuildingId={targetBuildingId}
            solarPosition={solarPosition}
            rooftopData={rooftopData}
            bipvData={bipvData}
            futureBuilding={futureBuilding}
            isFutureEnabled={isFutureEnabled}
            futureImpact={futureImpact}
            heatmapMode={heatmapMode}
            onSelectBuilding={setTargetBuildingId}
          />
        )}

        {/* Left Sidebar: Site & Building Controls */}
        <SiteControlsSidebar
          site={site}
          targetBuildingId={targetBuildingId}
          onSelectBuilding={setTargetBuildingId}
          onSearchLocation={api.searchLocations}
          onSelectLocation={loadSite}
          onOpenCustomFootprintDrawer={() => setIsAnyPropertyModalOpen(true)}
          onGenerateLayout={recomputeBuildingSolar}
        />

        {/* Right Panel: Decision Support Panel */}
        <DecisionPanel
          building={activeBuilding}
          rooftopData={rooftopData}
          bipvData={bipvData}
          futureBuilding={futureBuilding}
          isFutureEnabled={isFutureEnabled}
          onToggleFuture={setIsFutureEnabled}
          onUpdateFutureBuilding={setFutureBuilding}
          futureImpact={futureImpact}
          envelopeData={envelopeData}
          scenarioOptimizerData={scenarioOptimizerData}
          financialData={financialData}
          environmentalData={environmentalData}
          onGenerateOptimizedLayout={() => {
            recomputeBuildingSolar();
            confetti({ particleCount: 50, spread: 45, origin: { y: 0.6 } });
          }}
          onRunScenarioOptimizer={handleRunScenarioOptimizer}
          onSelectConflictBuilding={setTargetBuildingId}
          onApplyScenario={handleApplyScenario}
          isSimulating={isSimulating}
        />

        {/* Bottom Bar: Sun Scrubbing & Season Timeline */}
        <SunTimeline
          currentHour={currentHour}
          onChangeHour={setCurrentHour}
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
          isLiveNow={isLiveNow}
          onToggleLiveNow={() => setIsLiveNow((prev) => !prev)}
          solarPosition={solarPosition}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((prev) => !prev)}
        />

        {/* Homeowner Mode Simplified Banner */}
        {activeWorkspaceMode === 'homeowner' && rooftopData && financialData && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 glass-panel-elevated p-3 px-6 rounded-2xl border border-amber-500/40 flex items-center gap-6 shadow-2xl glow-amber">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs text-slate-400">Recommended System</div>
                <div className="text-sm font-bold text-white font-mono">
                  {rooftopData.installed_capacity_kwp} kWp Solar
                </div>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-slate-700"></div>

            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs text-slate-400">Annual Savings</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  ₹{financialData.year_1_gross_savings_inr.toLocaleString()}/yr
                </div>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-slate-700"></div>

            <button
              onClick={handleOpenPassport}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg glow-amber flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Get Solar Passport</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <EvidenceModal
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
      />

      <SolarPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        passport={passport}
        report={report}
        mode={passportModalMode}
      />

      {site && (
        <CampusModeModal
          isOpen={isCampusModalOpen}
          onClose={() => setIsCampusModalOpen(false)}
          buildings={site.buildings}
          onSelectBuilding={setTargetBuildingId}
        />
      )}

      <AnyPropertyDrawerModal
        isOpen={isAnyPropertyModalOpen}
        onClose={() => setIsAnyPropertyModalOpen(false)}
        onAddCustomBuilding={handleAddCustomBuilding}
      />
    </div>
  );
}
export default App;
