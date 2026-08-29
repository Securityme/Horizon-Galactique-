"use client";

import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Shield,
  Key,
  Database,
  MessageSquare,
  Flame,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  ExternalLink,
  Layers,
  Sparkles,
  Cpu,
  Globe
} from "lucide-react";
import { integratedServicesManager, IntegratedServiceState } from "../../services/integrations/serviceRegistry";
import { saveGameToCloud } from "../../services/firebaseSaveService";
import { useEngineStore } from "../../store/useEngineStore";

interface UserProfileViewProps {
  onClose?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onClose }) => {
  const [services, setServices] = useState<IntegratedServiceState>(integratedServicesManager.getState());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const { gameState } = useEngineStore();

  useEffect(() => {
    const unsub = integratedServicesManager.subscribe((newState) => {
      setServices(newState);
    });
    return () => unsub();
  }, []);

  const user = services.firebase.user;

  const handleManualSave = async () => {
    if (!user || !gameState) return;
    setIsSyncing(true);
    setSyncFeedback("Synchronisation de la partie en cours...");
    try {
      await saveGameToCloud(user.uid, gameState);
      setSyncFeedback("Sauvegarde Cloud réussie sur Firestore !");
    } catch (err: any) {
      setSyncFeedback("Échec de la synchronisation : " + (err.message || "Erreur"));
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* User Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User Avatar"}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-blue-400 font-bold text-xl shadow-md">
                {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : <UserIcon className="w-8 h-8" />}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900 ${
                user ? "bg-emerald-500" : "bg-amber-500"
              }`}
              title={user ? "Connecté à Google / Firebase" : "Session Invité"}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {user?.displayName || "Commandant Invité"}
              </h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                {services.firebase.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {user?.email || "Session locale non-liée à Google"}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
              <span>UID: {user?.uid ? `${user.uid.substring(0, 10)}...` : "Anonyme"}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {user ? (
            <button
              onClick={() => integratedServicesManager.disconnectFirebase()}
              className="px-3 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/50 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          ) : (
            <button
              onClick={() => integratedServicesManager.connectFirebaseGoogle()}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Connexion Google</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Services Matrix & Roles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Matrice des 3 Services Intégrés</span>
          </h4>
          <span className="text-[11px] font-mono text-slate-400">Auto & Manuel</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Service 1: Firebase Firestore & Auth */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-sm text-white">Firebase</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    services.firebase.status === "connected"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-amber-950 text-amber-400 border border-amber-800"
                  }`}
                >
                  {services.firebase.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Base Firestore & Authentification Google OAuth.
              </p>
              <div className="space-y-1.5 text-xs font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Rôle :</span>
                  <span className="font-semibold text-cyan-400">{services.firebase.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Auto-Connexion :</span>
                  <span>{services.firebase.autoConnected ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleManualSave}
                disabled={!user || isSyncing}
                className="w-full text-xs font-semibold py-1.5 px-3 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>Tester Sync Firestore</span>
              </button>
            </div>
          </div>

          {/* Service 2: Google Chat API */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-white">Google Chat</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    services.googleChat.status === "connected"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {services.googleChat.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Intégration des Espaces Google Workspace & Bots.
              </p>
              <div className="space-y-1.5 text-xs font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Rôle Chat :</span>
                  <span className="font-semibold text-emerald-400">{services.googleChat.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Espaces :</span>
                  <span>{services.googleChat.spaceCount} actifs</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => integratedServicesManager.connectGoogleChatManual()}
                className="w-full text-xs font-semibold py-1.5 px-3 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reconnecter Google Chat</span>
              </button>
            </div>
          </div>

          {/* Service 3: Cloud SQL Database */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-sm text-white">Cloud SQL</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    services.cloudSql.status === "active"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-indigo-950 text-indigo-300 border border-indigo-800"
                  }`}
                >
                  {services.cloudSql.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Base de données relationnelle PostgreSQL.
              </p>
              <div className="space-y-1.5 text-xs font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Rôle SQL :</span>
                  <span className="font-semibold text-indigo-400">{services.cloudSql.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Latence :</span>
                  <span>{services.cloudSql.latencyMs} ms</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() =>
                  integratedServicesManager.toggleCloudSqlManual(services.cloudSql.status !== "active")
                }
                className="w-full text-xs font-semibold py-1.5 px-3 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  {services.cloudSql.status === "active" ? "Basculer en Standby" : "Activer Cloud SQL"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {syncFeedback && (
        <div className="bg-blue-950/80 border border-blue-700/60 text-blue-200 p-3 rounded-lg text-xs font-mono flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}
    </div>
  );
};
