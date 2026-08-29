"use client";

import React, { useState } from "react";
import { useEngineStore } from "../../store/useEngineStore";
import {
  HelpCircle,
  X,
  Sparkles,
  Users,
  Map,
  Dices,
  RotateCw,
  Zap,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Lightbulb
} from "lucide-react";

import { useUIStore } from "../../store/useUIStore";

export const TutorialModal: React.FC = () => {
  const { activeBottomSheet, closeBottomSheet } = useEngineStore();
  const { theme } = useUIStore();
  const [activeStep, setActiveStep] = useState<number>(1);

  if (activeBottomSheet !== ("TUTORIAL" as any)) return null;

  const steps = [
    {
      step: 1,
      title: "Moteur de Cycle & Avancement des Tours",
      icon: <RotateCw className="w-5 h-5 text-blue-500" />,
      badge: "Moteur 4X",
      summary: "La simulation fonctionne par cycles de 10 tours avec calculs déterministes.",
      content: (
        <div className="space-y-2 text-xs text-slate-600 font-sans">
          <p>
            Chaque tour représente une échelle de temps (1 mois à 1 an selon l&apos;Ère active). À chaque résolution, les 9 secteurs de ressources (énergie, eau, minerai ISRU, terraformation, crédits) progressent simultanément.
          </p>
          <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-900 font-mono text-[11px]">
            💡 <strong>Astuce :</strong> Utilisez le <em>Laboratoire Fast-Sim</em> dans l&apos;onglet <strong>Système 4X</strong> pour projeter la viabilité de votre colonie jusqu&apos;à 100 tours en avance !
          </div>
        </div>
      )
    },
    {
      step: 2,
      title: "Cartes de Destin & Jets de Dés D20",
      icon: <Dices className="w-5 h-5 text-amber-500" />,
      badge: "Micro-Loop Roguelike",
      summary: "Tirez les cartes de destin et affrontez les défis d'archologie.",
      content: (
        <div className="space-y-2 text-xs text-slate-600 font-sans">
          <p>
            À chaque tour, 3 Cartes de Destin sont proposées. Chaque carte cible un des 10 Livres narratifs (Technocratie, Industrialisme, Militarisme, etc.) et déclenche un jet de dé D20.
          </p>
          <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-mono text-[11px]">
            🎲 <strong>Degrés de succès :</strong> Réussite Critique (D20=20), Succès, Échec, Échec Critique (D20=1). Les succès critiques ajoutent un fait canonique irréversible dans l&apos;histoire !
          </div>
        </div>
      )
    },
    {
      step: 3,
      title: "Heatmap Démographique & Tiers T0-T3",
      icon: <Users className="w-5 h-5 text-purple-500" />,
      badge: "Territoire & Population",
      summary: "Visualisez la densité et la répartition de vos colons sur la grille 14x14.",
      content: (
        <div className="space-y-2 text-xs text-slate-600 font-sans">
          <p>
            Votre population est structurée en 4 Tiers de compétences :
          </p>
          <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-slate-700">
            <li><strong>T0 (Ouvriers) :</strong> Extraction ISRU & mines de régolithe</li>
            <li><strong>T1 (Techniciens) :</strong> Exploitation des usines & réseaux d&apos;énergie</li>
            <li><strong>T2 (Ingénieurs) :</strong> Hôpitaux, stations d&apos;aération & logistique</li>
            <li><strong>T3 (Chercheurs) :</strong> Pôles R&D & matrice d&apos;intelligence artificielle</li>
          </ul>
          <div className="p-2.5 rounded bg-purple-50 border border-purple-200 text-purple-900 font-mono text-[11px]">
            🔥 <strong>Heatmap :</strong> Basculez la grille en mode <em>Heatmap Démographique</em> dans l&apos;onglet <strong>Système 4X</strong> pour identifier immédiatement les secteurs surpeuplés ou sous-équipés.
          </div>
        </div>
      )
    },
    {
      step: 4,
      title: "Génération d'Événements Contextuels Gemini IA",
      icon: <Sparkles className="w-5 h-5 text-indigo-500" />,
      badge: "Intelligence Artificielle",
      summary: "L'IA Gemini analyse votre colonie en temps réel pour créer des chroniques sur-mesure.",
      content: (
        <div className="space-y-2 text-xs text-slate-600 font-sans">
          <p>
            Grâce à l&apos;API Google AI Studio (Gemini 3.5 Flash), l&apos;IA évalue l&apos;état exact de vos métriques (déficit énergétique, niveau de stress du Leader, surpopulation) et tisse des récits d&apos;incidents ou d&apos;opportunités d&apos;archologie.
          </p>
          <div className="p-2.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 font-mono text-[11px]">
            ✨ <strong>Interactif :</strong> Cliquez sur <em>Simuler Incident Gemini IA</em> dans le Flux d&apos;Événements pour déclencher un événement sur-mesure avec choix décisionnels !
          </div>
        </div>
      )
    },
    {
      step: 5,
      title: "Réseaux Utilitaires & Matrice R&D",
      icon: <Zap className="w-5 h-5 text-emerald-500" />,
      badge: "Infrastructure",
      summary: "Sécurisez les réseaux primaires (Eau, Oxygène, Fusion, Cryogénie).",
      content: (
        <div className="space-y-2 text-xs text-slate-600 font-sans">
          <p>
            Chaque bâtiment d&apos;archologie nécessite des réseaux utilitaires actifs. Si le bilan énergétique tombe sous 0 MW ou que le réseau d&apos;oxygène est rompu, les parcelles associées passent en mode dégradation d&apos;urgence.
          </p>
          <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-[11px]">
            🧪 <strong>Arbre R&D :</strong> Répartissez vos points de recherche entre les 4 branches (ISRU, Fusion, Biosphère, IA) pour débloquer de nouveaux bâtiments et décrets civiques.
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps.find((s) => s.step === activeStep) || steps[0];

  const isLight = theme === "light";
  const isAmber = theme === "amber";

  const modalBg = isLight
    ? "bg-white border-slate-200 text-slate-800"
    : isAmber
    ? "bg-black border-amber-900 text-amber-500 font-mono"
    : "bg-slate-900 border-slate-800 text-slate-100";

  const headerBg = isLight
    ? "bg-[#0F172A] text-white border-b border-slate-700"
    : isAmber
    ? "bg-black text-amber-500 border-b border-amber-900"
    : "bg-slate-950 text-white border-b border-slate-800";

  const footerBg = isLight
    ? "bg-slate-50 border-t border-slate-200"
    : isAmber
    ? "bg-black border-t border-amber-900 text-amber-500"
    : "bg-slate-950/80 border-t border-slate-800 text-slate-300";

  const blockBg = isLight
    ? "bg-slate-50 border-slate-200 text-slate-700"
    : isAmber
    ? "bg-zinc-950 border-amber-900/50 text-amber-500"
    : "bg-slate-950/60 border-slate-800 text-slate-300";

  const tabBorder = isLight ? "border-slate-200" : isAmber ? "border-amber-900" : "border-slate-800";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans">
      <div className={`border rounded-lg shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${modalBg}`}>
        {/* Modal Header */}
        <div className={`px-5 py-3.5 flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded ${isAmber ? "bg-amber-950 text-amber-400" : "bg-blue-600 text-white"}`}>
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Guide &amp; Conseils d&apos;Archologie</h3>
              <p className={`text-[10px] font-mono ${isAmber ? "text-amber-600" : "text-slate-400"}`}>Guide de démarrage rapide et astuces tactiques (TIPS)</p>
            </div>
          </div>
          <button
            onClick={closeBottomSheet}
            className={`p-1 rounded transition cursor-pointer ${isAmber ? "text-amber-500 hover:text-amber-300" : "text-slate-400 hover:text-white"}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Step Selector Tabs */}
          <div className={`flex items-center justify-between gap-1 border-b pb-2 overflow-x-auto text-xs font-mono ${tabBorder}`}>
            {steps.map((s) => {
              const isActive = activeStep === s.step;
              const tabClass = isActive
                ? isAmber
                  ? "bg-amber-950 border-amber-500 text-amber-400 font-bold"
                  : "bg-blue-600 border-blue-600 text-white font-bold"
                : isLight
                ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                : isAmber
                ? "bg-black border-amber-900 text-amber-700 hover:text-amber-500"
                : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800";

              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`px-3 py-1.5 rounded border transition cursor-pointer flex items-center gap-1.5 ${tabClass}`}
                >
                  <span>TIP {s.step}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentStepData.icon}
                <h4 className={`text-sm font-bold ${isLight ? "text-slate-900" : isAmber ? "text-amber-400" : "text-slate-200"}`}>{currentStepData.title}</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                isLight
                  ? "bg-slate-100 border-slate-200 text-slate-600"
                  : isAmber
                  ? "bg-zinc-950 border-amber-900 text-amber-500"
                  : "bg-slate-950 border-slate-800 text-slate-400"
              }`}>
                {currentStepData.badge}
              </span>
            </div>

            <p className={`text-xs font-medium p-2.5 rounded border ${blockBg}`}>
              {currentStepData.summary}
            </p>

            <div className={`${isLight ? "text-slate-600" : isAmber ? "text-amber-500" : "text-slate-300"}`}>
              {currentStepData.content}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`px-5 py-3 flex items-center justify-between text-xs font-mono ${footerBg}`}>
          <div className={`${isLight ? "text-slate-500" : isAmber ? "text-amber-700" : "text-slate-400"} text-[11px]`}>
            Étape {activeStep} sur {steps.length}
          </div>

          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep((prev) => prev - 1)}
                className={`px-3 py-1.5 rounded border transition cursor-pointer font-semibold ${
                  isLight
                    ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                    : isAmber
                    ? "border-amber-950 text-amber-500 hover:bg-amber-950/40"
                    : "border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                Précédent
              </button>
            )}

            {activeStep < steps.length ? (
              <button
                onClick={() => setActiveStep((prev) => prev + 1)}
                className={`px-3 py-1.5 rounded text-white transition cursor-pointer font-semibold flex items-center gap-1 ${
                  isAmber ? "bg-amber-700 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <span>Suivant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={closeBottomSheet}
                className={`px-4 py-1.5 rounded text-white transition cursor-pointer font-semibold flex items-center gap-1 ${
                  isAmber ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>J&apos;ai compris</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
