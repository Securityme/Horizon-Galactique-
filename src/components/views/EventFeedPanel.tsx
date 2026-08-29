"use client";

import React, { useState, useMemo } from "react";
import { State4XPayload, BookLogEntry } from "../../types/state";
import { formatNumber } from "../../lib/formatters";
import dbBooks from "../../data/db_books.json";
import dbEras from "../../data/db_eras.json";
import { useEngineStore } from "../../store/useEngineStore";
import { EventDetailModal } from "../modals/EventDetailModal";
import {
  History,
  Sparkles,
  ShieldAlert,
  Crown,
  Building2,
  Filter,
  Search,
  Dices,
  AlertTriangle,
  Award,
  Zap,
  Users,
  Compass,
  CheckCircle2,
  Radio,
  Clock,
  Flame,
  Globe2,
  Bot,
  Loader2,
  Maximize2
} from "lucide-react";

export type EventCategory = "ALL" | "COLONY" | "THREATS" | "LEADER" | "AI_CHRONICLES";

export interface FeedEvent {
  id: string;
  turnIndex: number;
  category: "COLONY" | "THREATS" | "LEADER" | "AI_CHRONICLES";
  title: string;
  body: string;
  timestamp?: string;
  origin: "MODEL" | "FALLBACK" | "SIMULATION" | "MILESTONE";
  badgeLabel?: string;
  iconType: "colony" | "threat" | "leader" | "ai" | "milestone" | "dice";
  severity?: "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";
  rollData?: {
    natural: number | null;
    total: number | null;
    degree: string | null;
  };
  impactSummary?: string;
  tags: string[];
}

interface EventFeedPanelProps {
  gameState: State4XPayload;
  onSelectEvent?: (event: FeedEvent) => void;
}

export const EventFeedPanel: React.FC<EventFeedPanelProps> = ({ gameState, onSelectEvent }) => {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [zoomedEvent, setZoomedEvent] = useState<FeedEvent | null>(null);

  const { triggerContextualGeminiEvent, isGeneratingNarrative } = useEngineStore();

  // Synthesize and compile all events from logbook, canon, milestones, threats, and leader life-sim
  const allEvents = useMemo<FeedEvent[]>(() => {
    const events: FeedEvent[] = [];

    // 1. Logbook AI & Narrative Chronicles
    gameState.logbook.forEach((log: BookLogEntry, idx: number) => {
      const book = dbBooks.find((b) => b.id === log.bookId);
      const isThreatRelated =
        log.title.toLowerCase().includes("crise") ||
        log.title.toLowerCase().includes("menace") ||
        log.title.toLowerCase().includes("fuite") ||
        log.title.toLowerCase().includes("délestage") ||
        log.body.toLowerCase().includes("sanction") ||
        log.body.toLowerCase().includes("danger") ||
        log.degree === "CRITICAL_FAIL" ||
        log.degree === "FAILURE";

      const isLeaderRelated =
        log.title.toLowerCase().includes("leader") ||
        log.title.toLowerCase().includes("dynastie") ||
        log.title.toLowerCase().includes("décret") ||
        log.title.toLowerCase().includes("conseil") ||
        log.title.toLowerCase().includes("santé") ||
        log.body.toLowerCase().includes("légitimité") ||
        log.body.toLowerCase().includes("crédits privés");

      let category: FeedEvent["category"] = "AI_CHRONICLES";
      if (isThreatRelated) category = "THREATS";
      else if (isLeaderRelated) category = "LEADER";
      else if (log.bookId === "LIV-01" || log.bookId === "LIV-02" || log.bookId === "LIV-03") category = "COLONY";

      let severity: FeedEvent["severity"] = "INFO";
      if (log.degree === "CRITICAL_SUCCESS") severity = "SUCCESS";
      else if (log.degree === "CRITICAL_FAIL" || log.degree === "FAILURE") severity = "WARNING";

      let impact = "";
      if (log.chosenEffectId === "EFF-A") impact = "+3 Bonheur, -1.2k ¢";
      else if (log.chosenEffectId === "EFF-B") impact = "+40t Minerai, +4% Stress";
      else if (log.chosenEffectId === "EFF-C") impact = "-2.5k Cons., +5 Légit.";

      events.push({
        id: `log-${log.turnIndex}-${idx}`,
        turnIndex: log.turnIndex,
        category,
        title: log.title,
        body: log.body,
        timestamp: log.timestamp || `Tour ${log.turnIndex}`,
        origin: log.origin === "MODEL" ? "MODEL" : "FALLBACK",
        badgeLabel: book ? `${log.bookId} • ${book.theme}` : log.bookId,
        iconType: log.rollNatural ? "dice" : log.origin === "MODEL" ? "ai" : "colony",
        severity,
        rollData: log.rollNatural
          ? {
              natural: log.rollNatural,
              total: log.rollTotal,
              degree: log.degree,
            }
          : undefined,
        impactSummary: impact || undefined,
        tags: [log.bookId, log.origin, log.degree || "", "Narration", "Tour"],
      });
    });

    // 2. Historical Canon Facts
    gameState.canon.forEach((c, idx) => {
      events.push({
        id: `canon-${c.turn}-${idx}`,
        turnIndex: c.turn,
        category: "COLONY",
        title: `Jalon Historique — Faits Canoniques`,
        body: c.fact,
        timestamp: `Tour ${c.turn}`,
        origin: "MILESTONE",
        badgeLabel: "Archive Canonique",
        iconType: "milestone",
        severity: "SUCCESS",
        tags: ["Canon", "Histoire", "Fondation"],
      });
    });

    // 3. Colony Foundation Milestone (Always present as primary anchor)
    events.push({
      id: "milestone-foundation-0",
      turnIndex: 0,
      category: "COLONY",
      title: `Fondation de l'Archologie — ${gameState.leader.dynastyName}`,
      body: `Arrivée du module Capsule Hub sur la planète ${gameState.territory.planetId}. 10 colons pionniers ont amorcé l'extraction ISRU et la mise sous tension des piles à combustible primaires.`,
      timestamp: "Tour 0",
      origin: "MILESTONE",
      badgeLabel: "Fondation Initiale",
      iconType: "colony",
      severity: "SUCCESS",
      tags: ["Fondation", "Pionniers", "Origine"],
    });

    // 4. Era Milestone
    const eraData = dbEras.find((e) => e.id === gameState.currentEra);
    if (eraData) {
      events.push({
        id: `milestone-era-${gameState.currentEra}`,
        turnIndex: gameState.turnIndex,
        category: "COLONY",
        title: `Ère Active : ${eraData.name}`,
        body: `L'archologie fonctionne selon le paradigme de l'${eraData.name}. Déblocages : ${eraData.unlocks}. Périmètre respirable actif : ${formatNumber(gameState.territory.hectaresRespirable)} ha.`,
        timestamp: `Tour ${gameState.turnIndex}`,
        origin: "MILESTONE",
        badgeLabel: "Évolution d'Ère",
        iconType: "milestone",
        severity: "INFO",
        tags: ["Ère", "Technologie", "Expansion"],
      });
    }

    // 5. Leader & Governance Life-Sim Milestones
    events.push({
      id: `leader-status-${gameState.turnIndex}`,
      turnIndex: gameState.turnIndex,
      category: "LEADER",
      title: `État Dynastique du Leader : ${gameState.leader.displayName} ${gameState.leader.dynastyName}`,
      body: `Âge : ${gameState.leader.ageYears} ans. Santé : ${gameState.leader.healthPct}% | Stress : ${gameState.leader.stressPct}% | Légitimité : ${gameState.leader.legitimacy}/100. Propriétés personnelles : ${gameState.leader.properties.length} • Équipements : ${gameState.leader.equipment.length}.`,
      timestamp: `Tour ${gameState.turnIndex}`,
      origin: "SIMULATION",
      badgeLabel: "Profil Gouverneur",
      iconType: "leader",
      severity: gameState.leader.stressPct > 60 || gameState.leader.healthPct < 60 ? "WARNING" : "INFO",
      tags: ["Leader", "Dynastie", "Gouvernance", "Santé"],
    });

    // 6. External Threats & Environmental Status
    if (gameState.territory.radiationMsvPerTurn > 0.5 || gameState.territory.seismicRisk > 30) {
      events.push({
        id: `threat-env-${gameState.turnIndex}`,
        turnIndex: gameState.turnIndex,
        category: "THREATS",
        title: "Alerte Environnementale : Rayonnement & Sismicité",
        body: `Les capteurs de surface enregistrent un rayonnement de ${gameState.territory.radiationMsvPerTurn} mSv/tour et un indice sismique de ${gameState.territory.seismicRisk}%. Nécessite le renforcement des boucliers régolithiques.`,
        timestamp: `Tour ${gameState.turnIndex}`,
        origin: "SIMULATION",
        badgeLabel: "Menace Environnementale",
        iconType: "threat",
        severity: "CRITICAL",
        tags: ["Radiation", "Sismicité", "Survie", "Menace"],
      });
    }

    // 7. Sort all events: most recent turn first
    return events.sort((a, b) => b.turnIndex - a.turnIndex);
  }, [gameState]);

  // Filtered by category and search query
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      // Category match
      if (selectedCategory !== "ALL") {
        if (selectedCategory === "COLONY" && ev.category !== "COLONY") return false;
        if (selectedCategory === "THREATS" && ev.category !== "THREATS") return false;
        if (selectedCategory === "LEADER" && ev.category !== "LEADER") return false;
        if (selectedCategory === "AI_CHRONICLES" && ev.category !== "AI_CHRONICLES") return false;
      }

      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesText =
          ev.title.toLowerCase().includes(q) ||
          ev.body.toLowerCase().includes(q) ||
          ev.tags.some((t) => t.toLowerCase().includes(q)) ||
          `tour ${ev.turnIndex}`.includes(q);
        if (!matchesText) return false;
      }

      return true;
    });
  }, [allEvents, selectedCategory, searchQuery]);

  // Category counts
  const counts = useMemo(() => {
    return {
      ALL: allEvents.length,
      COLONY: allEvents.filter((e) => e.category === "COLONY").length,
      THREATS: allEvents.filter((e) => e.category === "THREATS").length,
      LEADER: allEvents.filter((e) => e.category === "LEADER").length,
      AI_CHRONICLES: allEvents.filter((e) => e.category === "AI_CHRONICLES").length,
    };
  }, [allEvents]);

  const handleCardClick = (ev: FeedEvent) => {
    setSelectedEventId(ev.id === selectedEventId ? null : ev.id);
    if (onSelectEvent) onSelectEvent(ev);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-xs space-y-4 font-sans text-slate-800">
      {/* 1. Header & Live Telemetry Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Flux d&apos;Événements & Chroniques
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                {counts.ALL} Événements enregistrés
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Journalisation en temps réel • Double-boucle Micro-Tour &amp; Méta-Gouvernance
            </p>
          </div>
        </div>

        {/* Milestone Quick Badges & Gemini Generator Button */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <button
            id="btn-trigger-gemini-event"
            onClick={() => triggerContextualGeminiEvent()}
            disabled={isGeneratingNarrative}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold transition cursor-pointer shadow-xs border border-indigo-400/30"
            title="Générer un événement narratif sur-mesure basé sur les ressources actuelles"
          >
            {isGeneratingNarrative ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            )}
            <span>{isGeneratingNarrative ? "Analyse Gemini..." : "⚡ Incident Gemini IA"}</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200">
            <Globe2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500">Planète :</span>
            <span className="font-bold text-slate-800">{gameState.territory.planetId}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200">
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-slate-500">Dynastie :</span>
            <span className="font-bold text-slate-800">{gameState.leader.dynastyName}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-500">Tour actuel :</span>
            <span className="font-bold text-blue-700">{gameState.turnIndex}</span>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
          <button
            id="filter-all"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded border font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === "ALL"
                ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Tous ({counts.ALL})</span>
          </button>

          <button
            id="filter-colony"
            onClick={() => setSelectedCategory("COLONY")}
            className={`px-3 py-1.5 rounded border font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === "COLONY"
                ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-3 h-3 text-blue-400" />
            <span>Colonie &amp; Infra ({counts.COLONY})</span>
          </button>

          <button
            id="filter-threats"
            onClick={() => setSelectedCategory("THREATS")}
            className={`px-3 py-1.5 rounded border font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === "THREATS"
                ? "bg-rose-700 border-rose-700 text-white shadow-xs"
                : "bg-slate-50 border-slate-200 text-rose-700 hover:bg-rose-50"
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>Menaces &amp; Crises ({counts.THREATS})</span>
          </button>

          <button
            id="filter-leader"
            onClick={() => setSelectedCategory("LEADER")}
            className={`px-3 py-1.5 rounded border font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === "LEADER"
                ? "bg-amber-600 border-amber-600 text-white shadow-xs"
                : "bg-slate-50 border-slate-200 text-amber-700 hover:bg-amber-50"
            }`}
          >
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Leader &amp; Gouvernance ({counts.LEADER})</span>
          </button>

          <button
            id="filter-ai-chronicles"
            onClick={() => setSelectedCategory("AI_CHRONICLES")}
            className={`px-3 py-1.5 rounded border font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === "AI_CHRONICLES"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                : "bg-slate-50 border-slate-200 text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <Bot className="w-3 h-3 text-indigo-400" />
            <span>Chroniques IA ({counts.AI_CHRONICLES})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      {/* 3. Meta-Narrative Quest Banner (Double-Boucle Roguelike) */}
      <div className="p-3.5 rounded bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-indigo-800/60 border border-indigo-700 text-indigo-300 mt-0.5">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-bold">
                Quête Méta-Narrative Active
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-900 border border-indigo-700 text-amber-300">
                Livre {gameState.currentEra.includes("ERA_1") ? "I" : "II"} • Objectif Majeur
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 mt-0.5">
              Consolidation du Réseau Primaire &amp; Résilience de la Colonie
            </h3>
            <p className="text-[11px] text-slate-300 leading-tight mt-0.5 max-w-2xl">
              Stabilisez l&apos;approvisionnement en énergie et en oxygène pour débloquer le premier palier d&apos;autonomie civique.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Résilience Spirituelle</span>
            <span className="text-amber-400 font-bold text-sm">
              +{Math.min(10, Math.floor(gameState.leader.legitimacy / 10))} pts
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Jauges d&apos;Urgence</span>
            <span className="text-emerald-400 font-bold text-sm">
              {gameState.surgeGauge}/5
            </span>
          </div>
        </div>
      </div>

      {/* 4. Event Feed Stream List */}
      <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded p-6">
            <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
            <p className="text-xs font-semibold">Aucun événement ne correspond aux filtres sélectionnés.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Modifiez vos termes de recherche ou sélectionnez une autre catégorie d&apos;événements.
            </p>
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const isExpanded = selectedEventId === ev.id;
            return (
              <div
                key={ev.id}
                id={`event-item-${ev.id}`}
                onClick={() => handleCardClick(ev)}
                className={`p-3.5 rounded border transition cursor-pointer text-left ${
                  isExpanded
                    ? "bg-blue-50/70 border-blue-400 ring-1 ring-blue-400/40 shadow-xs"
                    : ev.severity === "CRITICAL"
                    ? "bg-rose-50/50 border-rose-200 hover:border-rose-300"
                    : ev.severity === "WARNING"
                    ? "bg-amber-50/40 border-amber-200 hover:border-amber-300"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {/* Top metadata row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Category Icon */}
                    <div
                      className={`p-1.5 rounded border shrink-0 ${
                        ev.category === "THREATS"
                          ? "bg-rose-100 border-rose-300 text-rose-700"
                          : ev.category === "LEADER"
                          ? "bg-amber-100 border-amber-300 text-amber-700"
                          : ev.category === "AI_CHRONICLES"
                          ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                          : "bg-blue-100 border-blue-300 text-blue-700"
                      }`}
                    >
                      {ev.category === "THREATS" ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : ev.category === "LEADER" ? (
                        <Crown className="w-3.5 h-3.5" />
                      ) : ev.category === "AI_CHRONICLES" ? (
                        <Bot className="w-3.5 h-3.5" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Turn & Badge */}
                    <span className="text-[11px] font-mono font-bold text-slate-700">
                      Tour {ev.turnIndex}
                    </span>
                    {ev.badgeLabel && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
                        {ev.badgeLabel}
                      </span>
                    )}

                    {/* Origin Badge */}
                    {ev.origin === "MODEL" && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Gemini IA
                      </span>
                    )}
                    {ev.origin === "MILESTONE" && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center gap-1">
                        <Award className="w-2.5 h-2.5" />
                        Jalon
                      </span>
                    )}
                  </div>

                  {/* D20 or Severity Badge */}
                  <div className="flex items-center gap-2">
                    {ev.rollData && (
                      <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-bold">
                        <Dices className="w-3 h-3 text-amber-600" />
                        <span>
                          D20: {ev.rollData.natural} ({ev.rollData.degree})
                        </span>
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 font-mono">{ev.timestamp}</span>

                    {/* Grand Écran Zoom Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedEvent(ev);
                      }}
                      className="p-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-700 transition cursor-pointer border border-slate-200"
                      title="Zoom grand écran de cet événement"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                  {ev.title}
                </h4>

                {/* Body description */}
                <p className={`text-xs text-slate-600 leading-relaxed font-serif ${isExpanded ? "" : "line-clamp-2"}`}>
                  {ev.body}
                </p>

                {/* Extra Details / Impacts if expanded or present */}
                {(ev.impactSummary || ev.tags.length > 0) && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1">
                      {ev.tags.map((t, tidx) => (
                        <span
                          key={tidx}
                          className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-50 border border-slate-200 text-slate-500"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Impact summary */}
                    {ev.impactSummary && (
                      <div className="text-[10px] font-mono font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Impact : {ev.impactSummary}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Fullscreen Event Zoom Modal */}
      {zoomedEvent && (
        <EventDetailModal
          event={zoomedEvent}
          gameState={gameState}
          onClose={() => setZoomedEvent(null)}
        />
      )}
    </div>
  );
};
