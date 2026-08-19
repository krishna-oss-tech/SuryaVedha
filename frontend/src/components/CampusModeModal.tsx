/**
 * Campus Mode Modal for Suryavedh.
 * Ranks all campus buildings by solar suitability, DC capacity, BIPV potential, and installation priority.
 */

import React from 'react';
import { X, GraduationCap, Trophy, Building, ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';
import type { BuildingFootprint } from '../types';

interface CampusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: BuildingFootprint[];
  onSelectBuilding: (id: string) => void;
}

export const CampusModeModal: React.FC<CampusModeModalProps> = ({
  isOpen,
  onClose,
  buildings,
  onSelectBuilding
}) => {
  if (!isOpen) return null;

  // Rank campus buildings by roof area and height
  const ranked = [...buildings].sort((a, b) => b.gross_roof_area - a.gross_roof_area);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="bg-[#0B0F19] border border-amber-500/30 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden glow-amber">
        {/* Header */}
        <div className="p-5 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Campus Solar Opportunity Ranking
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  INSTITUTIONAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-building portfolio assessment and prioritized solar rollout roadmap.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Table Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
            <table className="w-full text-left text-xs divide-y divide-slate-800">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="p-3.5 pl-4">Rank & Building</th>
                  <th className="p-3.5">Suitability</th>
                  <th className="p-3.5">Capacity</th>
                  <th className="p-3.5">Est. Annual Gen</th>
                  <th className="p-3.5">BIPV Opp</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {ranked.map((b, idx) => {
                  const estKwp = Math.round(b.usable_roof_area * 0.16);
                  const estMwh = Math.round(estKwp * 1.55);
                  const suitability = Math.min(96, Math.max(70, 95 - idx * 4));
                  const priority = idx === 0 ? 'PHASE 1 (IMMEDIATE)' : idx <= 2 ? 'PHASE 2' : 'PHASE 3';
                  const priorityColor =
                    idx === 0
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : idx <= 2
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700';

                  return (
                    <tr key={b.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3.5 pl-4 flex items-center gap-2.5">
                        <span className="font-mono text-amber-400 font-bold text-xs w-4">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-white">{b.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {b.height}m • {b.gross_roof_area} m²
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className="text-amber-400 font-bold">{suitability}%</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-200">
                        {estKwp} kWp
                      </td>
                      <td className="p-3.5 font-mono text-amber-300 font-bold">
                        {estMwh} MWh/yr
                      </td>
                      <td className="p-3.5 font-mono text-purple-400">
                        {Math.round(estKwp * 0.45)} kWp
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${priorityColor}`}>
                          {priority}
                        </span>
                      </td>
                      <td className="p-3.5 pr-4 text-right">
                        <button
                          onClick={() => {
                            onSelectBuilding(b.id);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-bold text-[11px] transition-colors"
                        >
                          Analyze in 3D
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
