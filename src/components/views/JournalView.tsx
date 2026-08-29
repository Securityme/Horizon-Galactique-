"use client";

import React, { useState } from "react";
import { useEngineStore } from "../../store/useEngineStore";
import {
  BookOpen,
  Dices,
  Sparkles,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Coins,
  History,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight
} from "lucide-react";
import dbBooks from "../../data/db_books.json";
import { EventFeedPanel } from "./EventFeedPanel";
import { ColonyTasksPanel } from "./ColonyTasksPanel";

export const JournalView: React.FC = () => {
  const {
    gameState,
    currentDestinyCards,
    selectedDestinyCard,
    selectDestinyCard,
    activeNarrative,
    isGeneratingNarrative,
    executeTurnResolution
  } = useEngineStore();

  const [selectedEffectId, setSelectedEffectId] = useState<string>("EFF-A");
  const [overAllocCurrency, setOverAllocCurrency] = useState<"TREASURY" | "CONSORTIUM" | "PRIVATE">("TREASURY");
  const [overAllocAmount, setOverAllocAmount] = useState<number>(0);
  const [logFilterBook, setLogFilterBook] = useState<string>("ALL");

  if (!gameState) return null;

  const currentBookId = selectedDestinyCard?.bookId || activeNarrative?.bookId || "LIV-01";
  const bookInfo = dbBooks.find((b) => b.id === currentBookId) || dbBooks[0];

  const handleResolve = async () => {
    const overAlloc = overAllocAmount > 0 ? { currency: overAllocCurrency, amount: overAllocAmount } : null;
    await executeTurnResolution(selectedEffectId, overAlloc);
    setOverAllocAmount(0);
  };

  const filteredLogs = gameState.logbook.filter((log) => {
    if (logFilterBook === "ALL") return true;
    return log.bookId === logFilterBook;
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 space-y-4">
      {/* 1. Interactive Event Feed Panel (FLUX D'ÉVÉNEMENTS & CHRONIQUES - 1ère Place) */}
      <section>
        <EventFeedPanel gameState={gameState} />
      </section>

      {/* Colony Missions and Command Directives (Add Task feature) */}
      <section>
        <ColonyTasksPanel />
      </section>

      {/* 2. Destiny Cards Draft Bar */}
      <section className="bg-white border border-slate-200 rounded-md p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Tirage de Destin — Tour {gameState.turnIndex}
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Choisissez l&apos;événement prioritaire du tour</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {currentDestinyCards.map((card) => {
            const isSelected = selectedDestinyCard?.id === card.id;
            const b = dbBooks.find((item) => item.id === card.bookId);
            return (
              <button
                key={card.id}
                id={`destiny-card-${card.id}`}
                onClick={() => selectDestinyCard(card)}
                className={`p-3 rounded border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-blue-50/70 border-blue-500 ring-1 ring-blue-500 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-blue-700">
                      {card.bookId} • {b?.theme || "Secteur"}
                    </span>
                    <span className="text-[10px] text-amber-600 font-mono font-bold">
                      {card.sectorModifier}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 mb-1">{card.label}</h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{card.flavor}</p>
                </div>
                <div className="mt-2.5 flex items-center justify-end">
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? "text-blue-600" : "text-slate-400"}`}>
                    {isSelected ? "✓ Actif pour ce tour" : "Sélectionner →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Active Chronicle & Turn Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Main Narrative Resolution */}
        <div className="lg:col-span-2 space-y-4">
          <section className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-xs">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-blue-50 border border-blue-200 text-blue-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">
                      {bookInfo.id} — {bookInfo.title}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500 font-medium">{bookInfo.theme}</span>
                  </div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    {activeNarrative?.title || "Directive Sectorielle du Tour"}
                  </h1>
                </div>
              </div>

              {/* D20 Badge */}
              <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                <Dices className="w-3.5 h-3.5 text-amber-600" />
                <div className="text-[11px] font-mono">
                  <span className="text-slate-500">D20 Modifié : </span>
                  <span className="font-bold text-slate-800">DD 14</span>
                </div>
              </div>
            </div>

            {/* Narrative Body */}
            <div className="relative min-h-[120px] text-xs sm:text-sm text-slate-700 leading-relaxed font-serif bg-slate-50 p-3.5 rounded border border-slate-200 mb-4">
              {isGeneratingNarrative ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-blue-600">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono font-bold tracking-wider">
                    GÉNÉRATION DE LA CHRONIQUE GEMINI...
                  </span>
                </div>
              ) : (
                <p className="whitespace-pre-line">
                  {activeNarrative?.body || "En attente des instructions du conseil d'archologie..."}
                </p>
              )}
            </div>

            {/* Rebounds / Canon notice */}
            {activeNarrative?.rebounds && activeNarrative.rebounds.length > 0 && (
              <div className="mb-4 p-2.5 rounded bg-amber-50 border-l-4 border-l-amber-500 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold font-mono">Rebond diplomatique : </span>
                  {activeNarrative.rebounds[0].body}
                </div>
              </div>
            )}

            {/* Tactical Choices (Options A, B, C) */}
            <div className="space-y-2.5 mb-4">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Options d&apos;Arbitrage Tactique
              </h3>

              <div className="grid grid-cols-1 gap-2">
                {(activeNarrative?.options || [
                  { effectId: "EFF-A", label: "Approche conservatoire", body: "Stabiliser les flux sans surexposer les réserves.", riskHint: "LOW" },
                  { effectId: "EFF-B", label: "Cadence industrielle forcée", body: "Augmenter l'extraction ISRU au prix d'un stress accru.", riskHint: "MEDIUM" },
                  { effectId: "EFF-C", label: "Subventions du Consortium", body: "Consacrer des crédits d'urgence pour sécuriser la viabilité.", riskHint: "HIGH" }
                ]).map((opt) => {
                  const isSelected = selectedEffectId === opt.effectId;
                  return (
                    <button
                      key={opt.effectId}
                      id={`choice-opt-${opt.effectId}`}
                      onClick={() => setSelectedEffectId(opt.effectId)}
                      className={`p-3 rounded border text-left transition cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-500 ring-1 ring-blue-500/40 shadow-xs"
                          : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-blue-600" : "bg-slate-300"}`} />
                          <span className="font-bold text-xs text-slate-800">{opt.label}</span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                              opt.riskHint === "LOW"
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                : opt.riskHint === "MEDIUM"
                                ? "bg-amber-50 border-amber-300 text-amber-700"
                                : "bg-rose-50 border-rose-300 text-rose-700"
                            }`}
                          >
                            Risque {opt.riskHint}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed pl-4">{opt.body}</p>
                      </div>

                      <div className="shrink-0 text-[11px] font-mono font-bold">
                        {opt.effectId === "EFF-A" && <span className="text-emerald-700">+3 Bonheur, -1.2k ¢</span>}
                        {opt.effectId === "EFF-B" && <span className="text-amber-700">+40t Minerai, +4% Stress</span>}
                        {opt.effectId === "EFF-C" && <span className="text-blue-700">-2.5k Cons., +5 Légit.</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tri-Monetary Over-Allocation Box */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5 text-yellow-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Sur-allocation Trimonétaire (Bonus D20 F-22)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {overAllocAmount > 0 ? `Bonus jet : +${Math.floor(Math.log10(1 + overAllocAmount / 1000))}` : "Aucun bonus engagé"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="flex gap-1.5">
                  {(["TREASURY", "PRIVATE", "CONSORTIUM"] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setOverAllocCurrency(curr)}
                      className={`text-[11px] px-2.5 py-1 rounded font-mono font-semibold transition cursor-pointer border ${
                        overAllocCurrency === curr
                          ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                          : "bg-white border-slate-300 text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      {curr === "TREASURY" ? "Trésorerie" : curr === "PRIVATE" ? "Privé" : "Consortium"}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    step={1000}
                    value={overAllocAmount}
                    onChange={(e) => setOverAllocAmount(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-slate-800 min-w-[60px] text-right">
                    {overAllocAmount} ¢
                  </span>
                </div>
              </div>
            </div>

            {/* Resolve Action Button */}
            <button
              id="btn-resolve-turn"
              onClick={handleResolve}
              disabled={isGeneratingNarrative}
              className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Flame className="w-4 h-4" />
              <span>Exécuter et Résoudre le Tour {gameState.turnIndex}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </section>
        </div>

        {/* Right Col: Grand Livre Logbook Stream */}
        <div className="space-y-4">
          <section className="bg-white border border-slate-200 rounded-md p-3.5 sm:p-4 flex flex-col h-full max-h-[750px] shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-2.5">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Grand Livre & Archives</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono font-semibold">{gameState.logbook.length} entrées</span>
            </div>

            {/* Sector filter */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-2 text-[10px] font-mono">
              <button
                onClick={() => setLogFilterBook("ALL")}
                className={`px-2 py-0.5 rounded border font-semibold transition cursor-pointer ${
                  logFilterBook === "ALL" ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                TOUS
              </button>
              {dbBooks.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setLogFilterBook(b.id)}
                  className={`px-2 py-0.5 rounded border whitespace-nowrap font-semibold transition cursor-pointer ${
                    logFilterBook === b.id ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {b.id}
                </button>
              ))}
            </div>

            {/* Log list */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-1 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <div className="text-slate-400 text-center py-8 text-[11px]">Aucune archive pour ce filtre.</div>
              ) : (
                filteredLogs.map((entry, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-bold text-blue-700">Tour {entry.turnIndex} • {entry.bookId}</span>
                      <span className="font-semibold text-slate-600">D20: {entry.rollNatural} ({entry.degree})</span>
                    </div>
                    <h4 className="font-bold text-slate-800 font-sans text-xs">{entry.title}</h4>
                    <p className="text-slate-600 font-sans text-[11px] line-clamp-3 leading-relaxed">
                      {entry.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
