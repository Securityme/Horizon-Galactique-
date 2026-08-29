import { State4XPayload, GameSetup, TerritoryCell, UtilityId, EraIdentifier } from "../types/state";
import { ManualAction, OverAllocation, PatchOperation, NarrativeContext, PrecomputedEffect, RollOutcome, SimulationSeries, SimulationSeriesPoint } from "../types/payloads";
import { DeterministicDice } from "../narrative/mulberry32";
import { drawDestinyCards, DESTINY_DECK } from "../narrative/destinyDraft";
import * as formulas from "./formulas";

import dbSystems from "../data/db_systems.json";
import dbPlanets from "../data/db_planets.json";
import dbArchetypes from "../data/db_archetypes.json";
import dbBuildings from "../data/db_buildings.json";
import dbEquipment from "../data/db_equipment.json";
import dbProperties from "../data/db_properties.json";
import dbFactions from "../data/db_factions.json";
import dbPoles from "../data/db_poles.json";
import dbEras from "../data/db_eras.json";
import dbResearch from "../data/db_research.json";
import dbUtilities from "../data/db_utilities.json";
import dbDiets from "../data/db_diets.json";
import dbActivities from "../data/db_activities.json";

export function createInitialState(setup: GameSetup): State4XPayload {
  const planet = dbPlanets.find((p) => p.id === setup.planetId) || dbPlanets[0];
  const archetype = dbArchetypes.find((a) => a.id === setup.archetypeId) || dbArchetypes[0];

  // Grid initialization for Era I (14x14 = 196 cells, well below 400 cap INV-18)
  const cells: TerritoryCell[] = [];
  const gridSize = 14;
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cellId = `cell_${x}_${y}`;
      const isCenter = x === 7 && y === 7;
      const isNearCenter = (x === 7 && y === 8) || (x === 8 && y === 7);
      
      cells.push({
        id: cellId,
        x,
        y,
        buildingId: isCenter ? "BLD-C01" : isNearCenter ? "BLD-H01" : null,
        buildingLevel: isCenter || isNearCenter ? 1 : 0,
        zoning: isCenter ? "CIVIC" : isNearCenter ? "RESIDENTIAL" : "NONE",
        utilitiesServed: isCenter || isNearCenter ? ["UTL-ELE", "UTL-O2", "UTL-EAU", "UTL-DAT"] : [],
        pollution: 0,
        viable: true
      });
    }
  }

  const initialUtilities: State4XPayload["utilities"] = (dbUtilities as any[]).map((u) => ({
    id: u.id as UtilityId,
    sourceThroughput: u.id === "UTL-ELE" ? 25.0 : u.id === "UTL-O2" ? 150.0 : 80.0,
    usefulThroughput: u.id === "UTL-ELE" ? 24.5 : u.id === "UTL-O2" ? 148.0 : 78.0,
    criticalDemand: u.id === "UTL-ELE" ? 10.0 : 30.0,
    lengthKm: 1.2,
    status: "ONLINE"
  }));

  const initialFactions = (dbFactions as any[]).map((f) => ({
    id: f.id,
    name: f.name,
    fear: 30,
    respect: 50,
    sanctionActive: false
  }));

  const initialEconomy: State4XPayload["economy"] = {
    leaderPrivateCredits: archetype.privateCredits || 15000,
    colonyTreasury: 45000,
    consortiumCredits: 20000,
    taxRatePct: 12,
    marketTaxPct: 5,
    corruptionIndex: 0,
    netEnergyMW: 8.5,
    energyDeficitMW: 0,
    isruRawTonsPerTurn: 45,
    isruRefinedTonsPerTurn: 30,
    storedOreTons: 120,
    storedRefinedTons: 50,
    storageCapacityTons: 40000,
    industrialWearPct: 0,
  };

  const initialDemographics: State4XPayload["demographics"] = {
    popTotal: 48,
    pyramid: { children: 4, active: 42, seniors: 2 },
    tiers: { t0: 24, t1: 18, t2: 5, t3: 1 },
    jobsByTier: { t0: 40, t1: 15, t2: 5, t3: 1 },
    unemploymentByTier: { t0: 0, t1: 0, t2: 0, t3: 0 },
    unemploymentRatePct: 0,
    crimeRatePct: 2.5,
    happinessIndex: 68,
    averageHealth: 82,
    immigrationQuota: 10,
    emigrationLastTurn: 0
  };

  const initialPoles = (dbPoles as any[]).map((p) => ({
    id: p.id,
    value: 50
  }));

  const initialAdvisors = archetype.initialTeam.map((roleName, idx) => ({
    id: `ADV-0${idx + 1}`,
    displayName: `${roleName} Alistair`,
    role: roleName,
    traits: { crisisStyle: 50 + idx * 5, loyalty: 70 + idx * 5, cognitiveOrientation: 55 },
    skills: {
      engineering: 30,
      command: 25,
      diplomacy: 25,
      science: 30,
      medicine: 25,
      economy: 25,
      military: 25,
      bioAdaptation: 20,
      logistics: 25,
      rhetoric: 20
    },
    favorPoints: 3,
    permits: ["PRM-01"],
    equipment: []
  }));

  const startingUnlocked = ["RD-A01"];

  const fleet: Record<string, number> = { "VEH-T01": 2, "VEH-S01": 1 };
  if (archetype.startingGear) {
    archetype.startingGear.forEach((gearId) => {
      if (gearId.startsWith("VEH-")) {
        fleet[gearId] = (fleet[gearId] || 0) + 1;
      }
    });
  }

  const startingEquipment: string[] = ["EQP-01"];
  const startingProperties: string[] = ["PRP-01"];
  archetype.startingGear.forEach((g) => {
    if (g.startsWith("EQP-")) startingEquipment.push(g);
    if (g.startsWith("PRP-")) startingProperties.push(g);
  });

  return {
    contractVersion: "1.0.0",
    saveId: `sg_save_${Date.now()}_${setup.seed}`,
    turnIndex: 1,
    cycleIndex: 0,
    currentEra: "ERA_1_CAPSULE_HUB",
    turnScale: "MONTH",
    colonyDate: "An 01 — M 01",
    globalSeed: setup.seed,
    prngState: setup.seed,
    archetypeId: setup.archetypeId,
    territory: {
      planetId: setup.planetId,
      hectaresTotal: planet.hectaresTotal,
      hectaresRespirable: 2.0,
      hectaresUsed: 0.2,
      atmospherePressureBar: planet.initPressureBar,
      oxygenPercentage: planet.atmosphere.includes("O2") ? 12.0 : 0.4,
      meanTemperatureC: planet.meanTempC,
      terraformingProgressPct: 0.0,
      pollutionIndex: 0,
      radiationMsvPerTurn: planet.radiationMsv || 1.0,
      seismicRisk: planet.geoActivity || 0.2,
      gridGranularity: "PARCEL",
      cells
    },
    demographics: initialDemographics,
    economy: initialEconomy,
    utilities: initialUtilities,
    transportLinks: ["TRN-01"],
    fleet,
    leader: {
      displayName: setup.leaderName,
      dynastyName: setup.dynastyName,
      ageYears: 34,
      healthPct: 92,
      stressPct: 18,
      legitimacy: 75,
      prestige: 10,
      skills: archetype.skills,
      traits: archetype.traits,
      permits: ["PRM-01", "PRM-10"],
      equipment: startingEquipment,
      properties: startingProperties,
      dietId: "DIT-03",
      activityId: "ACT-12",
      trainingInProgress: null,
      heirId: null,
      childrenIds: [],
      spouseId: null,
      biographyFacts: ["Fondation de la colonie sur " + planet.name]
    },
    advisors: initialAdvisors,
    factions: initialFactions,
    poles: initialPoles,
    research: {
      points: 80,
      unlocked: startingUnlocked,
      inProgress: "RD-A02",
      allocationPct: { A: 40, B: 20, C: 20, D: 20 }
    },
    surgeGauge: 0,
    canon: [
      { turn: 1, fact: `Atterrissage réussi du vaisseau-colonie sur ${planet.name}.` }
    ],
    logbook: [],
    lineage: [
      {
        displayName: `Commandant Jarek ${setup.dynastyName}`,
        dynastyName: setup.dynastyName,
        mandateStartTurn: -45,
        mandateEndTurn: -20,
        causeOfDeath: "Mort naturelle durant le voyage cryogénique",
        accomplishments: [
          "Supervision du lancement de l'Arche stellaire depuis la Terre en ruines",
          "Stabilisation des réacteurs thermonucléaires principaux lors du départ"
        ],
        decisionsImpact: { "Énergie (MW)": 5, "Légitimité": 15 }
      },
      {
        displayName: `Gouverneure Vespera ${setup.dynastyName}`,
        dynastyName: setup.dynastyName,
        mandateStartTurn: -19,
        mandateEndTurn: 0,
        causeOfDeath: "Épuisement respiratoire lors des phases d'approche orbitale",
        accomplishments: [
          "Traversée victorieuse de la ceinture d'astéroïdes d'Epsilon Eridani",
          "Mise en place de la charte de coopération des Factions de l'Arche"
        ],
        decisionsImpact: { "Trésorerie (¢)": 5000, "Bonheur": 10 }
      },
      {
        displayName: setup.leaderName,
        dynastyName: setup.dynastyName,
        mandateStartTurn: 1,
        mandateEndTurn: null,
        accomplishments: [
          "Atterrissage et déploiement initial de la capsule centrale de l'Arche",
          "Prise de commandement officielle de la colonie"
        ],
        decisionsImpact: {}
      }
    ]
  };
}

export function applyManualActions(state: State4XPayload, actions: ManualAction[]): PatchOperation[] {
  const ops: PatchOperation[] = [];

  for (const action of actions) {
    switch (action.type) {
      case "SET_TAX": {
        const rate = Math.min(50, Math.max(0, action.rate));
        state.economy.taxRatePct = rate;
        ops.push({ path: "economy.taxRatePct", op: "set", value: rate });
        break;
      }
      case "SET_IMMIGRATION_QUOTA": {
        const q = Math.min(1000, Math.max(0, action.quota));
        state.demographics.immigrationQuota = q;
        ops.push({ path: "demographics.immigrationQuota", op: "set", value: q });
        break;
      }
      case "SET_RD_ALLOCATION": {
        state.research.allocationPct = action.allocation;
        ops.push({ path: "research.allocationPct", op: "set", value: action.allocation });
        break;
      }
      case "START_BUILDING": {
        const building = dbBuildings.find((b) => b.id === action.buildingId);
        const cell = state.territory.cells.find((c) => c.id === action.cellId);
        if (building && cell && !cell.buildingId && state.economy.colonyTreasury >= building.cost) {
          state.economy.colonyTreasury -= building.cost;
          cell.buildingId = building.id;
          cell.buildingLevel = 0;
          state.territory.hectaresUsed += building.footprintHa;
          ops.push({ path: "economy.colonyTreasury", op: "set", value: state.economy.colonyTreasury });
          ops.push({ path: `territory.cells.${action.cellId}.buildingId`, op: "set", value: building.id });
          ops.push({ path: `territory.cells.${action.cellId}.buildingLevel`, op: "set", value: 0 });
          ops.push({ path: "territory.hectaresUsed", op: "set", value: state.territory.hectaresUsed });
        }
        break;
      }
      case "DEMOLISH_BUILDING": {
        const cell = state.territory.cells.find((c) => c.id === action.cellId);
        if (cell && cell.buildingId) {
          const building = dbBuildings.find((b) => b.id === cell.buildingId);
          if (building) {
            state.territory.hectaresUsed = Math.max(0, state.territory.hectaresUsed - building.footprintHa);
          }
          cell.buildingId = null;
          cell.buildingLevel = 0;
          ops.push({ path: `territory.cells.${action.cellId}.buildingId`, op: "set", value: null });
        }
        break;
      }
      case "CONNECT_UTILITY": {
        const cell = state.territory.cells.find((c) => c.id === action.cellId);
        if (cell && !cell.utilitiesServed.includes(action.utilityId)) {
          cell.utilitiesServed.push(action.utilityId);
          ops.push({ path: `territory.cells.${action.cellId}.utilitiesServed`, op: "push", value: action.utilityId });
        }
        break;
      }
      case "CHANGE_ZONING": {
        const cell = state.territory.cells.find((c) => c.id === action.cellId);
        if (cell) {
          cell.zoning = action.zoning;
          ops.push({ path: `territory.cells.${action.cellId}.zoning`, op: "set", value: action.zoning });
        }
        break;
      }
      case "BUY_EQUIPMENT": {
        const eq = dbEquipment.find((e) => e.id === action.equipmentId);
        if (eq && state.economy.leaderPrivateCredits >= eq.privateCost) {
          state.economy.leaderPrivateCredits -= eq.privateCost;
          state.leader.equipment.push(eq.id);
          ops.push({ path: "economy.leaderPrivateCredits", op: "set", value: state.economy.leaderPrivateCredits });
          ops.push({ path: "leader.equipment", op: "push", value: eq.id });
        }
        break;
      }
      case "BUY_PROPERTY": {
        const prop = dbProperties.find((p) => p.id === action.propertyId);
        if (prop && state.economy.leaderPrivateCredits >= prop.privateCost) {
          state.economy.leaderPrivateCredits -= prop.privateCost;
          state.leader.properties.push(prop.id);
          state.leader.prestige += prop.prestigeBonus;
          ops.push({ path: "economy.leaderPrivateCredits", op: "set", value: state.economy.leaderPrivateCredits });
          ops.push({ path: "leader.properties", op: "push", value: prop.id });
          ops.push({ path: "leader.prestige", op: "set", value: state.leader.prestige });
        }
        break;
      }
      case "SET_DIET": {
        state.leader.dietId = action.dietId;
        ops.push({ path: "leader.dietId", op: "set", value: action.dietId });
        break;
      }
      case "SET_ACTIVITY": {
        state.leader.activityId = action.activityId;
        ops.push({ path: "leader.activityId", op: "set", value: action.activityId });
        break;
      }
      case "START_TRAINING": {
        state.leader.trainingInProgress = { id: action.trainingId, turnsRemaining: 3 };
        ops.push({ path: "leader.trainingInProgress", op: "set", value: state.leader.trainingInProgress });
        break;
      }
      case "DESIGNATE_HEIR": {
        state.leader.heirId = action.heirId;
        ops.push({ path: "leader.heirId", op: "set", value: action.heirId });
        break;
      }
      case "CONVERT_CURRENCY": {
        const amt = action.amount;
        if (action.from === "TREASURY" && action.to === "CONSORTIUM" && state.economy.colonyTreasury >= amt) {
          state.economy.colonyTreasury -= amt;
          state.economy.consortiumCredits += Math.floor(amt * 0.72);
        } else if (action.from === "CONSORTIUM" && action.to === "TREASURY" && state.economy.consortiumCredits >= amt) {
          state.economy.consortiumCredits -= amt;
          state.economy.colonyTreasury += Math.floor(amt * 0.68);
        } else if (action.from === "PRIVATE" && action.to === "TREASURY" && state.economy.leaderPrivateCredits >= amt) {
          state.economy.leaderPrivateCredits -= amt;
          state.economy.colonyTreasury += amt;
          state.leader.legitimacy = Math.min(100, state.leader.legitimacy + Math.floor(amt / 10000) * 6);
        } else if (action.from === "TREASURY" && action.to === "PRIVATE" && state.economy.colonyTreasury >= amt) {
          // Embezzlement rules (Section 7.5)
          state.economy.colonyTreasury -= amt;
          state.economy.leaderPrivateCredits += amt;
          state.economy.corruptionIndex += (amt / 10000) * 0.8;
        }
        // NOTE: Consortium -> Private is STRICTLY PROHIBITED (INV-14)
        ops.push({ path: "economy.colonyTreasury", op: "set", value: state.economy.colonyTreasury });
        ops.push({ path: "economy.leaderPrivateCredits", op: "set", value: state.economy.leaderPrivateCredits });
        ops.push({ path: "economy.consortiumCredits", op: "set", value: state.economy.consortiumCredits });
        ops.push({ path: "leader.legitimacy", op: "set", value: state.leader.legitimacy });
        break;
      }
      case "ENACT_DECREE": {
        for (const [poleId, delta] of Object.entries(action.poleDeltas)) {
          const pole = state.poles.find((p) => p.id === poleId);
          if (pole) {
            pole.value = Math.min(100, Math.max(0, pole.value + delta));
            ops.push({ path: `poles.${poleId}.value`, op: "set", value: pole.value });
          }
        }
        break;
      }
      case "BUILD_SHIP": {
        const cost = action.cost;
        if (state.economy.colonyTreasury >= cost) {
          state.economy.colonyTreasury -= cost;
          if (!state.fleet) {
            state.fleet = {};
          }
          state.fleet[action.shipType] = (state.fleet[action.shipType] || 0) + 1;
          ops.push({ path: "economy.colonyTreasury", op: "set", value: state.economy.colonyTreasury });
          ops.push({ path: `fleet.${action.shipType}`, op: "set", value: state.fleet[action.shipType] });
        }
        break;
      }
    }
  }

  return ops;
}

function runCycleEngine(state: State4XPayload, ops: PatchOperation[], dice: DeterministicDice) {
  // 1. Temporal Year-by-Year calculation and Resource growth/depletion:
  const baseOreDepletion = Math.floor((state.economy.storedOreTons || 100) * 0.05);
  const oreGrown = state.economy.isruRefinedTonsPerTurn || 10;
  const netOreDelta = oreGrown - baseOreDepletion;

  state.economy.storedOreTons = Math.min(
    state.economy.storageCapacityTons ?? 1000,
    Math.max(0, (state.economy.storedOreTons ?? 100) + netOreDelta)
  );
  ops.push({ path: "economy.storedOreTons", op: "set", value: state.economy.storedOreTons });

  // Energy Surplus efficiency compounding
  if (state.economy.netEnergyMW > 10) {
    const energyBonusCredits = Math.floor(state.economy.netEnergyMW * 15);
    state.economy.colonyTreasury += energyBonusCredits;
    ops.push({ path: "economy.colonyTreasury", op: "set", value: state.economy.colonyTreasury });
  }

  // 2. Automate Fleet Construction based on AI budget allocations:
  if (state.economy.colonyTreasury >= 55000) {
    const shipOptions = ["MINER", "CARGO_FREIGHTER", "SCIENCE_VESSEL", "CORVETTE"];
    const chosenShip = shipOptions[dice.nextInt(0, shipOptions.length - 1)];
    const cost = 15000;
    state.economy.colonyTreasury -= cost;
    if (!state.fleet) {
      state.fleet = {};
    }
    state.fleet[chosenShip] = (state.fleet[chosenShip] || 0) + 1;

    state.canon.push({
      turn: state.turnIndex,
      fact: `🤖 Auto-Build IA : Allocation de 15,000 Crédits pour l'assemblage automatique d'un vaisseau de classe [${chosenShip}] face au surplus de trésorerie.`,
    });
    ops.push({ path: "economy.colonyTreasury", op: "set", value: state.economy.colonyTreasury });
    ops.push({ path: `fleet.${chosenShip}`, op: "set", value: state.fleet[chosenShip] });
    ops.push({ path: "canon", op: "set", value: state.canon });
  }

  // 3. Random Events at specific cycle milestones:
  if (state.turnIndex > 0 && state.turnIndex % 5 === 0) {
    const milestones = [
      {
        title: "⚡ Surtension Nucléaire Détectée",
        fact: "Événement de Cycle : Une crête d'énergie thermique a secoué le réseau de fusion. La stabilité s'améliore mais requiert de la maintenance.",
        apply: () => {
          state.demographics.happinessIndex = Math.max(0, state.demographics.happinessIndex - 5);
          ops.push({ path: "demographics.happinessIndex", op: "set", value: state.demographics.happinessIndex });
        }
      },
      {
        title: "🌌 Alignement Cosmique Propice",
        fact: "Événement de Cycle : L'orbite de l'Arche croise un nuage de poussières riches en hélium-3. R&D boostée de +50 points.",
        apply: () => {
          state.research.points += 50;
          ops.push({ path: "research.points", op: "set", value: state.research.points });
        }
      },
      {
        title: "🩺 Épidémie de Poussières de Silicate",
        fact: "Événement de Cycle : Des micro-poussières de régolithe ont pénétré les conduits d'aération tertiaires. Légère hausse du mécontentement.",
        apply: () => {
          state.demographics.happinessIndex = Math.max(0, state.demographics.happinessIndex - 8);
          ops.push({ path: "demographics.happinessIndex", op: "set", value: state.demographics.happinessIndex });
        }
      },
      {
        title: "📈 Boom Technologique Consortial",
        fact: "Événement de Cycle : Le Consortium des Étoiles approuve une subvention d'infrastructure extraordinaire. +10,000 Crédits.",
        apply: () => {
          state.economy.consortiumCredits += 10000;
          ops.push({ path: "economy.consortiumCredits", op: "set", value: state.economy.consortiumCredits });
        }
      }
    ];

    const idx = dice.nextInt(0, milestones.length - 1);
    const event = milestones[idx];
    event.apply();

    state.canon.push({
      turn: state.turnIndex,
      fact: `${event.title} — ${event.fact}`,
    });
    ops.push({ path: "canon", op: "set", value: state.canon });
  }
}

export function resolveTurn(
  state: State4XPayload,
  dice: DeterministicDice,
  choiceId: string | null = null,
  overAllocation: OverAllocation | null = null,
  destinyCardId?: string,
  selectedBookId?: string
): { patch: PatchOperation[]; context: NarrativeContext } {
  const ops: PatchOperation[] = [];

  // Step 1: Draw Destiny Cards & Pick
  const destinyCards = drawDestinyCards(dice, 3);
  const pickedCard = destinyCards.find((c) => c.id === destinyCardId) || destinyCards[0];
  const activeBook = selectedBookId || pickedCard.bookId;

  // Step 2: Atmospheric & Environmental calculations (F-08, F-09, F-10)
  const currentPlanet = dbPlanets.find((p) => p.id === state.territory.planetId) || dbPlanets[0];
  
  // Count active buildings
  const builtBuildings = state.territory.cells
    .map((c) => (c.buildingId && c.buildingLevel > 0) ? dbBuildings.find((b) => b.id === c.buildingId) : null)
    .filter((b): b is NonNullable<typeof b> => b !== null && b !== undefined);

  const gasInjectors = builtBuildings.filter((b) => b.id === "BLD-T01" || b.id === "BLD-T04").length;
  const o2Plants = builtBuildings.filter((b) => b.id === "BLD-T02").length;
  const terraformingMirrors = builtBuildings.filter((b) => b.id === "BLD-T03").length;
  const magneticGenerators = builtBuildings.filter((b) => b.id === "BLD-T05").length;

  const nextPressure = formulas.calculateAtmosphericPressure(
    state.territory.atmospherePressureBar,
    gasInjectors * 200,
    0.85,
    state.territory.meanTemperatureC,
    currentPlanet.gravityG,
    magneticGenerators > 0 ? 0.95 : 0.05
  );
  state.territory.atmospherePressureBar = nextPressure;
  ops.push({ path: "territory.atmospherePressureBar", op: "set", value: nextPressure });

  const nextO2 = formulas.calculateOxygenPct(
    state.territory.oxygenPercentage,
    o2Plants * 400,
    builtBuildings.filter((b) => b.category === "Bio").length * 80,
    state.demographics.popTotal,
    15
  );
  state.territory.oxygenPercentage = nextO2;
  ops.push({ path: "territory.oxygenPercentage", op: "set", value: nextO2 });

  if (terraformingMirrors > 0) {
    state.territory.meanTemperatureC = Math.min(22, state.territory.meanTemperatureC + terraformingMirrors * 0.4);
    ops.push({ path: "territory.meanTemperatureC", op: "set", value: state.territory.meanTemperatureC });
  }

  const terraformPct = formulas.calculateTerraformIndex(
    state.territory.atmospherePressureBar,
    state.territory.oxygenPercentage,
    state.territory.meanTemperatureC
  );
  state.territory.terraformingProgressPct = terraformPct;
  ops.push({ path: "territory.terraformingProgressPct", op: "set", value: terraformPct });

  // Phase 2: Cellular Pollution Diffusion (Section 6.3)
  const nextCells = state.territory.cells.map((cell) => {
    const neighbors = state.territory.cells.filter((c) => {
      const dist = Math.sqrt(Math.pow(c.x - cell.x, 2) + Math.pow(c.y - cell.y, 2));
      return dist > 0 && dist < 1.5;
    });
    const avgNeighborPollution = neighbors.length > 0 
      ? neighbors.reduce((sum, n) => sum + n.pollution, 0) / neighbors.length 
      : 0;
    
    // Industrial emissions
    let emissions = 0;
    if (cell.buildingId) {
      const b = dbBuildings.find((bld) => bld.id === cell.buildingId);
      if (b && b.category === "INDUSTRIAL") emissions = 5;
      if (b && b.category === "ENERGY") emissions = 2;
    }

    const nextPollution = formulas.calculatePollutionImpact(cell.pollution + emissions, avgNeighborPollution);
    return { ...cell, pollution: nextPollution };
  });
  state.territory.cells = nextCells;
  ops.push({ path: "territory.cells", op: "set", value: nextCells });

  const avgPollution = nextCells.reduce((sum, c) => sum + c.pollution, 0) / nextCells.length;
  state.territory.pollutionIndex = Math.min(100, Math.round(avgPollution));
  ops.push({ path: "territory.pollutionIndex", op: "set", value: state.territory.pollutionIndex });

  // Step 3: Energy Calculation (F-01, F-02)
  const energySources = builtBuildings
    .filter((b) => b.category === "Énergie")
    .map((b) => ({
      nominalMw: (b as any).energyGenMw || 5.0,
      efficiency: 0.85,
      dispoFactor: 0.95
    }));
  if (energySources.length === 0) {
    energySources.push({ nominalMw: 10.0, efficiency: 0.8, dispoFactor: 1.0 });
  }

  const energyConso = builtBuildings.reduce((sum, b) => sum + (b.footprintHa * 3.5 + b.maintenance * 0.02), 2.0);
  const energyResult = formulas.calculateNetEnergy({
    sources: energySources,
    consumptionMw: energyConso,
    lineLossesMw: 0.4
  });
  state.economy.netEnergyMW = energyResult.netMw;
  state.economy.energyDeficitMW = energyResult.deficitMw;
  ops.push({ path: "economy.netEnergyMW", op: "set", value: energyResult.netMw });
  ops.push({ path: "economy.energyDeficitMW", op: "set", value: energyResult.deficitMw });

  // Step 4: ISRU & Industry (F-03, F-04, F-05)
  const rawIsru = formulas.calculateRawIsru(
    state.demographics.tiers.t0,
    state.demographics.tiers.t1,
    currentPlanet.isruRichness,
    state.research.unlocked.includes("RD-A02") ? 0.35 : 0.0,
    0.08,
    currentPlanet.gravityG
  );
  const refineResult = formulas.calculateRefining(rawIsru, 200, 0.75);
  state.economy.isruRawTonsPerTurn = rawIsru;
  state.economy.isruRefinedTonsPerTurn = refineResult.refinedTons;
  
  // Refined management (Section 5.4 Phase 2)
  state.economy.storedOreTons = Math.max(0, state.economy.storedOreTons + rawIsru - refineResult.refinedTons / 0.75);
  state.economy.storedRefinedTons = Math.min(
    state.economy.storageCapacityTons,
    (state.economy.storedRefinedTons || 0) + refineResult.refinedTons
  );
  
  ops.push({ path: "economy.isruRawTonsPerTurn", op: "set", value: rawIsru });
  ops.push({ path: "economy.isruRefinedTonsPerTurn", op: "set", value: refineResult.refinedTons });
  ops.push({ path: "economy.storedOreTons", op: "set", value: state.economy.storedOreTons });
  ops.push({ path: "economy.storedRefinedTons", op: "set", value: state.economy.storedRefinedTons });

  // Infrastructure Integrity (F-25)
  const totalBld = builtBuildings.length;
  const nextIntegrity = formulas.calculateInfrastructureIntegrity(
    state.economy.industrialWearPct || 0,
    state.economy.colonyTreasury * 0.02, // 2% allocated to maintenance automatically
    totalBld,
    state.territory.seismicRisk
  );
  state.economy.industrialWearPct = nextIntegrity;
  ops.push({ path: "economy.industrialWearPct", op: "set", value: nextIntegrity });

  // Step 5: Demographics & Education (F-11 to F-16)
  const housingCap = builtBuildings
    .filter((b) => b.category === "Habitat")
    .reduce((sum, b) => sum + ((b as any).capacity || 0), 60);

  // Job Demand Calculation (Phase 2)
  const jobDemand = { t0: 0, t1: 0, t2: 0, t3: 0 };
  builtBuildings.forEach((b) => {
    if (b.category === "ISRU" || b.category === "Énergie") jobDemand.t0 += 4;
    if (b.category === "Habitat") jobDemand.t0 += 1;
    if (b.category === "R&D") jobDemand.t1 += 3;
    if (b.category === "Civique") jobDemand.t1 += 2;
  });
  state.demographics.jobsByTier = jobDemand;
  ops.push({ path: "demographics.jobsByTier", op: "set", value: jobDemand });

  const jobMarket = formulas.calculateJobMarket(state.demographics.tiers, jobDemand);
  state.demographics.unemploymentByTier = jobMarket.unemploymentByTier;
  state.demographics.unemploymentRatePct = jobMarket.overallRate;
  ops.push({ path: "demographics.unemploymentByTier", op: "set", value: jobMarket.unemploymentByTier });
  ops.push({ path: "demographics.unemploymentRatePct", op: "set", value: jobMarket.overallRate });

  const demoGrowth = formulas.calculateDemographicGrowth(
    state.demographics.pyramid.active,
    state.demographics.pyramid,
    state.demographics.happinessIndex,
    state.demographics.averageHealth ?? 80,
    housingCap,
    state.demographics.popTotal,
    state.territory.radiationMsvPerTurn
  );

  const migration = formulas.calculateMigration(
    state.demographics.immigrationQuota ?? 10,
    state.demographics.happinessIndex,
    state.demographics.unemploymentRatePct ?? 5,
    state.demographics.averageHealth ?? 80,
    60,
    state.demographics.popTotal
  );

  const popDelta = demoGrowth.births - demoGrowth.deaths + migration.immigration - migration.emigration;
  state.demographics.popTotal = Math.max(12, state.demographics.popTotal + popDelta);
  state.demographics.pyramid.active = Math.max(10, state.demographics.pyramid.active + Math.floor(popDelta * 0.7));
  state.demographics.pyramid.children = Math.max(2, state.demographics.pyramid.children + demoGrowth.births - Math.floor(demoGrowth.births * 0.1));
  state.demographics.emigrationLastTurn = migration.emigration;
  ops.push({ path: "demographics.popTotal", op: "set", value: state.demographics.popTotal });

  // Education flows
  const eduT0T1 = formulas.calculateEducationFlow(state.demographics.tiers.t0, 40, state.demographics.happinessIndex);
  state.demographics.tiers.t0 = Math.max(2, state.demographics.tiers.t0 - eduT0T1 + Math.floor(popDelta * 0.4));
  state.demographics.tiers.t1 = state.demographics.tiers.t1 + eduT0T1;
  ops.push({ path: "demographics.tiers", op: "set", value: state.demographics.tiers });

  // Happiness & Crime
  const happiness = formulas.calculateHappiness({
    housing: Math.min(100, (housingCap / Math.max(1, state.demographics.popTotal)) * 100),
    food: 85,
    health: state.demographics.averageHealth ?? 80,
    leisure: 70,
    security: 75,
    freedom: 70,
    pollution: state.territory.pollutionIndex,
    taxPressure: state.economy.taxRatePct
  });
  state.demographics.happinessIndex = happiness;
  ops.push({ path: "demographics.happinessIndex", op: "set", value: happiness });

  const crime = formulas.calculateCrimeRate(
    state.demographics.unemploymentRatePct ?? 5,
    happiness,
    50,
    0.15,
    60
  );
  state.demographics.crimeRatePct = crime;
  ops.push({ path: "demographics.crimeRatePct", op: "set", value: crime });

  // Step 6: R&D Points (F-19)
  const rdSum = builtBuildings
    .filter((b) => b.category === "R&D")
    .reduce((sum, b) => sum + ((b as any).rdPointsPerTurn || 0), 10);
  const rdGained = formulas.calculateResearchPoints(rdSum, state.leader.skills.science, state.demographics.tiers.t3);
  state.research.points += rdGained;
  ops.push({ path: "research.points", op: "set", value: state.research.points });

  // Step 7: Economy & Treasury (F-20)
  const treasuryDelta = formulas.calculateTreasuryDelta(
    state.demographics.pyramid.active,
    180,
    state.economy.taxRatePct,
    crime,
    Math.floor(state.demographics.popTotal * 1.8),
    Math.floor(state.economy.isruRefinedTonsPerTurn * 4.5),
    builtBuildings.reduce((sum, b) => sum + b.maintenance, 50),
    Math.floor(state.demographics.pyramid.active * 12),
    0
  );
  state.economy.colonyTreasury = Math.max(0, state.economy.colonyTreasury + treasuryDelta.deltaTreasury);
  state.economy.leaderPrivateCredits += 1200; // Leader salary
  ops.push({ path: "economy.colonyTreasury", op: "set", value: state.economy.colonyTreasury });
  ops.push({ path: "economy.leaderPrivateCredits", op: "set", value: state.economy.leaderPrivateCredits });

  // Step 8: Leader Vitals (F-23) & Succession (F-24)
  const activeDiet = dbDiets.find((d) => d.id === state.leader.dietId) || dbDiets[2];
  const activeAct = dbActivities.find((a) => a.id === state.leader.activityId) || dbActivities[11];
  const leaderVitals = formulas.calculateLeaderVitals(
    state.leader.healthPct,
    state.leader.stressPct,
    { health: activeDiet.healthPerTurn, stress: activeDiet.stressPerTurn },
    { health: activeAct.healthDelta, stress: activeAct.stressDelta },
    { health: 0, stress: 0 },
    state.leader.ageYears,
    currentPlanet.gravityG,
    state.leader.equipment.includes("EQP-12"),
    energyResult.deficitMw > 0 ? 3 : 0,
    crime > 20 ? 2 : 0,
    state.leader.properties.length * 2
  );
  state.leader.healthPct = leaderVitals.nextHealth;
  state.leader.stressPct = leaderVitals.nextStress;
  ops.push({ path: "leader.healthPct", op: "set", value: leaderVitals.nextHealth });
  ops.push({ path: "leader.stressPct", op: "set", value: leaderVitals.nextStress });

  // Leader age increment (1 month or 1 year or 5 years depending on Era)
  if (state.turnScale === "MONTH") {
    if (state.turnIndex % 12 === 0) state.leader.ageYears += 1;
  } else if (state.turnScale === "YEAR") {
    state.leader.ageYears += 1;
  } else {
    state.leader.ageYears += 5;
  }
  ops.push({ path: "leader.ageYears", op: "set", value: state.leader.ageYears });

  // Death check
  const deathProb = formulas.calculateLeaderDeathProbability(
    state.leader.ageYears,
    state.leader.healthPct,
    state.leader.stressPct,
    state.leader.equipment.includes("EQP-05")
  );
  if (dice.next() < deathProb) {
    // Succession (INV-16)
    if (!state.lineage) state.lineage = [];
    const activeIndex = state.lineage.findIndex((l) => l.mandateEndTurn === null);
    if (activeIndex !== -1) {
      state.lineage[activeIndex].mandateEndTurn = state.turnIndex;
      state.lineage[activeIndex].causeOfDeath = state.leader.stressPct > 70
        ? "Surmenage chronique et arrêt cardiaque sous haute tension"
        : state.leader.healthPct < 20
          ? "Maladie foudroyante par effondrement des constantes vitales"
          : "Disparition biologique par sénescence avancée";

      const startTurn = state.lineage[activeIndex].mandateStartTurn;
      const reignLength = state.turnIndex - startTurn;
      state.lineage[activeIndex].accomplishments = [
        `Gouvernance de l'Arche pendant ${reignLength} mois de mandat`,
        `Préservation de la vie de ${state.demographics.popTotal} citoyens survivants`,
        `Trésorerie de fin de mandat de ${state.economy.colonyTreasury} ¢`,
        `Gestion de la colonie sous le développement de l'ère ${state.currentEra.replace(/_/g, " ")}`
      ];
      state.lineage[activeIndex].decisionsImpact = {
        "Bonheur Global (%)": Math.round(state.demographics.happinessIndex),
        "Trésorerie Restante (¢)": state.economy.colonyTreasury,
        "Légitimité de Clôture": state.leader.legitimacy
      };
    }

    let newName = "";
    let isHeir = false;
    if (state.leader.heirId) {
      newName = `Héritier(ère) ${state.leader.dynastyName}`;
      isHeir = true;
      state.leader.displayName = newName;
      state.leader.ageYears = 24;
      state.leader.healthPct = 100;
      state.leader.stressPct = 20;
      state.canon.push({ turn: state.turnIndex, fact: `Passage de témoin dynastique suite à la fin de règne du Leader.` });
    } else {
      newName = `Régent(e) ${state.advisors[0]?.displayName || "Intérimaire"}`;
      state.leader.displayName = newName;
      state.leader.legitimacy = Math.max(10, state.leader.legitimacy - 40);
      state.leader.ageYears = 42;
      state.leader.healthPct = 90;
      state.leader.stressPct = 35;
      state.canon.push({ turn: state.turnIndex, fact: `Régence temporaire instaurée en l'absence d'héritier direct.` });
    }

    state.lineage.push({
      displayName: newName,
      dynastyName: state.leader.dynastyName,
      mandateStartTurn: state.turnIndex,
      mandateEndTurn: null,
      accomplishments: [
        isHeir
          ? "Prise de serment dynastique face aux représentants du Consortium"
          : "Investiture provisoire par décret d'urgence extraordinaire",
        "Restauration immédiate du plan de vol de l'Arche"
      ],
      decisionsImpact: isHeir
        ? { "Légitimité dynastique": 15, "Espoir populaire": 10 }
        : { "Légitimité altérée": -20, "Défiance politique": -10 }
    });

    ops.push({ path: "lineage", op: "set", value: state.lineage });
    ops.push({ path: "leader.displayName", op: "set", value: state.leader.displayName });
    ops.push({ path: "leader.ageYears", op: "set", value: state.leader.ageYears });
    ops.push({ path: "leader.healthPct", op: "set", value: state.leader.healthPct });
    ops.push({ path: "leader.stressPct", op: "set", value: state.leader.stressPct });
    ops.push({ path: "leader.legitimacy", op: "set", value: state.leader.legitimacy });
  }

  // Step 9: D20 Roll & Modifiers (F-21, F-22)
  const d20Roll = dice.rollD20();
  const overAllocMod = overAllocation ? formulas.calculateOverAllocationModifier(overAllocation.amount) : 0;
  if (overAllocation) {
    if (overAllocation.currency === "TREASURY") state.economy.colonyTreasury = Math.max(0, state.economy.colonyTreasury - overAllocation.amount);
    if (overAllocation.currency === "PRIVATE") state.economy.leaderPrivateCredits = Math.max(0, state.economy.leaderPrivateCredits - overAllocation.amount);
    if (overAllocation.currency === "CONSORTIUM") state.economy.consortiumCredits = Math.max(0, state.economy.consortiumCredits - overAllocation.amount);
  }

  // Pertinent skill based on Book
  let pertinentSkill = state.leader.skills.command;
  if (activeBook === "LIV-01") pertinentSkill = state.leader.skills.science;
  else if (activeBook === "LIV-02") pertinentSkill = state.leader.skills.engineering;
  else if (activeBook === "LIV-03") pertinentSkill = state.leader.skills.military;
  else if (activeBook === "LIV-04") pertinentSkill = state.leader.skills.diplomacy;
  else if (activeBook === "LIV-05") pertinentSkill = state.leader.skills.logistics;
  else if (activeBook === "LIV-06") pertinentSkill = state.leader.skills.economy;
  else if (activeBook === "LIV-07") pertinentSkill = state.leader.skills.engineering;
  else if (activeBook === "LIV-08") pertinentSkill = state.leader.skills.bioAdaptation;
  else if (activeBook === "LIV-09") pertinentSkill = state.leader.skills.science;

  const rollResult = formulas.resolveD20(
    d20Roll,
    pertinentSkill,
    2, // M sector
    0, // M archetype
    state.leader.equipment.includes("EQP-04") ? 1 : 0,
    overAllocMod,
    14 // DC
  );

  // Surge Gauge mechanic (Section 7.7)
  if (rollResult.isCriticalSuccess) {
    state.surgeGauge = Math.min(5, state.surgeGauge + 1);
  } else if (rollResult.isCriticalFail) {
    state.surgeGauge = 0;
  }
  ops.push({ path: "surgeGauge", op: "set", value: state.surgeGauge });

  // Precomputed Effects (EFF-A, EFF-B, EFF-C)
  const precomputedEffects: PrecomputedEffect[] = [
    {
      id: "EFF-A",
      label: "Approche conservatoire et stabilisation",
      bodyPreview: "Sécuriser les protocoles de base sans surexposer les réserves.",
      patch: [
        { path: "demographics.happinessIndex", op: "inc", value: 3 },
        { path: "economy.colonyTreasury", op: "inc", value: -1200 }
      ]
    },
    {
      id: "EFF-B",
      label: "Impulsion industrielle et rendement accru",
      bodyPreview: "Forcer la cadence des équipes pour maximiser la production immédiate.",
      patch: [
        { path: "economy.storedOreTons", op: "inc", value: 40 },
        { path: "leader.stressPct", op: "inc", value: 4 }
      ]
    },
    {
      id: "EFF-C",
      label: "Déploiement d'urgence et arbitrage audacieux",
      bodyPreview: "Consacrer des crédits du Consortium pour neutraliser tout blocage.",
      patch: [
        { path: "economy.consortiumCredits", op: "inc", value: -2500 },
        { path: "leader.legitimacy", op: "inc", value: 5 }
      ]
    }
  ];

  // Apply chosen effect if present
  if (choiceId) {
    const chosen = precomputedEffects.find((e) => e.id === choiceId);
    if (chosen) {
      for (const p of chosen.patch) {
        if (p.path === "demographics.happinessIndex") state.demographics.happinessIndex += Number(p.value);
        if (p.path === "economy.colonyTreasury") state.economy.colonyTreasury += Number(p.value);
        if (p.path === "economy.storedOreTons") state.economy.storedOreTons += Number(p.value);
        if (p.path === "leader.stressPct") state.leader.stressPct += Number(p.value);
        if (p.path === "economy.consortiumCredits") state.economy.consortiumCredits += Number(p.value);
        if (p.path === "leader.legitimacy") state.leader.legitimacy += Number(p.value);
        ops.push(p);
      }
    }
  }

  // Step 10: Check Era Progression (DB-15, FSM)
  checkEraProgression(state, ops);

  // Advance construction queues
  for (const cell of state.territory.cells) {
    if (cell.buildingId && cell.buildingLevel === 0) {
      cell.buildingLevel = 1;
      const bType = dbBuildings.find((b) => b.id === cell.buildingId);
      if (bType) {
        state.canon = state.canon || [];
        state.canon.push({
          turn: state.turnIndex,
          fact: `🔨 Chantier : La construction du bâtiment "${bType.name}" au secteur (${cell.x}, ${cell.y}) est achevée et opérationnelle.`,
        });
        ops.push({ path: "canon", op: "set", value: state.canon });
      }
      ops.push({ path: `territory.cells.${cell.id}.buildingLevel`, op: "set", value: 1 });
    }
  }

  // Run CycleEngine calculations (annual temporal progression, resource changes, AI ship construction)
  runCycleEngine(state, ops, dice);

  // Step 11: Turn index & Date update
  state.turnIndex += 1;
  state.cycleIndex = state.turnIndex % 10;
  ops.push({ path: "turnIndex", op: "set", value: state.turnIndex });
  ops.push({ path: "cycleIndex", op: "set", value: state.cycleIndex });

  // Update date
  const eraObj = dbEras.find((e) => e.id === state.currentEra) || dbEras[0];
  state.turnScale = eraObj.turnScale as any;
  if (state.turnScale === "MONTH") {
    const year = Math.floor((state.turnIndex - 1) / 12) + 1;
    const month = ((state.turnIndex - 1) % 12) + 1;
    state.colonyDate = `An ${year.toString().padStart(2, "0")} — M ${month.toString().padStart(2, "0")}`;
  } else if (state.turnScale === "YEAR") {
    state.colonyDate = `An ${(state.turnIndex).toString().padStart(2, "0")}`;
  } else {
    state.colonyDate = `Lustre ${Math.floor(state.turnIndex / 5) + 1} (An ${state.turnIndex * 5})`;
  }
  ops.push({ path: "colonyDate", op: "set", value: state.colonyDate });

  const rollOutcome: RollOutcome = {
    natural: d20Roll,
    total: rollResult.total,
    dc: 14,
    degree: rollResult.degree,
    modifierBreakdown: {
      skill: Math.floor(pertinentSkill / 10),
      sector: 2,
      archetype: 0,
      equipment: state.leader.equipment.includes("EQP-04") ? 1 : 0,
      overAllocation: overAllocMod
    }
  };

  const context: NarrativeContext = {
    locale: "fr",
    turnIndex: state.turnIndex,
    cycleIndex: state.cycleIndex,
    era: state.currentEra,
    turnScale: eraObj.turnScaleLabel,
    colonyDate: state.colonyDate,
    activeBook,
    destinyCard: pickedCard,
    state: {
      popTotal: state.demographics.popTotal,
      happiness: state.demographics.happinessIndex,
      crime: state.demographics.crimeRatePct,
      unemployment: state.demographics.unemploymentRatePct ?? 0,
      netEnergyMW: state.economy.netEnergyMW,
      respirableHa: state.territory.hectaresRespirable,
      terraformPct: state.territory.terraformingProgressPct,
      treasury: state.economy.colonyTreasury,
      privateCredits: state.economy.leaderPrivateCredits,
      consortiumCredits: state.economy.consortiumCredits,
      leaderHealth: state.leader.healthPct,
      leaderStress: state.leader.stressPct,
      leaderLegitimacy: state.leader.legitimacy
    },
    sectorDeltas: {
      energy: state.economy.netEnergyMW,
      pop: popDelta,
      treasury: treasuryDelta.deltaTreasury,
      isru: rawIsru
    },
    rollOutcome,
    precomputedEffects,
    rollingSummaries: {},
    canon: state.canon.slice(-12),
    variantIndex: dice.nextInt(0, 99)
  };

  return { patch: ops, context };
}

function checkEraProgression(state: State4XPayload, ops: PatchOperation[]): void {
  const pop = state.demographics.popTotal;
  const netMw = state.economy.netEnergyMW;
  const terraform = state.territory.terraformingProgressPct;
  const pressure = state.territory.atmospherePressureBar;
  const o2 = state.territory.oxygenPercentage;
  const hasBldI02 = state.territory.cells.some((c) => c.buildingId === "BLD-I02");
  const hasBldM01 = state.territory.cells.some((c) => c.buildingId === "BLD-M01");

  if (state.currentEra === "ERA_1_CAPSULE_HUB" && pop >= 100 && netMw >= 20 && hasBldI02) {
    transitionToEra(state, "ERA_2_OUTPOST", ops);
  } else if (state.currentEra === "ERA_2_OUTPOST" && pop >= 800 && netMw >= 80 && hasBldM01) {
    transitionToEra(state, "ERA_3_GEODESIC_DOME", ops);
  } else if (state.currentEra === "ERA_3_GEODESIC_DOME" && terraform >= 60 && pressure >= 0.70 && o2 >= 19.5 && pop >= 15000) {
    transitionToEra(state, "ERA_4_OPEN_AIR", ops);
  } else if (state.currentEra === "ERA_4_OPEN_AIR" && pop >= 150000 && state.research.unlocked.includes("RD-A08")) {
    transitionToEra(state, "ERA_5_METROPOLIS", ops);
  } else if (state.currentEra === "ERA_5_METROPOLIS" && pop >= 1000000 && terraform >= 85) {
    transitionToEra(state, "ERA_6_MEGASTRUCTURE", ops);
  } else if (state.currentEra === "ERA_6_MEGASTRUCTURE" && pop >= 5000000) {
    transitionToEra(state, "ERA_7_SOVEREIGN", ops);
  }
}

function transitionToEra(state: State4XPayload, newEra: EraIdentifier, ops: PatchOperation[]): void {
  state.currentEra = newEra;
  const eraData = dbEras.find((e) => e.id === newEra);
  if (eraData) {
    state.territory.hectaresRespirable = eraData.haMaxResp;
    state.turnScale = eraData.turnScale as any;
    state.canon.push({
      turn: state.turnIndex,
      fact: `Transition historique vers l'Ère ${eraData.name} (${eraData.turnScaleLabel}).`
    });
    ops.push({ path: "currentEra", op: "set", value: newEra });
    ops.push({ path: "territory.hectaresRespirable", op: "set", value: eraData.haMaxResp });
    ops.push({ path: "turnScale", op: "set", value: eraData.turnScale });
  }
}

export function fastSim(initialState: State4XPayload, turns: number, dice: DeterministicDice): SimulationSeries {
  const clonedState: State4XPayload = JSON.parse(JSON.stringify(initialState));
  const points: SimulationSeriesPoint[] = [];

  for (let i = 0; i < turns; i++) {
    resolveTurn(clonedState, dice, "EFF-A", null);
    points.push({
      turn: clonedState.turnIndex,
      popTotal: clonedState.demographics.popTotal,
      t0: clonedState.demographics.tiers.t0,
      t1: clonedState.demographics.tiers.t1,
      t2: clonedState.demographics.tiers.t2,
      t3: clonedState.demographics.tiers.t3,
      netEnergyMW: clonedState.economy.netEnergyMW,
      hectaresRespirable: clonedState.territory.hectaresRespirable,
      terraformPct: clonedState.territory.terraformingProgressPct,
      treasury: clonedState.economy.colonyTreasury,
      privateCredits: clonedState.economy.leaderPrivateCredits,
      consortiumCredits: clonedState.economy.consortiumCredits,
      happiness: clonedState.demographics.happinessIndex,
      crime: clonedState.demographics.crimeRatePct,
      rdPoints: clonedState.research.points
    });
  }

  return { points };
}
