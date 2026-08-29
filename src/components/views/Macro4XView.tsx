"use client";

import React, { useState } from "react";
import { useEngineStore } from "../../store/useEngineStore";
import {
  Map,
  Layers,
  Zap,
  FlaskConical,
  Users,
  Play,
  TrendingUp,
  Building2,
  Filter,
  CheckCircle,
  Globe,
  Sliders,
  RotateCw,
  Flame,
  Activity,
  Coins,
  Sparkles,
  HelpCircle,
  Eye,
  BarChart2,
  Bot,
  Grid,
  List,
  Lock,
  Plus,
  Search,
  Check,
  Cpu
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import dbBuildings from "../../data/db_buildings.json";
import dbResearch from "../../data/db_research.json";
import dbUtilities from "../../data/db_utilities.json";
import dbPlanets from "../../data/db_planets.json";
import { formatNumber } from "../../lib/formatters";

export const Macro4XView: React.FC = () => {
  const {
    gameState,
    selectedCellId,
    setSelectedCellId,
    openBottomSheet,
    queueManualAction,
    simulationSeries,
    isFastSimulating,
    runFastSimulation,
    niaConfig,
    setNiaConfig,
    runNiaCycle,
    niaLogs
  } = useEngineStore();

  const [activeUtilityFilter, setActiveUtilityFilter] = useState<string>("ALL");
  const [fastSimTurns, setFastSimTurns] = useState<number>(20);
  const [mapDisplayMode, setMapDisplayMode] = useState<"ZONING" | "HEATMAP">("ZONING");
  const [viewLayout, setViewLayout] = useState<"GRID" | "LIST">("GRID");
  const [buildingSearchQuery, setBuildingSearchQuery] = useState<string>("");
  const [selectedBuildingCategory, setSelectedBuildingCategory] = useState<string>("ALL");

  if (!gameState) return null;

  const territory = gameState.territory;
  const demographics = gameState.demographics;
  const research = gameState.research;
  const currentEra = gameState.currentEra;

  const systemPlanets = dbPlanets;

  // Compute Era Unlocked Grid Radius
  let maxUnboundRadius = 2; // Era 1: 5x5 centered (x: 5..9, y: 5..9)
  if (currentEra.includes("ERA_2") || currentEra.includes("ERA 2")) maxUnboundRadius = 3; // 7x7
  else if (currentEra.includes("ERA_3") || currentEra.includes("ERA 3")) maxUnboundRadius = 4; // 9x9
  else if (currentEra.includes("ERA_4") || currentEra.includes("ERA 4")) maxUnboundRadius = 5; // 11x11
  else if (currentEra.includes("ERA_5") || currentEra.includes("ERA_6") || currentEra.includes("ERA_7")) maxUnboundRadius = 7; // 14x14 Full

  const handleCellClick = (cellId: string) => {
    setSelectedCellId(cellId);
    openBottomSheet("BUILDING_INSPECTOR");
  };

  const handleRunSim = () => {
    runFastSimulation(fastSimTurns);
  };

  const handleConstructOnFirstAvailable = (buildingId: string) => {
    const freeCell = territory.cells.find((c) => {
      const dx = Math.abs(c.x - 7);
      const dy = Math.abs(c.y - 7);
      return c.viable && c.buildingId === null && dx <= maxUnboundRadius && dy <= maxUnboundRadius;
    });

    if (!freeCell) {
      alert("Aucune parcelle débloquée disponible sur la grille ! Débloquez l'ère suivante.");
      return;
    }

    const bld = dbBuildings.find((b) => b.id === buildingId);
    if (!bld) return;

    if (gameState.economy.colonyTreasury < bld.cost) {
      alert(`Trésorerie insuffisante ! Coût : ${bld.cost} ¢, Disponible : ${gameState.economy.colonyTreasury} ¢`);
      return;
    }

    const zoning =
      bld.category === "Énergie"
        ? "ENERGY"
        : bld.category === "Habitat"
        ? "RESIDENTIAL"
        : bld.category === "Civique"
        ? "CIVIC"
        : bld.category === "Bio"
        ? "AGRI"
        : "INDUSTRIAL";

    queueManualAction({
      type: "START_BUILDING",
      cellId: freeCell.id,
      buildingId: bld.id
    });
  };

  const buildingCategories = Array.from(new Set(dbBuildings.map((b) => b.category)));

  const filteredBuildings = dbBuildings.filter((b) => {
    const matchesCategory = selectedBuildingCategory === "ALL" || b.category === selectedBuildingCategory;
    const matchesSearch =
      b.name.toLowerCase().includes(buildingSearchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(buildingSearchQuery.toLowerCase()) ||
      b.effect.toLowerCase().includes(buildingSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 space-y-4">
      {/* N.I.A Auto-Governor Control Widget */}
      <section className="bg-slate-900 border border-slate-700 rounded-md p-4 text-slate-100 space-y-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  N.I.A — Intelligence Artificielle Coloniale
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-bold">
                  {niaConfig.mode === "AUTO" ? "AUTOMATIQUE" : niaConfig.mode === "MANUAL" ? "MANUEL" : "DÉSACTIVÉ"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Gère et déploie automatiquement les infrastructures selon le budget disponible et les priorités de la colonie.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runNiaCycle()}
              disabled={niaConfig.mode === "OFF"}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Cpu className="w-3.5 h-3.5" />
              Lancer Cycle N.I.A
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs font-mono">
          <div className="space-y-1 bg-slate-800/60 p-2.5 rounded border border-slate-700/80">
            <span className="text-slate-400 font-semibold text-[10px] block uppercase">Mode de Gestion N.I.A</span>
            <div className="grid grid-cols-3 gap-1">
              {(["OFF", "MANUAL", "AUTO"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setNiaConfig({ mode })}
                  className={`py-1 rounded font-bold text-[10px] transition cursor-pointer ${
                    niaConfig.mode === mode
                      ? mode === "AUTO"
                        ? "bg-emerald-600 text-white"
                        : mode === "MANUAL"
                        ? "bg-amber-600 text-white"
                        : "bg-slate-700 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 bg-slate-800/60 p-2.5 rounded border border-slate-700/80">
            <span className="text-slate-400 font-semibold text-[10px] block uppercase">Priorité Sectorielle</span>
            <select
              value={niaConfig.priority}
              onChange={(e) => setNiaConfig({ priority: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded p-1.5 font-mono"
            >
              <option value="BALANCED">Équilibré (Besoins Vitaux)</option>
              <option value="ENERGY">Focus Énergie (Réacteurs)</option>
              <option value="HOUSING">Focus Logements (Capacité Habitat)</option>
              <option value="INDUSTRY">Focus Industrie & ISRU</option>
              <option value="SCIENCE">Focus R&D & Calculators</option>
            </select>
          </div>

          <div className="space-y-1 bg-slate-800/60 p-2.5 rounded border border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold text-[10px] uppercase">Budget Max / Cycle</span>
              <span className="text-yellow-400 font-bold">{formatNumber(niaConfig.maxBudgetPerTurn)} ¢</span>
            </div>
            <input
              type="range"
              min={1000}
              max={100000}
              step={2000}
              value={niaConfig.maxBudgetPerTurn}
              onChange={(e) => setNiaConfig({ maxBudgetPerTurn: Number(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Auto-Build AI Planets Selection */}
        {systemPlanets.length > 0 && (
          <div className="bg-slate-800/40 p-3 rounded border border-slate-700/60 space-y-2 text-xs">
            <span className="text-slate-400 font-semibold text-[10px] uppercase block tracking-wider font-mono">
              {"🚀 Activer l'Auto-Build AI pour les Planètes du Système :"}
            </span>
            <div className="flex flex-wrap gap-2.5">
              {systemPlanets.map((p) => {
                const isEnabled = niaConfig.autoBuildPlanets?.[p.id] ?? false;
                const isActive = p.id === territory.planetId;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      const updated = {
                        ...niaConfig.autoBuildPlanets,
                        [p.id]: !isEnabled
                      };
                      setNiaConfig({ autoBuildPlanets: updated });
                    }}
                    className={`px-3 py-1.5 rounded border text-[11px] font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
                      isEnabled
                        ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 hover:bg-emerald-600/30 shadow-xs"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {isEnabled ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-600" />
                    )}
                    <span>
                      {p.name} {isActive ? "📍" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Auto-Build AI Surplus Priority Thresholds Configuration */}
        <div className="bg-slate-800/20 border border-slate-800 rounded p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider font-mono">
              {"📊 Règles de Priorisation de l'Auto-Build AI (Seuils des Surplus)"}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">
              {"Définit quand l'IA priorise chaque secteur"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px] font-mono">
            {/* Energy threshold */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Énergie Min. :</span>
                <span className="text-emerald-400 font-bold">{niaConfig.autoBuildRules?.energyThresholdMw ?? 10} MW</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={niaConfig.autoBuildRules?.energyThresholdMw ?? 10}
                onChange={(e) => {
                  setNiaConfig({
                    autoBuildRules: {
                      ...niaConfig.autoBuildRules,
                      energyThresholdMw: Number(e.target.value)
                    }
                  });
                }}
                className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none"
              />
            </div>

            {/* Housing buffer ratio */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Tampon Hab. :</span>
                <span className="text-emerald-400 font-bold">{Math.round((niaConfig.autoBuildRules?.housingBufferRatio ?? 0.15) * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.5}
                step={0.05}
                value={niaConfig.autoBuildRules?.housingBufferRatio ?? 0.15}
                onChange={(e) => {
                  setNiaConfig({
                    autoBuildRules: {
                      ...niaConfig.autoBuildRules,
                      housingBufferRatio: Number(e.target.value)
                    }
                  });
                }}
                className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none"
              />
            </div>

            {/* Min ore reserve */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Réserve Minerai :</span>
                <span className="text-emerald-400 font-bold">{niaConfig.autoBuildRules?.minOreReserve ?? 150} t</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={25}
                value={niaConfig.autoBuildRules?.minOreReserve ?? 150}
                onChange={(e) => {
                  setNiaConfig({
                    autoBuildRules: {
                      ...niaConfig.autoBuildRules,
                      minOreReserve: Number(e.target.value)
                    }
                  });
                }}
                className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none"
              />
            </div>

            {/* Science points target */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Target Points R&D :</span>
                <span className="text-emerald-400 font-bold">{niaConfig.autoBuildRules?.sciencePointsTarget ?? 20} pts</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={niaConfig.autoBuildRules?.sciencePointsTarget ?? 20}
                onChange={(e) => {
                  setNiaConfig({
                    autoBuildRules: {
                      ...niaConfig.autoBuildRules,
                      sciencePointsTarget: Number(e.target.value)
                    }
                  });
                }}
                className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none"
              />
            </div>
          </div>
        </div>

        {/* N.I.A Live Logs Feed */}
        {niaLogs.length > 0 && (
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[10px] text-blue-300 space-y-1 max-h-20 overflow-y-auto">
            {niaLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="text-slate-500">•</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 1. Territory View Main Card */}
      <section className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Territoire & Colonie de Surface</h2>
              <span className="text-[11px] text-slate-500 font-mono">
                {territory.hectaresUsed} / {territory.hectaresRespirable} ha viabilisés • Ère active :{" "}
                <strong className="text-blue-600 font-bold">{currentEra}</strong>
              </span>
            </div>
          </div>

          {/* View Switcher (Grid vs List View) & Filters */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
            <div className="flex items-center p-0.5 rounded bg-slate-100 border border-slate-200 mr-1">
              <button
                id="btn-layout-grid"
                onClick={() => setViewLayout("GRID")}
                className={`px-2.5 py-1 rounded font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewLayout === "GRID"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Grille Sub-surface
              </button>
              <button
                id="btn-layout-list"
                onClick={() => setViewLayout("LIST")}
                className={`px-2.5 py-1 rounded font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewLayout === "LIST"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Magasin par Catégories ({dbBuildings.length})
              </button>
            </div>

            {viewLayout === "GRID" && (
              <>
                <div className="flex items-center p-0.5 rounded bg-slate-100 border border-slate-200">
                  <button
                    onClick={() => setMapDisplayMode("ZONING")}
                    className={`px-2 py-1 rounded font-bold transition cursor-pointer flex items-center gap-1 ${
                      mapDisplayMode === "ZONING" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    <Eye className="w-3 h-3" /> Zonage
                  </button>
                  <button
                    onClick={() => setMapDisplayMode("HEATMAP")}
                    className={`px-2 py-1 rounded font-bold transition cursor-pointer flex items-center gap-1 ${
                      mapDisplayMode === "HEATMAP" ? "bg-rose-600 text-white shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    <Flame className="w-3 h-3" /> Heatmap
                  </button>
                </div>

                <span className="text-slate-500 flex items-center gap-1 font-semibold">
                  <Filter className="w-3 h-3" /> Réseau :
                </span>
                <button
                  onClick={() => setActiveUtilityFilter("ALL")}
                  className={`px-2 py-0.5 rounded border font-semibold transition cursor-pointer ${
                    activeUtilityFilter === "ALL"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Tous
                </button>
              </>
            )}
          </div>
        </div>

        {/* View Layout 1: Dynamic Grid View */}
        {viewLayout === "GRID" ? (
          <>
            <div className="bg-slate-100 p-3 sm:p-4 rounded border border-slate-200 overflow-x-auto flex justify-center">
              <div className="grid grid-cols-14 gap-1 sm:gap-1.5 p-1.5 bg-slate-200/80 rounded border border-slate-300">
                {territory.cells.map((cell) => {
                  const building = cell.buildingId ? dbBuildings.find((b) => b.id === cell.buildingId) : null;
                  const isSelected = selectedCellId === cell.id;
                  const matchesFilter =
                    activeUtilityFilter === "ALL" || cell.utilitiesServed.includes(activeUtilityFilter as any);

                  // Era-bound check
                  const dx = Math.abs(cell.x - 7);
                  const dy = Math.abs(cell.y - 7);
                  const isUnlockedByEra = dx <= maxUnboundRadius && dy <= maxUnboundRadius;

                  let cellPop = 0;
                  if (cell.zoning === "RESIDENTIAL") cellPop = building ? 450 : 120;
                  else if (cell.zoning === "CIVIC") cellPop = building ? 300 : 80;
                  else if (cell.zoning === "INDUSTRIAL") cellPop = building ? 180 : 40;
                  else if (building) cellPop = 90;

                  let bgColor = "bg-white border-slate-300 text-slate-700 hover:bg-slate-50";

                  if (!isUnlockedByEra) {
                    bgColor = "bg-slate-300/60 border-slate-400 text-slate-400 opacity-40 cursor-not-allowed";
                  } else if (mapDisplayMode === "HEATMAP") {
                    if (cellPop >= 400) bgColor = "bg-rose-500 border-rose-600 text-white font-bold shadow-xs";
                    else if (cellPop >= 250) bgColor = "bg-purple-400 border-purple-500 text-white font-semibold";
                    else if (cellPop >= 150) bgColor = "bg-indigo-300 border-indigo-400 text-indigo-950 font-semibold";
                    else if (cellPop >= 50) bgColor = "bg-sky-200 border-sky-300 text-sky-900";
                    else bgColor = "bg-slate-100 border-slate-200 text-slate-400";
                  } else {
                    if (cell.zoning === "CIVIC") bgColor = "bg-purple-100 border-purple-300 text-purple-800";
                    else if (cell.zoning === "RESIDENTIAL") bgColor = "bg-blue-100 border-blue-300 text-blue-800";
                    else if (cell.zoning === "INDUSTRIAL") bgColor = "bg-amber-100 border-amber-300 text-amber-800";
                    else if (cell.zoning === "AGRI") bgColor = "bg-emerald-100 border-emerald-300 text-emerald-800";
                    else if (cell.zoning === "ENERGY") bgColor = "bg-yellow-100 border-yellow-300 text-yellow-800";
                  }

                  return (
                    <button
                      key={cell.id}
                      id={`cell-btn-${cell.id}`}
                      disabled={!isUnlockedByEra}
                      onClick={() => isUnlockedByEra && handleCellClick(cell.id)}
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-[3px] border transition-all flex flex-col items-center justify-center text-[9px] font-mono relative shadow-2xs ${bgColor} ${
                        isSelected ? "ring-2 ring-blue-600 ring-offset-1 z-10" : ""
                      } ${!matchesFilter ? "opacity-30" : ""}`}
                      title={
                        !isUnlockedByEra
                          ? `Parcelle (${cell.x}, ${cell.y}) — Verrouillée (Nécessite Ère supérieure)`
                          : mapDisplayMode === "HEATMAP"
                          ? `Parcelle (${cell.x}, ${cell.y}) - Densité : ${cellPop} colons/ha`
                          : `Parcelle (${cell.x}, ${cell.y}) - ${building ? building.name : "Terrain Vierge"}`
                      }
                    >
                      {!isUnlockedByEra ? (
                        <Lock className="w-2.5 h-2.5 text-slate-500" />
                      ) : mapDisplayMode === "HEATMAP" ? (
                        <span className="font-bold text-[8px] sm:text-[9px]">
                          {cellPop > 0 ? (cellPop > 999 ? `${(cellPop / 1000).toFixed(1)}k` : cellPop) : "•"}
                        </span>
                      ) : building ? (
                        <span className="font-bold uppercase scale-75 sm:scale-90">{building.category.charAt(0)}</span>
                      ) : (
                        <span className="text-slate-400 text-[8px]">•</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid legend */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-mono bg-slate-50 p-2.5 rounded border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">Taille de Grille selon l&apos;Ère :</span>
                <span className="text-blue-600 font-bold">{maxUnboundRadius * 2 + 1} x {maxUnboundRadius * 2 + 1} parcelles débloquées</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-slate-500">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Verrouillé par l&apos;Ère</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* View Layout 2: Categorized Building Store & Purchase View */
          <div className="space-y-4">
            {/* Filter Pills & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedBuildingCategory("ALL")}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                    selectedBuildingCategory === "ALL"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Tous ({dbBuildings.length})
                </button>
                {buildingCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedBuildingCategory(cat)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                      selectedBuildingCategory === cat
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher un bâtiment..."
                  value={buildingSearchQuery}
                  onChange={(e) => setBuildingSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-3 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Buildings Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredBuildings.map((bld) => {
                const isAffordable = gameState.economy.colonyTreasury >= bld.cost;

                return (
                  <div
                    key={bld.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition space-y-2 flex flex-col justify-between shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                            {bld.category} • {bld.tier}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{bld.name}</h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 whitespace-nowrap">
                          {formatNumber(bld.cost)} ¢
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">{bld.effect}</p>

                      <div className="flex flex-wrap gap-1 pt-1 text-[10px] font-mono text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                          Maint. : {bld.maintenance} ¢/t
                        </span>
                        {bld.energyGenMw && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                            +{bld.energyGenMw} MW
                          </span>
                        )}
                        {bld.capacity && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                            +{formatNumber(bld.capacity)} hab.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">Ère min : {bld.minEra}</span>

                      <button
                        onClick={() => handleConstructOnFirstAvailable(bld.id)}
                        disabled={!isAffordable}
                        className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Construire</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2. Research Tree & Demographics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Research Matrix */}
        <section className="bg-white border border-slate-200 rounded-md p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-purple-600" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Matrice de Recherche R&D</h3>
                <span className="text-[11px] text-slate-500 font-mono">{research.points} points disponibles</span>
              </div>
            </div>
            <button
              onClick={() => openBottomSheet("TECH_TREE")}
              className="text-[11px] font-mono font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded transition cursor-pointer"
            >
              Arbre Complet (32) →
            </button>
          </div>

          {/* 4 Branches allocation sliders */}
          <div className="space-y-2 font-mono text-xs">
            {(["A", "B", "C", "D"] as const).map((branch) => {
              const labels = {
                A: "Branche A : Matériaux & ISRU",
                B: "Branche B : Énergie & Fusion",
                C: "Branche C : Biosphère & Terraformation",
                D: "Branche D : Cognition & IA"
              };
              const pct = research.allocationPct[branch];
              return (
                <div key={branch} className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-semibold text-[11px]">{labels[branch]}</span>
                    <span className="text-blue-600 font-bold text-[11px]">{pct}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={pct}
                    onChange={(e) => {
                      const newAlloc = { ...research.allocationPct, [branch]: Number(e.target.value) };
                      queueManualAction({ type: "SET_RD_ALLOCATION", allocation: newAlloc });
                    }}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Demographics & Workforce Tiers */}
        <section className="bg-white border border-slate-200 rounded-md p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Structure Démographique & Tiers</h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {formatNumber(demographics.popTotal)} colons • Bonheur {demographics.happinessIndex}/100
                </span>
              </div>
            </div>
          </div>

          {/* T0 to T3 Workforce Breakdown */}
          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-slate-500 text-[10px] block font-semibold uppercase">T0 — Ouvriers / Extraction</span>
              <span className="text-base font-bold text-slate-800">{formatNumber(demographics.tiers.t0)}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-slate-500 text-[10px] block font-semibold uppercase">T1 — Techniciens / Usines</span>
              <span className="text-base font-bold text-slate-800">{formatNumber(demographics.tiers.t1)}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-slate-500 text-[10px] block font-semibold uppercase">T2 — Ingénieurs / Santé</span>
              <span className="text-base font-bold text-slate-800">{formatNumber(demographics.tiers.t2)}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-slate-500 text-[10px] block font-semibold uppercase">T3 — Chercheurs / IA</span>
              <span className="text-base font-bold text-slate-800">{formatNumber(demographics.tiers.t3)}</span>
            </div>
          </div>

          {/* Immigration Quota Control */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-700 font-semibold">Quota d&apos;Immigration / Tour</span>
              <span className="text-blue-600 font-bold">{demographics.immigrationQuota} colons</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={demographics.immigrationQuota}
              onChange={(e) => queueManualAction({ type: "SET_IMMIGRATION_QUOTA", quota: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </section>
      </div>

      {/* 3. Fast Simulation Lab (10 to 100 turns projection) */}
      <section className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Laboratoire de Projection Déterministe (Fast-Sim)</h3>
              <p className="text-[11px] text-slate-500">
                Simule N tours à l&apos;avance sans appel réseau pour évaluer les courbes de viabilité.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={fastSimTurns}
              onChange={(e) => setFastSimTurns(Number(e.target.value))}
              className="bg-white border border-slate-300 text-slate-800 text-xs rounded p-1.5 font-mono"
            >
              <option value={10}>10 Tours</option>
              <option value={20}>20 Tours</option>
              <option value={50}>50 Tours</option>
              <option value={100}>100 Tours</option>
            </select>

            <button
              id="btn-run-fast-sim"
              onClick={handleRunSim}
              disabled={isFastSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs uppercase font-mono transition cursor-pointer shadow-xs"
            >
              <Play className="w-3 h-3" />
              <span>Calculer Projection</span>
            </button>
          </div>
        </div>

        {/* Chart View */}
        {simulationSeries ? (
          <div className="h-64 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulationSeries.points}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="turn" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", color: "#1e293b", fontSize: "11px", borderRadius: "4px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                <Line type="monotone" dataKey="popTotal" name="Population" stroke="#0284c7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="netEnergyMW" name="Énergie (MW)" stroke="#d97706" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="terraformPct" name="Terraform (%)" stroke="#059669" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="happiness" name="Bonheur" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 font-mono text-[11px]">
            Sélectionnez un horizon de projection et cliquez sur &quot;Calculer Projection&quot;.
          </div>
        )}
      </section>
    </div>
  );
};
