"use client";

import React from "react";
import { useEngineStore } from "../../store/useEngineStore";
import { BookOpen, Map, Crown, MessageSquare } from "lucide-react";

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useEngineStore();

  const tabs: { id: "gouvernance" | "journal" | "macro4x" | "community"; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: "gouvernance",
      label: "Gouvernance",
      icon: <Crown className="w-4 h-4" />,
      desc: "Leader, Finances & Factions"
    },
    {
      id: "journal",
      label: "Chroniques",
      icon: <BookOpen className="w-4 h-4" />,
      desc: "Micro-Loop & Evénements"
    },
    {
      id: "macro4x",
      label: "Territoire 4X",
      icon: <Map className="w-4 h-4" />,
      desc: "Grille, R&D & Simulation"
    },
    {
      id: "community",
      label: "Communauté",
      icon: <MessageSquare className="w-4 h-4" />,
      desc: "Chat Global & Google Chat"
    }
  ];

  return (
    <nav className="bg-[#0B0F19] border-t border-slate-800/80 px-2 sm:px-4 flex items-center justify-center select-none shadow-xl backdrop-blur-md">
      <div className="grid grid-cols-4 w-full max-w-5xl gap-1.5 sm:gap-2.5 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center sm:justify-start gap-2 px-2.5 sm:px-4 py-2 rounded-md text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-md shadow-blue-900/40 border border-blue-400/30 ring-1 ring-blue-500/20"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-100 hover:bg-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="shrink-0">
                {isActive ? (
                  <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse block shadow-xs shadow-cyan-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full border border-slate-600 block opacity-60" />
                )}
              </div>
              <div className="shrink-0 text-indigo-300">{tab.icon}</div>
              <div className="flex flex-col text-left truncate">
                <span className="leading-tight font-bold tracking-tight text-[11px] sm:text-xs truncate">{tab.label}</span>
                <span className="hidden md:inline text-[9px] text-slate-400 font-mono opacity-80 truncate -mt-0.5">{tab.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
