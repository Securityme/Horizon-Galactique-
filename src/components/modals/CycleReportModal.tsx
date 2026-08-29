"use client";

import React from "react";
import { useEngineStore } from "../../store/useEngineStore";
import { useUIStore } from "../../store/useUIStore";
import { X, Award, FileText, CheckCircle2, AlertCircle, Sparkles, Cpu } from "lucide-react";

export const CycleReportModal: React.FC = () => {
  const { activeBottomSheet, closeBottomSheet, activeCycleReport, gameState, queueManualAction } = useEngineStore();
  const { theme } = useUIStore();

  if (activeBottomSheet !== "CYCLE_REPORT" || !activeCycleReport || !gameState) return null;

  const handleChooseDilemma = (choice: "A" | "B") => {
    if (choice === "A") {
      const defaultAllocation = { A: 25, B: 25, C: 25, D: 25 };
      const currentAlloc = gameState.research.allocationPct;
      const allocation = currentAlloc
        ? {
            A: currentAlloc.A ?? 25,
            B: currentAlloc.B ?? 25,
            C: currentAlloc.C ?? 25,
            D: currentAlloc.D ?? 25,
          }
        : defaultAllocation;
      queueManualAction({ type: "SET_RD_ALLOCATION", allocation });
    } else {
      queueManualAction({ type: "SET_TAX", rate: gameState.economy.taxRatePct });
    }
    closeBottomSheet();
  };

  const isLight = theme === "light";
  const isAmber = theme === "amber";

  const modalBg = isLight
    ? "bg-white border-slate-200 text-slate-800"
    : isAmber
    ? "bg-black border-amber-900 text-amber-500 font-mono"
    : "bg-slate-900 border-slate-800 text-slate-100";

  const headerBg = isLight
    ? "bg-slate-50 border-b border-slate-200"
    : isAmber
    ? "bg-black border-b border-amber-900 text-amber-500"
    : "bg-slate-950 border-b border-slate-800 text-white";

  const blockBg = isLight
    ? "bg-slate-50 border-slate-200 text-slate-700"
    : isAmber
    ? "bg-zinc-950 border-amber-900/40 text-amber-400"
    : "bg-slate-950/60 border-slate-800 text-slate-300";

  const autoBuildLogs = gameState.canon
    ?.filter((c) => c.fact.includes("Auto-Build") || c.fact.includes("Chantier"))
    .slice(-4) || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 font-sans">
      <div className={`border rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${modalBg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-3.5 shrink-0 ${headerBg}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded ${isAmber ? "bg-amber-950 text-amber-400" : "bg-blue-600/20 text-blue-400"}`}>
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className={`font-bold text-xs sm:text-sm ${isLight ? "text-slate-900" : isAmber ? "text-amber-400" : "text-white"}`}>{activeCycleReport.title}</h3>
              <span className={`text-[10px] font-mono ${isLight ? "text-slate-500" : isAmber ? "text-amber-600" : "text-slate-400"}`}>
                Gazette Décennale d&apos;Archologie & Arbitrage Macro-Loop
              </span>
            </div>
          </div>
          <button
            onClick={closeBottomSheet}
            className={`p-1 rounded transition cursor-pointer ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 text-slate-600"
                : isAmber
                ? "bg-amber-950 text-amber-500 hover:text-amber-300"
                : "bg-slate-800 hover:bg-slate-700 text-slate-400"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Summary */}
          <div className={`p-3.5 rounded border text-xs font-serif leading-relaxed ${blockBg}`}>
            <p className="whitespace-pre-line">{activeCycleReport.cycleSummary}</p>
          </div>

          {/* Resource Delta Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3 rounded-lg border ${blockBg}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono block text-slate-400">Trésor de la Colonie</span>
              <div className="text-base font-extrabold mt-1">{(gameState.economy.colonyTreasury || 0).toLocaleString()} <span className="text-xs">CR</span></div>
              <span className="text-[9px] text-emerald-500 font-semibold font-mono">Stable</span>
            </div>

            <div className={`p-3 rounded-lg border ${blockBg}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono block text-slate-400">Ressource Énergie</span>
              <div className="text-base font-extrabold mt-1">{(gameState.economy.netEnergyMW || 0).toLocaleString()} <span className="text-xs">MW</span></div>
              <span className={`text-[9px] font-semibold font-mono ${gameState.economy.netEnergyMW >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {gameState.economy.netEnergyMW >= 0 ? "Surplus Actif" : "Déficit Critique"}
              </span>
            </div>

            <div className={`p-3 rounded-lg border ${blockBg}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono block text-slate-400">Régolithe / Minerai</span>
              <div className="text-base font-extrabold mt-1">{(gameState.economy.storedOreTons || 0).toLocaleString()} <span className="text-xs">Tons</span></div>
              <span className="text-[9px] text-emerald-500 font-semibold font-mono">Maintenance : -5%</span>
            </div>

            <div className={`p-3 rounded-lg border ${blockBg}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono block text-slate-400">Population Totale</span>
              <div className="text-base font-extrabold mt-1">{(gameState.demographics.popTotal || 0).toLocaleString()} <span className="text-xs">Colons</span></div>
              <span className="text-[9px] text-emerald-500 font-semibold font-mono">Statut : Croissance</span>
            </div>
          </div>

          {/* Auto-Build AI & Major Projects Summary */}
          <div className={`p-3.5 rounded-lg border ${blockBg} space-y-2`}>
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 text-blue-400">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Rapport de l&apos;Auto-Build IA & Chantiers</span>
            </h4>
            {autoBuildLogs.length === 0 ? (
              <p className="text-[11px] italic font-mono text-slate-500">
                Aucun projet d&apos;assemblage automatique ou d&apos;inauguration complété durant cette période.
              </p>
            ) : (
              <ul className="space-y-1.5 font-mono text-[11px] leading-relaxed">
                {autoBuildLogs.map((log, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{log.fact}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Dilemma */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${isLight ? "text-slate-900" : "text-amber-400"}`}>
                {activeCycleReport.structuralDilemma.dilemmaTitle}
              </h4>
            </div>
            <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              {activeCycleReport.structuralDilemma.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleChooseDilemma("A")}
                className={`p-3 rounded text-left transition cursor-pointer flex flex-col justify-between shadow-xs border ${
                  isLight
                    ? "bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-blue-500"
                    : isAmber
                    ? "bg-zinc-950 hover:bg-amber-950/20 border-amber-900 hover:border-amber-500 text-amber-500"
                    : "bg-slate-950/40 hover:bg-slate-800 border-slate-800 hover:border-blue-500"
                }`}
              >
                <div>
                  <span className={`text-xs font-bold font-mono block mb-1 ${isAmber ? "text-amber-400" : "text-blue-500"}`}>
                    Option A : {activeCycleReport.structuralDilemma.choiceA.label}
                  </span>
                  <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    {activeCycleReport.structuralDilemma.choiceA.outcome}
                  </p>
                </div>
                <span className={`text-[10px] font-mono mt-2 block font-semibold ${isAmber ? "text-amber-500" : "text-amber-600"}`}>
                  {activeCycleReport.structuralDilemma.choiceA.impactSummary}
                </span>
              </button>

              <button
                onClick={() => handleChooseDilemma("B")}
                className={`p-3 rounded text-left transition cursor-pointer flex flex-col justify-between shadow-xs border ${
                  isLight
                    ? "bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-emerald-500"
                    : isAmber
                    ? "bg-zinc-950 hover:bg-amber-950/20 border-amber-900 hover:border-amber-500 text-amber-500"
                    : "bg-slate-950/40 hover:bg-slate-800 border-slate-800 hover:border-emerald-500"
                }`}
              >
                <div>
                  <span className={`text-xs font-bold font-mono block mb-1 ${isAmber ? "text-amber-400" : "text-emerald-500"}`}>
                    Option B : {activeCycleReport.structuralDilemma.choiceB.label}
                  </span>
                  <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    {activeCycleReport.structuralDilemma.choiceB.outcome}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-500 mt-2 block font-semibold">
                  {activeCycleReport.structuralDilemma.choiceB.impactSummary}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
