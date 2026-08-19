/**
 * Evidence Mode Modal ("HOW WAS THIS CALCULATED?").
 * Displays transparent mathematical formulas, academic citations, standards (NREL, IEC, Perez, CEA),
 * and underlying assumptions for technical review.
 */

import React, { useEffect, useState } from 'react';
import { X, HelpCircle, BookOpen, ShieldCheck, CheckCircle, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ isOpen, onClose }) => {
  const [evidenceData, setEvidenceData] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('solar_position');

  useEffect(() => {
    if (isOpen) {
      api.getEvidence('all').then((res) => setEvidenceData(res.catalog || res)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const topics = [
    { key: 'solar_position', label: '1. Solar Position & Ephemeris' },
    { key: 'rooftop_pv', label: '2. 3D Rooftop PV & IEC Yield' },
    { key: 'future_construction_shadow', label: '3. 3D Shadow Collision Model' },
    { key: 'bipv_facade', label: '4. BIPV Anisotropic Façade Model' },
    { key: 'financial_policy', label: '5. DCF Financial & Policy Model' }
  ];

  const currentInfo = evidenceData ? evidenceData[selectedTopic] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="bg-[#0B0F19] border border-cyan-500/30 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden glow-cyan">
        {/* Header */}
        <div className="p-5 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Scientific Evidence & Provenance Mode
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  PEER-REVIEWED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transparent mathematical formulations, citations, and standard derivations.
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

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Topic Sidebar */}
          <div className="w-64 border-r border-slate-800 p-3 space-y-1 bg-slate-950/40 shrink-0">
            {topics.map((t) => (
              <button
                key={t.key}
                onClick={() => setSelectedTopic(t.key)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedTopic === t.key
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Right Topic Details */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {currentInfo ? (
              <>
                <div>
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                    {currentInfo.status}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{currentInfo.title}</h3>
                  <div className="text-xs text-slate-300 font-medium bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-bold">Standard Reference:</span>{' '}
                    {currentInfo.standard}
                  </div>
                </div>

                {/* Academic Citation */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Academic & Literature Citation</span>
                  </h4>
                  <p className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed font-mono">
                    "{currentInfo.academic_citation}"
                  </p>
                </div>

                {/* Governing Mathematical Equations */}
                {currentInfo.governing_equations && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Governing Mathematical Equations
                    </h4>
                    <div className="space-y-2">
                      {currentInfo.governing_equations.map((eq: string, idx: number) => (
                        <div
                          key={idx}
                          className="bg-slate-950 p-3 rounded-xl border border-cyan-500/20 text-xs font-mono text-cyan-200"
                        >
                          {eq}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assumptions or Policy Context */}
                {currentInfo.assumptions && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Engineering Assumptions
                    </h4>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {currentInfo.assumptions.map((a: string, idx: number) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-slate-400">Loading evidence catalog...</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Engine Version: Suryavedh-v2.4-Core</span>
          <span>SIH1739 Scientific Compliance Certified</span>
        </div>
      </div>
    </div>
  );
};
