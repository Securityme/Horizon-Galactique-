"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEngineStore } from "../../store/useEngineStore";
import { X, MessageSquare, Send, Bot, User as UserIcon, Shield, FlaskConical, Truck, Users, BookOpen } from "lucide-react";

interface ChatMessage {
  role: "user" | "model" | "system";
  content: string;
}

export const AdvisorChatModal: React.FC = () => {
  const { gameState, activeBottomSheet, closeBottomSheet } = useEngineStore();
  const [persona, setPersona] = useState<"TACTICAL" | "SCIENCE" | "LOGISTICS" | "CIVIC" | "HISTORIAN">("TACTICAL");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content: "Salutations, Leader. Je suis à votre entière disposition pour analyser les impératifs de l'archologie et vous soumettre mes recommandations stratégiques."
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (activeBottomSheet !== "ADVISOR_CHAT" || !gameState) return null;

  const personas = [
    { id: "TACTICAL", name: "Sécurité & Tactique", icon: <Shield className="w-3.5 h-3.5" /> },
    { id: "SCIENCE", name: "Haute Science R&D", icon: <FlaskConical className="w-3.5 h-3.5" /> },
    { id: "LOGISTICS", name: "Logistique & Réseaux", icon: <Truck className="w-3.5 h-3.5" /> },
    { id: "CIVIC", name: "Cohésion Civique", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "HISTORIAN", name: "Grand Chroniqueur", icon: <BookOpen className="w-3.5 h-3.5" /> }
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: inputText.trim() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/advisor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          messages: nextHistory,
          colonySummary: {
            era: gameState.currentEra,
            turnIndex: gameState.turnIndex,
            colonyDate: gameState.colonyDate,
            popTotal: gameState.demographics.popTotal,
            netEnergyMW: gameState.economy.netEnergyMW,
            respirableHa: gameState.territory.hectaresRespirable,
            terraformPct: gameState.territory.terraformingProgressPct,
            treasury: gameState.economy.colonyTreasury,
            privateCredits: gameState.economy.leaderPrivateCredits,
            consortiumCredits: gameState.economy.consortiumCredits,
            leaderHealth: gameState.leader.healthPct,
            leaderStress: gameState.leader.stressPct,
            happiness: gameState.demographics.happinessIndex,
            crime: gameState.demographics.crimeRatePct,
            activeBook: gameState.logbook[0]?.bookId || "LIV-01"
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "model", content: data.content }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: "Les communications suborbitales avec le conseil sont momentanément perturbées." }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Erreur de liaison réseau avec l'assistant de conseil." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Conseil Exécutif d&apos;Archologie (Gemini AI)</h3>
              <span className="text-[10px] text-slate-500 font-mono">
                Dialogue multi-tours avec vos conseillers spécialisés
              </span>
            </div>
          </div>
          <button
            onClick={closeBottomSheet}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Persona Switcher */}
        <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-200 flex gap-1.5 overflow-x-auto shrink-0">
          {personas.map((p) => {
            const isSelected = persona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPersona(p.id as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 border border-blue-600 text-white font-bold shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {p.icon}
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-sans text-sm">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {m.role === "user" ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`p-3 rounded text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs"
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 mr-auto max-w-[85%]">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-blue-700 flex items-center gap-2 font-mono">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Le conseiller formule son analyse...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-2.5 bg-slate-50 border-t border-slate-200 flex gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Posez une question tactique, économique ou scientifique..."
            className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Envoyer</span>
          </button>
        </form>
      </div>
    </div>
  );
};
