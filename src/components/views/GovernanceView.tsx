"use client";

import React, { useState } from "react";
import { useEngineStore } from "../../store/useEngineStore";
import {
  Crown,
  Heart,
  Activity,
  Coins,
  Shield,
  Award,
  BookMarked,
  Sparkles,
  Users,
  MessageSquare,
  ArrowRightLeft,
  AlertTriangle,
  Scale,
  Plus,
  Rocket,
  Compass,
  Zap,
  Cpu,
  Boxes
} from "lucide-react";
import dbDiets from "../../data/db_diets.json";
import dbActivities from "../../data/db_activities.json";
import dbEquipment from "../../data/db_equipment.json";
import dbProperties from "../../data/db_properties.json";
import dbDecrees from "../../data/db_decrees.json";
import { formatNumber } from "../../lib/formatters";

export const GovernanceView: React.FC = () => {
  const { gameState, queueManualAction, openBottomSheet } = useEngineStore();

  const [activeSubTab, setActiveSubTab] = useState<"DECREES" | "FACTIONS" | "ARCHE" | "FINANCE">("DECREES");
  const [transferFrom, setTransferFrom] = useState<"TREASURY" | "CONSORTIUM" | "PRIVATE">("TREASURY");
  const [transferTo, setTransferTo] = useState<"TREASURY" | "CONSORTIUM" | "PRIVATE">("CONSORTIUM");
  const [transferAmount, setTransferAmount] = useState<number>(5000);
  const [transferWarning, setTransferWarning] = useState<string | null>(null);

  if (!gameState) return null;

  const leader = gameState.leader;
  const economy = gameState.economy;

  const handleTransfer = () => {
    setTransferWarning(null);
    if (transferFrom === transferTo) {
      setTransferWarning("Les devises source et cible doivent être différentes.");
      return;
    }
    if (transferFrom === "CONSORTIUM" && transferTo === "PRIVATE") {
      setTransferWarning("Transfert Consortium vers Privé STRICTEMENT INTERDIT par la Charte Coloniale.");
      return;
    }

    queueManualAction({
      type: "CONVERT_CURRENCY",
      from: transferFrom,
      to: transferTo,
      amount: transferAmount
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 space-y-4">
      {/* Top Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-600" />
          <h1 className="text-sm sm:text-base font-bold text-slate-900">Gouvernance & Haute Administration</h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab("DECREES")}
            className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "DECREES"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Conseil & Décrets
          </button>
          <button
            onClick={() => setActiveSubTab("FACTIONS")}
            className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "FACTIONS"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Factions & Diplomatie
          </button>
          <button
            onClick={() => setActiveSubTab("ARCHE")}
            className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "ARCHE"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            Arche Stellaire & Flotte
          </button>
          <button
            onClick={() => setActiveSubTab("FINANCE")}
            className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "FINANCE"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Console Financière
          </button>
        </div>
      </div>

      {/* 1. Leader Dossier & Lifestyle Header */}
      <section className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl font-mono shadow-xs border border-blue-400/30">
              {leader.displayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-blue-700 uppercase">
                  Dynastie {leader.dynastyName}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-[11px] text-slate-500 font-mono font-semibold">{leader.ageYears} ans</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">{leader.displayName}</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Dirigeant(e) suprême de l&apos;archologie de frontière</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-center">
              <span className="text-[10px] text-slate-500 font-mono font-semibold uppercase block">Légitimité</span>
              <span className="text-xs font-bold text-amber-700 font-mono">{leader.legitimacy}/100</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-center">
              <span className="text-[10px] text-slate-500 font-mono font-semibold uppercase block">Prestige</span>
              <span className="text-xs font-bold text-indigo-700 font-mono">{leader.prestige} pts</span>
            </div>
          </div>
        </div>

        {/* Vitals & Lifestyle Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium text-[11px]">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Vitalité & Santé
              </span>
              <span className="font-bold font-mono text-slate-800 text-[11px]">{leader.healthPct}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${leader.healthPct}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium text-[11px]">
                <Activity className="w-3.5 h-3.5 text-purple-600" /> Charge & Stress
              </span>
              <span className="font-bold font-mono text-slate-800 text-[11px]">{leader.stressPct}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${leader.stressPct}%` }} />
            </div>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <label className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-wider block">
              Régime Nutritionnel
            </label>
            <select
              value={leader.dietId}
              onChange={(e) => queueManualAction({ type: "SET_DIET", dietId: e.target.value })}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded p-1.5 font-mono"
            >
              {dbDiets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.costPerTurn} ¢/t)
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <label className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-wider block">
              Activité & Récupération
            </label>
            <select
              value={leader.activityId || ""}
              onChange={(e) => queueManualAction({ type: "SET_ACTIVITY", activityId: e.target.value || null })}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded p-1.5 font-mono"
            >
              <option value="">Aucune activité</option>
              {dbActivities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <label className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-wider block">
              Héritier Dynastique
            </label>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-800 font-medium text-[11px]">
                {leader.heirId ? `Désigné : ${leader.heirId}` : "Aucun héritier"}
              </span>
              <button
                onClick={() => queueManualAction({ type: "DESIGNATE_HEIR", heirId: "HEIR-01" })}
                className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded transition cursor-pointer"
              >
                {leader.heirId ? "Changer" : "Désigner"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-tab 1: Council & Decrees */}
      {activeSubTab === "DECREES" && (
        <>
          <section className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                  Conseil des Conseillers Exécutifs
                </h2>
              </div>
              <button
                onClick={() => openBottomSheet("ADVISOR_CHAT")}
                className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded border border-blue-200 transition cursor-pointer font-mono font-semibold"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Consulter le Conseil (IA Gemini)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {gameState.advisors.map((adv) => (
                <div key={adv.id} className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">{adv.role}</span>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">{adv.favorPoints} Faveur</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">{adv.displayName}</h3>
                  <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
                    <div>Loyauté : {adv.traits.loyalty}%</div>
                    <div>Orientation : {adv.traits.cognitiveOrientation} pts</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                  Décrets & Ordonnances Coloniales
                </h2>
              </div>
              <button
                onClick={() => openBottomSheet("DECREES")}
                className="text-xs font-mono font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded transition cursor-pointer"
              >
                Gérer les Décrets →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {gameState.poles.map((pole) => (
                <div key={pole.id} className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-700 font-semibold">{pole.id}</span>
                    <span className="text-blue-700 font-bold">{pole.value}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pole.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Sub-tab 2: Factions & Diplomacy */}
      {activeSubTab === "FACTIONS" && (
        <section className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                Factions & Pression Sociale
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">{gameState.factions.length} Factions répertoriées</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gameState.factions.map((f) => (
              <div key={f.id} className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{f.name}</h3>
                  {f.sanctionActive && (
                    <span className="px-2 py-0.5 rounded bg-rose-100 border border-rose-300 text-rose-800 font-mono text-[10px] font-bold">
                      Sanction Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Peur / Menace</span>
                    <span className="font-bold text-rose-600">{f.fear}%</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Respect / Loyauté</span>
                    <span className="font-bold text-emerald-600">{f.respect}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sub-tab 3: Arche Stellaire & Fleet Management */}
      {activeSubTab === "ARCHE" && (
        <section className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                  Commandement de l&apos;Arche Stellaire & Flotte Orbitale
                </h2>
                <span className="text-[11px] text-slate-500 font-mono">Vaisseau Amiral • Archotype {gameState.archetypeId}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded bg-slate-900 text-slate-100 border border-slate-700 space-y-2">
              <span className="text-[10px] text-blue-400 font-mono font-bold uppercase block">Intégrité de Coque</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">98.4 %</div>
              <p className="text-[10px] text-slate-400">Boucliers magnétiques actifs en orbite géostationnaire.</p>
            </div>

            <div className="p-3.5 rounded bg-slate-900 text-slate-100 border border-slate-700 space-y-2">
              <span className="text-[10px] text-blue-400 font-mono font-bold uppercase block">Pods Cryogéniques Rémanents</span>
              <div className="text-2xl font-bold font-mono text-cyan-400">1 420 Colons</div>
              <p className="text-[10px] text-slate-400">Prêts au réveil et au transfert vers les dômes de surface.</p>
            </div>

            <div className="p-3.5 rounded bg-slate-900 text-slate-100 border border-slate-700 space-y-2">
              <span className="text-[10px] text-blue-400 font-mono font-bold uppercase block">Réserves de Réacteur</span>
              <div className="text-2xl font-bold font-mono text-amber-400">420 t Hélium-3</div>
              <p className="text-[10px] text-slate-400">Autonomie énergétique orbitale estimée à 120 cycles.</p>
            </div>
          </div>

          {/* Fleet Inventory */}
          <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-800 flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-blue-600" /> Inventaire des Vaisseaux en Orbite
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">VEH-T01 — Navette de Fret Balisée</span>
                  <span className="text-[10px] text-slate-500 block">Capacité : 40 t par rotation</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">2 Unités</span>
              </div>

              <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">VEH-S01 — Sonde d&apos;Exploration Profonde</span>
                  <span className="text-[10px] text-slate-500 block">Portée : Système solaire entier</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">1 Unité</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sub-tab 4: Financial Console */}
      {activeSubTab === "FINANCE" && (
        <section className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-600" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                Console Financière Trimonétaire
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded bg-slate-50 border border-slate-200 border-l-4 border-l-amber-500 space-y-1">
              <span className="text-[10px] text-amber-700 font-mono uppercase font-bold tracking-wider">Trésorerie Publique</span>
              <div className="text-xl font-bold font-mono text-slate-900">{formatNumber(economy.colonyTreasury)} ¢</div>
            </div>

            <div className="p-3.5 rounded bg-slate-50 border border-slate-200 border-l-4 border-l-blue-500 space-y-1">
              <span className="text-[10px] text-blue-700 font-mono uppercase font-bold tracking-wider">Crédits Privés (Leader)</span>
              <div className="text-xl font-bold font-mono text-slate-900">{formatNumber(economy.leaderPrivateCredits)} ¢</div>
            </div>

            <div className="p-3.5 rounded bg-slate-50 border border-slate-200 border-l-4 border-l-indigo-500 space-y-1">
              <span className="text-[10px] text-indigo-700 font-mono uppercase font-bold tracking-wider">Crédits Consortium</span>
              <div className="text-xl font-bold font-mono text-slate-900">{formatNumber(economy.consortiumCredits)} ¢</div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-2.5">
            <div className="text-[11px] font-mono font-bold uppercase text-slate-700 flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
              Virement et Arbitrage Inter-Devises
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center">
              <div>
                <label className="text-[10px] text-slate-500 font-mono uppercase block mb-1 font-semibold">Source</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded p-1.5 font-mono"
                >
                  <option value="TREASURY">Trésorerie Publique</option>
                  <option value="PRIVATE">Crédits Privés</option>
                  <option value="CONSORTIUM">Consortium</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-mono uppercase block mb-1 font-semibold">Destination</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded p-1.5 font-mono"
                >
                  <option value="TREASURY">Trésorerie Publique</option>
                  <option value="PRIVATE">Crédits Privés</option>
                  <option value="CONSORTIUM">Consortium</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-mono uppercase block mb-1 font-semibold">Montant</label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded p-1.5 font-mono"
                />
              </div>

              <div className="sm:pt-4">
                <button
                  onClick={handleTransfer}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded transition cursor-pointer shadow-xs"
                >
                  Effectuer le virement
                </button>
              </div>
            </div>

            {transferWarning && (
              <div className="p-2 rounded bg-rose-50 border-l-4 border-l-rose-500 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{transferWarning}</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
