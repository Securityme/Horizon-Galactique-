import { StateCreator } from "zustand";
import { EngineStoreState } from "../useEngineStore";
import { NiaConfig, autoBuildAIImpl } from "../../features/nia";
import dbBuildings from "../../data/db_buildings.json";
import { audioService } from "../../services/audio";

export interface NiaSlice {
  niaConfig: NiaConfig;
  niaLogs: string[];
  setNiaConfig: (config: Partial<NiaConfig>) => void;
  runNiaCycle: () => { builtCount: number; spent: number; logs: string[] };
}

export const createNiaSlice: StateCreator<EngineStoreState, [], [], NiaSlice> = (set, get) => ({
  niaConfig: {
    mode: "OFF",
    priority: "BALANCED",
    directive: "EXPANSION",
    maxBudgetPerTurn: 15000,
    autoBuildPlanets: {},
    autoBuildRules: {
      energyThresholdMw: 10,
      housingBufferRatio: 0.15,
      minOreReserve: 150,
      sciencePointsTarget: 20
    }
  },
  niaLogs: [],

  setNiaConfig: (config) =>
    set((state) => ({
      niaConfig: { ...state.niaConfig, ...config }
    })),

  runNiaCycle: () => {
    const { gameState, niaConfig } = get();
    if (!gameState || niaConfig.mode === "OFF") return { builtCount: 0, spent: 0, logs: [] };

    const currentPlanetId = gameState.territory.planetId;
    const isAutoBuildEnabled = niaConfig.autoBuildPlanets?.[currentPlanetId] ?? false;

    const currentEra = gameState.currentEra;
    const treasury = gameState.economy.colonyTreasury;
    const budget = Math.min(treasury, niaConfig.maxBudgetPerTurn);
    if (budget < 800) return { builtCount: 0, spent: 0, logs: ["Trésorerie insuffisante pour la N.I.A."] };

    let maxDist = 2;
    if (currentEra.includes("ERA_2") || currentEra.includes("ERA 2")) maxDist = 3;
    else if (currentEra.includes("ERA_3") || currentEra.includes("ERA 3")) maxDist = 4;
    else if (currentEra.includes("ERA_4") || currentEra.includes("ERA 4")) maxDist = 5;
    else if (currentEra.includes("ERA_5") || currentEra.includes("ERA_6") || currentEra.includes("ERA_7")) maxDist = 7;

    const emptyCells = gameState.territory.cells.filter((c) => {
      const dx = Math.abs(c.x - 7);
      const dy = Math.abs(c.y - 7);
      return c.viable && c.buildingId === null && dx <= maxDist && dy <= maxDist;
    });

    if (emptyCells.length === 0) {
      return { builtCount: 0, spent: 0, logs: ["N.I.A : Aucune parcelle libre débloquée."] };
    }

    let targetCategory: "Énergie" | "Habitat" | "ISRU" | "R&D" | "Civique" = "Habitat";
    let priorityReason = "Besoins vitaux de la colonie.";

    if (isAutoBuildEnabled) {
      const evaluation = autoBuildAIImpl.evaluatePriority(gameState, niaConfig.autoBuildRules);
      targetCategory = evaluation.category;
      priorityReason = `[Auto-Build AI] ${evaluation.reason}`;
    } else {
      const { directive, priority } = niaConfig;
      
      if (directive === "SURVIVAL") {
        if (gameState.economy.netEnergyMW < 2) targetCategory = "Énergie";
        else if (gameState.demographics.happinessIndex < 40) targetCategory = "Civique";
        else targetCategory = "Habitat";
        priorityReason = "Priorité absolue à la survie et à la stabilité.";
      } else if (directive === "EXPANSION") {
        if (gameState.economy.storedOreTons > 500) targetCategory = "ISRU";
        else targetCategory = "Habitat";
        priorityReason = "Focus sur la croissance démographique et industrielle.";
      } else if (directive === "ECOLOGY") {
        if (gameState.territory.pollutionIndex > 20) targetCategory = "Civique";
        else targetCategory = "R&D";
        priorityReason = "Limitation de l'empreinte et recherche environnementale.";
      } else if (directive === "ISOLATION") {
        targetCategory = "ISRU";
        priorityReason = "Autarcie et fortification des réserves.";
      } else {
        if (priority === "ENERGY" || gameState.economy.netEnergyMW < 5) {
          targetCategory = "Énergie";
        } else if (priority === "SCIENCE") {
          targetCategory = "R&D";
        } else if (priority === "INDUSTRY") {
          targetCategory = "ISRU";
        } else if (priority === "HOUSING" || gameState.demographics.popTotal > 40) {
          targetCategory = "Habitat";
        } else {
          if (gameState.economy.netEnergyMW < 2) targetCategory = "Énergie";
          else if ((gameState.research?.points ?? 0) < 10) targetCategory = "R&D";
          else targetCategory = "Habitat";
        }
        priorityReason = `Focus sectoriel : ${priority}`;
      }
    }

    const candidates = (dbBuildings as any[]).filter(
      (b) => b.category === targetCategory && b.cost <= budget
    );

    const building = candidates[0] || (dbBuildings as any[]).find((b) => b.cost <= budget);
    if (!building) {
      return { builtCount: 0, spent: 0, logs: [`N.I.A : Budget insuffisant pour bâtir en ${targetCategory}.`] };
    }

    const targetCell = emptyCells[0];
    const updatedCells = gameState.territory.cells.map((c) =>
      c.id === targetCell.id
        ? {
            ...c,
            buildingId: building.id,
            buildingLevel: 1,
            zoning:
              building.category === "Énergie"
                ? ("ENERGY" as const)
                : building.category === "Habitat"
                ? ("RESIDENTIAL" as const)
                : ("INDUSTRIAL" as const)
          }
        : c
    );

    const newTreasury = Math.max(0, gameState.economy.colonyTreasury - building.cost);
    let netEnergyMW = gameState.economy.netEnergyMW;
    if (building.energyGenMw) {
      netEnergyMW += building.energyGenMw;
    }

    const logMsg = isAutoBuildEnabled
      ? `🤖 [Auto-Build AI — ${targetCategory}] ${priorityReason} Construction de ${building.name} (${targetCell.x}, ${targetCell.y}) pour ${building.cost} ¢.`
      : `🤖 [N.I.A Auto-Gouverneur] Construction de ${building.name} (${targetCell.x}, ${targetCell.y}) pour ${building.cost} ¢.`;

    set((state) => {
      if (!state.gameState) return {};
      return {
        gameState: {
          ...state.gameState,
          economy: {
            ...state.gameState.economy,
            colonyTreasury: newTreasury,
            netEnergyMW
          },
          territory: {
            ...state.gameState.territory,
            cells: updatedCells
          }
        },
        niaLogs: [logMsg, ...state.niaLogs.slice(0, 15)]
      };
    });

    audioService.playBlip(720, 0.08);
    return { builtCount: 1, spent: building.cost, logs: [logMsg] };
  },
});
