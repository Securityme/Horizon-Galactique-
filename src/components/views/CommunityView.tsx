"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Users,
  Flame,
  Globe,
  Database,
  ShieldCheck,
  Sparkles,
  Bot,
  ExternalLink,
  Cpu
} from "lucide-react";
import {
  subscribeToCommunityChat,
  sendCommunityMessage,
  sendGoogleChatMessage,
  CommunityMessage
} from "../../services/integrations/chatService";
import { integratedServicesManager, IntegratedServiceState } from "../../services/integrations/serviceRegistry";
import { getCommunityPulse, CommunityPulse } from "../../services/communityService";

export const CommunityView: React.FC = () => {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [channelSource, setChannelSource] = useState<"COMMUNITY" | "GOOGLE_CHAT">("COMMUNITY");
  const [services, setServices] = useState<IntegratedServiceState>(integratedServicesManager.getState());
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [pulse, setPulse] = useState<CommunityPulse | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubChat = subscribeToCommunityChat((newMsgs) => {
      setMessages(newMsgs);
    });
    const unsubServices = integratedServicesManager.subscribe((newServices) => {
      setServices(newServices);
    });

    // Initial pulse fetch
    getCommunityPulse().then(setPulse);

    return () => {
      unsubChat();
      unsubServices();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const user = services.firebase.user;
    const textToSend = inputText.trim();
    setInputText("");
    setIsSending(true);

    if (channelSource === "COMMUNITY") {
      const ok = await sendCommunityMessage(user, textToSend, "COMMUNITY");
      if (!ok) {
        setStatusMsg("Échec de l'envoi dans la communauté Firestore.");
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } else {
      // Send to Google Chat API & add local community bridge copy
      const res = await sendGoogleChatMessage(
        services.googleChat.accessToken,
        "spaces/AAAA-space-id",
        textToSend
      );
      // Also post locally in community Firestore as a bridged Google Chat message
      await sendCommunityMessage(user, `[Google Chat] ${textToSend}`, "GOOGLE_CHAT");
      setStatusMsg(res.details || "Message transmis au pont Google Chat.");
      setTimeout(() => setStatusMsg(null), 4000);
    }

    setIsSending(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-5 space-y-6">
      {/* Community Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Canal Communautaire & Google Chat
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl font-sans leading-relaxed">
            Espace de discussion global synchronisé en temps réel avec Firebase Firestore et le pont Google Chat Workspace.
          </p>
        </div>

        {/* Live Service Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <div className="bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-slate-300 font-semibold">Firebase:</span>
            <span className="text-emerald-400 font-bold">{services.firebase.status}</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-semibold">Google Chat:</span>
            <span className="text-emerald-400 font-bold">{services.googleChat.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Feed (2 cols on LG) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[560px] shadow-xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-sm text-slate-200 font-mono">
                Flux Intersidéral (#global-colonists)
              </span>
            </div>

            {/* Source selector */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setChannelSource("COMMUNITY")}
                className={`px-2.5 py-1 rounded transition cursor-pointer font-semibold ${
                  channelSource === "COMMUNITY"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Communauté
              </button>
              <button
                onClick={() => setChannelSource("GOOGLE_CHAT")}
                className={`px-2.5 py-1 rounded transition cursor-pointer font-semibold ${
                  channelSource === "GOOGLE_CHAT"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Google Chat
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
                <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-indigo-400" />
                <span>Aucun message dans ce canal. Soyez le premier à publier !</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = services.firebase.user?.uid === msg.senderUid;
                const isGoogleChat = msg.serviceSource === "GOOGLE_CHAT";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-slate-400">
                      <span className="font-bold text-slate-200">{msg.senderName}</span>
                      {isGoogleChat && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 text-[9px] border border-emerald-800">
                          Google Chat
                        </span>
                      )}
                      <span>{msg.createdAt}</span>
                    </div>

                    <div
                      className={`max-w-md p-3 rounded-xl text-xs leading-relaxed font-sans ${
                        isMe
                          ? "bg-blue-600 text-white rounded-tr-none shadow-md"
                          : isGoogleChat
                          ? "bg-emerald-950/80 border border-emerald-800/80 text-emerald-100 rounded-tl-none shadow-md"
                          : "bg-slate-800 border border-slate-700/70 text-slate-100 rounded-tl-none shadow-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                channelSource === "COMMUNITY"
                  ? "Poster un message dans la communauté Firebase..."
                  : "Poster un message via le pont Google Chat Workspace..."
              }
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer</span>
            </button>
          </form>

          {statusMsg && (
            <div className="px-3 py-1.5 bg-slate-900 text-cyan-300 text-[11px] font-mono border-t border-slate-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-4">
          {/* Global Pulse (Phase 2) */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-xl p-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Pouls de la Communauté</span>
            </h3>

            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-mono mb-1">Citoyens Sauvés</div>
                <div className="text-xl font-bold text-white font-mono">
                  {pulse?.totalCitizensSaved.toLocaleString() || "---"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-mono mb-1">Ères Atteintes</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  {pulse?.totalErasAdvanced.toLocaleString() || "---"}
                </div>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-slate-500 font-mono italic text-center">
              Dernière synchronisation : {pulse?.updatedAt ? new Date(pulse.updatedAt).toLocaleTimeString() : "Jamais"}
            </div>
          </div>

          {/* Active Services Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Statut des 3 Services</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="text-slate-200 font-semibold">Firebase Firestore</span>
                </div>
                <span className="text-emerald-400 font-bold">{services.firebase.status}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-200 font-semibold">Google Chat API</span>
                </div>
                <span className="text-emerald-400 font-bold">{services.googleChat.status}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-200 font-semibold">Cloud SQL</span>
                </div>
                <span className="text-indigo-400 font-bold">{services.cloudSql.status}</span>
              </div>
            </div>
          </div>

          {/* User Active Roles */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Rôles & Permissions</span>
            </h3>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950">
                <span className="text-slate-400">Firebase:</span>
                <span className="font-bold text-cyan-300">{services.firebase.role}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950">
                <span className="text-slate-400">Google Chat:</span>
                <span className="font-bold text-emerald-300">{services.googleChat.role}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950">
                <span className="text-slate-400">Cloud SQL:</span>
                <span className="font-bold text-indigo-300">{services.cloudSql.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
