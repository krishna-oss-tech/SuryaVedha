/**
 * Right Panel: Clean Decision Support Panel for Suryavedh.
 * Displays Solar Opportunity KPIs, Automatic Panel Placement,
 * Future Construction Simulator, Current vs Future Comparison,
 * Solar Conflict Map, Solar Access Planning Envelope, and Scenario Optimizer.
 */

import React, { useState } from 'react';
import {
  Sun,
  Zap,
  Building,
  TrendingDown,
  AlertTriangle,
  Sliders,
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Leaf,
  Maximize2,
  RefreshCw,
  Compass
} from 'lucide-react';
import type {
  BuildingFootprint,
  RooftopPVResponse,
  BIPVResponse,
  ProposedFutureBuilding,
  FutureImpactResponse,
  SolarAccessEnvelopeResponse,
  ScenarioOptimizerResponse,
  FinancialAnalysisResponse,
  EnvironmentalAnalysisResponse,
  ConflictSeverity
} from '../types';

interface DecisionPanelProps {
  building: BuildingFootprint | null;
  rooftopData: RooftopPVResponse | null;
  bipvData: BIPVResponse | null;
  futureBuilding: ProposedFutureBuilding | null;
  isFutureEnabled: boolean;
  onToggleFuture: (enabled: boolean) => void;
  onUpdateFutureBuilding: (bldg: ProposedFutureBuilding) => void;
  futureImpact: FutureImpactResponse | null;
  envelopeData: SolarAccessEnvelopeResponse | null;
  scenarioOptimizerData: ScenarioOptimizerResponse | null;
  financialData: FinancialAnalysisResponse | null;
  environmentalData: EnvironmentalAnalysisResponse | null;
  onGenerateOptimizedLayout: () => void;
  onRunScenarioOptimizer: () => void;
  onSelectConflictBuilding: (bldgId: string) => void;
  onApplyScenario: (scenario: any) => void;
  isSimulating: boolean;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  building,
  rooftopData,
  bipvData,
  futureBuilding,
  isFutureEnabled,
  onToggleFuture,
  onUpdateFutureBuilding,
  futureImpact,
  envelopeData,
  scenarioOptimizerData,
  financialData,
  environmentalData,
  onGenerateOptimizedLayout,
  onRunScenarioOptimizer,
  onSelectConflictBuilding,
  onApplyScenario,
  isSimulating
}) => {
  const [activeTab, setActiveTab] = useState<'solar' | 'future' | 'financial'>('solar');

  if (!building) return null;

  return (
    <aside className="w-96 h-[calc(100vh-4rem-5rem)] absolute right-4 top-20 z-20 flex flex-col pointer-events-none select-none">
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-2xl flex flex-col flex-1 overflow-hidden pointer-events-auto">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 mb-3.5 shrink-0">
          <button
            onClick={() => setActiveTab('solar')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'solar'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Solar Yield</span>
          </button>

          <button
            onClick={() => setActiveTab('future')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'future'
                ? 'bg-orange-500 text-white font-bold shadow-md glow-amber'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Future Sim</span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'financial'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Economics</span>
          </button>
        </div>

        {/* Tab 1: Solar Potential & Automatic Panel Layout */}
        {activeTab === 'solar' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
            {/* Primary Solar Opportunity Score Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 p-3.5 rounded-xl border border-amber-500/30 glow-amber">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Solar Opportunity Score
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono">
                  GRADE A+
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
                  {rooftopData ? rooftopData.solar_suitability_score.toFixed(0) : '94'}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 100 Viability Index</span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {rooftopData?.best_solar_zone_description ||
                  'Optimal unshaded south-facing roof envelope with unobstructed 15° solar exposure.'}
              </p>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Rooftop DC Capacity */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  Rooftop Capacity
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {rooftopData?.installed_capacity_kwp || 0} <span className="text-xs text-slate-400">kWp</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {rooftopData?.total_panels_count || 0} x 540W Modules
                </div>
              </div>

              {/* Annual Generation */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  Annual Generation
                </div>
                <div className="text-lg font-bold text-amber-400 font-mono">
                  {rooftopData ? (rooftopData.annual_generation_kwh / 1000).toFixed(1) : 0}{' '}
                  <span className="text-xs text-amber-300/80">MWh/yr</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Yield: {rooftopData?.specific_yield_kwh_per_kwp || 0} kWh/kWp
                </div>
              </div>

              {/* BIPV Façade Potential */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  BIPV Potential
                </div>
                <div className="text-lg font-bold text-purple-400 font-mono">
                  {bipvData?.total_bipv_capacity_kwp || 0} <span className="text-xs text-slate-400">kWp</span>
                </div>
                <div className="text-[10px] text-purple-300/80 mt-0.5 truncate">
                  Prime: {bipvData?.best_facade || 'South (180°)'}
                </div>
              </div>

              {/* Shading Loss */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  Shading Loss
                </div>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  {rooftopData ? `${((rooftopData.annual_shading_loss_kwh / Math.max(1, rooftopData.annual_generation_kwh)) * 100).toFixed(1)}%` : '3.8%'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {rooftopData?.annual_shading_loss_kwh || 0} kWh Loss
                </div>
              </div>
            </div>

            {/* Primary Action: Generate Optimized Panel Layout */}
            <button
              onClick={onGenerateOptimizedLayout}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/20 border border-amber-300/50 flex items-center justify-center gap-2 transition-all glow-amber"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>GENERATE OPTIMIZED PANEL LAYOUT</span>
            </button>

            {/* BIPV Directional Breakdown */}
            {bipvData && (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Façade Solar Potential (BIPV)
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {bipvData.facades.map((f) => (
                    <div key={f.orientation} className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                        <span>{f.orientation.split(' ')[0]}</span>
                        <span className="text-amber-400 font-mono">{f.suitability_score}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {f.capacity_kwp} kWp • {(f.annual_bipv_generation_kwh / 1000).toFixed(1)} MWh
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Future Construction Simulator & Solar Conflict Map */}
        {activeTab === 'future' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
            {/* Future Simulator Master Switch */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-orange-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                  <span>Simulate Future Construction</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Model proposed adjacent towers and quantify shadow impacts
                </div>
              </div>
              <input
                type="checkbox"
                checked={isFutureEnabled}
                onChange={(e) => onToggleFuture(e.target.checked)}
                className="w-5 h-5 accent-orange-500 cursor-pointer"
              />
            </div>

            {isFutureEnabled && futureBuilding && (
              <>
                {/* Proposed Tower 3D Slider Controls */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                    Proposed Tower Geometry
                  </div>

                  {/* Height Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span>Tower Height</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {futureBuilding.height_m}m ({futureBuilding.floors} Floors)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="60"
                      step="1"
                      value={futureBuilding.height_m}
                      onChange={(e) => {
                        const h = parseFloat(e.target.value);
                        onUpdateFutureBuilding({
                          ...futureBuilding,
                          height_m: h,
                          floors: Math.max(3, Math.floor(h / 3.2))
                        });
                      }}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  {/* Setback Distance Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span>Setback Distance</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {futureBuilding.setback_distance_m}m
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="35"
                      step="0.5"
                      value={futureBuilding.setback_distance_m}
                      onChange={(e) => {
                        const sb = parseFloat(e.target.value);
                        onUpdateFutureBuilding({
                          ...futureBuilding,
                          setback_distance_m: sb,
                          center_x: 20 + sb * 0.8
                        });
                      }}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>

                {/* Current vs Future Impact Comparison Card */}
                {futureImpact && (
                  <div className="bg-gradient-to-br from-slate-900 to-rose-950/40 p-3.5 rounded-xl border border-rose-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                        Solar Conflict Assessment
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                        -{futureImpact.overall_percentage_loss_pct}% YIELD
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Annual Energy Loss</div>
                        <div className="text-sm font-bold text-rose-400 font-mono">
                          {(futureImpact.total_annual_energy_loss_kwh / 1000).toFixed(1)} MWh/yr
                        </div>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Revenue Impact</div>
                        <div className="text-sm font-bold text-rose-300 font-mono">
                          -₹{futureImpact.total_annual_revenue_loss_inr.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 italic pt-1">
                      {futureImpact.summary_verdict}
                    </p>
                  </div>
                )}

                {/* Solar Conflict Map: Affected Assets */}
                {futureImpact && futureImpact.affected_conflicts.length > 0 && (
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Solar Conflict Map ({futureImpact.affected_conflicts.length} Assets)
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {futureImpact.affected_conflicts.map((c) => {
                        const sevColor =
                          c.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : c.severity === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700';

                        return (
                          <div
                            key={c.building_id}
                            onClick={() => onSelectConflictBuilding(c.building_id)}
                            className="p-2 bg-slate-950/70 hover:bg-slate-800/80 rounded-lg border border-slate-800 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-200 truncate">{c.building_name}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${sevColor}`}>
                                {c.severity} (-{c.percentage_loss_pct}%)
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 leading-snug">
                              {c.reason}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Solar Access Planning Envelope Card */}
                {envelopeData && (
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-cyan-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                        Solar Access Planning Envelope
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          envelopeData.is_height_compliant
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {envelopeData.is_height_compliant ? 'COMPLIANT' : 'HEIGHT EXCEEDED'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      Max Recommended Height:{' '}
                      <span className="font-mono text-cyan-300 font-bold">
                        {envelopeData.maximum_recommended_height_m}m
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      Recommended Min Setback:{' '}
                      <span className="font-mono text-cyan-300 font-bold">
                        {envelopeData.recommended_minimum_setback_m}m
                      </span>
                    </div>
                  </div>
                )}

                {/* Scenario Optimizer CTA ("FIND BETTER SCENARIO") */}
                <button
                  onClick={onRunScenarioOptimizer}
                  disabled={isSimulating}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 border border-orange-300/50 flex items-center justify-center gap-2 transition-all glow-amber"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>FIND BETTER SCENARIO (PARETO OPTIMIZER)</span>
                </button>

                {/* Optimized Scenario Result Card */}
                {scenarioOptimizerData && (
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-amber-500/40 space-y-2">
                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{scenarioOptimizerData.recommended_scenario.scenario_label}</span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {scenarioOptimizerData.recommended_scenario.trade_off_explanation}
                    </p>

                    <div className="flex items-center justify-between text-xs font-mono pt-1">
                      <span className="text-slate-400">
                        H: {scenarioOptimizerData.recommended_scenario.proposed_height_m}m • Setback:{' '}
                        {scenarioOptimizerData.recommended_scenario.proposed_setback_m}m
                      </span>
                      <button
                        onClick={() =>
                          onApplyScenario(scenarioOptimizerData.recommended_scenario)
                        }
                        className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px] hover:bg-amber-400"
                      >
                        Apply Config
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 3: Financial & Environmental Economics */}
        {activeTab === 'financial' && financialData && environmentalData && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
            {/* Financial Overview Card */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 p-3.5 rounded-xl border border-emerald-500/30">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                25-Year Financial Economics
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Total CAPEX</div>
                  <div className="text-sm font-bold text-white font-mono">
                    ₹{financialData.total_capex_inr.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Simple Payback</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {financialData.simple_payback_years} Years
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">25-Yr Net Savings</div>
                  <div className="text-sm font-bold text-emerald-300 font-mono">
                    ₹{financialData.lifetime_25yr_net_savings_inr.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">LCOE (Cost/Unit)</div>
                  <div className="text-sm font-bold text-amber-300 font-mono">
                    ₹{financialData.levelized_cost_of_electricity_inr_kwh} / kWh
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental Decarbonization Card */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Environmental Carbon Offset</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Annual CO₂ Avoided</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {environmentalData.annual_co2_reduction_metric_tons} Tons
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Trees Equivalent</div>
                  <div className="text-sm font-bold text-emerald-300 font-mono">
                    {environmentalData.equivalent_trees_planted_count.toLocaleString()} Trees
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                Derived from CEA India Grid Baseline (0.716 kg CO₂/kWh). MODELED ESTIMATE.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
