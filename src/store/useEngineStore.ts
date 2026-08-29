import { create } from "zustand";
import { GameSlice, createGameSlice } from "./slices/gameSlice";
import { NiaSlice, createNiaSlice } from "./slices/niaSlice";
import { SystemSlice, createSystemSlice } from "./slices/systemSlice";

export type EngineStoreState = GameSlice & NiaSlice & SystemSlice;

export const useEngineStore = create<EngineStoreState>()((...a) => ({
  ...createGameSlice(...a),
  ...createNiaSlice(...a),
  ...createSystemSlice(...a),
}));
