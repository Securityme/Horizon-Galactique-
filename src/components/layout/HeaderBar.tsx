"use client";

import React, { useState, useEffect } from "react";
import { useEngineStore } from "../../store/useEngineStore";
import {
  Zap,
  Users,
  Shield,
  Coins,
  Heart,
  Activity,
  Flame,
  Globe,
  Settings,
  Cloud,
  LogOut,
  UserCheck,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Lightbulb,
  Boxes,
  FlaskConical
} from "lucide-react";
import { signInWithGoogle, logOut, subscribeToAuth, saveToCloud } from "../../services/authService";
import { User } from "firebase/auth";
import { FipRadioWidget } from "./FipRadioWidget";
import { ResourceDetailModal, ResourceTypeId } from "../modals/ResourceDetailModal";
import dbEras from "../../data/db_eras.json";
import { formatNumber } from "../../lib/formatters";
import { integratedServicesManager, IntegratedServiceState } from "../../services/integrations/serviceRegistry";

export const HeaderBar: React.FC = () => {
  const { gameState, openBottomSheet } = useEngineStore();
  const [user, setUser] = useState<User | null>(null);
  const [servicesState, setServicesState] = useState<IntegratedServiceState>(integratedServicesManager.getState());
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [cloudMsg, setCloudMsg] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [selectedResource, setSelectedResource] = useState<ResourceTypeId | null>(null);

  useEffect(() => {
    const unsubAuth = subscribeToAuth((u) => setUser(u));
    const unsubServices = integratedServicesManager.subscribe((s) => setServicesState(s));
    return () => {
      unsubAuth();
      unsubServices();
    };
  }, []);

  if (!gameState) return null;

  const eraData = dbEras.find((e) => e.id === gameState.currentEra) || dbEras[0];

  const handleCloudSync = async () => {
    if (!user) {
      const u = await signInWithGoogle();
      if (u) setUser(u);
      return;
    }
    setIsCloudSaving(true);
    const success = await saveToCloud(user.uid, 1, gameState);
    setIsCloudSaving(false);
    setCloudMsg(success ? "Synchronisé !" : "Erreur sync");
    setTimeout(() => setCloudMsg(null), 3000);
  };

  return (
    <header className="bg-[#0F172A] border-b border-slate-700 text-white px-3 sm:px-4 py-1.5 transition-all duration-300 select-none sticky top-0 z-20 shadow-md">
      {/* Retracted / Collapsed Minimal View */}
      {isCollapsed ? (
        <div className="flex items-center justify-between gap-2 text-xs font-mono">
          {/* Leader Profile Badge Button (Top Left) */}
          <button
            id="btn-open-leader-profile-collapsed"
            onClick={() => openBottomSheet("LEADER_PROFILE")}
            className="flex items-center gap-2 text-xs font-mono bg-slate-800/90 hover:bg-slate-700 p-1 pr-2.5 rounded-lg border border-slate-700 transition cursor-pointer group shadow-xs"
            title="Ouvrir le Dossier du Leader et la gestion de la Dynastie"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-md flex items-center justify-center font-bold text-[10px] text-white shadow-xs group-hover:scale-105 transition-transform">
              {gameState.leader.displayName.charAt(0)}
            </div>
            <span className="font-bold text-slate-100 uppercase tracking-tight text-xs group-hover:text-blue-300">
              {gameState.leader.dynastyName}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-blue-400 font-bold">Tour {gameState.turnIndex}</span>
          </button>

          {/* Quick Metrics Pills when collapsed */}
          <div className="hidden md:flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1 text-slate-200" title="Population">
              <Users className="w-3 h-3 text-blue-400" />
              <span>{formatNumber(gameState.demographics.popTotal)}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-200" title="Énergie Net">
              <Zap className={`w-3 h-3 ${gameState.economy.netEnergyMW >= 0 ? "text-amber-400" : "text-rose-400"}`} />
              <span>{gameState.economy.netEnergyMW > 0 ? `+${gameState.economy.netEnergyMW}` : gameState.economy.netEnergyMW} MW</span>
            </div>
            <div className="flex items-center gap-1 text-slate-200" title="Trésorerie">
              <Coins className="w-3 h-3 text-yellow-400" />
              <span>{formatNumber(gameState.economy.colonyTreasury)} ¢</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FipRadioWidget />

            {/* Unfold / Expand Header Button */}
            <button
              id="btn-expand-header"
              onClick={() => setIsCollapsed(false)}
              className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-600 px-2 py-1 rounded transition cursor-pointer font-semibold"
              title="Déplier la barre de ressources complète"
            >
              <span>Déplier</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
            </button>

            {/* Quick Actions */}
            <button
              id="btn-open-advisor-chat-mini"
              onClick={() => openBottomSheet("ADVISOR_CHAT")}
              className="p-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition cursor-pointer"
              title="Conseil IA"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-open-settings-mini"
              onClick={() => openBottomSheet("SETTINGS")}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition cursor-pointer"
              title="Paramètres"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Full Expanded View */
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Title & Colony info */}
          <button
            id="btn-open-leader-profile-expanded"
            onClick={() => openBottomSheet("LEADER_PROFILE")}
            className="flex items-center gap-2.5 text-left hover:bg-slate-800/80 p-1.5 rounded-lg border border-transparent hover:border-slate-700 transition cursor-pointer group"
            title="Ouvrir le Dossier du Leader et la gestion de la Dynastie"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center font-bold text-xs tracking-wider text-white shadow-md shrink-0 border border-blue-400/30 group-hover:scale-105 transition-transform">
              {gameState.leader.displayName.charAt(0)}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-xs sm:text-sm text-slate-100 uppercase group-hover:text-blue-300">
                  {gameState.leader.dynastyName}
                </span>
                <span className="text-xs text-slate-500 font-mono">/</span>
                <span className="text-xs text-slate-300 font-medium">{gameState.leader.displayName}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-amber-300 font-semibold text-[10px]">
                  {eraData.name}
                </span>
                <span>{gameState.colonyDate}</span>
                <span className="text-slate-600">•</span>
                <span className="text-blue-300 font-bold">Tour {gameState.turnIndex}</span>
              </div>
            </div>
          </button>

          {/* Primary Simulation Metrics Ticker */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto text-[11px] font-mono py-0.5">
            {/* Population */}
            <button
              onClick={() => setSelectedResource("FOOD")}
              className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 px-2 py-1 rounded border border-slate-700 shrink-0 cursor-pointer transition"
              title="Cliquer pour inspecter la Population & Rations"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-slate-100">{formatNumber(gameState.demographics.popTotal)}</span>
            </button>

            {/* Net Energy */}
            <button
              onClick={() => setSelectedResource("ENERGY")}
              className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 px-2 py-1 rounded border border-slate-700 shrink-0 cursor-pointer transition"
              title="Cliquer pour inspecter le Réseau Énergétique MW"
            >
              <Zap className={`w-3.5 h-3.5 ${gameState.economy.netEnergyMW >= 0 ? "text-amber-400" : "text-rose-400 animate-pulse"}`} />
              <span className={gameState.economy.netEnergyMW >= 0 ? "text-slate-100" : "text-rose-400 font-bold"}>
                {gameState.economy.netEnergyMW > 0 ? `+${gameState.economy.netEnergyMW}` : gameState.economy.netEnergyMW} MW
              </span>
            </button>

            {/* Ore / Storage */}
            <button
              onClick={() => setSelectedResource("ORE")}
              className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 px-2 py-1 rounded border border-slate-700 shrink-0 cursor-pointer transition"
              title="Cliquer pour inspecter le Minerai & Stockage ISRU"
            >
              <Boxes className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-100">{gameState.economy.storedOreTons || 120} t</span>
            </button>

            {/* Treasury */}
            <button
              onClick={() => setSelectedResource("TREASURY")}
              className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 px-2 py-1 rounded border border-slate-700 shrink-0 cursor-pointer transition"
              title="Cliquer pour inspecter la Trésorerie Publique"
            >
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-slate-100">{formatNumber(gameState.economy.colonyTreasury)} ¢</span>
            </button>

            {/* Research */}
            <button
              onClick={() => setSelectedResource("RESEARCH")}
              className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 px-2 py-1 rounded border border-slate-700 shrink-0 cursor-pointer transition"
              title="Cliquer pour inspecter les Points de Recherche"
            >
              <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-100">{gameState.research.points} pts</span>
            </button>

            {/* Leader Health & Stress */}
            <div className="flex items-center gap-2 bg-slate-800/90 px-2 py-1 rounded border border-slate-700 shrink-0" title="Santé & Stress du Leader">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" />
                <span className="text-slate-100">{gameState.leader.healthPct}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-purple-400" />
                <span className="text-slate-100">{gameState.leader.stressPct}%</span>
              </div>
            </div>

            {/* Surge Gauge (0 to 5) */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-2 py-1 rounded border border-slate-700 shrink-0" title="Jauge d'Impulsion (5 = Tour Majeur)">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((slot) => (
                  <div
                    key={slot}
                    className={`w-2 h-3 rounded-xs transition-all ${
                      slot <= gameState.surgeGauge ? "bg-orange-500 shadow-xs shadow-orange-500/50" : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Control Actions & Retract Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <FipRadioWidget />

            {/* Guide & TIPS Tutorial button */}
            <button
              id="btn-open-tutorial"
              onClick={() => openBottomSheet("TUTORIAL" as any)}
              className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2.5 py-1.5 rounded border border-amber-400 transition cursor-pointer shadow-xs"
              title="Guide & Conseils (TIPS)"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guide TIPS</span>
            </button>

            {/* Advisor Chat quick access */}
            <button
              id="btn-open-advisor-chat"
              onClick={() => openBottomSheet("ADVISOR_CHAT")}
              className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1.5 rounded border border-blue-500 transition cursor-pointer font-medium shadow-xs"
              title="Consulter le Conseil des Conseillers (IA)"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Conseil IA</span>
            </button>

            {/* 3 Services Connection Status Badge */}
            <button
              id="btn-3services-status"
              onClick={() => openBottomSheet("SETTINGS")}
              className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-[11px] font-mono transition hover:border-slate-500 cursor-pointer"
              title="Statut des 3 Services : Firebase / Google Chat / Cloud SQL"
            >
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${servicesState.firebase.status === "connected" ? "bg-emerald-400" : "bg-amber-400"}`} title="Firebase" />
                <span className={`w-2 h-2 rounded-full ${servicesState.googleChat.status === "connected" ? "bg-emerald-400" : "bg-slate-500"}`} title="Google Chat" />
                <span className={`w-2 h-2 rounded-full ${servicesState.cloudSql.status === "active" ? "bg-indigo-400" : "bg-slate-500"}`} title="Cloud SQL" />
              </div>
              <span className="text-slate-300 font-semibold text-[10px] uppercase">3 Services</span>
            </button>

            {/* Auth & Profile Badge */}
            <button
              id="btn-auth-profile-badge"
              onClick={() => openBottomSheet("SETTINGS")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900/80 border border-blue-700/60 text-xs font-mono transition cursor-pointer shadow-xs"
              title="Profil Google & Statut (Cliquer pour ouvrir)"
            >
              <div className="relative flex items-center justify-center">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User"
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 rounded-full object-cover border border-blue-400"
                  />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${user ? "bg-emerald-400" : "bg-amber-400"}`} />
              </div>
              <span className="hidden lg:inline text-blue-200 font-bold truncate max-w-[100px]">
                {user?.displayName ? user.displayName.split(" ")[0] : "Invité"}
              </span>
            </button>

            {/* Cloud Sync Button */}
            <button
              id="btn-cloud-sync"
              onClick={handleCloudSync}
              disabled={isCloudSaving}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border transition cursor-pointer font-medium ${
                user
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600"
                  : "bg-slate-800 hover:bg-slate-700 text-blue-300 border-blue-500/60"
              }`}
              title={user ? `Connecté: ${user.email} (Sauvegarder dans le Cloud)` : "Se connecter avec Google pour synchroniser"}
            >
              <Cloud className={`w-3.5 h-3.5 ${isCloudSaving ? "animate-spin text-blue-400" : ""}`} />
              <span className="hidden sm:inline">
                {cloudMsg ? cloudMsg : user ? "Cloud Sync" : "Connexion"}
              </span>
            </button>

            {/* Settings button */}
            <button
              id="btn-open-settings"
              onClick={() => openBottomSheet("SETTINGS")}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition cursor-pointer"
              title="Paramètres & Sauvegardes"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Retract / Collapse Toggle Button */}
            <button
              id="btn-collapse-header"
              onClick={() => setIsCollapsed(true)}
              className="flex items-center gap-1 text-[10px] bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-1.5 rounded transition cursor-pointer font-mono font-semibold"
              title="Réduire le header"
            >
              <span className="hidden md:inline">Réduire</span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* Resource Detail Modal */}
      {selectedResource && (
        <ResourceDetailModal
          resourceId={selectedResource}
          gameState={gameState}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </header>
  );
};
