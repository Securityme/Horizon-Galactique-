import { State4XPayload, GameSetup, EraIdentifier, UtilityId } from "./state";

export interface PatchOperation {
  path: string;
  op: "set" | "inc" | "push" | "remove";
  value: any;
}

export type ManualAction =
  | { type: "SET_TAX"; rate: number }
  | { type: "SET_IMMIGRATION_QUOTA"; quota: number }
  | { type: "SET_RD_ALLOCATION"; allocation: Record<"A" | "B" | "C" | "D", number> }
  | { type: "START_BUILDING"; cellId: string; buildingId: string }
  | { type: "DEMOLISH_BUILDING"; cellId: string }
  | { type: "CONNECT_UTILITY"; cellId: string; utilityId: UtilityId }
  | { type: "CHANGE_ZONING"; cellId: string; zoning: "NONE" | "RESIDENTIAL" | "INDUSTRIAL" | "CIVIC" | "AGRI" | "ENERGY" }
  | { type: "BUY_EQUIPMENT"; equipmentId: string; target: "LEADER" | string }
  | { type: "BUY_PROPERTY"; propertyId: string }
  | { type: "SET_DIET"; dietId: string }
  | { type: "SET_ACTIVITY"; activityId: string | null }
  | { type: "START_TRAINING"; trainingId: string }
  | { type: "DESIGNATE_HEIR"; heirId: string }
  | { type: "CONVERT_CURRENCY"; from: "TREASURY" | "CONSORTIUM" | "PRIVATE"; to: "TREASURY" | "CONSORTIUM" | "PRIVATE"; amount: number }
  | { type: "ENACT_DECREE"; decreeId: string; poleDeltas: Record<string, number> }
  | { type: "BUILD_SHIP"; shipType: string; cost: number };

export interface OverAllocation {
  currency: "TREASURY" | "CONSORTIUM" | "PRIVATE";
  amount: number;
}

export interface DestinyCard {
  id: string;
  label: string;
  bookId: string;
  sectorModifier: string;
  flavor: string;
}

export interface PrecomputedEffect {
  id: "EFF-A" | "EFF-B" | "EFF-C";
  label: string;
  bodyPreview: string;
  patch: PatchOperation[];
}

export interface RollOutcome {
  natural: number;
  total: number;
  dc: number;
  degree: "CRITICAL_FAIL" | "FAIL" | "MARGINAL_SUCCESS" | "SUCCESS" | "CRITICAL_SUCCESS";
  modifierBreakdown?: {
    skill: number;
    sector: number;
    archetype: number;
    equipment: number;
    overAllocation: number;
  };
}

export interface NarrativeContext {
  locale: "fr" | "en";
  turnIndex: number;
  cycleIndex: number;
  era: EraIdentifier;
  turnScale: string;
  colonyDate: string;
  activeBook: string;
  destinyCard: DestinyCard;
  state: {
    popTotal: number;
    happiness: number;
    crime: number;
    unemployment: number;
    netEnergyMW: number;
    respirableHa: number;
    terraformPct: number;
    treasury: number;
    privateCredits: number;
    consortiumCredits: number;
    leaderHealth: number;
    leaderStress: number;
    leaderLegitimacy: number;
  };
  sectorDeltas: Record<string, number>;
  rollOutcome: RollOutcome;
  precomputedEffects: PrecomputedEffect[];
  rollingSummaries: Record<string, string>;
  canon: { turn: number; fact: string }[];
  variantIndex: number;
}

export interface SimulationSeriesPoint {
  turn: number;
  popTotal: number;
  t0: number;
  t1: number;
  t2: number;
  t3: number;
  netEnergyMW: number;
  hectaresRespirable: number;
  terraformPct: number;
  treasury: number;
  privateCredits: number;
  consortiumCredits: number;
  happiness: number;
  crime: number;
  rdPoints: number;
}

export interface SimulationSeries {
  points: SimulationSeriesPoint[];
}

export type WorkerInbound =
  | { kind: "INIT"; seed: number; setup: GameSetup }
  | { kind: "APPLY_MANUAL"; actions: ManualAction[] }
  | { kind: "RESOLVE_TURN"; choiceId: string | null; overAllocation: OverAllocation | null; destinyCardId?: string; selectedBookId?: string }
  | { kind: "REQUEST_SNAPSHOT" }
  | { kind: "LOAD_SNAPSHOT"; snapshot: State4XPayload }
  | { kind: "FAST_SIM"; turns: number };

export type WorkerOutbound =
  | { kind: "READY"; snapshot: State4XPayload }
  | { kind: "PATCH"; turnIndex: number; ops: PatchOperation[]; context?: NarrativeContext }
  | { kind: "TURN_CONTEXT"; context: NarrativeContext }
  | { kind: "SNAPSHOT"; snapshot: State4XPayload }
  | { kind: "FAST_SIM_RESULT"; series: SimulationSeries }
  | { kind: "ERROR"; code: string; detail: string };
