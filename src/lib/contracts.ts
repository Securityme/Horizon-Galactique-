import { z } from "zod";

export const EraIdentifierSchema = z.enum([
  "ERA 1 CAPSULE HUB",
  "ERA 2 OUTPOST",
  "ERA 3 GEODESIC DOME",
  "ERA 4 OPEN AIR",
  "ERA 5 METROPOLIS",
  "ERA 6 MEGASTRUCTURE",
  "ERA 7 SOVEREIGN",
  "ERA_1_CAPSULE_HUB",
  "ERA_2_OUTPOST",
  "ERA_3_GEODESIC_DOME",
  "ERA_4_OPEN_AIR",
  "ERA_5_METROPOLIS",
  "ERA_6_MEGASTRUCTURE",
  "ERA_7_SOVEREIGN",
]);


export const TiersDemographicsSchema = z.object({
  t0: z.number().nonnegative(),
  t1: z.number().nonnegative(),
  t2: z.number().nonnegative(),
  t3: z.number().nonnegative(),
});

export const PersonTraitsSchema = z.object({
  crisisStyle: z.number().min(0).max(100),
  loyalty: z.number().min(0).max(100),
  cognitiveOrientation: z.number().min(0).max(100),
});

export const LeaderStateSchema = z.object({
  displayName: z.string().min(2).max(64),
  dynastyName: z.string().min(2).max(64),
  ageYears: z.number().nonnegative(),
  healthPct: z.number().min(0).max(100),
  stressPct: z.number().min(0).max(100),
  legitimacy: z.number().min(0).max(100),
  prestige: z.number().nonnegative(),
  activityId: z.string().nullable().optional(),
  skills: z.record(z.string(), z.number()),
  traits: PersonTraitsSchema,
  permits: z.array(z.string()).optional(),
  equipment: z.array(z.string()),
  properties: z.array(z.string()),
  dietId: z.string(),
  trainingInProgress: z
    .object({
      id: z.string(),
      turnsRemaining: z.number(),
    })
    .nullable()
    .optional(),

  heirId: z.string().nullable(),
  childrenIds: z.array(z.string()).optional(),
  spouseId: z.string().nullable().optional(),
  biographyFacts: z.array(z.string()).optional(),
});

export const EconomyStateSchema = z.object({
  leaderPrivateCredits: z.number(),
  colonyTreasury: z.number(),
  consortiumCredits: z.number(),
  taxRatePct: z.number().min(0).max(100),
  marketTaxPct: z.number().optional().default(5),
  corruptionIndex: z.number().optional().default(0),
  netEnergyMW: z.number(),
  energyDeficitMW: z.number().optional().default(0),
  storedOreTons: z.number().optional().default(100),
  storedRefinedTons: z.number().optional().default(50),
  storageCapacityTons: z.number().optional().default(1000),
  isruRawTonsPerTurn: z.number().nonnegative(),
  isruRefinedTonsPerTurn: z.number().nonnegative(),
  industrialWearPct: z.number().min(0).max(100).optional().default(0),
});


export const AgePyramidSchema = z.object({
  children: z.number().nonnegative(),
  active: z.number().nonnegative(),
  seniors: z.number().nonnegative(),
});

export const DemographicsStateSchema = z.object({
  popTotal: z.number().nonnegative(),
  tiers: TiersDemographicsSchema,
  jobsByTier: TiersDemographicsSchema.optional().default({ t0: 0, t1: 0, t2: 0, t3: 0 }),
  unemploymentByTier: TiersDemographicsSchema.optional().default({ t0: 0, t1: 0, t2: 0, t3: 0 }),
  happinessIndex: z.number().min(0).max(100),
  crimeRatePct: z.number().min(0).max(100),
  unemploymentRatePct: z.number().min(0).max(100).optional(),
  immigrationQuota: z.number().nonnegative().optional(),
  averageHealth: z.number().min(0).max(100).optional(),
  emigrationLastTurn: z.number().optional(),
  growthRatePerTurn: z.number().optional(),
  pyramid: AgePyramidSchema.optional().default({ children: 0, active: 40, seniors: 0 }),
  agePyramid: AgePyramidSchema.optional(),
});






export const TerritoryCellSchema = z.object({
  id: z.string(),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  buildingId: z.string().nullable(),
  buildingLevel: z.number().int().nonnegative(),
  zoning: z.enum(["NONE", "RESIDENTIAL", "INDUSTRIAL", "CIVIC", "AGRI", "ENERGY"]),
  utilitiesServed: z.array(z.string()),
  pollution: z.number().nonnegative(),
  viable: z.boolean(),
});

export const TerritoryStateSchema = z.object({
  planetId: z.string(),
  hectaresTotal: z.number().positive(),
  hectaresRespirable: z.number().nonnegative(),
  hectaresUsed: z.number().nonnegative().optional().default(0),
  atmospherePressureBar: z.number().optional().default(1),
  oxygenPercentage: z.number().optional().default(21),
  meanTemperatureC: z.number().optional().default(15),
  terraformingProgressPct: z.number().min(0).max(100).optional().default(0),
  pollutionIndex: z.number().min(0).max(100).optional().default(0),
  radiationMsvPerTurn: z.number().optional().default(0),
  seismicRisk: z.number().optional().default(0),
  gridGranularity: z.enum(["PARCEL", "BLOCK", "DISTRICT", "REGION"]),
  cells: z.array(TerritoryCellSchema),
});

export const UtilityNetworkStateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  currentCapacity: z.number().optional(),
  currentLoad: z.number().optional(),
  coveragePct: z.number().min(0).max(100).optional(),
  operationalCostPerTurn: z.number().optional(),
  sourceThroughput: z.number().optional(),
  usefulThroughput: z.number().optional(),
  criticalDemand: z.number().optional(),
  lengthKm: z.number().optional(),
  status: z.string(),
});


export const BookLogEntrySchema = z.object({
  turnIndex: z.number(),
  bookId: z.string(),
  title: z.string(),
  body: z.string(),
  origin: z.enum(["MODEL", "FALLBACK"]),
  rollNatural: z.number().nullable(),
  rollTotal: z.number().nullable(),
  degree: z.string().nullable(),
  chosenEffectId: z.string().nullable(),
  timestamp: z.string().optional(),
});

export const LineageEntrySchema = z.object({
  displayName: z.string(),
  dynastyName: z.string(),
  mandateStartTurn: z.number(),
  mandateEndTurn: z.number().nullable(),
  causeOfDeath: z.string().optional(),
  accomplishments: z.array(z.string()),
  decisionsImpact: z.record(z.string(), z.number()).optional(),
});

export const State4XPayloadSchema = z.object({
  contractVersion: z.string(),
  saveId: z.string(),
  turnIndex: z.number().int().nonnegative(),
  cycleIndex: z.number().int().nonnegative(),
  currentEra: EraIdentifierSchema,
  turnScale: z.string().optional().default("1 mois"),
  colonyDate: z.string().optional().default("An 01, Mois 01"),
  globalSeed: z.number().int(),
  prngState: z.number().int(),
  archetypeId: z.string().optional().default("ARC-01"),
  territory: TerritoryStateSchema,
  demographics: DemographicsStateSchema,
  economy: EconomyStateSchema,
  utilities: z.array(UtilityNetworkStateSchema).optional().default([]),
  transportLinks: z.array(z.string()).optional().default([]),
  fleet: z.record(z.string(), z.number()).optional().default({}),
  leader: LeaderStateSchema,
  advisors: z.array(
    z.object({
      id: z.string(),
      displayName: z.string(),
      role: z.string(),
      favorPoints: z.number().optional().default(0),
      traits: PersonTraitsSchema,
    })
  ),

  factions: z.array(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      fear: z.number().min(0).max(100),
      respect: z.number().min(0).max(100),
      sanctionActive: z.boolean(),
    })
  ),
  poles: z.array(z.object({ id: z.string(), value: z.number() })).optional().default([]),
  research: z.object({
    points: z.number().nonnegative(),
    unlocked: z.array(z.string()),
    inProgress: z.string().nullable(),
    allocationPct: z
      .object({
        A: z.number(),
        B: z.number(),
        C: z.number(),
        D: z.number(),
      })
      .default({ A: 25, B: 25, C: 25, D: 25 }),
  }),

  surgeGauge: z.number().int().min(0).max(5),
  canon: z.array(z.object({ turn: z.number(), fact: z.string() })).optional().default([]),
  logbook: z.array(BookLogEntrySchema).optional().default([]),
  lineage: z.array(LineageEntrySchema).optional().default([]),
  lastSyncedAt: z.string().optional(),
});


export const PatchOperationSchema = z.object({
  path: z.union([z.string(), z.array(z.string())]),
  op: z.enum(["set", "inc", "push", "remove"]),
  value: z.any(),
});

export const WorkerInboundSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("INIT"), seed: z.number(), setup: z.any().optional(), payload: State4XPayloadSchema.optional() }),
  z.object({ kind: z.literal("APPLY_MANUAL"), actions: z.array(z.any()) }),
  z.object({
    kind: z.literal("RESOLVE_TURN"),
    choiceId: z.string().nullable(),
    overAllocation: z.any().nullable().optional(),
    destinyCardId: z.string().optional(),
    selectedBookId: z.string().optional(),
  }),
  z.object({ kind: z.literal("REQUEST_SNAPSHOT") }),
  z.object({ kind: z.literal("LOAD_SNAPSHOT"), snapshot: z.any() }),
  z.object({ kind: z.literal("FAST_SIM"), turns: z.number().int().positive() }),
]);

export const WorkerOutboundSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("READY"), snapshot: z.any() }),
  z.object({ kind: z.literal("PATCH"), turnIndex: z.number(), ops: z.array(PatchOperationSchema) }),
  z.object({ kind: z.literal("TURN_CONTEXT"), context: z.any() }),
  z.object({ kind: z.literal("SNAPSHOT"), snapshot: z.any() }),
  z.object({ kind: z.literal("FAST_SIM_RESULT"), series: z.any() }),
  z.object({ kind: z.literal("ERROR"), code: z.string(), detail: z.string() }),
]);

export type EraIdentifier = z.infer<typeof EraIdentifierSchema>;
export type TiersDemographics = z.infer<typeof TiersDemographicsSchema>;
export type PersonTraits = z.infer<typeof PersonTraitsSchema>;
export type LeaderState = z.infer<typeof LeaderStateSchema>;
export type EconomyState = z.infer<typeof EconomyStateSchema>;
export type DemographicsState = z.infer<typeof DemographicsStateSchema>;
export type TerritoryCell = z.infer<typeof TerritoryCellSchema>;
export type TerritoryState = z.infer<typeof TerritoryStateSchema>;
export type UtilityNetworkState = z.infer<typeof UtilityNetworkStateSchema>;
export type BookLogEntry = z.infer<typeof BookLogEntrySchema>;
export type LineageEntry = z.infer<typeof LineageEntrySchema>;
export type State4XPayload = z.infer<typeof State4XPayloadSchema>;
export type PatchOperation = z.infer<typeof PatchOperationSchema>;
export type WorkerInbound = z.infer<typeof WorkerInboundSchema>;
export type WorkerOutbound = z.infer<typeof WorkerOutboundSchema>;

export type AdvisorState = State4XPayload["advisors"][number];
export type FactionState = State4XPayload["factions"][number];
export type PoleState = NonNullable<State4XPayload["poles"]>[number];
export type ResearchState = State4XPayload["research"];
export type AgePyramid = { children: number; active: number; seniors: number };


export const NarrativeOptionSchema = z.object({
  effectId: z.enum(["EFF-A", "EFF-B", "EFF-C"]),
  label: z.string().min(4).max(90),
  body: z.string().min(20).max(320),
  riskHint: z.enum(["LOW", "MEDIUM", "HIGH"])
});

export const ReboundSchema = z.object({
  bookId: z.enum([
    "LIV-01", "LIV-02", "LIV-03", "LIV-04", "LIV-05",
    "LIV-06", "LIV-07", "LIV-08", "LIV-09", "LIV-10"
  ]),
  body: z.string().min(20).max(240)
});

export const TurnNarrativeSchema = z.object({
  bookId: z.enum([
    "LIV-01", "LIV-02", "LIV-03", "LIV-04", "LIV-05",
    "LIV-06", "LIV-07", "LIV-08", "LIV-09", "LIV-10"
  ]),
  title: z.string().min(4).max(80),
  body: z.string().min(100).max(1200),
  options: z.array(NarrativeOptionSchema).min(2).max(4),
  rebounds: z.array(ReboundSchema).max(2),
  canonCandidate: z.string().max(120).nullable()
});

export type TurnNarrative = z.infer<typeof TurnNarrativeSchema>;

export const TurnRequestSchema = z.object({
  context: z.object({
    locale: z.enum(["fr", "en"]).default("fr"),
    turnIndex: z.number(),
    cycleIndex: z.number(),
    era: z.string(),
    turnScale: z.string(),
    colonyDate: z.string(),
    activeBook: z.string(),
    destinyCard: z.object({
      id: z.string(),
      label: z.string(),
      bookId: z.string(),
      sectorModifier: z.string(),
      flavor: z.string()
    }),
    state: z.record(z.string(), z.any()),
    sectorDeltas: z.record(z.string(), z.number()),
    rollOutcome: z.object({
      natural: z.number(),
      total: z.number(),
      dc: z.number(),
      degree: z.string()
    }),
    precomputedEffects: z.array(z.object({
      id: z.enum(["EFF-A", "EFF-B", "EFF-C"]),
      label: z.string(),
      bodyPreview: z.string(),
      patch: z.array(z.any())
    })),
    rollingSummaries: z.record(z.string(), z.string()).optional(),
    canon: z.array(z.object({ turn: z.number(), fact: z.string() })).max(24),
    variantIndex: z.number()
  })
});

export const CycleReportSchema = z.object({
  title: z.string().min(6).max(100),
  cycleSummary: z.string().min(100).max(1400),
  structuralDilemma: z.object({
    dilemmaTitle: z.string().min(6).max(90),
    description: z.string().min(50).max(600),
    choiceA: z.object({
      label: z.string().min(4).max(80),
      outcome: z.string().min(20).max(300),
      impactSummary: z.string()
    }),
    choiceB: z.object({
      label: z.string().min(4).max(80),
      outcome: z.string().min(20).max(300),
      impactSummary: z.string()
    })
  }),
  eraTransitionVerdict: z.string().optional()
});

export type CycleReport = z.infer<typeof CycleReportSchema>;

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "model", "system"]),
  content: z.string()
});

export const AdvisorChatRequestSchema = z.object({
  persona: z.enum(["TACTICAL", "SCIENCE", "LOGISTICS", "CIVIC", "HISTORIAN"]),
  messages: z.array(ChatMessageSchema),
  colonySummary: z.object({
    era: z.string(),
    turnIndex: z.number(),
    colonyDate: z.string(),
    popTotal: z.number(),
    netEnergyMW: z.number(),
    respirableHa: z.number(),
    terraformPct: z.number(),
    treasury: z.number(),
    privateCredits: z.number(),
    consortiumCredits: z.number(),
    leaderHealth: z.number(),
    leaderStress: z.number(),
    happiness: z.number(),
    crime: z.number(),
    activeBook: z.string()
  })
});

export const ContextualEventSchema = z.object({
  id: z.string(),
  title: z.string().min(4).max(100),
  category: z.enum(["COLONY", "THREATS", "LEADER", "AI_CHRONICLES"]),
  severity: z.enum(["INFO", "WARNING", "CRITICAL", "SUCCESS"]),
  body: z.string().min(60).max(900),
  impactSummary: z.string().min(4).max(120),
  tags: z.array(z.string()).min(1).max(6),
  options: z.array(
    z.object({
      label: z.string().min(4).max(90),
      description: z.string().min(10).max(250),
      deltaEnergy: z.number().default(0),
      deltaTreasury: z.number().default(0),
      deltaHappiness: z.number().default(0),
      deltaStress: z.number().default(0)
    })
  ).min(1).max(3)
});

export type ContextualEvent = z.infer<typeof ContextualEventSchema>;

export const ContextualEventRequestSchema = z.object({
  colonyState: z.object({
    era: z.string(),
    turnIndex: z.number(),
    colonyDate: z.string(),
    popTotal: z.number(),
    tiers: z.object({
      t0: z.number(),
      t1: z.number(),
      t2: z.number(),
      t3: z.number()
    }),
    netEnergyMW: z.number(),
    respirableHa: z.number(),
    terraformPct: z.number(),
    treasury: z.number(),
    happiness: z.number(),
    crime: z.number(),
    leaderHealth: z.number(),
    leaderStress: z.number(),
    planetId: z.string()
  })
});


