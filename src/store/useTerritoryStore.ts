import { create } from "zustand";
import { State4XPayload } from "../types/state";
import { PatchOperation } from "../types/payloads";

function applySinglePatch(target: any, subPath: string, patch: PatchOperation) {
  const parts = subPath.split(".");
  let curr = target;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!curr[parts[i]]) curr[parts[i]] = {};
    curr = curr[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (patch.op === "set") curr[last] = patch.value;
  if (patch.op === "inc") curr[last] = (curr[last] || 0) + (patch.value as number);
  if (patch.op === "push") {
    if (!Array.isArray(curr[last])) curr[last] = [];
    curr[last].push(patch.value);
  }
}

interface TerritoryDomainStore {
  territory: State4XPayload["territory"] | null;
  economy: State4XPayload["economy"] | null;
  setTerritoryData: (territory: State4XPayload["territory"], economy: State4XPayload["economy"]) => void;
  applyPatch: (ops: PatchOperation[]) => void;
}

export const useTerritoryStore = create<TerritoryDomainStore>((set) => ({
  territory: null,
  economy: null,
  setTerritoryData: (territory, economy) => set({ territory, economy }),
  applyPatch: (ops) =>
    set((state) => {
      const nextTerritory = state.territory ? structuredClone(state.territory) : null;
      const nextEconomy = state.economy ? structuredClone(state.economy) : null;

      for (const patch of ops) {
        if (patch.path.startsWith("territory.") && nextTerritory) {
          applySinglePatch(nextTerritory, patch.path.replace("territory.", ""), patch);
        } else if (patch.path.startsWith("economy.") && nextEconomy) {
          applySinglePatch(nextEconomy, patch.path.replace("economy.", ""), patch);
        }
      }
      return { territory: nextTerritory, economy: nextEconomy };
    }),
}));
