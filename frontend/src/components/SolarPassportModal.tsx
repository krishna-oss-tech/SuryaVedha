/**
 * Solar Passport & Certified 20-Section Site Report Modal for Suryavedh.
 * Enables viewing, printing, and exporting the official Solar Passport.
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Download,
  Printer,
  FileText,
  Sun,
  MapPin,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Leaf
} from 'lucide-react';
import type { SolarPassport, SolarSiteReport } from '../types';

interface SolarPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  passport: SolarPassport | null;
  report: SolarSiteReport | null;
  mode?: 'passport' | 'report';
}

export const SolarPassportModal: React.FC<SolarPassportModalProps> = ({
  isOpen,
  onClose,
  passport,
  report,
  mode = 'passport'
}) => {
  const [activeView, setActiveView] = useState<'passport' | 'report'>(mode);

  if (!isOpen || !passport) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="bg-[#0B0F19] border border-amber-500/40 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden glow-amber">
        {/* Header */}
        <div className="p-5 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center glow-amber">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Official Solar Passport Certification
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
                  {passport.passport_id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                LOD-1 Verified Urban Solar Asset Decision Document
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveView('passport')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeView === 'passport'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Solar Passport
              </button>
              <button
                onClick={() => setActiveView('report')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeView === 'report'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                20-Section Report
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeView === 'passport' ? (
            /* Solar Passport Certificate View */
            <div className="border-2 border-amber-500/40 rounded-2xl p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/20 relative">
              {/* Top Watermark Badge */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                    Suryavedh Urban Solar Passport
                  </span>
                  <h3 className="text-2xl font-extrabold text-white font-['Space_Grotesk'] mt-1">
                    {passport.property_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{passport.locality}</p>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg glow-amber font-mono">
                    {passport.overall_solar_suitability_grade}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Score: <strong>{passport.solar_score}/100</strong>
                  </div>
                </div>
              </div>

              {/* Core Solar Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Rooftop PV Capacity</div>
                  <div className="text-lg font-bold text-amber-400 font-mono">
                    {passport.rooftop_capacity_kwp} kWp
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {(passport.rooftop_annual_generation_kwh / 1000).toFixed(1)} MWh/yr
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">BIPV Façade Potential</div>
                  <div className="text-lg font-bold text-purple-400 font-mono">
                    {passport.bipv_potential_kwp} kWp
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {(passport.bipv_annual_generation_kwh / 1000).toFixed(1)} MWh/yr
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Estimated Annual Savings</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    ₹{passport.estimated_annual_savings_inr.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Payback: {passport.simple_payback_years} Years
                  </div>
                </div>
              </div>

              {/* Environmental Carbon & Geometry Quality */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800 mb-6">
                <div>
                  <div className="text-slate-400 font-medium">Environmental Avoidance</div>
                  <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                    {passport.annual_co2_offset_tonnes} Tons CO₂ / Year
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Geometry & Altimetry Quality</div>
                  <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                    {passport.geometry_quality_grade}
                  </div>
                </div>
              </div>

              {/* Certification Stamp Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800 pt-3 font-mono">
                <div>
                  Certified by <strong>{passport.model_version}</strong> • Confidence: {(passport.confidence_level * 100).toFixed(0)}%
                </div>
                <div>Issued: {new Date(passport.issue_timestamp).toLocaleDateString()}</div>
              </div>
            </div>
          ) : (
            /* 20-Section Site Assessment Report View */
            <div className="space-y-4">
              <div className="text-xs text-slate-400 pb-2 border-b border-slate-800">
                Comprehensive 20-Section Site Solar Potential & Future Sensitivity Assessment Report
              </div>
              {report?.sections?.map((s) => (
                <div key={s.num} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      §{s.num}
                    </span>
                    <h4 className="text-sm font-bold text-white">{s.title}</h4>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    {typeof s.content === 'string' ? (
                      s.content
                    ) : Array.isArray(s.content) ? (
                      <ul className="list-disc list-inside space-y-0.5 mt-1 font-mono text-[11px]">
                        {s.content.map((item: any, idx: number) => (
                          <li key={idx}>
                            {typeof item === 'object' ? JSON.stringify(item) : item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <pre className="text-[11px] font-mono bg-slate-950 p-2 rounded-lg overflow-x-auto text-amber-200">
                        {JSON.stringify(s.content, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
