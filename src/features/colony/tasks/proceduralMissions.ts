import { State4XPayload } from "../../../types/state";
import { ColonyTask } from "../../../components/views/ColonyTasksPanel";

export function generateProceduralMissions(state: State4XPayload): ColonyTask[] {
  const missions: ColonyTask[] = [];

  // 1. Energy Security (If low energy)
  if (state.economy.netEnergyMW < 10) {
    missions.push({
      id: "proc-energy",
      title: "Urgence Énergétique",
      description: "Le réseau vacille. Stabilisez la production à au moins 15 MW.",
      category: "CONSTRUCTION",
      difficulty: "MEDIUM",
      reward: { credits: 3000, science: 10 },
      completed: false,
    });
  }

  // 2. Population Growth (If high happiness but room to grow)
  if (state.demographics.happinessIndex > 60 && state.demographics.popTotal < 100) {
    missions.push({
      id: "proc-pop",
      title: "Appel aux Colons",
      description: "Le moral est bon. Attirez de nouveaux colons pour atteindre 120 habitants.",
      category: "POPULATION",
      difficulty: "EASY",
      reward: { credits: 2000, science: 20 },
      completed: false,
    });
  }

  // 3. Research Milestone
  if (state.currentEra.includes("ERA 1") || state.currentEra.includes("ERA 2")) {
    missions.push({
      id: "proc-research",
      title: "Percée Technologique",
      description: "Dépassez les 50 points de recherche cumulés pour consolider nos bases.",
      category: "RESEARCH",
      difficulty: "MEDIUM",
      reward: { credits: 5000, science: 40 },
      completed: false,
    });
  }

  // 4. Resource Stockpiling
  if ((state.economy.storedOreTons ?? 0) < 200) {
    missions.push({
      id: "proc-isru",
      title: "Mobilisation Minière",
      description: "Nos réserves de minerai sont basses. Stockez 500 tonnes de minerai brut.",
      category: "ECONOMY",
      difficulty: "MEDIUM",
      reward: { credits: 3500, science: 15 },
      completed: false,
    });
  }

  return missions;
}
