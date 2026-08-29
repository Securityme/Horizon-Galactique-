import { NarrativeContext } from "../types/payloads";
import { TurnNarrative, CycleReport } from "../lib/contracts";

const BOOK_TITLES: Record<string, string[]> = {
  "LIV-01": [
    "Anomalie dans l'arbre d'automatisation",
    "Optimisation des protocoles d'IA de forage",
    "Surcadencement des serveurs de calcul quantique",
    "Dérive des subroutines cognitives"
  ],
  "LIV-02": [
    "Rapport des puits profonds ISRU",
    "Effervescence au complexe de raffinage",
    "Gestion des stocks haute pression",
    "Découverte d'un gisement météoritique"
  ],
  "LIV-03": [
    "Inspection des bataillons de garnison",
    "Maintien de l'ordre dans les sous-niveaux",
    "Déploiement du rideau de défense",
    "Exercice tactique anti-incursion"
  ],
  "LIV-04": [
    "Séance extraordinaire du conseil de souveraineté",
    "Pression diplomatique des factions",
    "Délibération sur la charte coloniale",
    "Émissaire extraordinaire en audience"
  ],
  "LIV-05": [
    "Alignement des fenêtres de tir orbitales",
    "Arrivée d'un convoi de fret longue portée",
    "Régulation du flux migratoire au spatioport",
    "Trafic et autorisations de descente"
  ],
  "LIV-06": [
    "Arbitrages fiscaux et transactions privées",
    "Fluctuations de l'indice marchand",
    "Audit des comptoirs et du marché noir",
    "Spéculation sur les concessions de dôme"
  ],
  "LIV-07": [
    "Plan d'aménagement des îlots viabilisés",
    "Extension de la surface respirable",
    "Régulation de la densité d'habitat",
    "Maintenance des épurateurs d'air urbains"
  ],
  "LIV-08": [
    "Bilan de santé des cohortes et mutagenèse",
    "Rendement des bioréacteurs à protéines",
    "Compatibilité des bio-implants de soutien",
    "Veille épidémiologique en milieu clos"
  ],
  "LIV-09": [
    "Mesure du gradient de terraformation",
    "Injection d'aérosols et régulation thermique",
    "Évolution de la pression partielle d'oxygène",
    "Observation des fronts météorologiques"
  ],
  "LIV-10": [
    "Chronique de la dynastie dirigeante",
    "Décret d'urgence au Grand Livre",
    "Rapport de légitimité et santé du Leader",
    "Moment solennel pour l'archologie"
  ]
};

export function generateFallbackTurnNarrative(ctx: NarrativeContext): TurnNarrative {
  const bookId = ctx.activeBook as TurnNarrative["bookId"];
  const titles = BOOK_TITLES[bookId] || BOOK_TITLES["LIV-10"];
  const title = titles[ctx.variantIndex % titles.length] || `Chronique du ${bookId}`;

  const degreeText = ctx.rollOutcome.degree === "CRITICAL_SUCCESS"
    ? "Une issue exceptionnelle a été arrachée grâce à une maîtrise sans faille des équipes sur le terrain."
    : ctx.rollOutcome.degree === "SUCCESS"
    ? "L'opération a atteint ses objectifs nominaux sans compromettre l'équilibre général."
    : ctx.rollOutcome.degree === "MARGINAL_SUCCESS"
    ? "Le résultat est mitigé : un compromis coûteux a dû être consenti pour stabiliser la situation."
    : ctx.rollOutcome.degree === "FAIL"
    ? "Des complications techniques et politiques entravent la résolution normale de l'incident."
    : "Un revers critique majeur secoue les fondations de l'administration coloniale.";

  const body = `Dans le cadre de l'Ère ${ctx.era} (Tour ${ctx.turnIndex}, calendrier : ${ctx.colonyDate}), le secteur ${bookId} a été mobilisé suite à l'événement « ${ctx.destinyCard.label} ». ${ctx.destinyCard.flavor}
Les capteurs indiquent une population de ${ctx.state.popTotal.toLocaleString()} âmes, une énergie nette de ${ctx.state.netEnergyMW} MW et un indice de terraformation de ${ctx.state.terraformPct}%. 
Lors de la résolution tactique, le jet de D20 a produit un résultat naturel de ${ctx.rollOutcome.natural} (Total ajusté : ${ctx.rollOutcome.total} contre une difficulté de ${ctx.rollOutcome.dc}). ${degreeText}
Le conseil colonial attend vos directives exécutives pour sceller le protocole.`;

  const options = ctx.precomputedEffects.map((eff, index) => {
    const riskHint: "LOW" | "MEDIUM" | "HIGH" = index === 0 ? "LOW" : index === 1 ? "MEDIUM" : "HIGH";
    return {
      effectId: eff.id,
      label: eff.label || `Option tactique ${eff.id}`,
      body: eff.bodyPreview || `Appliquer les directives de l'option ${eff.id} sur les registres sectoriels.`,
      riskHint
    };
  });

  const rebounds: TurnNarrative["rebounds"] = [];
  if (ctx.rollOutcome.natural >= 17 && bookId !== "LIV-04") {
    rebounds.push({
      bookId: "LIV-04",
      body: "La Gazette de Souveraineté consigne l'impact politique immédiat de cette décision sur les factions."
    });
  }

  const canonCandidate = ctx.rollOutcome.degree === "CRITICAL_SUCCESS" || ctx.rollOutcome.degree === "CRITICAL_FAIL"
    ? `Tour ${ctx.turnIndex} : ${ctx.destinyCard.label} résolu avec ${ctx.rollOutcome.degree}`
    : null;

  return {
    bookId,
    title,
    body,
    options,
    rebounds,
    canonCandidate
  };
}

export function generateFallbackCycleReport(turnIndex: number, era: string, date: string): CycleReport {
  return {
    title: `Bilan du Cycle ${Math.floor(turnIndex / 10)} — ${date}`,
    cycleSummary: `Le cycle décennal d'archologie s'achève pour l'Ère ${era}. Les dix derniers tours de gouvernance ont consolidé les infrastructures critiques, canalisé les flux migratoires et éprouvé la résilience des chaînes ISRU. Les factions réévaluent leur allégeance envers le Leader tandis que les ingénieurs préparent la prochaine phase d'expansion.`,
    structuralDilemma: {
      dilemmaTitle: "Arbitrage structurel de nouveau cycle",
      description: "Le conseil doit choisir entre une accélération agressive de l'automatisation industrielle ou un investissement prioritaire dans le bien-être et la bio-sécurité des colons.",
      choiceA: {
        label: "Pacte d'accélération technocratique",
        outcome: "Débloque un surcroît de points R&D et d'extraction minérale, mais impose une contrainte accrue sur le stress et la liberté des citoyens.",
        impactSummary: "R&D +20%, ISRU +15%, Bonheur -8%"
      },
      choiceB: {
        label: "Charte de préservation civique et biosphérique",
        outcome: "Rehausse immédiatement la cohésion sociale et la régénération de santé des cohortes, au détriment du rythme de production lourde.",
        impactSummary: "Bonheur +12%, Santé +10%, Coûts publics +10%"
      }
    },
    eraTransitionVerdict: "Les métriques de viabilité et d'infrastructure satisfont les seuils d'évolution."
  };
}
