/**
 * Bottom Bar Timeline Component for Suryavedh.
 * Enables interactive scrubbing of solar time, switching between Solstice/Equinox seasons,
 * and toggling Live Now astronomical real-time mode.
 */

import React from 'react';
import {
  Sun,
  Moon,
  Clock,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import type { SolarPositionResponse } from '../types';

interface SunTimelineProps {
  currentHour: number; // 6.0 to 18.5
  onChangeHour: (h: number) => void;
  selectedDate: string; // "2026-03-21", "2026-06-21", "2026-12-21"
  onChangeDate: (d: string) => void;
  isLiveNow: boolean;
  onToggleLiveNow: () => void;
  solarPosition: SolarPositionResponse | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const SunTimeline: React.FC<SunTimelineProps> = ({
  currentHour,
  onChangeHour,
  selectedDate,
  onChangeDate,
  isLiveNow,
  onToggleLiveNow,
  solarPosition,
  isPlaying,
  onTogglePlay
}) => {
  // Convert fractional hour (e.g. 13.5) to formatted HH:MM string
  const formatTime = (h: number) => {
    const hours = Math.floor(h);
    const minutes = Math.floor((h - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} IST`;
  };

  return (
    <div className="h-20 absolute bottom-4 left-4 right-4 z-20 pointer-events-none select-none flex items-center justify-center">
      <div className="glass-panel p-3 px-5 rounded-2xl border border-slate-800 shadow-2xl max-w-4xl w-full flex items-center justify-between gap-6 pointer-events-auto">
        {/* Play/Pause & Live Now Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTogglePlay}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 font-bold glow-amber'
                : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-700'
            }`}
            title={isPlaying ? 'Pause Sun Movement' : 'Play Sun Movement Animation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={onToggleLiveNow}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isLiveNow
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 glow-amber'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            LIVE NOW
          </button>
        </div>

        {/* Center: Interactive Time Slider */}
        <div className="flex-1 flex flex-col justify-center gap-1">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-white font-bold">{formatTime(currentHour)}</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>
                El: <strong className="text-amber-300">{solarPosition?.elevation_deg || 0}°</strong>
              </span>
              <span>
                Az: <strong className="text-amber-300">{solarPosition?.azimuth_deg || 0}°</strong>
              </span>
              <span className="hidden sm:inline">
                Daylight: {solarPosition?.is_daylight ? '☀️ Day' : '🌙 Night'}
              </span>
            </div>
          </div>

          {/* Time Slider Track */}
          <input
            type="range"
            min="6.0"
            max="18.5"
            step="0.1"
            value={currentHour}
            onChange={(e) => {
              if (isLiveNow) onToggleLiveNow();
              onChangeHour(parseFloat(e.target.value));
            }}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono px-0.5">
            <span>06:00 (Sunrise)</span>
            <span>09:00</span>
            <span>12:00 (Solar Noon)</span>
            <span>15:00</span>
            <span>18:30 (Sunset)</span>
          </div>
        </div>

        {/* Season / Solstice Quick Picker */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0 text-xs">
          <button
            onClick={() => onChangeDate('2026-06-21')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedDate.includes('06-21')
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Summer Solstice (Peak Sun Altitude)"
          >
            Jun 21
          </button>
          <button
            onClick={() => onChangeDate('2026-03-21')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedDate.includes('03-21')
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Spring Equinox"
          >
            Mar 21
          </button>
          <button
            onClick={() => onChangeDate('2026-12-21')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedDate.includes('12-21')
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Winter Solstice (Lowest Sun / Longest Shadows)"
          >
            Dec 21
          </button>
        </div>
      </div>
    </div>
  );
};
