import { StateCreator } from "zustand";
import { EngineStoreState } from "../useEngineStore";
import { State4XPayload, GameSetup } from "../../types/state";
import { ManualAction, OverAllocation, DestinyCard, SimulationSeries, PatchOperation } from "../../types/payloads";
import { TurnNarrative, CycleReport } from "../../lib/contracts";
import { DeterministicDice } from "../../narrative/mulberry32";
import { 
  initWorker, 
  applyManualActionsToWorker, 
  resolveTurnInWorker, 
  fastSimInWorker,
  loadSnapshotInWorker
} from "../../lib/simulation/workerWrapper";
import { drawDestinyCards } from "../../narrative/destinyDraft";
import { generateFallbackTurnNarrative } from "../../narrative/fallbackWriter";
import { saveActiveGameLocally, loadActiveGameLocally } from "../../services/storage";
import { useTerritoryStore } from "../useTerritoryStore";
import { useSimLifeStore } from "../useSimLifeStore";
import { useChronicleStore } from "../useChronicleStore";
import { getFirebaseAuth } from "../../services/authService";
import { saveGameToCloud } from "../../services/firebaseSaveService";
import { reportColonyStats } from "../../services/communityService";
import { archiveChronicleTurn } from "../../services/chronicleService";
import { directorService } from "../../services/ai/director";

export interface SystemSlice {
  gameState: State4XPayload | null;
  dice: DeterministicDice | null;
  pendingManualActions: ManualAction[];
  currentDestinyCards: DestinyCard[];
  selectedDestinyCard: DestinyCard | null;
  activeNarrative: TurnNarrative | null;
  isGeneratingNarrative: boolean;
  activeCycleReport: CycleReport | null;
  simulationSeries: SimulationSeries | null;
  isFastSimulating: boolean;

  initNewGame: (setup: GameSetup) => Promise<void>;
  resumeGame: () => Promise<boolean>;
  loadGameById: (saveId: string) => Promise<boolean>;
  queueManualAction: (action: ManualAction) => Promise<void>;
  selectDestinyCard: (card: DestinyCard) => void;
  executeTurnResolution: (choiceId: string | null, overAllocation: OverAllocation | null) => Promise<void>;
  triggerContextualGeminiEvent: () => Promise<boolean>;
  runFastSimulation: (turns: number) => Promise<SimulationSeries | null>;
}

function syncDomainStores(state: State4XPayload | null) {
  if (!state) return;
  useTerritoryStore.getState().setTerritoryData(state.territory, state.economy);
  useSimLifeStore.getState().setSimLifeData(state.leader, state.demographics, state.factions);
  useChronicleStore.getState().setChronicleData(state.turnIndex, state.currentEra, state.surgeGauge);
}

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

function applyPatchesToState(state: any, ops: PatchOperation[]) {
  for (const op of ops) {
    applySinglePatch(state, op.path, op);
  }
}

export const createSystemSlice: StateCreator<EngineStoreState, [], [], SystemSlice> = (set, get) => ({
  gameState: null,
  dice: null,
  pendingManualActions: [],
  currentDestinyCards: [],
  selectedDestinyCard: null,
  activeNarrative: null,
  isGeneratingNarrative: false,
  activeCycleReport: null,
  simulationSeries: null,
  isFastSimulating: false,

  initNewGame: async (setup) => {
    // Note: createInitialState removed from imports to avoid circular dependency
    // We rely on the worker to give us the initial state snapshot
    const res = await initWorker(setup.seed, setup);
    if (res.kind !== "READY" || !res.snapshot) return;

    const initialState = res.snapshot;
    const dice = new DeterministicDice(setup.seed);
    const destinyCards = drawDestinyCards(dice, 3);
    const firstCard = destinyCards[0];

    const initialContext = {
      locale: "fr" as const,
      turnIndex: initialState.turnIndex,
      cycleIndex: initialState.cycleIndex,
      era: initialState.currentEra,
      turnScale: "1 mois",
      colonyDate: initialState.colonyDate,
      activeBook: firstCard.bookId,
      destinyCard: firstCard,
      state: {
        popTotal: initialState.demographics.popTotal,
        happiness: initialState.demographics.happinessIndex,
        crime: initialState.demographics.crimeRatePct,
        unemployment: initialState.demographics.unemploymentRatePct ?? 0,
        netEnergyMW: initialState.economy.netEnergyMW,
        respirableHa: initialState.territory.hectaresRespirable,
        terraformPct: initialState.territory.terraformingProgressPct,
        treasury: initialState.economy.colonyTreasury,
        privateCredits: initialState.economy.leaderPrivateCredits,
        consortiumCredits: initialState.economy.consortiumCredits,
        leaderHealth: initialState.leader.healthPct,
        leaderStress: initialState.leader.stressPct,
        leaderLegitimacy: initialState.leader.legitimacy
      },
      sectorDeltas: {},
      rollOutcome: { natural: 15, total: 18, dc: 14, degree: "SUCCESS" as const },
      precomputedEffects: [],
      rollingSummaries: {},
      canon: initialState.canon,
      variantIndex: 0
    };

    const initialNarrative = generateFallbackTurnNarrative(initialContext as any);

    saveActiveGameLocally(initialState);
    syncDomainStores(initialState);

    set({
      gameState: initialState,
      dice,
      currentDestinyCards: destinyCards,
      selectedDestinyCard: firstCard,
      activeNarrative: initialNarrative,
      pendingManualActions: [],
      activeCycleReport: null
    });
  },

  resumeGame: async () => {
    const saved = loadActiveGameLocally();
    if (!saved) return false;
    const dice = new DeterministicDice(saved.prngState || saved.globalSeed);
    const destinyCards = drawDestinyCards(dice, 3);

    await loadSnapshotInWorker(saved);
    syncDomainStores(saved);

    set({
      gameState: saved,
      dice,
      currentDestinyCards: destinyCards,
      selectedDestinyCard: destinyCards[0],
      pendingManualActions: []
    });
    return true;
  },

  loadGameById: async (saveId: string) => {
    // Placeholder implementation
    return false;
  },

  queueManualAction: async (action) => {
    const { gameState, pendingManualActions } = get();
    if (!gameState) return;

    const res = await applyManualActionsToWorker([...pendingManualActions, action]);
    if (res.kind === "PATCH") {
      const nextState = structuredClone(gameState);
      applyPatchesToState(nextState, res.ops);
      set({ gameState: nextState, pendingManualActions: [...pendingManualActions, action] });
      syncDomainStores(nextState);
    }
  },

  selectDestinyCard: (card) => set({ selectedDestinyCard: card }),

  executeTurnResolution: async (choiceId, overAllocation) => {
    const { gameState, dice, selectedDestinyCard } = get();
    if (!gameState || !dice || !selectedDestinyCard) return;

    set({ isGeneratingNarrative: true });

    const res = await resolveTurnInWorker(
      choiceId,
      overAllocation,
      selectedDestinyCard.id
    );

    if (res.kind === "PATCH") {
      const patch = res.ops;
      
      // Orchestrate narrative using Director AI
      const narrative = await directorService.orchestrateTurn(gameState) || generateFallbackTurnNarrative({} as any);

      applyPatchesToState(gameState, patch);
      saveActiveGameLocally(gameState);
      
      const currentUser = getFirebaseAuth().currentUser;
      if (currentUser) {
        const userId = currentUser.uid;
        Promise.all([
          saveGameToCloud(userId, gameState),
          reportColonyStats(gameState.demographics.popTotal, gameState.lineage.length),
          archiveChronicleTurn(userId, gameState, narrative.title)
        ]).catch((err) => console.warn("Background Cloud Ops Warn:", err));
      }
      
      syncDomainStores(gameState);
      useTerritoryStore.getState().applyPatch(patch);
      useSimLifeStore.getState().applyPatch(patch);
      useChronicleStore.getState().applyPatch(patch);

      const nextDestinyCards = drawDestinyCards(dice, 3);

      set({
        gameState,
        pendingManualActions: [],
        currentDestinyCards: nextDestinyCards,
        selectedDestinyCard: nextDestinyCards[0],
        activeNarrative: narrative,
        isGeneratingNarrative: false
      });
    }
  },

  triggerContextualGeminiEvent: async () => {
    return false;
  },

  runFastSimulation: async (turns) => {
    set({ isFastSimulating: true });
    const res = await fastSimInWorker(turns);
    set({ isFastSimulating: false });
    if (res.kind === "FAST_SIM_RESULT") {
      return res.series ?? null;
    }
    return null;
  },
});
