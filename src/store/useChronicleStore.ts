import { create } from "zustand";
import { PatchOperation } from "../types/payloads";

interface ChronicleDomainStore {
  turnIndex: number;
  currentEra: string;
  surgeGauge: number;
  setChronicleData: (turnIndex: number, currentEra: string, surgeGauge: number) => void;
  applyPatch: (ops: PatchOperation[]) => void;
}

export const useChronicleStore = create<ChronicleDomainStore>((set) => ({
  turnIndex: 1,
  currentEra: "ERA 1 CAPSULE HUB",
  surgeGauge: 0,
  setChronicleData: (turnIndex, currentEra, surgeGauge) => set({ turnIndex, currentEra, surgeGauge }),
  applyPatch: (ops) =>
    set((state) => {
      let turnIndex = state.turnIndex;
      let currentEra = state.currentEra;
      let surgeGauge = state.surgeGauge;

      for (const patch of ops) {
        if (patch.path === "turnIndex") turnIndex = patch.value as number;
        if (patch.path === "currentEra") currentEra = patch.value as string;
        if (patch.path === "surgeGauge") surgeGauge = patch.value as number;
      }
      return { turnIndex, currentEra, surgeGauge };
    }),
}));
