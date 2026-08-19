/**
 * Left Sidebar: Minimal Site & Building Selection Controls.
 * Allows searching locations, selecting buildings, customizing any-property footprints,
 * and reviewing data provenance metadata.
 */

import React, { useState } from 'react';
import {
  Search,
  Building2,
  MapPin,
  Compass,
  PlusCircle,
  CheckCircle2,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { DigitalTwinSite, BuildingFootprint, LocationSearchResult } from '../types';

interface SiteControlsSidebarProps {
  site: DigitalTwinSite | null;
  targetBuildingId: string;
  onSelectBuilding: (id: string) => void;
  onSearchLocation: (query: string) => Promise<LocationSearchResult[]>;
  onSelectLocation: (locId: string) => void;
  onOpenCustomFootprintDrawer: () => void;
  onGenerateLayout: () => void;
}

export const SiteControlsSidebar: React.FC<SiteControlsSidebarProps> = ({
  site,
  targetBuildingId,
  onSelectBuilding,
  onSearchLocation,
  onSelectLocation,
  onOpenCustomFootprintDrawer,
  onGenerateLayout
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await onSearchLocation(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <aside className="w-80 h-[calc(100vh-4rem-5rem)] absolute left-4 top-20 z-20 flex flex-col pointer-events-none select-none">
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-2xl flex flex-col flex-1 overflow-hidden pointer-events-auto">
        {/* Search Header */}
        <div className="mb-3.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            1. Site & Building Selection
          </label>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search site / campus / city..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 pl-8 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          {/* Search Dropdown if results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-slate-900 border border-slate-700 rounded-xl p-1.5 max-h-40 overflow-y-auto divide-y divide-slate-800 shadow-2xl">
              {searchResults.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    onSelectLocation(r.id);
                    setSearchResults([]);
                  }}
                  className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-xs"
                >
                  <div className="font-semibold text-slate-200">{r.display_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{r.locality}, {r.city}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Site Overview */}
        {site && (
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 mb-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-white leading-snug">{site.name}</div>
                <div className="text-[11px] text-slate-400">{site.address}</div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20 shrink-0">
                LOD-1 3D
              </span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>
                {site.coordinates.latitude.toFixed(4)}°N, {site.coordinates.longitude.toFixed(4)}°E
              </span>
            </div>
          </div>
        )}

        {/* Building Footprints List */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Discovered Structures ({site?.buildings.length || 0})
            </span>
          </div>

          <div className="space-y-1.5">
            {site?.buildings.map((b) => {
              const isTarget = b.id === targetBuildingId;
              return (
                <div
                  key={b.id}
                  onClick={() => onSelectBuilding(b.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                    isTarget
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-md glow-amber'
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isTarget
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div
                        className={`text-xs font-semibold truncate ${
                          isTarget ? 'text-amber-300' : 'text-slate-200'
                        }`}
                      >
                        {b.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {b.height}m height • {b.gross_roof_area} m² roof
                      </div>
                    </div>
                  </div>

                  {isTarget ? (
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Any-Property Mode Trigger */}
        <div className="pt-3 border-t border-slate-800/80 mt-2">
          <button
            onClick={onOpenCustomFootprintDrawer}
            className="w-full py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center justify-center gap-2 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Draw / Input Custom Plot</span>
          </button>
        </div>

        {/* Provenance Footer */}
        {site && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Quality: {site.provenance.data_type}</span>
            <span>Conf: {(site.provenance.confidence * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>
    </aside>
  );
};
