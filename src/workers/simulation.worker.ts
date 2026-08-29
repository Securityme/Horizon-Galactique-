// src/workers/simulation.worker.ts
import { expose } from "comlink";
import { State4XPayload, GameSetup } from "../types/state";
import {
  WorkerOutbound,
  ManualAction,
  OverAllocation,
  NarrativeContext,
} from "../types/payloads";
import { WorkerInboundSchema } from "../lib/contracts";
import { DeterministicDice } from "../narrative/mulberry32";
import {
  createInitialState,
  applyManualActions,
  resolveTurn,
  fastSim,
} from "../engine/engine";

/**
 * Worker state holders for off-thread tick engine execution.
 */
let currentState: State4XPayload | null = null;
let currentDice: DeterministicDice | null = null;
let lastValidSnapshot: State4XPayload | null = null;

/**
 * Safely clones a state object using structuredClone API.
 */
function cloneState<T>(state: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(state);
  }
  return JSON.parse(JSON.stringify(state));
}

/**
 * Core simulation tick engine implementation running inside the Web Worker.
 */
export const simulationEngineWorker = {
  /**
   * Initializes a new simulation state with a deterministic Mulberry32 seed and setup parameters.
   */
  init(seed: number, setup: GameSetup): WorkerOutbound {
    try {
      currentDice = new DeterministicDice(seed);
      currentState = createInitialState(setup);
      currentState.globalSeed = seed;
      currentState.prngState = currentDice.getState();
      lastValidSnapshot = cloneState(currentState);

      const res: WorkerOutbound = {
        kind: "READY",
        snapshot: cloneState(currentState),
      };
      return res;
    } catch (err: any) {
      console.error("[SimulationWorker] Initialization error:", err);
      return {
        kind: "ERROR",
        code: "INIT_FAILED",
        detail: err?.message || "Failed to initialize simulation worker state.",
      };
    }
  },

  /**
   * Applies manual player actions (zoning, building, tax, budget allocations) and returns patch operations.
   */
  applyManual(actions: ManualAction[]): WorkerOutbound {
    if (!currentState || !currentDice) {
      return {
        kind: "ERROR",
        code: "NOT_INITIALIZED",
        detail: "Worker state is not initialized. Call init() first.",
      };
    }

    try {
      // Save valid snapshot before mutation
      lastValidSnapshot = cloneState(currentState);

      const ops = applyManualActions(currentState, actions);
      currentState.prngState = currentDice.getState();
      ops.push({ path: "prngState", op: "set", value: currentState.prngState });

      return {
        kind: "PATCH",
        turnIndex: currentState.turnIndex,
        ops: cloneState(ops),
      };
    } catch (err: any) {
      console.error("[SimulationWorker] Error applying manual actions:", err);
      // Recover state from last valid snapshot
      if (lastValidSnapshot) {
        currentState = cloneState(lastValidSnapshot);
      }
      return {
        kind: "ERROR",
        code: "MANUAL_ACTION_FAILED",
        detail: `Failed applying actions: ${err?.message || "Unknown error"}. State restored to last valid snapshot.`,
      };
    }
  },

  /**
   * Resolves a simulation turn (tick), executing all 17 industrial calculation solvers.
   * Emits immutable patch operations and narrative context.
   */
  resolveTurn(
    choiceId: string | null = null,
    overAllocation: OverAllocation | null = null,
    destinyCardId?: string,
    selectedBookId?: string
  ): WorkerOutbound {
    if (!currentState || !currentDice) {
      return {
        kind: "ERROR",
        code: "NOT_INITIALIZED",
        detail: "Worker state or PRNG dice is not initialized.",
      };
    }

    try {
      // Save checkpoint before turn resolution
      lastValidSnapshot = cloneState(currentState);

      const { patch, context } = resolveTurn(
        currentState,
        currentDice,
        choiceId,
        overAllocation,
        destinyCardId,
        selectedBookId
      );

      currentState.prngState = currentDice.getState();
      patch.push({ path: "prngState", op: "set", value: currentState.prngState });

      return {
        kind: "PATCH",
        turnIndex: currentState.turnIndex,
        ops: cloneState(patch),
        context: cloneState(context),
      };
    } catch (err: any) {
      console.error("[SimulationWorker] Turn resolution error:", err);
      // Recovery: restore state to last valid snapshot
      if (lastValidSnapshot) {
        currentState = cloneState(lastValidSnapshot);
        if (currentDice) {
          currentDice.setState(currentState.prngState);
        }
      }
      return {
        kind: "ERROR",
        code: "TURN_RESOLUTION_FAILED",
        detail: `Turn calculation failed: ${err?.message || "Unknown error"}. Restored state to Turn ${currentState?.turnIndex ?? 1}.`,
      };
    }
  },

  /**
   * Runs a fast multi-turn forecast simulation without mutating the active game state.
   */
  fastSim(turns: number): WorkerOutbound {
    if (!currentState || !currentDice) {
      return {
        kind: "ERROR",
        code: "NOT_INITIALIZED",
        detail: "Worker state is not initialized.",
      };
    }

    try {
      const simDice = new DeterministicDice(currentDice.getState());
      const series = fastSim(currentState, turns, simDice);
      return {
        kind: "FAST_SIM_RESULT",
        series: cloneState(series),
      };
    } catch (err: any) {
      console.error("[SimulationWorker] Fast sim error:", err);
      return {
        kind: "ERROR",
        code: "FAST_SIM_FAILED",
        detail: err?.message || "Fast simulation failed.",
      };
    }
  },

  /**
   * Returns a complete state snapshot using structured cloning for safe transfer.
   */
  requestSnapshot(): WorkerOutbound {
    if (!currentState) {
      return {
        kind: "ERROR",
        code: "NOT_INITIALIZED",
        detail: "Worker state is not initialized.",
      };
    }

    return {
      kind: "SNAPSHOT",
      snapshot: cloneState(currentState),
    };
  },

  /**
   * Loads an external state snapshot and restores PRNG determinism.
   */
  loadSnapshot(snapshot: State4XPayload): WorkerOutbound {
    try {
      currentState = cloneState(snapshot);
      currentDice = new DeterministicDice(snapshot.globalSeed);
      currentDice.setState(snapshot.prngState);
      lastValidSnapshot = cloneState(currentState);

      return {
        kind: "READY",
        snapshot: cloneState(currentState),
      };
    } catch (err: any) {
      console.error("[SimulationWorker] Load snapshot error:", err);
      return {
        kind: "ERROR",
        code: "LOAD_SNAPSHOT_FAILED",
        detail: err?.message || "Failed to load state snapshot.",
      };
    }
  },

  /**
   * Processes a direct WorkerInbound message and returns the corresponding WorkerOutbound payload.
   * Uses Zod boundary validation to guarantee schema safety.
   */
  processMessage(rawMsg: unknown): WorkerOutbound {
    const parseResult = WorkerInboundSchema.safeParse(rawMsg);
    if (!parseResult.success) {
      return {
        kind: "ERROR",
        code: "INVALID_ZOD_INBOUND_PAYLOAD",
        detail: `Zod validation failed: ${parseResult.error.message}`,
      };
    }

    const msg = parseResult.data;
    switch (msg.kind) {
      case "INIT":
        return this.init(msg.seed, msg.setup);
      case "APPLY_MANUAL":
        return this.applyManual(msg.actions);
      case "RESOLVE_TURN":
        return this.resolveTurn(
          msg.choiceId,
          msg.overAllocation,
          msg.destinyCardId,
          msg.selectedBookId
        );
      case "FAST_SIM":
        return this.fastSim(msg.turns);
      case "REQUEST_SNAPSHOT":
        return this.requestSnapshot();
      case "LOAD_SNAPSHOT":
        return this.loadSnapshot(msg.snapshot);
      default:
        return {
          kind: "ERROR",
          code: "UNKNOWN_MESSAGE",
          detail: "Unrecognized inbound message type.",
        };
    }
  },
};

export type SimulationWorkerAPI = typeof simulationEngineWorker;

// Set up native HTML5 Web Worker message handler if running inside a Web Worker context
if (typeof self !== "undefined" && typeof (self as any).addEventListener === "function") {
  // Comlink RPC export
  expose(simulationEngineWorker);

  // Native postMessage fallback event listener with Structured Clone and Zod contract safety
  (self as any).addEventListener("message", (event: MessageEvent<unknown>) => {
    try {
      const result = simulationEngineWorker.processMessage(event.data);
      (self as any).postMessage(cloneState(result));
    } catch (unexpectedError: any) {
      (self as any).postMessage({
        kind: "ERROR",
        code: "WORKER_CRITICAL_EXCEPTION",
        detail: unexpectedError?.message || "Unexpected worker crash prevented.",
      });
    }
  });
}

export default simulationEngineWorker;
