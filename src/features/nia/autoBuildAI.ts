import { AutoBuildAI } from "./types";
import dbBuildings from "../../data/db_buildings.json";

export const autoBuildAIImpl: AutoBuildAI = {
  evaluatePriority: (gameState, rules) => {
    const builtBuildings = gameState.territory.cells
      .map((c: any) => c.buildingId ? dbBuildings.find((b) => b.id === c.buildingId) : null)
      .filter((b: any): b is NonNullable<typeof b> => b !== null && b !== undefined);

    const housingCap = builtBuildings
      .filter((b: any) => b.category === "Habitat")
      .reduce((sum: number, b: any) => sum + ((b as any).capacity || 0), 60);

    const currentPop = gameState.demographics.popTotal;
    const currentEnergy = gameState.economy.netEnergyMW;
    const currentOre = gameState.economy.storedOreTons ?? 0;
    const currentScience = gameState.research?.points ?? 0;

    // Scores representing deficits (higher score means higher priority)
    let energyScore = 0;
    if (currentEnergy < rules.energyThresholdMw) {
      energyScore = (rules.energyThresholdMw - currentEnergy) * 15;
    }

    let housingScore = 0;
    const requiredHousing = currentPop * (1 + rules.housingBufferRatio);
    if (housingCap < requiredHousing) {
      housingScore = (requiredHousing - housingCap) * 1.5;
    }

    let isruScore = 0;
    if (currentOre < rules.minOreReserve) {
      isruScore = (rules.minOreReserve - currentOre) * 0.1;
    }

    let scienceScore = 0;
    if (currentScience < rules.sciencePointsTarget) {
      scienceScore = (rules.sciencePointsTarget - currentScience) * 1.2;
    }

    // Default scores to ensure a balanced development if everything is fine
    const baseEnergyScore = energyScore + 5;
    const baseHousingScore = housingScore + 4;
    const baseIsruScore = isruScore + 3;
    const baseScienceScore = scienceScore + 2;

    const scores = [
      { category: "Énergie" as const, score: baseEnergyScore, reason: `Énergie actuelle (${currentEnergy} MW) < seuil ciblé (${rules.energyThresholdMw} MW).` },
      { category: "Habitat" as const, score: baseHousingScore, reason: `Capacité d'habitat (${housingCap}) < tampon requis (${Math.round(requiredHousing)}).` },
      { category: "ISRU" as const, score: baseIsruScore, reason: `Réserves de minerai (${currentOre} t) < réserve minimale (${rules.minOreReserve} t).` },
      { category: "R&D" as const, score: baseScienceScore, reason: `Points de recherche (${currentScience}) < target de R&D (${rules.sciencePointsTarget}).` }
    ];

    scores.sort((a, b) => b.score - a.score);
    const top = scores[0];

    return {
      category: top.category,
      reason: top.reason,
      score: top.score
    };
  }
};
