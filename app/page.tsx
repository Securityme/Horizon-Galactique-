"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { useEngineStore } from "../src/store/useEngineStore";
import { useUIStore } from "../src/store/useUIStore";

import { HeaderBar } from "../src/components/layout/HeaderBar";
import { TabBar } from "../src/components/layout/TabBar";
import { JournalView } from "../src/components/views/JournalView";
import { Macro4XView } from "../src/components/views/Macro4XView";
import { GovernanceView } from "../src/components/views/GovernanceView";
import { CommunityView } from "../src/components/views/CommunityView";

import { BuildingInspectorModal } from "../src/components/modals/BuildingInspectorModal";
import { TechTreeModal } from "../src/components/modals/TechTreeModal";
import { AdvisorChatModal } from "../src/components/modals/AdvisorChatModal";
import { CycleReportModal } from "../src/components/modals/CycleReportModal";
import { SettingsModal } from "../src/components/modals/SettingsModal";
import { TutorialModal } from "../src/components/modals/TutorialModal";
import { LeaderProfileModal } from "../src/components/modals/LeaderProfileModal";

import { GameSetupScreen } from "../src/components/setup/GameSetupScreen";
import { MainMenuScreen } from "../src/components/setup/MainMenuScreen";
import { AuthGate } from "../src/components/AuthGate";
import { audioService } from "../src/services/audio";
import { Terminal, ShieldAlert, Sparkles, Orbit, Radio, Cpu } from "lucide-react";

const subscribeNoop = () => () => {};

export default function HomePage() {
  const { gameState, activeTab } = useEngineStore();
  const { theme, setTheme } = useUIStore();
  const [showSetupWizard, setShowSetupWizard] = useState<boolean>(false);

  // Bootloader State
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  // Load Saved Theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("sg_theme") as any;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, [setTheme]);

  // Terminal Simulated Sequence
  useEffect(() => {
    if (!mounted) return;
    const logs = [
      "⚡ SYSTEM_BOOT // INITIALIZING L'ARCHE DES ÉTOILES DIAGNOSTICS...",
      "⚙️ [OK] Multi-Thread Engine: simulation.worker active (10931 cycles/sec)",
      "🎲 [OK] Quantum Seed: Mulberry32 Deterministic Generator mounted",
      "⚡ [OK] Grid Solver: 39-Bus AC balanced load registered",
      "💧 [OK] Flow Engine: Hydraulic Solver online (Deterministic loop)",
      "👥 [OK] Demographics: Segment Grid 14x14 T0-T3 calibrated",
      "🤖 [OK] Edge Router: Gemini 3.5 AI Chronicle engine online",
      "🔥 [OK] Firebase Connect: Cloud-Saves sync rules deployed",
      "💾 [OK] Save-State System: Local indexedDB slot active",
      "🚀 [SYSTEM] BOOT SUCCESSFUL. WELCOME BACK ARCHON-COMMANDER."
    ];

    let currentIdx = 0;
    let timeoutId: NodeJS.Timeout | null = null;
    const interval = setInterval(() => {
      if (currentIdx < logs.length) {
        const nextLog = logs[currentIdx];
        if (nextLog) {
          setBootLogs((prev) => [...prev, nextLog]);
          setBootProgress(Math.floor(((currentIdx + 1) / logs.length) * 100));
          // Cinematic AV Sound Feedback
          if (nextLog.startsWith("🚀")) {
            audioService.playSuccessFanfare();
          } else {
            audioService.playBlip(600 + currentIdx * 45, 0.03);
          }
        }
        currentIdx++;
      } else {
        clearInterval(interval);
        timeoutId = setTimeout(() => {
          setIsBooting(false);
        }, 600);
      }
    }, 250);

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Retro sci-fi startup screen (AV Optimized)
  if (isBooting) {
    return (
      <div className="min-h-screen bg-black text-emerald-400 font-mono p-4 sm:p-8 flex flex-col justify-between select-none relative overflow-hidden">
        {/* CRT Scanline and Flicker Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent bg-[size:100%_4px] pointer-events-none z-30 opacity-40 animate-pulse" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black pointer-events-none z-20" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-emerald-950/80 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-300 block">Console de Diagnostics</span>
              <span className="text-[9px] text-emerald-600 block">Liaison Quantum // v20.5-PROD</span>
            </div>
          </div>
          <button
            onClick={() => {
              audioService.playBlip(900, 0.05);
              setIsBooting(false);
            }}
            className="px-3 py-1 text-[10px] border border-emerald-800/60 hover:bg-emerald-950/50 text-emerald-500 hover:text-emerald-300 rounded cursor-pointer transition uppercase tracking-wider"
          >
            [ Passer le Chargement ]
          </button>
        </div>

        {/* Center Grid and Diagnostics Logs */}
        <div className="flex-1 my-8 max-w-2xl w-full mx-auto flex flex-col justify-center relative z-10">
          {/* Circular Pulse Radar */}
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-emerald-950/60 animate-ping opacity-25" />
              <div className="absolute inset-2 rounded-full border border-emerald-800/40 animate-pulse" />
              <Orbit className="w-10 h-10 text-emerald-400 animate-spin-slow" />
            </div>
          </div>

          {/* Console Log Panel */}
          <div className="bg-slate-950/80 border border-emerald-950/70 p-6 rounded-lg shadow-inner h-[280px] overflow-y-auto space-y-2 text-xs scrollbar-thin scrollbar-thumb-emerald-950">
            {bootLogs.map((log, idx) => {
              if (!log) return null;
              const isSystem = typeof log === "string" && log && log.startsWith("🚀");
              return (
                <div
                  key={idx}
                  className={`py-0.5 leading-relaxed animate-in fade-in slide-in-from-left-4 duration-200 flex items-start gap-2 ${
                    isSystem ? "text-amber-400 font-extrabold mt-3 border-t border-emerald-950/40 pt-2" : "text-emerald-500/90"
                  }`}
                >
                  <span className="text-emerald-700 font-bold">$&gt;</span>
                  <span>{log}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Progress Bar */}
        <div className="max-w-2xl w-full mx-auto space-y-3 pb-6 relative z-10">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-emerald-600 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Séquence d&apos;Amorçage de l&apos;Arche
            </span>
            <span>{bootProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 border border-emerald-950 rounded overflow-hidden p-0.5">
            <div
              className="h-full bg-emerald-400 transition-all duration-200 shadow-[0_0_12px_rgba(52,211,153,0.8)] rounded-sm"
              style={{ width: `${bootProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Active theme layout class selection
  const themeClasses = theme === "light"
    ? "min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans"
    : theme === "amber"
    ? "min-h-screen bg-black text-amber-500 flex flex-col font-mono"
    : "min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans";

  return (
    <AuthGate onStartNewGame={() => setShowSetupWizard(true)}>
      {!gameState ? (
        <>
          {showSetupWizard ? (
            <GameSetupScreen onBackToMenu={() => setShowSetupWizard(false)} />
          ) : (
            <MainMenuScreen onStartNewGame={() => setShowSetupWizard(true)} />
          )}
        </>
      ) : (
        <div className={themeClasses}>
          <HeaderBar />

          <main className="flex-1 overflow-y-auto pb-20">
            {activeTab === "journal" && <JournalView />}
            {activeTab === "macro4x" && <Macro4XView />}
            {activeTab === "gouvernance" && <GovernanceView />}
            {activeTab === "community" && <CommunityView />}
          </main>

          {/* Footer Navigation Bar */}
          <footer className="sticky bottom-0 z-30 shadow-lg">
            <TabBar />
          </footer>

          {/* Overlays / Modals */}
          <BuildingInspectorModal />
          <TechTreeModal />
          <AdvisorChatModal />
          <CycleReportModal />
          <LeaderProfileModal />
        </div>
      )}
      <SettingsModal />
      <TutorialModal />
    </AuthGate>
  );
}
