/**
 * Header Navigation Bar for Suryavedh.
 * Features branding, active site badge, live sun status, mode switcher, and report trigger.
 */

import React from 'react';
import {
  Sun,
  ShieldCheck,
  FileText,
  HelpCircle,
  Building2,
  Home,
  GraduationCap,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';
import type { DigitalTwinSite, SolarPositionResponse } from '../types';

interface HeaderNavProps {
  site: DigitalTwinSite | null;
  solarPosition: SolarPositionResponse | null;
  activeMode: 'standard' | 'homeowner' | 'campus' | 'advanced';
  onSelectMode: (mode: 'standard' | 'homeowner' | 'campus' | 'advanced') => void;
  onOpenEvidence: () => void;
  onOpenPassport: () => void;
  onOpenReport: () => void;
  onOpenLanding: () => void;
  heatmapMode: boolean;
  onToggleHeatmap: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  site,
  solarPosition,
  activeMode,
  onSelectMode,
  onOpenEvidence,
  onOpenPassport,
  onOpenReport,
  onOpenLanding,
  heatmapMode,
  onToggleHeatmap
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0A0D14]/90 backdrop-blur-xl px-5 flex items-center justify-between z-30 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-3.5 cursor-pointer" onClick={onOpenLanding}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 glow-amber border border-amber-300/40">
          <Sun className="w-6 h-6 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight text-white font-['Space_Grotesk']">
              SURYAVEDH
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 tracking-wider">
              SIH-1739
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-normal hidden md:block">
            Simulate Tomorrow. Protect Solar Today.
          </p>
        </div>
      </div>

      {/* Center: Current Site & Live Solar Status */}
      <div className="hidden lg:flex items-center gap-3 glass-pill px-4 py-1.5 rounded-full border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate max-w-[200px]">{site?.name || 'Selected Urban Site'}</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-700"></div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${solarPosition?.is_daylight ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`}></span>
          <span className="text-slate-400 text-[11px]">
            {solarPosition?.is_daylight
              ? `Sun El: ${solarPosition.elevation_deg}° • Az: ${solarPosition.azimuth_deg}°`
              : 'Night (Zero Irradiance)'}
          </span>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onSelectMode('standard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeMode === 'standard'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Full 3D Decision Support Workspace"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Workspace</span>
        </button>

        <button
          onClick={() => onSelectMode('homeowner')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeMode === 'homeowner'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Simplified 1-Click Homeowner Mode"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Homeowner</span>
        </button>

        <button
          onClick={() => onSelectMode('campus')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeMode === 'campus'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Multi-Building Campus Opportunity Ranking"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Campus Mode</span>
        </button>
      </div>

      {/* Action Buttons: Heatmap, Evidence & Reports */}
      <div className="flex items-center gap-2">
        {/* Heatmap Toggle Button */}
        <button
          onClick={onToggleHeatmap}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            heatmapMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 glow-amber'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Toggle Solar Heatmap Radiance Overlay"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Solar Heatmap</span>
        </button>

        {/* Evidence Mode Button */}
        <button
          onClick={onOpenEvidence}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10 transition-all glow-cyan"
          title="How was this calculated? Scientific provenance & equations"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Evidence Mode</span>
        </button>

        {/* Solar Passport Button */}
        <button
          onClick={onOpenPassport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all border border-amber-300/50 glow-amber"
          title="Generate Official Solar Passport Certificate"
        >
          <ShieldCheck className="w-4 h-4 text-slate-950" />
          <span>Solar Passport</span>
        </button>

        {/* Full Report Button */}
        <button
          onClick={onOpenReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 text-slate-200 border border-slate-700 hover:bg-slate-800 transition-all"
          title="Export 20-Section Solar Site Assessment Report"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden lg:inline">Site Report</span>
        </button>
      </div>
    </header>
  );
};
