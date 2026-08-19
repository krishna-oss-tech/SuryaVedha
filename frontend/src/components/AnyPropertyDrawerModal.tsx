/**
 * Any-Property Custom Footprint Drawer Modal for Suryavedh.
 * Allows drawing or typing arbitrary plot/building dimensions (House, Factory, Commercial Site).
 */

import React, { useState } from 'react';
import { X, Plus, Building2, Check, Sparkles } from 'lucide-react';
import type { BuildingFootprint } from '../types';

interface AnyPropertyDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomBuilding: (bldg: BuildingFootprint) => void;
}

export const AnyPropertyDrawerModal: React.FC<AnyPropertyDrawerModalProps> = ({
  isOpen,
  onClose,
  onAddCustomBuilding
}) => {
  const [name, setName] = useState('My Custom Solar Property');
  const [widthM, setWidthM] = useState(25);
  const [lengthM, setLengthM] = useState(20);
  const [heightM, setHeightM] = useState(12);
  const [floors, setFloors] = useState(3);
  const [category, setCategory] = useState('residential');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hw = widthM / 2.0;
    const hl = lengthM / 2.0;

    // Create 4-vertex local polygon footprint centered at origin
    const coords: [number, number][] = [
      [-hw, -hl],
      [hw, -hl],
      [hw, hl],
      [-hw, hl]
    ];

    const grossArea = widthM * lengthM;
    const usableArea = grossArea * 0.76;

    const newBldg: BuildingFootprint = {
      id: `custom_${Date.now()}`,
      name: name.trim() || 'Custom Property',
      footprint_coordinates: coords,
      height: heightM,
      floors: floors,
      height_source: 'user_provided_verified',
      gross_roof_area: grossArea,
      usable_roof_area: usableArea,
      category: category,
      is_target_site: true,
      is_protected_solar_asset: true
    };

    onAddCustomBuilding(newBldg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="bg-[#0B0F19] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl glow-amber">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                Any-Property Footprint Input
              </h3>
              <p className="text-[11px] text-slate-400">Custom Dimensions & Floor Height</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Property Name / Label</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Width (East-West) [m]</label>
              <input
                type="number"
                min="5"
                max="120"
                value={widthM}
                onChange={(e) => setWidthM(parseFloat(e.target.value) || 10)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Length (North-South) [m]</label>
              <input
                type="number"
                min="5"
                max="120"
                value={lengthM}
                onChange={(e) => setLengthM(parseFloat(e.target.value) || 10)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Height [m]</label>
              <input
                type="number"
                min="3"
                max="80"
                step="0.5"
                value={heightM}
                onChange={(e) => {
                  const h = parseFloat(e.target.value) || 6;
                  setHeightM(h);
                  setFloors(Math.max(1, Math.floor(h / 3.0)));
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Property Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              >
                <option value="residential">Residential House</option>
                <option value="commercial">Commercial Office</option>
                <option value="industrial">Factory / Warehouse</option>
                <option value="educational">School / College</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            Calculated Roof Area:{' '}
            <strong className="text-amber-400 font-mono">{widthM * lengthM} m²</strong> • Usable:{' '}
            <strong className="text-emerald-400 font-mono">
              {(widthM * lengthM * 0.76).toFixed(0)} m²
            </strong>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all glow-amber"
          >
            <Check className="w-4 h-4" />
            <span>Generate 3D Digital Twin</span>
          </button>
        </form>
      </div>
    </div>
  );
};
