import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white p-6 rounded-md border border-slate-200 max-w-md w-full text-center shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 mb-2">404 - Page Non Trouvée</h2>
        <p className="text-sm text-slate-600 mb-4">
          La transmission ou le secteur demandé n&apos;existe pas dans les archives de l&apos;archologie.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono text-xs font-bold transition"
        >
          Retour à la Simulation
        </Link>
      </div>
    </div>
  );
}
