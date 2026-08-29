"use client";

import React, { useState } from "react";
import { useEngineStore } from "../../store/useEngineStore";
import { Sparkles, Globe, Crown, Shield, Rocket, Dices, ArrowRight, Sliders, Sun, Atom } from "lucide-react";
import dbSystems from "../../data/db_systems.json";
import dbPlanets from "../../data/db_planets.json";
import dbArchetypes from "../../data/db_archetypes.json";
import { formatNumber } from "../../lib/formatters";

interface GameSetupScreenProps {
  onBackToMenu?: () => void;
}

export const GameSetupScreen: React.FC<GameSetupScreenProps> = ({ onBackToMenu }) => {
  const { initNewGame, resumeGame } = useEngineStore();

  const [selectedSystemId, setSelectedSystemId] = useState<string>(dbSystems[0]?.id || "SYS-001");
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>(dbPlanets[0]?.id || "PLA-001");
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>(dbArchetypes[0]?.id || "ARC-01");
  const [leaderName, setLeaderName] = useState<string>("Elysia Vance");
  const [dynastyName, setDynastyName] = useState<string>("Vance-Sovereign");
  const [seed, setSeed] = useState<number>(42891);

  // Advanced Starting Modifiers
  const [starType, setStarType] = useState<string>("Solaire G-Type Standard");
  const [asteroidDensity, setAsteroidDensity] = useState<string>("Normale");
  const [archeModuleFocus, setArcheModuleFocus] = useState<string>("Extracteur ISRU Automatisé");
  const [leaderPerk, setLeaderPerk] = useState<string>("Genèse Dynastique (+10% Légitimité)");

  const activeSystem = dbSystems.find((s) => s.id === selectedSystemId) || dbSystems[0];
  const planetsInSystem = dbPlanets.filter((p) => p.systemId === selectedSystemId);
  const activePlanet = dbPlanets.find((p) => p.id === selectedPlanetId) || planetsInSystem[0] || dbPlanets[0];
  const activeArchetype = dbArchetypes.find((a) => a.id === selectedArchetypeId) || dbArchetypes[0];

  const handleSystemChange = (sysId: string) => {
    setSelectedSystemId(sysId);
    const planets = dbPlanets.filter((p) => p.systemId === sysId);
    if (planets.length > 0) {
      setSelectedPlanetId(planets[0].id);
    }
  };

  const handleStartGame = () => {
    initNewGame({
      systemId: selectedSystemId,
      planetId: selectedPlanetId,
      archetypeId: selectedArchetypeId,
      leaderName: leaderName.trim() || "Elysia Vance",
      dynastyName: dynastyName.trim() || "Vance-Sovereign",
      seed,
      starType,
      asteroidDensity,
      archeModuleFocus,
      leaderPerk
    });
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 900000) + 10000);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center justify-center p-3 sm:p-5 select-none font-sans">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-md space-y-5">
        {/* Header Title */}
        <div className="text-center space-y-1.5 border-b border-slate-200 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-semibold mb-0.5">
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>MOTEUR 4X DEEP SIMULATION & CONFIGURATEUR SPATIAL</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Stellar Genesis : Frontier Archology
          </h1>
          <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
            Fondez votre colonie planétaire, déploiez vos modules ISRU, gérez la N.I.A et arbitrez les tensions de souveraineté.
          </p>
        </div>

        {/* Wizard Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Col 1: System & Planet */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Système & Planète</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-mono text-slate-500 font-semibold block mb-1">Système Stellaire</label>
                <select
                  value={selectedSystemId}
                  onChange={(e) => handleSystemChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded p-2 font-mono"
                >
                  {dbSystems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 font-semibold block mb-1">Planète d&apos;Atterrissage</label>
                <select
                  value={selectedPlanetId}
                  onChange={(e) => setSelectedPlanetId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded p-2 font-mono"
                >
                  {planetsInSystem.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.atmosphere})
                    </option>
                  ))}
                </select>
              </div>

              {/* Planet Mini Specs */}
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] font-mono space-y-0.5 text-slate-600">
                <div className="text-slate-900 font-bold">{activePlanet.name}</div>
                <div>Gravité : {activePlanet.gravityG} G</div>
                <div>Pression : {activePlanet.initPressureBar} bar</div>
                <div>Température : {activePlanet.meanTempC}°C</div>
                <div>Richesse ISRU : {activePlanet.isruRichness}x</div>
              </div>
            </div>
          </div>

          {/* Col 2: Leader Archetype */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
              <Crown className="w-3.5 h-3.5 text-purple-600" />
              <span>2. Archétype Dirigeant</span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {dbArchetypes.map((arch) => {
                const isSelected = selectedArchetypeId === arch.id;
                return (
                  <button
                    key={arch.id}
                    onClick={() => setSelectedArchetypeId(arch.id)}
                    className={`w-full p-2 rounded border text-left transition cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 border-blue-500 text-slate-800 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold font-mono mb-0.5">
                      <span className="text-slate-900">{arch.name}</span>
                      <span className="text-[10px] text-amber-700 font-semibold">{formatNumber(arch.privateCredits)} ¢</span>
                    </div>
                    <p className="text-[10px] text-emerald-700 leading-tight">Bonus : {arch.bonus}</p>
                    <p className="text-[10px] text-rose-700 leading-tight">Malus : {arch.malus}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Col 3: Identity & Advanced Modifiers */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>3. Dynastie & Modificateurs</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-mono text-slate-500 font-semibold block mb-1">Nom du Leader</label>
                <input
                  type="text"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded p-2 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 font-semibold block mb-1">Nom de la Dynastie</label>
                <input
                  type="text"
                  value={dynastyName}
                  onChange={(e) => setDynastyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded p-2 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 font-semibold block mb-1">Graine Déterministe</label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(Number(e.target.value))}
                    className="flex-1 bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded p-2 font-mono"
                  />
                  <button
                    onClick={handleRandomSeed}
                    className="p-2 rounded bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    <Dices className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Advanced Planetary & System Modifiers */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-800 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-blue-600" /> Propriétés Avancées du Système Solaire & Module de Départ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-1">Type d&apos;Étoile Hôte</label>
              <select
                value={starType}
                onChange={(e) => setStarType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-1.5 text-slate-800 text-xs"
              >
                <option value="Solaire G-Type Standard">Solaire G-Type (Solaire 1.0x)</option>
                <option value="Naine Rouge Intermittente">Naine Rouge M (Énergie -20%, Eruptions)</option>
                <option value="Étoile Double Binaire">Système Binaire (+30% Solaire)</option>
                <option value="Naine Bleue Énergétique">Naine Bleue (+50% Rayonnement R&D)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-1">Densité d&apos;Astéroïdes</label>
              <select
                value={asteroidDensity}
                onChange={(e) => setAsteroidDensity(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-1.5 text-slate-800 text-xs"
              >
                <option value="Faible">Faible (Sécurité maximale)</option>
                <option value="Normale">Normale (Équilibre ISRU)</option>
                <option value="Ceinture Dense">Ceinture Dense (+150% Richesse ISRU)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-1">Module Prioritaire de l&apos;Arche</label>
              <select
                value={archeModuleFocus}
                onChange={(e) => setArcheModuleFocus(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-1.5 text-slate-800 text-xs"
              >
                <option value="Extracteur ISRU Automatisé">Extracteur ISRU Automatisé</option>
                <option value="Bloc Modulaire Inflatable">Bloc Habitat Modulaire</option>
                <option value="Réacteur Modulaire à Fission">Réacteur Modulaire à Fission</option>
                <option value="Salle d'Instruction">Salle d&apos;Instruction R&D</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-1">Trait de Dynastie Leader</label>
              <select
                value={leaderPerk}
                onChange={(e) => setLeaderPerk(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-1.5 text-slate-800 text-xs"
              >
                <option value="Genèse Dynastique (+10% Légitimité)">Genèse Dynastique (+10% Légitimité)</option>
                <option value="Ingénieur Stellaire (+15% Énergie)">Ingénieur Stellaire (+15% MW)</option>
                <option value="Arbitre Financier (+25 000 ¢)">Arbitre Financier (+25 000 ¢ Privés)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {onBackToMenu ? (
            <button
              onClick={onBackToMenu}
              className="text-xs font-mono text-slate-600 hover:text-slate-900 font-semibold cursor-pointer flex items-center gap-1"
            >
              ← Retour au Menu Principal
            </button>
          ) : (
            <button
              onClick={() => resumeGame()}
              className="text-xs font-mono text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Reprendre la dernière session locale →
            </button>
          )}

          <button
            id="btn-start-game"
            onClick={handleStartGame}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Lancer la Colonisation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
