"use client";

import React from "react";
import { useEngineStore } from "../../store/useEngineStore";
import { X, Building, Trash2, Zap, Shield, Plus, CheckCircle } from "lucide-react";
import dbBuildings from "../../data/db_buildings.json";
import dbUtilities from "../../data/db_utilities.json";
import { formatNumber } from "../../lib/formatters";

export const BuildingInspectorModal: React.FC = () => {
  const { gameState, selectedCellId, activeBottomSheet, closeBottomSheet, queueManualAction } = useEngineStore();

  if (activeBottomSheet !== "BUILDING_INSPECTOR" || !gameState || !selectedCellId) return null;

  const cell = gameState.territory.cells.find((c) => c.id === selectedCellId);
  if (!cell) return null;

  const activeBuilding = cell.buildingId ? dbBuildings.find((b) => b.id === cell.buildingId) : null;

  const handleConstruct = (buildingId: string) => {
    queueManualAction({ type: "START_BUILDING", cellId: cell.id, buildingId });
    closeBottomSheet();
  };

  const handleDemolish = () => {
    queueManualAction({ type: "DEMOLISH_BUILDING", cellId: cell.id });
    closeBottomSheet();
  };

  const handleToggleUtility = (utilityId: string) => {
    queueManualAction({ type: "CONNECT_UTILITY", cellId: cell.id, utilityId: utilityId as any });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-2xl overflow-hidden shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                Inspecteur de Parcelle ({cell.x}, {cell.y})
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                Zonage : {cell.zoning} • Viable : {cell.viable ? "OUI" : "NON"}
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

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Active Building Status */}
          {activeBuilding ? (
            <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-blue-700 uppercase font-semibold">
                    {activeBuilding.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{activeBuilding.name}</h4>
                </div>
                <button
                  onClick={handleDemolish}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Démanteler</span>
                </button>
              </div>
              <p className="text-xs text-slate-600">{activeBuilding.effect}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[10px]">Empreinte</span>
                  <span className="text-slate-800 font-semibold">{activeBuilding.footprintHa} ha</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[10px]">Maintenance</span>
                  <span className="text-slate-800 font-semibold">{activeBuilding.maintenance} ¢/t</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[10px]">Tier</span>
                  <span className="text-slate-800 font-semibold">{activeBuilding.tier}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[10px]">Niveau</span>
                  <span className="text-slate-800 font-semibold">{cell.buildingLevel}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-700">
                Construire une infrastructure sur cette parcelle :
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dbBuildings.slice(0, 8).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleConstruct(b.id)}
                    className="p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-left transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="text-blue-700 font-bold">{b.name}</span>
                        <span className="text-amber-700 font-bold">{formatNumber(b.cost)} ¢</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{b.effect}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
                      Catégorie : {b.category} • {b.footprintHa} ha
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Connected Utilities Grid */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-700">
              Raccordement aux Réseaux Utilitaires
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              {dbUtilities.map((u) => {
                const isConnected = cell.utilitiesServed.includes(u.id as any);
                return (
                  <button
                    key={u.id}
                    onClick={() => handleToggleUtility(u.id)}
                    className={`p-2 rounded border text-left flex items-center justify-between transition cursor-pointer ${
                      isConnected
                        ? "bg-blue-50 border-blue-400 text-blue-800 font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <span>{u.name}</span>
                    {isConnected && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
