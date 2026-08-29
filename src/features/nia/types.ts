export interface AutoBuildRules {
  energyThresholdMw: number;
  housingBufferRatio: number;
  minOreReserve: number;
  sciencePointsTarget: number;
}

export interface AutoBuildAI {
  evaluatePriority: (
    gameState: any,
    rules: AutoBuildRules
  ) => {
    category: "Énergie" | "Habitat" | "ISRU" | "R&D" | "Civique";
    reason: string;
    score: number;
  };
}

export interface NiaConfig {
  mode: "OFF" | "MANUAL" | "AUTO";
  priority: "BALANCED" | "ENERGY" | "HOUSING" | "INDUSTRY" | "SCIENCE";
  directive: "SURVIVAL" | "EXPANSION" | "ECOLOGY" | "ISOLATION";
  maxBudgetPerTurn: number;
  autoBuildPlanets: Record<string, boolean>;
  autoBuildRules: AutoBuildRules;
}
