/**
 * Public Landing / Editorial Hero View for Suryavedh.
 * Delivers premium branding, clear value propositions, search bar, and direct entrypoints.
 */

import React, { useState } from 'react';
import {
  Sun,
  Building2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  Compass,
  FileCheck2,
  Sparkles,
  MapPin,
  Search
} from 'lucide-react';
import type { LocationSearchResult } from '../types';

interface LandingHeroProps {
  onEnterWorkspace: (locationId?: string) => void;
  onSearch: (query: string) => Promise<LocationSearchResult[]>;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onEnterWorkspace,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await onSearch(searchQuery);
      setSearchResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc: LocationSearchResult) => {
    onEnterWorkspace(loc.id);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Solar Flare & Architectural Glow */}
      <div className="absolute top-[-15%] left-[50%] translate-x-[-50%] w-[800px] h-[500px] bg-gradient-to-b from-amber-500/15 via-orange-600/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Brand Bar */}
      <header className="px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/25 border border-amber-300/40 glow-amber">
            <Sun className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-['Space_Grotesk']">
                SURYAVEDH
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                SIH-1739
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Urban Solar Intelligence & Digital Twin</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onEnterWorkspace('site_ycce_nagpur')}
            className="text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors hidden sm:block"
          >
            YCCE Campus Demo
          </button>
          <button
            onClick={() => onEnterWorkspace('site_nagpur_civil_lines')}
            className="text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors hidden sm:block"
          >
            Nagpur Civil Lines
          </button>
          <button
            onClick={() => onEnterWorkspace()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all border border-amber-300/50 flex items-center gap-2 glow-amber"
          >
            <span>Launch Digital Twin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Editorial Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center z-10 flex-1 flex flex-col items-center justify-center">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-medium mb-6 shadow-xl">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Next-Gen Urban Solar Decision-Support Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] font-['Space_Grotesk'] mb-6 max-w-4xl">
          Solar Impact Intelligence for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400">
            Smarter Urban Planning
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Understand your rooftop & façade solar potential today.{' '}
          <span className="text-amber-400 font-medium">Simulate how tomorrow's high-rise construction can change it.</span>
        </p>

        {/* Real Location Search Bar */}
        <div className="w-full max-w-2xl mx-auto mb-12">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center glass-panel-elevated p-2 rounded-2xl border border-amber-500/30 shadow-2xl"
          >
            <div className="pl-3.5 pr-2 text-slate-400">
              <Search className="w-5 h-5 text-amber-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search site: e.g. Nagpur, YCCE, Civil Lines, South Mumbai..."
              className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:outline-none py-2"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              {isSearching ? 'Searching...' : 'Analyze Site'}
            </button>
          </form>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-3 bg-slate-900/95 border border-slate-700 rounded-xl p-2 shadow-2xl text-left divide-y divide-slate-800">
              {searchResults.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleSelectLocation(r)}
                  className="p-3 hover:bg-slate-800/80 rounded-lg cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-amber-300">
                        {r.display_name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {r.locality}, {r.city} • Lat {r.coordinates.latitude.toFixed(4)}°, Lon {r.coordinates.longitude.toFixed(4)}°
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-amber-400 font-medium px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                    Open 3D Model
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
            <span>Try analyzing:</span>
            <button
              onClick={() => onEnterWorkspace('site_ycce_nagpur')}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
            >
              🏫 YCCE Engineering Campus
            </button>
            <button
              onClick={() => onEnterWorkspace('site_nagpur_civil_lines')}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
            >
              🏙️ Civil Lines, Nagpur
            </button>
            <button
              onClick={() => onEnterWorkspace('site_custom_search')}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
            >
              📐 Any Custom Property / House
            </button>
          </div>
        </div>

        {/* 6 Core Feature Capability Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left w-full max-w-5xl">
          {/* Feature 1 */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">1. Future Construction Simulator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Introduce proposed high-rise towers, adjust height and setback in 3D, and quantify exact shadow degradation on neighbors.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">2. 3D LOD-1 Digital Twin</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive 3D city models with verified building heights, spatial coordinate metrics, and multi-asset selection.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
              <Sun className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">3. Sun Path & Dynamic Shadows</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Astronomical Spencer & NREL ephemeris. Scrub time from 06:00 to 18:30 and watch shadows cast and rotate across buildings.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-emerald-500/40 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">4. Automatic 3D Panel Placement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic IEC-standard algorithm places 540W modules respecting setback buffers and winter inter-row clearances.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-purple-500/40 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">5. BIPV Façade Potential</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluates vertical envelopes across North, East, South, and West using Perez anisotropic sky diffuse models.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-blue-500/40 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">6. Scenario Optimizer & Passport</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Finds the Pareto sweet-spot balancing developer floor area and solar rights. Exports official Solar Passports.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-slate-800/60 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 z-10">
        <div>
          Suryavedh Urban Solar Intelligence • Built for SIH-1739 BIPV & LOD-1 City Potential Assessment
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 font-mono text-[11px]">
          <span>v2.4 Core Science</span>
          <span>•</span>
          <span>NASA POWER & ISRO-VEDAS Aligned</span>
        </div>
      </footer>
    </div>
  );
};
