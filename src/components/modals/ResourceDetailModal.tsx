"use client";

import React from "react";
import {
  X,
  Zap,
  Boxes,
  Apple,
  Coins,
  FlaskConical,
  Flame,
  Shield,
  Building2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  HardDrive,
  Info,
  Sun,
  Wind
} from "lucide-react";
import { State4XPayload } from "../../types/state";
import dbBuildings from "../../data/db_buildings.json";
import dbPlanets from "../../data/db_planets.json";

export type ResourceTypeId =
  | "ENERGY"
  | "ORE"
  | "REFINED_ORE"
  | "TREASURY"
  | "RESEARCH"
  | "FOOD"
  | "STORAGE";

interface ResourceDetailModalProps {
  resourceId: ResourceTypeId | null;
  gameState: State4XPayload | null;
  onClose: () => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resourceId,
  gameState,
  onClose,
}) => {
  if (!resourceId || !gameState) return null;

  const currentPlanet = dbPlanets.find((p) => p.id === gameState.territory.planetId) || dbPlanets[0];

  // Helper resource metadata
  const getResourceMeta = () => {
    switch (resourceId) {
      case "ENERGY":
        return {
          title: "Réseau Énergétique MW",
          icon: Zap,
          color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
          currentStock: gameState.economy.netEnergyMW,
          maxCapacity: 5000,
          unit: "MW",
          description: "Puissance électrique instantanée générée par les centrales à fusion, solaires et géothermiques pour maintenir l'archologie sous tension."
        };
      case "ORE":
        return {
          title: "Minerai Brut ISRU",
          icon: Boxes,
          color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
          currentStock: gameState.economy.storedOreTons || 120,
          maxCapacity: gameState.economy.storageCapacityTons || 1000,
          unit: "tonnes",
          description: "Ressources rocheuses et régolithes extraits des strates pour le raffinage et la construction navale."
        };
      case "REFINED_ORE":
        return {
          title: "Métaux & Alliages Raffinés",
          icon: Flame,
          color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
          currentStock: Math.floor((gameState.economy.storedOreTons || 120) * 0.4),
          maxCapacity: Math.floor((gameState.economy.storageCapacityTons || 1000) * 0.5),
          unit: "tonnes",
          description: "Alliages structuraux de haute densité purifiés par les fonderies à induction plasma."
        };
      case "TREASURY":
        return {
          title: "Trésorerie Coloniale",
          icon: Coins,
          color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
          currentStock: gameState.economy.colonyTreasury,
          maxCapacity: 100000,
          unit: "¢",
          description: "Fonds publics de la colonie tirés des taxes et subventions du Consortium pour financer les décrets et infrastructures."
        };
      case "RESEARCH":
        return {
          title: "Points de Recherche Tech",
          icon: FlaskConical,
          color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
          currentStock: gameState.research.points,
          maxCapacity: 10000,
          unit: "pts",
          description: "Capital scientifique accumulé par les laboratoires d'IA et d'analyse moléculaire pour débloquer l'Arbre Technologique."
        };
      case "FOOD":
        return {
          title: "Rations & Culture Hydroponique",
          icon: Apple,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
          currentStock: Math.floor(gameState.demographics.popTotal * 12),
          maxCapacity: 50000,
          unit: "rations",
          description: "Substances nutritives et biomatériaux produits par les coupoles agricoles et serres aéroponiques."
        };
      case "STORAGE":
        return {
          title: "Capacité de Stockage Globale",
          icon: HardDrive,
          color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
          currentStock: gameState.economy.storedOreTons || 120,
          maxCapacity: gameState.economy.storageCapacityTons || 1000,
          unit: "t max",
          description: "Volume total sécurisé dans les entrepôts sous pression et silos souterrains régolithiques."
        };
    }
  };

  const meta = getResourceMeta();
  const IconComponent = meta.icon;

  // Calculate building production/consumption breakdown
  const activeCells = gameState.territory.cells.filter((c) => c.buildingId);
  const activeBuildingCounts: Record<string, number> = {};
  activeCells.forEach((c) => {
    if (c.buildingId) {
      activeBuildingCounts[c.buildingId] = (activeBuildingCounts[c.buildingId] || 0) + 1;
    }
  });

  const activeBuildingList = dbBuildings.map((b) => {
    const count = activeBuildingCounts[b.id] || 0;
    const isActive = count > 0;
    const tierNum = parseInt(b.tier.replace("T", ""), 10) || 1;
    return {
      building: b,
      count,
      isActive,
      // Calculate output estimate
      estimatedOutput: count * (tierNum * 25)
    };
  });

  const activeBuildings = activeBuildingList.filter((item) => item.isActive);
  const inactiveBuildings = activeBuildingList.filter((item) => !item.isActive);

  // Climate / Weather Modifiers based on current planet
  const weatherModifiers = [
    {
      name: `Météo Planétaire : ${currentPlanet.atmosphere || "Atmosphère Standard"}`,
      effect: currentPlanet.meanTempC > 100 ? "-20% Rendement Énergétique (Surchauffe Thermal)" : "+15% Captation Solaire",
      type: currentPlanet.meanTempC > 100 ? "MALUS" : "BONUS"
    },
    {
      name: `Moteur Physique : Gravité ${currentPlanet.gravityG}g`,
      effect: currentPlanet.gravityG > 1.2 ? "-10% Rendement Transport ISRU" : "+10% Stabilité des Silos",
      type: currentPlanet.gravityG > 1.2 ? "MALUS" : "BONUS"
    },
    {
      name: `Activité Géologique (${Math.round((currentPlanet.geoActivity || 0.5) * 100)}%)`,
      effect: (currentPlanet.geoActivity || 0.5) > 0.6 ? "+40% Énergie Géothermique" : "Stabilité Sismique Nominale",
      type: "BONUS"
    }
  ];

  const fillPct = Math.min(100, Math.round((meta.currentStock / meta.maxCapacity) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sans select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${meta.color}`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold uppercase">
                  Détails Ressource F-22
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Planète : {gameState.territory.planetId}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wide mt-0.5">
                {meta.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          
          {/* 1. Storage & Capacity Gauge */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-slate-300" />
                Niveau du Stock &amp; Capacité Maximale
              </span>
              <span className="font-bold text-white text-sm">
                {meta.currentStock.toLocaleString()} / {meta.maxCapacity.toLocaleString()} {meta.unit} ({fillPct}%)
              </span>
            </div>

            {/* Storage Progress Bar */}
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  fillPct > 90
                    ? "bg-rose-500"
                    : fillPct > 70
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
                style={{ width: `${Math.max(4, fillPct)}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 font-serif leading-relaxed">
              {meta.description}
            </p>
          </div>

          {/* 2. Active Buildings Production Breakdown */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              Bâtiments Actifs Producteurs / Consommateurs ({activeBuildings.length})
            </h3>

            {activeBuildings.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-slate-400 text-xs font-mono">
                Aucun bâtiment n&apos;est actuellement déployé sur la grille territoriale.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                {activeBuildings.map((item) => (
                  <div
                    key={item.building.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-xs">{item.building.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.count} unité(s) active(s) • Tier {item.building.tier}
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400 text-xs">
                      +{item.estimatedOutput} / tour
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Inactive Buildings List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Bâtiments Inactifs ou Non-Constructeurs ({inactiveBuildings.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs max-h-36 overflow-y-auto pr-1">
              {inactiveBuildings.slice(0, 6).map((item) => (
                <div
                  key={item.building.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-400 flex items-center justify-between"
                >
                  <span className="text-[11px] truncate">{item.building.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500">
                    Non construit
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Bonus & Malus Modifiers (Météo, Physique & Factions) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Bonus &amp; Malus Environnementaux &amp; Factions
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {weatherModifiers.map((mod, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    mod.type === "BONUS"
                      ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-300"
                      : "bg-rose-950/30 border-rose-800/50 text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{mod.name}</span>
                  </div>
                  <span className="font-bold">{mod.effect}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 shrink-0 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-slate-700"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
