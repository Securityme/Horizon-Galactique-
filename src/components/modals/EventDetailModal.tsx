"use client";

import React from "react";
import {
  X,
  Maximize2,
  Sparkles,
  ShieldAlert,
  Crown,
  Building2,
  Dices,
  Bot,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  Flame,
  Award
} from "lucide-react";
import { FeedEvent } from "../views/EventFeedPanel";
import { State4XPayload } from "../../types/state";

interface EventDetailModalProps {
  event: FeedEvent | null;
  gameState: State4XPayload | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, gameState, onClose }) => {
  if (!event || !gameState) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sans select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100 relative">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold uppercase">
                  Grand Écran • Chronique F-22
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Tour {event.turnIndex} • {gameState.currentEra}
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-bold text-white font-mono uppercase tracking-wide mt-0.5">
                Inspecteur d&apos;Événement &amp; Archives Coloniales
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer border border-slate-700"
            title="Fermer la vue grand écran (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Main Title & Category Badge */}
          <div className="space-y-3 border-b border-slate-800 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 ${
                    event.category === "THREATS"
                      ? "bg-rose-950 text-rose-300 border-rose-800"
                      : event.category === "LEADER"
                      ? "bg-amber-950 text-amber-300 border-amber-800"
                      : event.category === "AI_CHRONICLES"
                      ? "bg-indigo-950 text-indigo-300 border-indigo-800"
                      : "bg-blue-950 text-blue-300 border-blue-800"
                  }`}
                >
                  {event.category === "THREATS" && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                  {event.category === "LEADER" && <Crown className="w-4 h-4 text-amber-400" />}
                  {event.category === "AI_CHRONICLES" && <Bot className="w-4 h-4 text-indigo-400" />}
                  {event.category === "COLONY" && <Building2 className="w-4 h-4 text-blue-400" />}
                  <span>{event.badgeLabel || event.category}</span>
                </div>

                {event.origin === "MODEL" && (
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-900/60 border border-indigo-700 text-indigo-300 font-mono text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    Généré par Gemini IA
                  </span>
                )}
              </div>

              {/* D20 Roll Outcome */}
              {event.rollData && (
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
                  <Dices className="w-4 h-4 text-amber-500" />
                  <span className="text-slate-400">Résultat D20 :</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {event.rollData.natural}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      event.rollData.degree === "CRITICAL_SUCCESS"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : event.rollData.degree === "CRITICAL_FAIL" || event.rollData.degree === "FAILURE"
                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                        : "bg-blue-950 text-blue-300 border border-blue-800"
                    }`}
                  >
                    {event.rollData.degree}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white font-mono leading-tight">
              {event.title}
            </h1>
          </div>

          {/* Full Narrative Text Frame */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 sm:p-6 text-slate-200 font-serif leading-relaxed text-sm sm:text-base space-y-4 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 via-indigo-500 to-amber-500" />
            <p className="whitespace-pre-line pl-2">{event.body}</p>
          </div>

          {/* Impact & Tags Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Card: Strategic Impact */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2 font-mono">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Impacts Coloniaux &amp; Résolution
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {event.impactSummary || "Événement enregistré sans altération directe des réserves critiques."}
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                {event.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Card: AI Advisor Context & Lore */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2 font-mono">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                Analyse &amp; Recommandation du Conseil
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {`Conséquence directe pour la dynastie ${gameState.leader.dynastyName} : la stabilité et le bonheur colonial restent sous étroite surveillance de l'IA Archonte.`}
              </p>
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 shrink-0 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Horodatage : {event.timestamp || `Tour ${event.turnIndex}`}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center gap-2"
          >
            <span>Fermer le Zoom</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
