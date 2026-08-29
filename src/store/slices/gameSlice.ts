import { StateCreator } from "zustand";
import { EngineStoreState } from "../useEngineStore";

export interface GameSlice {
  activeTab: "gouvernance" | "journal" | "macro4x" | "community";
  selectedCellId: string | null;
  activeBottomSheet: "BUILDING_INSPECTOR" | "TECH_TREE" | "DECREES" | "SETTINGS" | "CYCLE_REPORT" | "ADVISOR_CHAT" | "LEADER_PROFILE" | "TUTORIAL" | null;
  setActiveTab: (tab: "gouvernance" | "journal" | "macro4x" | "community") => void;
  setSelectedCellId: (cellId: string | null) => void;
  openBottomSheet: (sheet: GameSlice["activeBottomSheet"]) => void;
  closeBottomSheet: () => void;
}

export const createGameSlice: StateCreator<EngineStoreState, [], [], GameSlice> = (set) => ({
  activeTab: "journal",
  selectedCellId: null,
  activeBottomSheet: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCellId: (cellId) => set({ selectedCellId: cellId }),
  openBottomSheet: (sheet) => set({ activeBottomSheet: sheet }),
  closeBottomSheet: () => set({ activeBottomSheet: null }),
});
