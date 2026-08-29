"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { useEngineStore } from "../../store/useEngineStore";
import { useUIStore } from "../../store/useUIStore";
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Cloud,
  Download,
  Upload,
  Radio,
  Play,
  Pause,
  Sliders,
  LogOut,
  Save,
  Trash2,
  RotateCcw,
  Sparkles,
  Shield,
  Clock,
  CheckCircle,
  Home
} from "lucide-react";
import { audioService } from "../../services/audio";
import { fipRadio, FIP_STATIONS, FipStation } from "../../services/fipRadio";
import {
  signInWithGoogle,
  logOut,
  subscribeToAuth,
  saveToCloud,
  fetchCloudSaves,
  CloudSaveSlot
} from "../../services/authService";
import { getLocalSavedSlots, LocalSaveSlotMeta } from "../../services/storage";
import { User } from "firebase/auth";
import { UserProfileView } from "../setup/UserProfileView";

const subscribeFip = (callback: () => void) => fipRadio.subscribe(callback);

export const SettingsModal: React.FC = () => {
  const { gameState, activeBottomSheet, closeBottomSheet, loadGameById } = useEngineStore();
  const { isSettingsOpen, closeSettings, theme, setTheme } = useUIStore();

  const [activeModalTab, setActiveModalTab] = useState<"GENERAL" | "PROFILE">("PROFILE");
  const [ambientOn, setAmbientOn] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [user, setUser] = useState<User | null>(null);
  const [cloudSlots, setCloudSlots] = useState<CloudSaveSlot[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSaveSetting, setAutoSaveSetting] = useState<string>("5t"); // 5 turns auto save
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // FIP Radio State
  const fipStation = useSyncExternalStore(subscribeFip, () => fipRadio.getStation(), () => FIP_STATIONS[0]);
  const fipPlaying = useSyncExternalStore(subscribeFip, () => fipRadio.getIsPlaying(), () => false);
  const fipVolume = useSyncExternalStore(subscribeFip, () => fipRadio.getVolume(), () => 0.6);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      setUser(u);
      if (u) {
        fetchCloudSaves(u.uid).then(setCloudSlots);
      }
    });
    return () => unsub();
  }, []);

  const isModalOpen = isSettingsOpen || activeBottomSheet === "SETTINGS";
  if (!isModalOpen) return null;

  const handleClose = () => {
    closeBottomSheet();
    closeSettings();
  };

  const handleToggleAmbient = () => {
    if (ambientOn) {
      audioService.stopAmbient();
      setAmbientOn(false);
    } else {
      audioService.startAmbient();
      setAmbientOn(true);
    }
  };

  const handleMasterVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    audioService.setVolume(vol);
  };

  const handleFipVolumeChange = (vol: number) => {
    fipRadio.setVolume(vol);
  };

  const handleToggleFip = () => {
    fipRadio.togglePlay();
  };

  const handleSelectFipStation = (st: FipStation) => {
    fipRadio.playStation(st);
  };

  const handleExportJson = () => {
    if (!gameState) return;
    const jsonStr = JSON.stringify(gameState, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stellar_genesis_save_turn${gameState.turnIndex}_${gameState.saveId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg("Fichier JSON exporté !");
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string;
        const parsed = JSON.parse(raw);
        if (parsed.saveId && parsed.contractVersion) {
          localStorage.setItem(`sg_save_${parsed.saveId}`, raw);
          loadGameById(parsed.saveId);
          handleClose();
        } else {
          alert("Format de fichier invalide.");
        }
      } catch (err) {
        alert("Erreur de lecture du fichier JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleCloudSaveNow = async () => {
    if (!gameState) {
      setStatusMsg("Aucune partie active à synchroniser.");
      setTimeout(() => setStatusMsg(null), 3000);
      return;
    }
    if (!user) {
      await signInWithGoogle();
      return;
    }
    setIsSyncing(true);
    setStatusMsg("Synchronisation Cloud en cours...");
    const ok = await saveToCloud(user.uid, 1, gameState);
    if (ok) {
      const updated = await fetchCloudSaves(user.uid);
      setCloudSlots(updated);
      setStatusMsg("Partie sauvegardée dans Google Firebase !");
    } else {
      setStatusMsg("Erreur lors de la sauvegarde cloud.");
    }
    setIsSyncing(false);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleExitToMainMenu = () => {
    if (confirm("Retourner au menu principal ? Assurez-vous d'avoir sauvegardé votre progression.")) {
      useEngineStore.setState({ gameState: null });
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 font-sans select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base font-mono uppercase tracking-wide">
                Paramètres & Contrôles Système
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Audio Radio FIP, Sauvegardes Cloud Firebase & Options de Simulation
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>


        {/* Modal Header Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border-b border-slate-800 font-mono text-xs">
          <button
            onClick={() => setActiveModalTab("PROFILE")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition cursor-pointer ${
              activeModalTab === "PROFILE"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Profil & 3 Services (Google Chat / Firebase / SQL)</span>
          </button>
          <button
            onClick={() => setActiveModalTab("GENERAL")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition cursor-pointer ${
              activeModalTab === "GENERAL"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Audio & Système</span>
          </button>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div className="bg-blue-950/90 border-b border-blue-800 px-4 py-2 text-center text-xs font-mono text-blue-300 font-semibold flex items-center justify-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {activeModalTab === "PROFILE" ? (
            <UserProfileView onClose={handleClose} />
          ) : (
            <>
              {/* SECTION 1: Radio FIP Live Stream */}
          <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-xl border border-rose-900/40 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs">
                  FIP
                </div>
                <div>
                  <h4 className="font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5 text-xs">
                    <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                    Radio FIP • Direct & Thématiques
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Diffuseur officiel Radio France intégré à l’arche coloniale
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleFip}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md ${
                  fipPlaying
                    ? "bg-rose-600 hover:bg-rose-500 text-white border border-rose-400"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
              >
                {fipPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>EN DIRECT</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>ÉCOUTER FIP</span>
                  </>
                )}
              </button>
            </div>

            {/* Station Selection Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FIP_STATIONS.map((st) => {
                const isSelected = fipStation.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleSelectFipStation(st)}
                    className={`p-2 rounded-lg text-left transition font-mono border cursor-pointer ${
                      isSelected
                        ? "bg-rose-950/60 border-rose-500 text-white shadow-xs"
                        : "bg-slate-900/70 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">{st.name}</span>
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${st.color}`} />
                    </div>
                    <span className="text-[9px] text-slate-500 block truncate">{st.genre}</span>
                  </button>
                );
              })}
            </div>

            {/* FIP Volume Slider */}
            <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-4 font-mono text-[11px]">
              <span className="text-slate-400 flex items-center gap-1 shrink-0">
                <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                Volume FIP: {Math.round(fipVolume * 100)}%
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={fipVolume}
                onChange={(e) => handleFipVolumeChange(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* SECTION 2: Ambient Web Audio Synthesizer */}
          <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              Sons Ambiants Synthétisés Web Audio
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-300 font-mono">Drone Spatial d’Archologie</span>
                <button
                  onClick={handleToggleAmbient}
                  className={`px-3 py-1.5 rounded font-mono font-bold text-xs transition cursor-pointer ${
                    ambientOn ? "bg-sky-600 text-white shadow-xs" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {ambientOn ? "ACTIF" : "INACTIF"}
                </button>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1 font-mono">
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>Volume Effets & Drone</span>
                  <span className="font-bold text-sky-400">{Math.round(masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={masterVolume}
                  onChange={(e) => handleMasterVolumeChange(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2.5: Sélection du Thème d'Interface */}
          <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Thème Visuel de l&apos;Interface
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-lg border text-left font-mono transition cursor-pointer ${
                  theme === "dark"
                    ? "bg-blue-950/80 border-blue-500 text-white"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <div className="font-bold text-[11px] flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-700 shrink-0" />
                  <span className="truncate">Deep Space</span>
                </div>
                <span className="text-[9px] text-slate-500 block mt-0.5">Mode Sombre</span>
              </button>

              <button
                onClick={() => setTheme("light")}
                className={`p-2 rounded-lg border text-left font-mono transition cursor-pointer ${
                  theme === "light"
                    ? "bg-slate-200 border-blue-600 text-slate-900"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <div className="font-bold text-[11px] flex items-center gap-1 text-inherit">
                  <div className="w-2 h-2 rounded-full bg-white border border-slate-300 shrink-0" />
                  <span className="truncate">Station Lab</span>
                </div>
                <span className="text-[9px] text-slate-500 block mt-0.5">Mode Clair</span>
              </button>

              <button
                onClick={() => setTheme("amber")}
                className={`p-2 rounded-lg border text-left font-mono transition cursor-pointer ${
                  theme === "amber"
                    ? "bg-black border-amber-500 text-amber-500"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <div className="font-bold text-[11px] flex items-center gap-1 text-inherit">
                  <div className="w-2 h-2 rounded-full bg-black border border-amber-500 shrink-0" />
                  <span className="truncate">Retro Term</span>
                </div>
                <span className="text-[9px] text-slate-500 block mt-0.5">Terminal Ambre</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: Firebase Cloud Storage & Account */}
          <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-400" />
                Compte & Synchronisation Firebase Cloud
              </h4>

              {user ? (
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-emerald-400 font-semibold">{user.email}</span>
                  <button
                    onClick={() => logOut()}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    title="Se déconnecter"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Connexion Google</span>
                </button>
              )}
            </div>

            {user ? (
              <div className="space-y-2">
                <button
                  onClick={handleCloudSaveNow}
                  disabled={isSyncing}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSyncing ? "Enregistrement dans Firestore..." : "Sauvegarder la session actuelle sur Firebase"}</span>
                </button>
                <p className="text-[10px] text-slate-400 font-mono text-center">
                  Base de données : gen-lang-client-0030451305 • Sauvegarde synchronisée multi-appareils
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 font-mono bg-slate-900 p-2.5 rounded border border-slate-800">
                Connectez votre compte Google pour sauvegarder et charger automatiquement vos parties depuis Firestore.
              </p>
            )}
          </div>

          {/* SECTION 4: Export & Backup JSON */}
          <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400" />
              Importation / Exportation locale JSON
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono">
              <button
                onClick={handleExportJson}
                className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Télécharger Sauvegarde (.json)</span>
              </button>

              <label className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center justify-center gap-2 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Restaurer Fichier JSON</span>
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
            </div>
          </div>

          {/* SECTION 5: Menu Principal & Reset */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={handleExitToMainMenu}
              className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-2 transition cursor-pointer border border-slate-700"
            >
              <Home className="w-4 h-4 text-sky-400" />
              <span>Menu Principal</span>
            </button>

            <button
              onClick={() => {
                if (confirm("Réinitialiser complètement la partie en cours ?")) {
                  useEngineStore.setState({ gameState: null });
                  closeBottomSheet();
                }
              }}
              className="py-2 px-3 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 border border-rose-800 font-mono text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réinitialiser Partie</span>
            </button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
