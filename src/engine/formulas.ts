import constants from "../data/constants.json";

export interface EnergyParams {
  sources: { nominalMw: number; efficiency: number; dispoFactor: number }[];
  consumptionMw: number;
  lineLossesMw: number;
}

/** F-01 — Bilan énergétique net */
export function calculateNetEnergy(params: EnergyParams): { netMw: number; deficitMw: number } {
  const production = params.sources.reduce(
    (sum, src) => sum + src.nominalMw * src.efficiency * src.dispoFactor,
    0
  );
  const net = production - params.consumptionMw - params.lineLossesMw;
  return {
    netMw: Math.round(net * 10) / 10,
    deficitMw: net < 0 ? Math.round(-net * 10) / 10 : 0
  };
}

/** F-02 — Disponibilité d'une source intermittente */
export function calculateIntermittentDispo(
  fBase: number,
  atmoOpacity: number,
  isDaytime: boolean
): number {
  return fBase * (1 - Math.min(1, Math.max(0, atmoOpacity))) * (isDaytime ? 1.0 : 0.05);
}

/** F-03 — Extraction ISRU brute */
export function calculateRawIsru(
  t0Workers: number,
  t1Workers: number,
  planetIsruRichness: number,
  rdBonus: number,
  materialWear: number,
  gravityG: number
): number {
  const fGrav = 1 / (1 + 0.35 * Math.max(0, gravityG - 1));
  const rawLabor = t0Workers * 2.5 + t1Workers * 6.0;
  const yieldTons = rawLabor * planetIsruRichness * (1 + rdBonus) * (1 - Math.min(0.9, materialWear)) * fGrav;
  return Math.max(0, Math.round(yieldTons));
}

/** F-04 — Raffinage */
export function calculateRefining(
  rawTons: number,
  refineryCapacity: number,
  refiningEfficiency = 0.75
): { refinedTons: number; slagTons: number; untreatedTons: number } {
  const treated = Math.min(rawTons, refineryCapacity);
  const refined = treated * refiningEfficiency;
  const slag = treated * (1 - refiningEfficiency);
  const untreated = Math.max(0, rawTons - treated);
  return {
    refinedTons: Math.round(refined),
    slagTons: Math.round(slag),
    untreatedTons: Math.round(untreated)
  };
}

/** F-05 — Usure du matériel */
export function calculateMaterialWear(
  currentWear: number,
  abrasionFactor: number,
  maintenanceDrones: number,
  machineCount: number
): number {
  const maintenance = machineCount > 0
    ? Math.min(1, (maintenanceDrones * constants.EFF_DRONE) / machineCount)
    : 1;
  const nextWear = currentWear + constants.TAUX_USURE * abrasionFactor * (1 - maintenance);
  return Math.min(1, Math.max(0, Math.round(nextWear * 1000) / 1000));
}

/** F-06 — Capacité de bâtiments */
export function calculateBuildingCapacity(respirableHa: number, densityZoning: number): number {
  return Math.floor(respirableHa * densityZoning);
}

/** F-07 — Surface respirable */
export function calculateRespirableHectares(
  currentHa: number,
  deltaDomes: number,
  deltaOpenAir: number,
  lostHa: number,
  pressureBar: number,
  oxygenPct: number
): number {
  const allowedOpenAir = (pressureBar >= 0.70 && oxygenPct >= 19.5) ? deltaOpenAir : 0;
  const nextHa = currentHa + deltaDomes + allowedOpenAir - lostHa;
  return Math.max(0.5, Math.round(nextHa * 100) / 100);
}

/** F-08 — Pression atmosphérique */
export function calculateAtmosphericPressure(
  currentBar: number,
  gasInjectedTons: number,
  injectionEfficiency: number,
  temperatureExoC: number,
  gravityG: number,
  magneticField: number,
  planetVolMultiplier = 1.0
): number {
  const escapeRate = (constants.K_ECHAP * Math.max(10, temperatureExoC + 273)) / Math.max(0.2, gravityG) * (1 - magneticField);
  const delta = (gasInjectedTons * injectionEfficiency - escapeRate) / (100000 * planetVolMultiplier);
  return Math.max(0, Math.round((currentBar + delta) * 10000) / 10000);
}

/** F-09 — Fraction d'oxygène */
export function calculateOxygenPct(
  currentPct: number,
  electrolysisKg: number,
  photosynthesisKg: number,
  popTotal: number,
  oxidationKg: number,
  totalAtmoMass = 5000000
): number {
  const respirationKg = popTotal * constants.O2_PAR_COLON;
  const deltaO2 = (electrolysisKg + photosynthesisKg - respirationKg - oxidationKg) / totalAtmoMass * 100;
  const nextPct = currentPct + deltaO2;
  return Math.min(100, Math.max(0, Math.round(nextPct * 100) / 100));
}

/** F-10 — Indice de terraformation */
export function calculateTerraformIndex(
  pressureBar: number,
  oxygenPct: number,
  meanTempC: number
): number {
  const pNorm = Math.min(1, pressureBar / constants.P_CIBLE);
  const o2Norm = Math.min(1, oxygenPct / constants.X_CIBLE);
  const tempDiff = Math.abs(meanTempC - constants.T_CIBLE);
  const tempNorm = Math.max(0, 1 - tempDiff / 60);
  const progress = 100 * (0.40 * pNorm + 0.35 * o2Norm + 0.25 * tempNorm);
  return Math.min(100, Math.max(0, Math.round(progress * 10) / 10));
}

/** F-11 — Croissance démographique naturelle */
export function calculateDemographicGrowth(
  popActive: number,
  popByAge: { children: number; active: number; seniors: number },
  happinessNorm: number,
  healthNorm: number,
  availableHousing: number,
  popTotal: number,
  radiationMsv: number
): { births: number; deaths: number } {
  const fLogement = popTotal > 0 ? Math.min(1, availableHousing / popTotal) : 1;
  const births = Math.floor(
    popActive * constants.TAUX_FECONDITE * (happinessNorm / 100) * (healthNorm / 100) * fLogement
  );
  const radMortalityFactor = 1 + radiationMsv / constants.R_REF;
  const deathsChild = popByAge.children * 0.002 * radMortalityFactor;
  const deathsActive = popByAge.active * 0.005 * radMortalityFactor;
  const deathsSenior = popByAge.seniors * 0.04 * radMortalityFactor;
  const deaths = Math.floor(deathsChild + deathsActive + deathsSenior);
  return { births, deaths };
}

/** F-12 — Migration */
export function calculateMigration(
  quotaPerTurn: number,
  happinessIndex: number,
  unemploymentPct: number,
  avgHealth: number,
  avgFactionReputation: number,
  popTotal: number
): { immigration: number; emigration: number } {
  const attractivite =
    0.35 * (happinessIndex / 100) +
    0.25 * (1 - unemploymentPct / 100) +
    0.20 * (avgHealth / 100) +
    0.20 * (avgFactionReputation / 100);
  const immigration = Math.min(quotaPerTurn, Math.floor(attractivite * constants.CAPACITE_SPATIOPORT));
  const flightFactor = Math.max(0, 1 - happinessIndex / constants.SEUIL_FUITE);
  const emigration = Math.floor(popTotal * constants.TAUX_FUITE * flightFactor);
  return { immigration, emigration };
}

/** F-13 — Flux éducatif */
export function calculateEducationFlow(
  popTier: number,
  trainingCapacity: number,
  happinessNorm: number
): number {
  const naturalRate = popTier * constants.TAUX_SCOLARISATION * (happinessNorm / 100);
  return Math.min(trainingCapacity, Math.floor(naturalRate));
}

/** F-14 — Marché du travail par Tier */
export function calculateJobMarket(
  popByTier: { t0: number; t1: number; t2: number; t3: number },
  jobsByTier: { t0: number; t1: number; t2: number; t3: number }
): { unemploymentByTier: { t0: number; t1: number; t2: number; t3: number }; overallRate: number } {
  const u0 = Math.max(0, popByTier.t0 - jobsByTier.t0);
  const u1 = Math.max(0, popByTier.t1 - jobsByTier.t1);
  const u2 = Math.max(0, popByTier.t2 - jobsByTier.t2);
  const u3 = Math.max(0, popByTier.t3 - jobsByTier.t3);

  const totalPop = popByTier.t0 + popByTier.t1 + popByTier.t2 + popByTier.t3;
  const totalUnemployed = u0 + u1 + u2 + u3;
  
  const overallRate = totalPop > 0 ? (totalUnemployed / totalPop) * 100 : 0;

  return {
    unemploymentByTier: { t0: u0, t1: u1, t2: u2, t3: u3 },
    overallRate: Math.round(overallRate * 10) / 10
  };
}

/** F-17 — Pollution et Diffusion Cellulaire */
export function calculatePollutionImpact(
  cellPollution: number,
  neighborsAvgPollution: number,
  diffusionRate = 0.15,
  cleanupEfficiency = 0.05
): number {
  const diffusion = (neighborsAvgPollution - cellPollution) * diffusionRate;
  const next = cellPollution + diffusion - cellPollution * cleanupEfficiency;
  return Math.max(0, Math.round(next * 10) / 10);
}

/** F-25 — Intégrité de l'Infrastructure */
export function calculateInfrastructureIntegrity(
  currentWear: number,
  maintenanceBudget: number,
  totalBuildings: number,
  seismicRisk: number
): number {
  const requiredBudget = totalBuildings * 150;
  const budgetRatio = totalBuildings > 0 ? Math.min(1.2, maintenanceBudget / requiredBudget) : 1;
  const degradation = 0.5 * (1 - budgetRatio) + 0.2 * seismicRisk;
  const nextWear = currentWear + degradation;
  return Math.min(100, Math.max(0, Math.round(nextWear * 10) / 10));
}
export function calculateCrimeRate(
  unemploymentPct: number,
  happinessIndex: number,
  densityNorm: number,
  garrisonRatio: number,
  educationAvg: number
): number {
  const base = constants.BASE_CRIME;
  const crime =
    base +
    0.42 * unemploymentPct +
    0.31 * (100 - happinessIndex) +
    0.18 * densityNorm -
    0.26 * garrisonRatio * 100 -
    0.22 * educationAvg;
  return Math.min(100, Math.max(0, Math.round(crime * 10) / 10));
}

/** F-16 — Bonheur global */
export function calculateHappiness(params: {
  housing: number;
  food: number;
  health: number;
  leisure: number;
  security: number;
  freedom: number;
  pollution: number;
  taxPressure: number;
}): number {
  const score =
    0.22 * params.housing +
    0.20 * params.food +
    0.16 * params.health +
    0.14 * params.leisure +
    0.12 * params.security +
    0.08 * params.freedom -
    0.05 * params.pollution -
    0.03 * params.taxPressure;
  return Math.min(100, Math.max(0, Math.round(score * 10) / 10));
}

/** F-17 — Pollution */
export function calculatePollution(
  currentPollution: number,
  buildingEmissions: number,
  vegetatedHa: number,
  filtrationCapacity: number
): number {
  const absorption = vegetatedHa * constants.TAUX_ABSORPTION * 100 + filtrationCapacity;
  const nextPollution = currentPollution + buildingEmissions - absorption;
  return Math.max(0, Math.round(nextPollution * 10) / 10);
}

/** F-18 — Débit d'un réseau utilitaire */
export function calculateUtilityThroughput(
  sourceThroughput: number,
  lossRatePer10Km: number,
  lengthKm: number,
  criticalDemand: number
): { usefulThroughput: number; isOnline: boolean } {
  const useful = sourceThroughput * (1 - (lossRatePer10Km * lengthKm) / 10);
  const isOnline = useful >= criticalDemand;
  return {
    usefulThroughput: Math.max(0, Math.round(useful * 10) / 10),
    isOnline
  };
}

/** F-19 — Points de recherche */
export function calculateResearchPoints(
  buildingRdSum: number,
  scienceSkill: number,
  t3Pop: number
): number {
  const fSpecialistes = Math.min(1.5, Math.max(0.2, t3Pop / constants.SPECIALISTES_REQUIS));
  const total = buildingRdSum * (1 + 0.004 * scienceSkill) * fSpecialistes;
  return Math.round(total);
}

/** F-20 — Trésorerie publique */
export function calculateTreasuryDelta(
  popActive: number,
  avgIncome: number,
  taxRatePct: number,
  crimePct: number,
  marketTaxes: number,
  netExports: number,
  maintenanceCosts: number,
  publicSalaries: number,
  constructionCosts: number
): { deltaTreasury: number; taxRevenue: number; evasionPct: number } {
  const taxPressure = taxRatePct;
  const evasionPct = Math.min(0.8, 0.004 * crimePct + 0.006 * taxPressure);
  const taxRevenue = popActive * avgIncome * (taxRatePct / 100) * (1 - evasionPct);
  const totalIn = taxRevenue + marketTaxes + netExports;
  const totalOut = maintenanceCosts + publicSalaries + constructionCosts;
  return {
    deltaTreasury: Math.round(totalIn - totalOut),
    taxRevenue: Math.round(taxRevenue),
    evasionPct: Math.round(evasionPct * 1000) / 10
  };
}

/** F-21 — Résolution D20 */
export function resolveD20(
  d20Natural: number,
  pertinentSkill: number,
  mSector: number,
  mArchetype: number,
  mEquipment: number,
  mOverAllocation: number,
  difficultyClass: number
): {
  total: number;
  degree: "CRITICAL_FAIL" | "FAIL" | "MARGINAL_SUCCESS" | "SUCCESS" | "CRITICAL_SUCCESS";
  isCriticalSuccess: boolean;
  isCriticalFail: boolean;
} {
  const skillMod = Math.floor(pertinentSkill / 10);
  const total = d20Natural + skillMod + mSector + mArchetype + mEquipment + mOverAllocation;

  if (d20Natural === 1) {
    return { total, degree: "CRITICAL_FAIL", isCriticalSuccess: false, isCriticalFail: true };
  }
  if (d20Natural === 20 || total >= difficultyClass + 10) {
    return { total, degree: "CRITICAL_SUCCESS", isCriticalSuccess: true, isCriticalFail: false };
  }
  if (total >= difficultyClass + 5) {
    return { total, degree: "SUCCESS", isCriticalSuccess: false, isCriticalFail: false };
  }
  if (total >= difficultyClass) {
    return { total, degree: "MARGINAL_SUCCESS", isCriticalSuccess: false, isCriticalFail: false };
  }
  return { total, degree: "FAIL", isCriticalSuccess: false, isCriticalFail: false };
}

/** F-22 — Sur-allocation trimonétaire */
export function calculateOverAllocationModifier(amountEngaged: number): number {
  if (amountEngaged <= 0) return 0;
  const mod = Math.floor(Math.log10(1 + amountEngaged / constants.COUT_PAR_POINT));
  return Math.min(5, Math.max(0, mod));
}

/** F-23 — Santé et stress du Leader */
export function calculateLeaderVitals(
  currentHealth: number,
  currentStress: number,
  dietEffects: { health: number; stress: number },
  activityEffects: { health: number; stress: number },
  equipmentEffects: { health: number; stress: number },
  ageYears: number,
  gravityG: number,
  hasLongevitySerum: boolean,
  crisisLoad: number,
  factionPressure: number,
  residenceComfort: number
): { nextHealth: number; nextStress: number; deltaHealth: number; deltaStress: number } {
  const agingBase = constants.BASE_AGE * (1 + 0.15 * Math.max(0, gravityG - 1));
  const aging = hasLongevitySerum ? agingBase * 0.65 : agingBase;

  const deltaHealth =
    dietEffects.health +
    activityEffects.health +
    equipmentEffects.health -
    aging -
    crisisLoad * 1.5;

  const deltaStress =
    crisisLoad * 4.0 +
    factionPressure * 2.0 -
    activityEffects.stress -
    residenceComfort;

  const nextHealth = Math.min(100, Math.max(0, Math.round(currentHealth + deltaHealth)));
  const nextStress = Math.min(100, Math.max(0, Math.round(currentStress + deltaStress)));

  return { nextHealth, nextStress, deltaHealth: Math.round(deltaHealth), deltaStress: Math.round(deltaStress) };
}

/** F-24 — Probabilité de décès du Leader */
export function calculateLeaderDeathProbability(
  ageYears: number,
  healthPct: number,
  stressPct: number,
  hasMedicalProtection: boolean
): number {
  const baseProb = ageYears < 50 ? 0.001 : (ageYears - 49) * 0.008;
  const prob =
    baseProb *
    (1 - healthPct / 100) *
    (1 + 0.4 * (stressPct / 100)) *
    (hasMedicalProtection ? 0.4 : 1.0);
  return Math.min(0.95, Math.max(0, prob));
}
