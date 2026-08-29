"use client";

import React, { useState } from "react";
import { useEngineStore } from "../../store/useEngineStore";
import { X, FlaskConical, Check, Lock, ArrowRight, Info, Zap, Users, Sparkles } from "lucide-react";
import dbResearch from "../../data/db_research.json";

export const TechTreeModal: React.FC = () => {
  const { gameState, activeBottomSheet, closeBottomSheet, queueManualAction } = useEngineStore();
  const [activeTechId, setActiveTechId] = useState<string | null>(null);

  if (activeBottomSheet !== "TECH_TREE" || !gameState) return null;

  const research = gameState.research;
  const activeTech = activeTechId ? dbResearch.find((t) => t.id === activeTechId) : null;

  const handleUnlock = (techId: string, cost: number) => {
    if (research.points >= cost && !research.unlocked.includes(techId)) {
      const defaultAllocation = { A: 25, B: 25, C: 25, D: 25 };
      const currentAlloc = research.allocationPct;
      const allocation = currentAlloc
        ? {
            A: currentAlloc.A ?? 25,
            B: currentAlloc.B ?? 25,
            C: currentAlloc.C ?? 25,
            D: currentAlloc.D ?? 25,
          }
        : defaultAllocation;
      queueManualAction({ type: "SET_RD_ALLOCATION", allocation });
      closeBottomSheet();
    }
  };


  const branches = [
    { id: "A", name: "Branche A — Matériaux & Ingénierie ISRU", color: "text-amber-800" },
    { id: "B", name: "Branche B — Énergie, Fusion & Réseaux", color: "text-yellow-800" },
    { id: "C", name: "Branche C — Biosphère, Climat & Vivant", color: "text-emerald-800" },
    { id: "D", name: "Branche D — Cognition, IA & Gouvernance", color: "text-blue-800" }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-purple-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Arbre de Recherche Scientifique R&D</h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {research.points} points de recherche accumulés • {research.unlocked.length} / 32 technologies
              </span>
            </div>
          </div>
          <button
            onClick={closeBottomSheet}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Matrix */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {branches.map((br) => {
            const techs = dbResearch.filter((t) => t.id.startsWith(`RD-${br.id}`));
            return (
              <div key={br.id} className="space-y-2">
                <h4 className={`text-[11px] font-mono font-bold uppercase tracking-wider ${br.color}`}>
                  {br.name}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {techs.map((tech) => {
                    const isUnlocked = research.unlocked.includes(tech.id);
                    const canAfford = research.points >= tech.cost;

                    return (
                        <div
                          key={tech.id}
                          onClick={() => setActiveTechId(tech.id === activeTechId ? null : tech.id)}
                          className={`p-2.5 rounded border flex flex-col justify-between transition cursor-pointer ${
                            activeTechId === tech.id
                              ? "ring-2 ring-purple-600 ring-offset-1 z-10"
                              : ""
                          } ${
                            isUnlocked
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs"
                              : canAfford
                              ? "bg-slate-50 border-slate-300 text-slate-800 hover:border-slate-400 shadow-2xs"
                              : "bg-slate-50/50 border-slate-200 text-slate-400 opacity-60"
                          }`}
                        >
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                            <span className="font-bold text-slate-700">{tech.id}</span>
                            <span className="font-semibold text-blue-700">{tech.cost} pts</span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 mb-0.5 leading-tight">{tech.name}</h5>
                          <p className="text-[10px] text-slate-500 line-clamp-2">Débloque : {tech.unlocks}</p>
                        </div>

                        <div className="mt-2.5 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono">
                          {isUnlocked ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Débloqué
                            </span>
                          ) : (
                            <button
                              onClick={() => handleUnlock(tech.id, tech.cost)}
                              disabled={!canAfford}
                              className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold transition cursor-pointer ${
                                canAfford
                                  ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-2xs"
                                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                              }`}
                            >
                              Rechercher
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Tech Tooltip Details Card */}
        {activeTech && (
          <div className="p-3.5 bg-slate-900 text-white border-t border-slate-700 shrink-0 font-sans animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-600 text-white font-bold">
                    {activeTech.id}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">{activeTech.name}</h4>
                  <span className="text-[10px] font-mono text-purple-300">
                    Coût : {activeTech.cost} Pts R&D
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  <strong>Déblocage Majeur :</strong> {activeTech.unlocks}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-400" /> Prérequis : Tier T3 Chercheurs
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Bilan Énergie : Neutre
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" /> Statut :{" "}
                    {research.unlocked.includes(activeTech.id) ? "Active & Opérationnelle" : "Verrouillée"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleUnlock(activeTech.id, activeTech.cost)}
                disabled={research.unlocked.includes(activeTech.id) || research.points < activeTech.cost}
                className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition cursor-pointer shrink-0 ${
                  research.unlocked.includes(activeTech.id)
                    ? "bg-emerald-600 text-white"
                    : research.points >= activeTech.cost
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                {research.unlocked.includes(activeTech.id) ? "Débloqué" : "Rechercher cette Tech"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
