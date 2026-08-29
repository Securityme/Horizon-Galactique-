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

interface SimLifeDomainStore {
  leader: State4XPayload["leader"] | null;
  demographics: State4XPayload["demographics"] | null;
  factions: State4XPayload["factions"];
  setSimLifeData: (
    leader: State4XPayload["leader"],
    demographics: State4XPayload["demographics"],
    factions: State4XPayload["factions"]
  ) => void;
  applyPatch: (ops: PatchOperation[]) => void;
}

export const useSimLifeStore = create<SimLifeDomainStore>((set) => ({
  leader: null,
  demographics: null,
  factions: [],
  setSimLifeData: (leader, demographics, factions) => set({ leader, demographics, factions }),
  applyPatch: (ops) =>
    set((state) => {
      const nextLeader = state.leader ? structuredClone(state.leader) : null;
      const nextDemo = state.demographics ? structuredClone(state.demographics) : null;

      for (const patch of ops) {
        if (patch.path.startsWith("leader.") && nextLeader) {
          applySinglePatch(nextLeader, patch.path.replace("leader.", ""), patch);
        } else if (patch.path.startsWith("demographics.") && nextDemo) {
          applySinglePatch(nextDemo, patch.path.replace("demographics.", ""), patch);
        }
      }
      return { leader: nextLeader, demographics: nextDemo };
    }),
}));
