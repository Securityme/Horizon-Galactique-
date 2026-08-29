"use client";

import React, { useState, useSyncExternalStore } from "react";
import { fipRadio, FIP_STATIONS, FipStation } from "../../services/fipRadio";
import { Radio, Play, Pause, Volume2, VolumeX, ChevronDown, Loader2, Disc } from "lucide-react";

const subscribeFip = (callback: () => void) => fipRadio.subscribe(callback);

export const FipRadioWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Subscribe to FIP manager state changes cleanly
  const currentStation = useSyncExternalStore(subscribeFip, () => fipRadio.getStation(), () => FIP_STATIONS[0]);
  const isPlaying = useSyncExternalStore(subscribeFip, () => fipRadio.getIsPlaying(), () => false);
  const isLoading = useSyncExternalStore(subscribeFip, () => fipRadio.getIsLoading(), () => false);
  const isFallbackSynth = useSyncExternalStore(subscribeFip, () => fipRadio.getIsFallbackSynth(), () => false);
  const volume = useSyncExternalStore(subscribeFip, () => fipRadio.getVolume(), () => 0.6);

  const handleTogglePlay = () => {
    fipRadio.togglePlay();
  };

  const handleSelectStation = (station: FipStation) => {
    fipRadio.playStation(station);
  };

  const handleVolumeChange = (v: number) => {
    fipRadio.setVolume(v);
  };

  return (
    <div className="relative inline-block font-sans select-none z-30">
      {/* Compact Header Pill */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-full px-2.5 py-1 text-xs text-slate-200 shadow-sm backdrop-blur-md">
        <button
          onClick={handleTogglePlay}
          className={`w-5 h-5 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
            isPlaying
              ? isFallbackSynth
                ? "bg-cyan-600 text-white shadow-xs shadow-cyan-500/50"
                : "bg-rose-600 text-white shadow-xs shadow-rose-500/50"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
          title={isPlaying ? "Mettre en pause la Radio" : "Écouter la Radio de l'Arche"}
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-white" />
          ) : isPlaying ? (
            <Pause className="w-3 h-3 fill-current" />
          ) : (
            <Play className="w-3 h-3 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 hover:text-white transition cursor-pointer font-mono"
        >
          <Radio className={`w-3.5 h-3.5 ${isPlaying ? (isFallbackSynth ? "text-cyan-400 animate-pulse" : "text-rose-400 animate-pulse") : "text-slate-400"}`} />
          <span className="font-bold text-[11px] text-slate-200 max-w-[110px] sm:max-w-[140px] truncate">{currentStation.name}</span>
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3 w-3 shrink-0">
              <span className={`w-0.5 ${isFallbackSynth ? "bg-cyan-400" : "bg-rose-400"} animate-[bounce_1s_infinite_100ms] h-full rounded-full`} />
              <span className={`w-0.5 ${isFallbackSynth ? "bg-cyan-400" : "bg-rose-400"} animate-[bounce_1s_infinite_300ms] h-2/3 rounded-full`} />
              <span className={`w-0.5 ${isFallbackSynth ? "bg-cyan-400" : "bg-rose-400"} animate-[bounce_1s_infinite_200ms] h-5/6 rounded-full`} />
            </div>
          )}
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Expanded FIP Radio Station Selection Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl z-50 text-slate-100 font-sans space-y-3 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  <Disc className={`w-4 h-4 ${isPlaying ? "animate-spin" : ""}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono text-white">Radio Archon & FIP</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Système Audio Interstellaire</p>
                </div>
              </div>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold border ${
                  isLoading
                    ? "bg-amber-950/80 text-amber-300 border-amber-700/80"
                    : isPlaying
                    ? isFallbackSynth
                      ? "bg-cyan-950 text-cyan-300 border-cyan-700"
                      : "bg-rose-950 text-rose-300 border-rose-800"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {isLoading ? "Connexion..." : isPlaying ? (isFallbackSynth ? "Synthé IA" : "En Direct") : "Inactif"}
              </span>
            </div>

            {/* Station Cards */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {FIP_STATIONS.map((st) => {
                const isSelected = currentStation.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      handleSelectStation(st);
                    }}
                    className={`w-full p-2 rounded-lg text-left text-xs font-mono transition flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? st.isSpaceSynth
                          ? "bg-slate-800 border-cyan-500/60 text-white shadow-xs"
                          : "bg-slate-800 border-rose-500/60 text-white shadow-xs"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${st.color} shrink-0`} />
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          {st.name}
                          {st.isSpaceSynth && (
                            <span className="text-[9px] px-1 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-sans">IA</span>
                          )}
                        </div>
                        <div className="text-[9px] text-slate-400 font-sans">{st.genre}</div>
                      </div>
                    </div>
                    {isSelected && isPlaying && (
                      <span className={`text-[10px] font-bold animate-pulse ${st.isSpaceSynth ? "text-cyan-400" : "text-rose-400"}`}>
                        {st.isSpaceSynth ? "SYNTH" : "LIVE"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Volume Slider */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  {volume === 0 ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-slate-300" />}
                  Volume Radio
                </span>
                <span className="font-bold text-slate-200">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

