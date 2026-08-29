import { wrap } from "comlink";
import type { SimulationWorkerAPI } from "../../workers/simulation.worker";
import { GameSetup, State4XPayload } from "../../types/state";
import { WorkerOutbound, ManualAction, OverAllocation } from "../../types/payloads";

let workerInstance: Worker | null = null;
let apiProxy: any = null;

/**
 * Returns the Comlink RPC proxy for the simulation worker.
 * Initializes the worker lazily on first access.
 */
function getWorker() {
  if (typeof window === "undefined") return null;
  if (!workerInstance) {
    // Note: Next.js handles the Worker constructor with URL automatically
    workerInstance = new Worker(new URL("../../workers/simulation.worker", import.meta.url));
    apiProxy = wrap<SimulationWorkerAPI>(workerInstance);
  }
  return apiProxy;
}

export async function initWorker(seed: number, setup: GameSetup): Promise<WorkerOutbound> {
  const api = getWorker();
  if (!api) return { kind: "ERROR", code: "SSR_ENV", detail: "Worker cannot run in SSR." };
  return await api.init(seed, setup);
}

export async function applyManualActionsToWorker(actions: ManualAction[]): Promise<WorkerOutbound> {
  const api = getWorker();
  if (!api) return { kind: "ERROR", code: "SSR_ENV", detail: "Worker cannot run in SSR." };
  return await api.applyManual(actions);
}

export async function resolveTurnInWorker(
  choiceId: string | null = null,
  overAllocation: OverAllocation | null = null,
  destinyCardId?: string,
  selectedBookId?: string
): Promise<WorkerOutbound> {
  const api = getWorker();
  if (!api) return { kind: "ERROR", code: "SSR_ENV", detail: "Worker cannot run in SSR." };
  return await api.resolveTurn(choiceId, overAllocation, destinyCardId, selectedBookId);
}

export async function fastSimInWorker(turns: number): Promise<WorkerOutbound> {
  const api = getWorker();
  if (!api) return { kind: "ERROR", code: "SSR_ENV", detail: "Worker cannot run in SSR." };
  return await api.fastSim(turns);
}

export async function requestSnapshotFromWorker(): Promise<WorkerOutbound> {
  const api = getWorker();
  if (!api) return { kind: "ERROR", code: "SSR_ENV", detail: "Worker cannot run in SSR." };
  return await api.requestSnapshot();
}

export async function loadSnapshotInWorker(snapshot: State4XPayload): Promise<WorkerOutbound> {
  const api = getWorker();
  if (!api) return { kind: "ERROR", code: "SSR_ENV", detail: "Worker cannot run in SSR." };
  return await api.loadSnapshot(snapshot);
}
