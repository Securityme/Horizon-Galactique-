"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { useEngineStore } from "../../store/useEngineStore";
import { useUIStore } from "../../store/useUIStore";
import { fipRadio, FIP_STATIONS } from "../../services/fipRadio";
import {
  Rocket,
  Play,
  Cloud,
  BookOpen,
  Settings,
  Sparkles,
  Shield,
  LogIn,
  LogOut,
  RefreshCw,
  Trash2,
  CheckCircle,
  Globe,
  Database,
  ArrowRight,
  UserCheck,
  Radio
} from "lucide-react";
import { auth } from "../../lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { signInWithGoogle, signInGuest } from "../../services/authService";
import {
  syncUserProfile,
  saveGameToCloud,
  listCloudSaves,
  loadGameFromCloud,
  deleteCloudSave
} from "../../services/firebaseSaveService";
import { LocalSaveSlotMeta, loadActiveGameLocally } from "../../services/storage";

interface MainMenuScreenProps {
  onStartNewGame: () => void;
}

const subscribeFip = (callback: () => void) => fipRadio.subscribe(callback);

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onStartNewGame }) => {
  const { gameState, resumeGame, openBottomSheet } = useEngineStore();
  const { theme } = useUIStore();

  const fipStation = useSyncExternalStore(subscribeFip, () => fipRadio.getStation(), () => FIP_STATIONS[0]);
  const fipPlaying = useSyncExternalStore(subscribeFip, () => fipRadio.getIsPlaying(), () => false);
  const fipLoading = useSyncExternalStore(subscribeFip, () => fipRadio.getIsLoading(), () => false);

  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [showCloudModal, setShowCloudModal] = useState<boolean>(false);
  const [cloudSaves, setCloudSaves] = useState<LocalSaveSlotMeta[]>([]);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [hasLocalSave] = useState<boolean>(() => !!loadActiveGameLocally());

  const fetchCloudSaves = async (uid: string) => {
    setSyncStatus("Chargement des sauvegardes cloud...");
    try {
      const saves = await listCloudSaves(uid);
      setCloudSaves(saves);
      setSyncStatus(null);
    } catch (err) {
      console.error(err);
      setSyncStatus("Erreur lors de la récupération cloud.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (currentUser) {
        await syncUserProfile(currentUser);
        await fetchCloudSaves(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setSyncStatus("Connexion Google en cours...");
      const signedInUser = await signInWithGoogle();
      if (signedInUser) {
        await syncUserProfile(signedInUser);
        await fetchCloudSaves(signedInUser.uid);
        setSyncStatus("Compte synchronisé avec succès !");
      } else {
        setSyncStatus(null);
      }
    } catch (err) {
      console.warn("Auth error:", err);
      setSyncStatus("Connexion annulée.");
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      setSyncStatus("Connexion en mode Invité...");
      const signedInUser = await signInGuest();
      if (signedInUser) {
        await syncUserProfile(signedInUser);
        setSyncStatus("Session Invité activée !");
      } else {
        setSyncStatus(null);
      }
    } catch (err) {
      console.warn("Anonymous Auth error:", err);
      setSyncStatus("Connexion Invité annulée.");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setCloudSaves([]);
    setSyncStatus(null);
  };

  const handleUploadCurrentSave = async () => {
    if (!user) {
      handleGoogleSignIn();
      return;
    }
    const current = gameState || loadActiveGameLocally();
    if (!current) {
      setSyncStatus("Aucune partie locale à sauvegarder.");
      return;
    }

    setSyncStatus("Sauvegarde dans Firebase Cloud...");
    try {
      await saveGameToCloud(user.uid, current);
      await fetchCloudSaves(user.uid);
      setSyncStatus("Partie sauvegardée dans le cloud !");
    } catch (err) {
      console.error(err);
      setSyncStatus("Erreur lors de l'enregistrement cloud.");
    }
  };

  const handleLoadCloudSave = async (saveId: string) => {
    if (!user) return;
    setSyncStatus("Chargement depuis Firebase...");
    try {
      const loadedState = await loadGameFromCloud(user.uid, saveId);
      if (loadedState) {
        useEngineStore.setState({ gameState: loadedState });
        setShowCloudModal(false);
        setSyncStatus(null);
      } else {
        setSyncStatus("Sauvegarde introuvable.");
      }
    } catch (err) {
      console.error(err);
      setSyncStatus("Erreur de chargement.");
    }
  };

  const handleDeleteCloudSave = async (saveId: string) => {
    if (!user) return;
    setSyncStatus("Suppression...");
    try {
      await deleteCloudSave(user.uid, saveId);
      await fetchCloudSaves(user.uid);
      setSyncStatus("Sauvegarde supprimée.");
    } catch (err) {
      console.error(err);
      setSyncStatus("Erreur lors de la suppression.");
    }
  };

  const handleContinue = () => {
    if (gameState) return;
    if (hasLocalSave) {
      resumeGame();
    } else if (cloudSaves.length > 0) {
      handleLoadCloudSave(cloudSaves[0].saveId);
    }
  };

  const isLight = theme === "light";
  const isAmber = theme === "amber";

  const containerClass = isLight
    ? "min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none"
    : isAmber
    ? "min-h-screen bg-black text-amber-500 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-mono"
    : "min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none";

  const consoleClass = isLight
    ? "w-full max-w-2xl bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-lg z-10 space-y-6"
    : isAmber
    ? "w-full max-w-2xl bg-black border border-amber-500 rounded-xl p-6 sm:p-8 shadow-2xl z-10 space-y-6"
    : "w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-md z-10 space-y-6";

  const titleClass = isLight
    ? "text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans"
    : isAmber
    ? "text-2xl sm:text-4xl font-extrabold tracking-tight text-amber-500 font-mono uppercase"
    : "text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm font-sans";

  const accountBarClass = isLight
    ? "p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-mono text-slate-700"
    : isAmber
    ? "p-3 bg-black border border-amber-500 rounded-lg flex items-center justify-between text-xs font-mono text-amber-500"
    : "p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono";

  const buttonClassSettings = isLight
    ? "py-2.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 font-mono text-xs flex items-center justify-center gap-2 border border-slate-300 transition cursor-pointer"
    : isAmber
    ? "py-2.5 px-3 rounded-lg bg-black hover:bg-amber-950/20 text-amber-500 font-mono text-xs flex items-center justify-center gap-2 border border-amber-500 transition cursor-pointer"
    : "py-2.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer";

  const buttonClassSaves = isLight
    ? "w-full py-3 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 font-mono text-xs font-semibold flex items-center justify-between border border-slate-300 transition cursor-pointer"
    : isAmber
    ? "w-full py-3 px-4 rounded-lg bg-black hover:bg-amber-950/20 text-amber-500 font-mono text-xs font-semibold flex items-center justify-between border border-amber-500 transition cursor-pointer"
    : "w-full py-3 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold flex items-center justify-between border border-slate-700 transition cursor-pointer";

  const hasAnySave = hasLocalSave || gameState || cloudSaves.length > 0;

  return (
    <div className={containerClass}>
      {/* Background Orbital Glow Effect */}
      {!isAmber && (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Main Center Console */}
      <div className={consoleClass}>
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <h1 className={titleClass}>
            Horizon Cosmique
          </h1>
          <p className="text-sm sm:text-lg font-mono text-blue-500 font-extrabold tracking-widest uppercase">
            L’Arche des Étoiles
          </p>
          <div className="h-0.5 w-16 bg-blue-500 mx-auto rounded-full my-1.5" />
        </div>

        {/* User Account Bar */}
        <div className={accountBarClass}>
          <div className="flex items-center gap-2.5">
            <Cloud className="w-4 h-4 text-sky-400" />
            {loadingAuth ? (
              <span className="text-slate-500">Vérification Firebase...</span>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-bold">{user.displayName || user.email}</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 text-[10px]">Cloud Actif</span>
              </div>
            ) : (
              <span>Non connecté (Mode Local)</span>
            )}
          </div>

          {user ? (
            <button
              onClick={handleSignOut}
              className="hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAnonymousSignIn}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1 border border-slate-700 transition cursor-pointer text-[10px]"
              >
                <span>Invité</span>
              </button>
              <button
                onClick={handleGoogleSignIn}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition cursor-pointer text-[10px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connexion Google</span>
              </button>
            </div>
          )}
        </div>

        {/* Primary Navigation Buttons */}
        <div className="space-y-3 pt-1">
          {/* Continue Game */}
          <button
            onClick={handleContinue}
            disabled={!hasAnySave}
            className={`w-full py-3.5 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between transition shadow-md cursor-pointer ${
              hasAnySave
                ? "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white border border-blue-400/30 shadow-[0_0_12px_rgba(37,99,235,0.2)]"
                : "bg-slate-800/50 border border-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center gap-3">
              <Play className="w-4 h-4 fill-current" />
              <span>Continuer la Partie</span>
            </div>
            {hasLocalSave ? (
              <span className="text-[10px] text-blue-200 font-normal">Sauvegarde Locale Prête</span>
            ) : cloudSaves.length > 0 ? (
              <span className="text-[10px] text-emerald-400 font-normal">Sauvegarde Cloud Détectée</span>
            ) : null}
          </button>

          {/* New Game */}
          <button
            onClick={onStartNewGame}
            className="w-full py-3.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between border border-emerald-500/30 transition shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Rocket className="w-4 h-4" />
              <span>Nouvelle Colonisation</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Cloud Saves Modal Trigger */}
          <button
            onClick={() => setShowCloudModal(true)}
            className={buttonClassSaves}
          >
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-sky-400" />
              <span>Gestionnaire Sauvegardes Cloud (Firebase)</span>
            </div>
            <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-sky-400 border border-slate-800">
              {cloudSaves.length} Slot(s)
            </span>
          </button>

          {/* Compact Cognitive FIP Radio Player */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2.5 font-mono text-[11px] text-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 text-rose-500 ${fipPlaying ? "animate-pulse" : ""}`} />
                <span className="font-bold text-rose-300">RADIO COGNITIVE FIP</span>
              </div>
              <button
                onClick={() => fipRadio.togglePlay()}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer ${
                  fipPlaying
                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                {fipLoading ? (
                  <span className="animate-pulse">Buffer...</span>
                ) : fipPlaying ? (
                  "PAUSE"
                ) : (
                  "ÉCOUTER"
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {FIP_STATIONS.slice(0, 5).map((st) => {
                const isSelected = fipStation.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => fipRadio.playStation(st)}
                    className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition cursor-pointer border ${
                      isSelected
                        ? "bg-rose-950/50 border-rose-600 text-white font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {st.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Game Tutorial & Rules */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => openBottomSheet("SETTINGS")}
              className={buttonClassSettings}
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Paramètres</span>
            </button>

            <button
              onClick={() => openBottomSheet("TUTORIAL")}
              className={buttonClassSettings}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Règles & Codex</span>
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {syncStatus && (
          <div className="p-2.5 bg-blue-950/60 border border-blue-800 rounded text-center text-xs font-mono text-blue-300 animate-in fade-in duration-150">
            {syncStatus}
          </div>
        )}

        {/* Footer Version Info */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Horizon Cosmique v20.0.0</span>
          <span>Projet : gen-lang-client-0030451305</span>
        </div>
      </div>

      {/* Cloud Saves Modal */}
      {showCloudModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4 text-slate-100 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold font-mono text-sky-400">
                <Cloud className="w-4 h-4" />
                <span>Sauvegardes Cloud Firebase Firestore</span>
              </div>
              <button
                onClick={() => setShowCloudModal(false)}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                [Fermer]
              </button>
            </div>

            {!user ? (
              <div className="p-6 bg-slate-950 rounded border border-slate-800 text-center space-y-3">
                <Shield className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs text-slate-300">
                  Connectez-vous avec votre compte Google pour synchroniser vos parties dans le Cloud.
                </p>
                <button
                  onClick={handleGoogleSignIn}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded font-mono inline-flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter avec Google</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Saves Cloud ({cloudSaves.length})
                  </span>
                  <button
                    onClick={handleUploadCurrentSave}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded flex items-center gap-1 transition cursor-pointer"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Envoyer Partie Locale</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {cloudSaves.length === 0 ? (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded text-center text-xs text-slate-500 font-mono">
                      Aucune sauvegarde enregistrée dans le cloud.
                    </div>
                  ) : (
                    cloudSaves.map((save) => (
                      <div
                        key={save.saveId}
                        className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between text-xs font-mono"
                      >
                        <div>
                          <div className="font-bold text-slate-200">
                            {save.leaderName} ({save.dynastyName})
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Tour {save.turnIndex} • Pop {save.popTotal} • {save.planetId}
                          </div>
                          <div className="text-[9px] text-slate-500">
                            {new Date(save.updatedAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoadCloudSave(save.saveId)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-[10px] cursor-pointer"
                          >
                            Charger
                          </button>
                          <button
                            onClick={() => handleDeleteCloudSave(save.saveId)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
