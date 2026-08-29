"use client";

import React, { useState, useEffect } from "react";
import { useEngineStore } from "../../store/useEngineStore";
import {
  Crown,
  Heart,
  Activity,
  Shield,
  Coins,
  Award,
  UserCheck,
  X,
  Sparkles,
  Cloud,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Lock,
  Boxes
} from "lucide-react";
import dbDiets from "../../data/db_diets.json";
import dbActivities from "../../data/db_activities.json";
import { formatNumber } from "../../lib/formatters";
import { integratedServicesManager, IntegratedServiceState } from "../../services/integrations/serviceRegistry";
import { saveGameToCloud } from "../../services/firebaseSaveService";
import { signInWithGoogle, logOut } from "../../services/authService";

export const LeaderProfileModal: React.FC = () => {
  const { gameState, activeBottomSheet, closeBottomSheet, queueManualAction } = useEngineStore();
  const [services, setServices] = useState<IntegratedServiceState>(integratedServicesManager.getState());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"DOSSIER" | "LINEAGE" | "ACCOUNT">("DOSSIER");

  useEffect(() => {
    const unsub = integratedServicesManager.subscribe((newState) => {
      setServices(newState);
    });
    return () => unsub();
  }, []);

  if (activeBottomSheet !== "LEADER_PROFILE" || !gameState) return null;

  const leader = gameState.leader;
  const user = services.firebase.user;

  const handleManualSave = async () => {
    if (!user || !gameState) return;
    setIsSyncing(true);
    setSyncFeedback("Synchronisation de la partie...");
    try {
      await saveGameToCloud(user.uid, gameState);
      setSyncFeedback("Partie sauvegardée sur le Cloud Firestore !");
    } catch (err: any) {
      setSyncFeedback("Échec de la sauvegarde : " + (err.message || "Erreur"));
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100 font-sans">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg font-mono shadow-md border border-blue-400/40">
              {leader.displayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                  Profil du Dirigeant & Commandement
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-mono">Dynastie {leader.dynastyName}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">{leader.displayName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sub-tab switcher */}
            <div className="flex items-center p-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono">
              <button
                onClick={() => setActiveTab("DOSSIER")}
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                  activeTab === "DOSSIER" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Dossier Leader
              </button>
              <button
                onClick={() => setActiveTab("LINEAGE")}
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeTab === "LINEAGE" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Lignée
              </button>
              <button
                onClick={() => setActiveTab("ACCOUNT")}
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeTab === "ACCOUNT" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <Cloud className="w-3 h-3" />
                Compte
              </button>
            </div>

            <button
              onClick={closeBottomSheet}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === "DOSSIER" && (
            <>
              {/* Vitals & Reputation Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Vitalité / Santé</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-rose-400 font-mono">{leader.healthPct}%</span>
                    <Heart className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${leader.healthPct}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Niveau de Stress</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-400 font-mono">{leader.stressPct}%</span>
                    <Activity className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${leader.stressPct}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Légitimité</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-amber-400 font-mono">{leader.legitimacy}/100</span>
                    <Crown className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${leader.legitimacy}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Prestige Personnel</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-400 font-mono">{leader.prestige} pts</span>
                    <Award className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-[10px] text-slate-400">Influence inter-système</p>
                </div>
              </div>

              {/* Lifestyle & Nutrition Controls */}
              <div className="bg-slate-800/50 border border-slate-700/80 rounded-lg p-4 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Mode de Vie & Récupération du Leader
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 font-semibold block mb-1">Régime Nutritionnel</label>
                    <select
                      value={leader.dietId}
                      onChange={(e) => queueManualAction({ type: "SET_DIET", dietId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded p-2 font-mono"
                    >
                      {dbDiets.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.costPerTurn} ¢/t)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 font-semibold block mb-1">Activité Quotidienne</label>
                    <select
                      value={leader.activityId || ""}
                      onChange={(e) => queueManualAction({ type: "SET_ACTIVITY", activityId: e.target.value || null })}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded p-2 font-mono"
                    >
                      <option value="">Aucune activité spécifique</option>
                      {dbActivities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 font-semibold block mb-1">Héritier Dynastique</label>
                    <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded p-1.5">
                      <span className="text-xs font-mono text-slate-300">
                        {leader.heirId ? `Héritier : ${leader.heirId}` : "Non désigné"}
                      </span>
                      <button
                        onClick={() => queueManualAction({ type: "DESIGNATE_HEIR", heirId: "HEIR-01" })}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                      >
                        {leader.heirId ? "Changer" : "Désigner"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Private Wealth & Equipment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      Fortunes Privées (Leader)
                    </span>
                    <span className="text-lg font-mono font-bold text-yellow-400">
                      {formatNumber(gameState.economy.leaderPrivateCredits)} ¢
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Utilisés pour acquérir du matériel de pointe, des domaines privés et garantir le niveau de vie de la dynastie.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-cyan-400" />
                      Équipements & Permis
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      {leader.equipment.length} équipement(s)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                    {leader.equipment.map((eq, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        {eq}
                      </span>
                    ))}
                    {(leader.permits || []).map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "LINEAGE" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Chronique de la Lignée Dynastique</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {"Historique des dirigeants successifs de l'Arche spatiale. Découvrez leurs mandats d'administration coloniale, leurs réalisations majeures et l'héritage durable de leurs choix de société."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Container */}
              <div className="relative pl-6 border-l-2 border-slate-800 ml-4 space-y-6 py-2">
                {(gameState.lineage || [
                  {
                    displayName: `Commandant Jarek ${leader.dynastyName}`,
                    dynastyName: leader.dynastyName,
                    mandateStartTurn: -45,
                    mandateEndTurn: -20,
                    causeOfDeath: "Mort naturelle durant le voyage cryogénique",
                    accomplishments: [
                      "Supervision du lancement de l'Arche stellaire depuis la Terre en ruines",
                      "Stabilisation des réacteurs thermonucléaires principaux lors du départ"
                    ],
                    decisionsImpact: { "Énergie (MW)": 5, "Légitimité": 15 }
                  },
                  {
                    displayName: `Gouverneure Vespera ${leader.dynastyName}`,
                    dynastyName: leader.dynastyName,
                    mandateStartTurn: -19,
                    mandateEndTurn: 0,
                    causeOfDeath: "Épuisement respiratoire lors des phases d'approche orbitale",
                    accomplishments: [
                      "Traversée victorieuse de la ceinture d'astéroïdes d'Epsilon Eridani",
                      "Mise en place de la charte de coopération des Factions de l'Arche"
                    ],
                    decisionsImpact: { "Trésorerie (¢)": 5000, "Bonheur": 10 }
                  },
                  {
                    displayName: leader.displayName,
                    dynastyName: leader.dynastyName,
                    mandateStartTurn: 1,
                    mandateEndTurn: null,
                    accomplishments: [
                      "Atterrissage et déploiement initial de la capsule centrale de l'Arche",
                      "Prise de commandement officielle de la colonie"
                    ],
                    decisionsImpact: {}
                  }
                ]).map((entry: any, index: number) => {
                  const isActive = entry.mandateEndTurn === null;
                  return (
                    <div key={index} className="relative group">
                      {/* Timeline Dot */}
                      <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isActive
                          ? "bg-amber-400 border-amber-300 ring-4 ring-amber-400/20 animate-pulse"
                          : "bg-slate-900 border-slate-600"
                      }`}>
                        {isActive && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                      </span>

                      <div className="space-y-1.5">
                        {/* Header Line */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isActive ? "text-amber-400" : "text-slate-200"}`}>
                              {entry.displayName}
                            </span>
                            {isActive ? (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                En Fonction
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded bg-slate-800 border border-slate-700 text-slate-400">
                                Archivé
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-slate-400">
                            {entry.mandateStartTurn < 0
                              ? `Mois ${entry.mandateStartTurn} à ${entry.mandateEndTurn}`
                              : `Tour ${entry.mandateStartTurn} à ${isActive ? "Présent" : entry.mandateEndTurn}`}
                          </span>
                        </div>

                        {/* Cause of death if applicable */}
                        {entry.causeOfDeath && (
                          <div className="text-xs italic text-red-400/85 font-mono flex items-center gap-1.5">
                            <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
                            <span>Décès : {entry.causeOfDeath}</span>
                          </div>
                        )}

                        {/* Accomplishments */}
                        <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc marker:text-slate-500">
                          {entry.accomplishments.map((acc: string, aIdx: number) => (
                            <li key={aIdx}>{acc}</li>
                          ))}
                        </ul>

                        {/* Decisions Impact */}
                        {entry.decisionsImpact && Object.keys(entry.decisionsImpact).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {Object.entries(entry.decisionsImpact).map(([metric, val]: any, mIdx: number) => {
                              const isPositive = val >= 0;
                              return (
                                <span
                                  key={mIdx}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
                                    isPositive
                                      ? "bg-emerald-500/5 border-emerald-500/25 text-emerald-400"
                                      : "bg-rose-500/5 border-rose-500/25 text-rose-400"
                                  }`}
                                >
                                  {metric} : {isPositive ? `+${val}` : val}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "ACCOUNT" && (
            /* Cloud Account Tab */
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/70 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-blue-400" />
                      Compte Google & Synchronisation Firestore
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {user ? `Connecté en tant que ${user.email}` : "Mode invité local (Partie sauvegardée dans le navigateur)"}
                    </p>
                  </div>

                  {user ? (
                    <button
                      onClick={logOut}
                      className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Déconnexion
                    </button>
                  ) : (
                    <button
                      onClick={signInWithGoogle}
                      className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Se connecter avec Google
                    </button>
                  )}
                </div>

                {user && (
                  <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300">ID Projet Firestore : {gameState.saveId}</span>
                    <button
                      onClick={handleManualSave}
                      disabled={isSyncing}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                      Sauvegarder la Colonie
                    </button>
                  </div>
                )}

                {syncFeedback && (
                  <div className="p-2.5 rounded bg-blue-950/80 border border-blue-700 text-xs font-mono text-blue-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{syncFeedback}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={closeBottomSheet}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase font-mono cursor-pointer transition shadow-sm"
          >
            Fermer le Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
