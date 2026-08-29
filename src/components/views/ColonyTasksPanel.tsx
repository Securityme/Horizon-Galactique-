"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEngineStore } from "../../store/useEngineStore";
import { audioService } from "../../services/audio";
import { useUIStore } from "../../store/useUIStore";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Trophy, 
  Coins, 
  Atom, 
  Compass, 
  ShieldCheck,
  Zap
} from "lucide-react";
import { generateProceduralMissions } from "../../features/colony/tasks/proceduralMissions";

export interface ColonyTask {
  id: string;
  title: string;
  description: string;
  category: "CONSTRUCTION" | "RESEARCH" | "POPULATION" | "ECONOMY" | "CUSTOM";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  reward: {
    credits: number;
    science: number;
  };
  completed: boolean;
  isCustom?: boolean;
}

const DEFAULT_MIN_MISSIONS: ColonyTask[] = [
  {
    id: "m-01",
    title: "Sécurité Énergétique de l'Arche",
    description: "Assurer l'alimentation électrique d'urgence en bâtissant au moins 2 Centrales de Fusion/Solaires.",
    category: "CONSTRUCTION",
    difficulty: "EASY",
    reward: { credits: 2500, science: 15 },
    completed: false,
  },
  {
    id: "m-02",
    title: "Expansion Démographique",
    description: "Atteindre un seuil de population de 60 colons actifs pour agrandir le dôme d'archologie.",
    category: "POPULATION",
    difficulty: "MEDIUM",
    reward: { credits: 1500, science: 30 },
    completed: false,
  },
  {
    id: "m-03",
    title: "Progrès Scientifique Quantum",
    description: "Accumuler au moins 30 points de recherche pour initier l'analyse des signaux extra-solaires.",
    category: "RESEARCH",
    difficulty: "HARD",
    reward: { credits: 4000, science: 50 },
    completed: false,
  }
];

export const ColonyTasksPanel: React.FC = () => {
  const { gameState } = useEngineStore();
  const { theme } = useUIStore();
  
  const saveId = gameState?.saveId || "default";

  // Lazy Initial State loading
  const [tasks, setTasks] = useState<ColonyTask[]>(() => {
    if (typeof window === "undefined") return DEFAULT_MIN_MISSIONS;
    const key = `sg_tasks_${saveId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn("Error parsing tasks storage:", e);
      }
    }
    return DEFAULT_MIN_MISSIONS;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");

  // Form states for new task creation
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<ColonyTask["category"]>("CUSTOM");
  const [newDifficulty, setNewDifficulty] = useState<ColonyTask["difficulty"]>("EASY");
  const [rewardCredits, setRewardCredits] = useState(1000);
  const [rewardScience, setRewardScience] = useState(10);

  // Keep a ref of tasks to avoid re-triggering effects unnecessarily
  const tasksRef = useRef(tasks);
  
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // Sync tasks when saveId switches (using a clean async defer to bypass linter warning)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `sg_tasks_${saveId}`;
    const stored = localStorage.getItem(key);
    
    const timeoutId = setTimeout(() => {
      if (stored) {
        try {
          setTasks(JSON.parse(stored));
        } catch (e) {
          console.warn("Sync parse error:", e);
        }
      } else {
        setTasks(DEFAULT_MIN_MISSIONS);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [saveId]);

  const saveTasksToStore = useCallback((newTasks: ColonyTask[]) => {
    setTasks(newTasks);
    if (typeof window !== "undefined") {
      localStorage.setItem(`sg_tasks_${saveId}`, JSON.stringify(newTasks));
    }
  }, [saveId]);

  // Automated Task Status Checker
  useEffect(() => {
    if (!gameState || tasksRef.current.length === 0) return;

    let updated = false;
    const checkedTasks = tasksRef.current.map(task => {
      if (task.completed) return task;

      // 1. Static/Classic Missions
      if (task.id === "m-02" && gameState.demographics.popTotal >= 60) {
        updated = true;
        return { ...task, completed: true };
      }
      if (task.id === "m-03" && (gameState.research?.points ?? 0) >= 30) {
        updated = true;
        return { ...task, completed: true };
      }

      // 2. Procedural Missions
      if (task.id === "proc-energy" && gameState.economy.netEnergyMW >= 15) {
        updated = true;
        return { ...task, completed: true };
      }
      if (task.id === "proc-pop" && gameState.demographics.popTotal >= 120) {
        updated = true;
        return { ...task, completed: true };
      }
      if (task.id === "proc-research" && (gameState.research?.points ?? 0) >= 50) {
        updated = true;
        return { ...task, completed: true };
      }
      if (task.id === "proc-isru" && (gameState.economy.storedOreTons ?? 0) >= 500) {
        updated = true;
        return { ...task, completed: true };
      }

      return task;
    });

    // 3. Auto-Inject missing procedural missions
    const procedural = generateProceduralMissions(gameState);
    const existingIds = new Set(checkedTasks.map(t => t.id));
    const newProcedural = procedural.filter(p => !existingIds.has(p.id));
    
    if (newProcedural.length > 0) {
      updated = true;
      checkedTasks.push(...newProcedural);
    }

    if (updated) {
      const timeoutId = setTimeout(() => {
        saveTasksToStore(checkedTasks);
        if (checkedTasks.some((t, i) => t.completed && !tasksRef.current[i]?.completed)) {
          audioService.playSuccessFanfare();
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [gameState, saveTasksToStore]);

  if (!gameState) return null;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: ColonyTask = {
      id: `task-${Date.now()}`,
      title: newTitle,
      description: newDesc || "Pas de description spécifiée.",
      category: newCategory,
      difficulty: newDifficulty,
      reward: { credits: rewardCredits, science: rewardScience },
      completed: false,
      isCustom: true,
    };

    const nextTasks = [...tasks, newTask];
    saveTasksToStore(nextTasks);

    // Reset Form
    setNewTitle("");
    setNewDesc("");
    setNewCategory("CUSTOM");
    setNewDifficulty("EASY");
    setRewardCredits(1000);
    setRewardScience(10);
    setShowAddForm(false);

    audioService.playBlip(800, 0.05);
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextTasks = tasks.filter(t => t.id !== id);
    saveTasksToStore(nextTasks);
    audioService.playBlip(400, 0.08);
  };

  const handleToggleTask = (id: string) => {
    const nextTasks = tasks.map(task => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        if (nextCompleted) {
          // Play fanfare sound
          audioService.playSuccessFanfare();
          
          // Grant actual core game rewards to treasury and science
          useEngineStore.setState((prev) => {
            if (!prev.gameState) return {};
            return {
              gameState: {
                ...prev.gameState,
                economy: {
                  ...prev.gameState.economy,
                  colonyTreasury: prev.gameState.economy.colonyTreasury + task.reward.credits
                },
                research: prev.gameState.research ? {
                  ...prev.gameState.research,
                  points: prev.gameState.research.points + task.reward.science
                } : {
                  points: task.reward.science,
                  unlocked: [],
                  inProgress: null,
                  allocationPct: { A: 25, B: 25, C: 25, D: 25 }
                }
              }
            };
          });
        }
        return { ...task, completed: nextCompleted };
      }
      return task;
    });

    saveTasksToStore(nextTasks);
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "active") return !task.completed;
    if (activeTab === "completed") return task.completed;
    return true;
  });

  const isLight = theme === "light";
  const isAmber = theme === "amber";

  return (
    <div className={`border rounded-lg p-4 sm:p-5 shadow-xs transition ${
      isLight ? "bg-white border-slate-200" :
      isAmber ? "bg-black border-amber-500 text-amber-500 font-mono" :
      "bg-slate-900/90 border-slate-800"
    }`}>
      {/* Panel Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/20 pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded ${
            isLight ? "bg-blue-50 text-blue-600 border border-blue-100" :
            isAmber ? "bg-black text-amber-500 border border-amber-500" :
            "bg-slate-950/80 text-blue-400 border border-slate-800"
          }`}>
            <Trophy className="w-4 h-4 animate-bounce-slow" />
          </div>
          <div>
            <h2 className={`text-xs font-bold uppercase tracking-widest ${
              isLight ? "text-slate-900" : isAmber ? "text-amber-500" : "text-white"
            }`}>
              Missions & Directives de la Colonie
            </h2>
            <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">
              Suivi interactif des objectifs d&apos;administration
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            audioService.playBlip(680, 0.05);
            setShowAddForm(!showAddForm);
          }}
          className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
            isLight ? "bg-slate-900 hover:bg-slate-800 text-white" :
            isAmber ? "bg-amber-500 text-black hover:bg-amber-400" :
            "bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Créer une Directive</span>
        </button>
      </div>

      {/* Task Creation Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className={`p-4 rounded-md border mb-4 space-y-3.5 animate-in slide-in-from-top-3 duration-200 ${
          isLight ? "bg-slate-50 border-slate-200" :
          isAmber ? "bg-black border-amber-500" :
          "bg-slate-950/60 border-slate-800"
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-extrabold uppercase text-indigo-400">
              Nouveau Projet d&apos;Archologie
            </span>
            <button
              type="button"
              onClick={() => {
                audioService.playBlip(400, 0.05);
                setShowAddForm(false);
              }}
              className="text-[9px] font-mono text-slate-500 uppercase hover:text-slate-300"
            >
              [ Annuler ]
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 block">Titre de la Directive</label>
              <input
                type="text"
                required
                placeholder="Ex: Optimiser le dôme alpha"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={`w-full p-2 rounded text-xs border focus:outline-none ${
                  isLight ? "bg-white border-slate-300 text-slate-800" :
                  isAmber ? "bg-black border-amber-500 text-amber-500 placeholder-amber-700" :
                  "bg-slate-900 border-slate-800 text-white placeholder-slate-600 focus:border-blue-500"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 block">Secteur / Categorie</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className={`w-full p-2 rounded text-xs border focus:outline-none ${
                  isLight ? "bg-white border-slate-300 text-slate-800" :
                  isAmber ? "bg-black border-amber-500 text-amber-500" :
                  "bg-slate-900 border-slate-800 text-white focus:border-blue-500"
                }`}
              >
                <option value="CUSTOM">GÉNÉRAL / DIRECTIVES</option>
                <option value="CONSTRUCTION">INFRASTRUCTURE / PROJETS</option>
                <option value="RESEARCH">RECHERCHE & DÉVELOPPEMENT</option>
                <option value="POPULATION">RESSOURCES HUMAINES</option>
                <option value="ECONOMY">FLUX FINANCIERS</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 block">Description des Objectifs</label>
            <textarea
              rows={2}
              placeholder="Indiquez ici les conditions de validation de la directive de bord..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className={`w-full p-2 rounded text-xs border focus:outline-none resize-none ${
                isLight ? "bg-white border-slate-300 text-slate-800" :
                isAmber ? "bg-black border-amber-500 text-amber-500 placeholder-amber-700" :
                "bg-slate-900 border-slate-800 text-white focus:border-blue-500"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 block">Difficulté estimée</label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as any)}
                className={`w-full p-2 rounded text-xs border focus:outline-none ${
                  isLight ? "bg-white border-slate-300 text-slate-800" :
                  isAmber ? "bg-black border-amber-500 text-amber-500" :
                  "bg-slate-900 border-slate-800 text-white"
                }`}
              >
                <option value="EASY">FACILE (Standard)</option>
                <option value="MEDIUM">INTERMÉDIAIRE</option>
                <option value="HARD">COMPLEXE (Majeur)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                <Coins className="w-3 h-3 text-yellow-500" /> Crédits de prime
              </label>
              <input
                type="number"
                min={0}
                max={50000}
                step={500}
                value={rewardCredits}
                onChange={(e) => setRewardCredits(Number(e.target.value))}
                className={`w-full p-2 rounded text-xs border focus:outline-none ${
                  isLight ? "bg-white border-slate-300 text-slate-800" :
                  isAmber ? "bg-black border-amber-500 text-amber-500" :
                  "bg-slate-900 border-slate-800 text-white"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                <Atom className="w-3 h-3 text-cyan-400" /> Science allouée
              </label>
              <input
                type="number"
                min={0}
                max={200}
                step={5}
                value={rewardScience}
                onChange={(e) => setRewardScience(Number(e.target.value))}
                className={`w-full p-2 rounded text-xs border focus:outline-none ${
                  isLight ? "bg-white border-slate-300 text-slate-800" :
                  isAmber ? "bg-black border-amber-500 text-amber-500" :
                  "bg-slate-900 border-slate-800 text-white"
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded font-mono text-xs font-bold uppercase tracking-widest transition cursor-pointer ${
              isLight ? "bg-indigo-600 hover:bg-indigo-500 text-white" :
              isAmber ? "bg-amber-500 hover:bg-amber-400 text-black" :
              "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/20"
            }`}
          >
            Confirmer & Valider la Directive
          </button>
        </form>
      )}

      {/* Task Filters */}
      <div className="flex gap-1.5 pb-3 border-b border-slate-800/10 mb-4 text-[10px] font-mono">
        {(["all", "active", "completed"] as const).map((filter) => {
          const isActive = activeTab === filter;
          return (
            <button
              key={filter}
              onClick={() => {
                audioService.playBlip(700, 0.04);
                setActiveTab(filter);
              }}
              className={`px-3 py-1 rounded border font-bold transition uppercase cursor-pointer ${
                isActive
                  ? isLight ? "bg-slate-900 border-slate-900 text-white" :
                    isAmber ? "bg-amber-500 border-amber-500 text-black" :
                    "bg-blue-600/95 border-blue-500 text-white"
                  : isLight ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100" :
                    isAmber ? "bg-black border-amber-500/20 text-amber-500/60 hover:text-amber-500" :
                    "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              {filter === "all" ? "Toutes" : filter === "active" ? "En cours" : "Terminées"}
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 space-y-2 border border-dashed border-slate-800/10 rounded-lg">
            <Compass className="w-6 h-6 text-slate-500 mx-auto opacity-60 animate-spin-slow" />
            <p className="text-xs text-slate-500 font-mono">Aucune directive de bord enregistrée sous ce filtre.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const hasDemographicsGoal = task.id === "m-02";
            const hasScienceGoal = task.id === "m-03";

            // Real-time colony telemetry progress helper
            let progressPct = 0;
            let labelProgress = "";

            if (hasDemographicsGoal) {
              const current = gameState.demographics.popTotal;
              progressPct = Math.min(100, (current / 60) * 100);
              labelProgress = `${current} / 60 colons`;
            } else if (hasScienceGoal) {
              const current = gameState.research?.points ?? 0;
              progressPct = Math.min(100, (current / 30) * 100);
              labelProgress = `${current} / 30 pts R&D`;
            }

            return (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-3.5 rounded-lg border text-left transition duration-200 relative overflow-hidden flex flex-col justify-between gap-3 group cursor-pointer ${
                  task.completed
                    ? isLight ? "bg-emerald-50/50 border-emerald-200 opacity-70" :
                      isAmber ? "bg-black border-emerald-500/50 opacity-60 text-emerald-500" :
                      "bg-emerald-950/20 border-emerald-950/40 opacity-75"
                    : isLight ? "bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-xs" :
                      isAmber ? "bg-black border-amber-500/40 hover:border-amber-500 hover:shadow-md" :
                      "bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700 hover:shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {task.completed ? (
                      <CheckCircle2 className={`w-4 h-4 ${isAmber ? "text-emerald-500" : "text-emerald-500 animate-in zoom-in-50"}`} />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className={`text-xs font-bold leading-tight ${
                        task.completed ? "line-through text-slate-500" :
                        isLight ? "text-slate-800" : isAmber ? "text-amber-500" : "text-slate-200"
                      }`}>
                        {task.title}
                      </h4>
                      {task.isCustom && (
                        <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase">
                          Com. de bord
                        </span>
                      )}
                      <span className={`text-[8px] font-mono px-1 py-0.2 rounded border font-bold uppercase ${
                        task.difficulty === "EASY" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        task.difficulty === "MEDIUM" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                        "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      }`}>
                        {task.difficulty}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{task.description}</p>
                  </div>

                  {/* Custom task trash button */}
                  {task.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTask(task.id, e)}
                      className="shrink-0 text-slate-600 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Automation telemetry bar */}
                {(hasDemographicsGoal || hasScienceGoal) && !task.completed && (
                  <div className="space-y-1 pt-1 border-t border-slate-800/10">
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase">
                      <span>Télémétrie de validation</span>
                      <span className="font-bold text-slate-300">{labelProgress}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Rewards Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono text-slate-400 border-t border-dashed border-slate-800/10 pt-2 font-semibold">
                  <div className="flex items-center gap-1.5 font-sans">
                    <ShieldCheck className="w-3 h-3 text-blue-500" />
                    <span>Statut : {task.completed ? "Mission Validée" : "En cours"}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">Primes :</span>
                    <span className="text-amber-500 flex items-center gap-0.5">
                      <Coins className="w-3 h-3 text-yellow-500" />
                      +{task.reward.credits} ¢
                    </span>
                    <span className="text-cyan-400 flex items-center gap-0.5">
                      <Atom className="w-3 h-3 text-cyan-500" />
                      +{task.reward.science} R&D
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
