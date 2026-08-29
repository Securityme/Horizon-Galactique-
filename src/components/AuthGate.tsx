"use client";

import React, { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { signInWithGoogle, signInGuest } from "../services/authService";
import { syncUserProfile } from "../services/firebaseSaveService";
import { useUIStore } from "../store/useUIStore";
import { audioService } from "../services/audio";
import { Cloud, LogIn, Fingerprint, Shield, Sparkles, Orbit, Radio } from "lucide-react";

interface AuthGateProps {
  children: React.ReactNode;
  onStartNewGame?: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const { theme } = useUIStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const playHoverTick = () => {
    audioService.playBlip(780, 0.03);
  };

  const handleGoogleSignIn = async () => {
    audioService.playBlip(600, 0.06);
    setAuthStatus("Établissement du lien Google...");
    try {
      const signedInUser = await signInWithGoogle();
      if (signedInUser) {
        audioService.playSuccessFanfare();
        setAuthStatus("Lien synaptique cloud établi !");
      } else {
        setAuthStatus(null);
      }
    } catch (err) {
      console.warn("Google Auth error:", err);
      setAuthStatus("Connexion annulée.");
      audioService.playCriticalAlert();
    }
  };

  const handleGuestSignIn = async () => {
    audioService.playBlip(500, 0.06);
    setAuthStatus("Création d'une liaison locale temporaire...");
    try {
      const signedInUser = await signInGuest();
      if (signedInUser) {
        audioService.playSuccessFanfare();
        setAuthStatus("Session Invité activée !");
      } else {
        setAuthStatus(null);
      }
    } catch (err) {
      console.warn("Guest Auth error:", err);
      setAuthStatus("Connexion Invité échouée.");
      audioService.playCriticalAlert();
    }
  };

  const isLight = theme === "light";
  const isAmber = theme === "amber";

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-emerald-500 font-mono select-none">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-[10px] tracking-widest uppercase text-emerald-600 animate-pulse">
          Accès Réseau // Authentification Firebase...
        </div>
      </div>
    );
  }

  if (!user) {
    const portalClass = isLight
      ? "min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none"
      : isAmber
      ? "min-h-screen bg-black text-amber-500 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none font-mono"
      : "min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none";

    const boxClass = isLight
      ? "w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-xl relative z-10 space-y-6"
      : isAmber
      ? "w-full max-w-md bg-black border border-amber-500 rounded-xl p-8 shadow-[0_0_15px_rgba(245,158,11,0.15)] relative z-10 space-y-6"
      : "w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-xl p-8 shadow-2xl backdrop-blur-md relative z-10 space-y-6";

    return (
      <div id="auth-portal" className={portalClass}>
        {/* Decorative Space Grids */}
        {!isAmber && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        )}

        <div className={boxClass}>
          {/* Top Sci-Fi Badge */}
          <div className="flex justify-center">
            <div className={`p-3 rounded-full flex items-center justify-center ${
              isLight ? "bg-slate-100 text-slate-700 border border-slate-200" :
              isAmber ? "bg-black border border-amber-500 text-amber-500" :
              "bg-slate-950/80 border border-slate-800 text-blue-400"
            }`}>
              <Orbit className="w-8 h-8 animate-spin-slow" />
            </div>
          </div>

          {/* Prompt Titles */}
          <div className="text-center space-y-1.5">
            <h2 className={`text-xl font-extrabold uppercase tracking-widest ${
              isLight ? "text-slate-900" :
              isAmber ? "text-amber-500" :
              "text-white"
            }`}>
              Connexion Requise
            </h2>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              Arche des Étoiles // Liaison Synaptique
            </p>
            <div className={`h-[1px] w-12 mx-auto my-3 ${isAmber ? "bg-amber-500" : "bg-blue-500"}`} />
          </div>

          <p className="text-xs text-center leading-relaxed text-slate-400 max-w-xs mx-auto">
            Identifiez-vous auprès de la console centrale de l&apos;Arche pour synchroniser votre journal de bord et sauvegarder votre colonie dans le cloud.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              id="btn-auth-google"
              onClick={handleGoogleSignIn}
              onMouseEnter={playHoverTick}
              className={`w-full py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition cursor-pointer shadow-md ${
                isLight ? "bg-slate-900 hover:bg-slate-800 text-white" :
                isAmber ? "bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500" :
                "bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Lier Compte Google</span>
            </button>

            <button
              id="btn-auth-guest"
              onClick={handleGuestSignIn}
              onMouseEnter={playHoverTick}
              className={`w-full py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition cursor-pointer ${
                isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300" :
                isAmber ? "bg-black hover:bg-amber-950/20 text-amber-500/70 hover:text-amber-500 border border-amber-500/30" :
                "bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700"
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              <span>Continuer en Mode Invité</span>
            </button>
          </div>

          {/* Status Message */}
          {authStatus && (
            <div className={`p-2.5 rounded text-center text-[10px] font-mono border animate-pulse ${
              isLight ? "bg-slate-50 border-slate-200 text-slate-600" :
              isAmber ? "bg-black border-amber-500/40 text-amber-500" :
              "bg-slate-950/60 border-slate-800 text-blue-400"
            }`}>
              {authStatus}
            </div>
          )}

          {/* Bottom Security Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase tracking-widest pt-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Sécurisé par Firebase Cloud</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

