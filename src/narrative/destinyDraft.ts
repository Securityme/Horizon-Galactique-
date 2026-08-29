import { DestinyCard } from "../types/payloads";
import { DeterministicDice } from "./mulberry32";

export const DESTINY_DECK: DestinyCard[] = [
  { id: "DST-01", label: "Brèche dans le réacteur auxiliaire", bookId: "LIV-01", sectorModifier: "RD-A +15%", flavor: "Une fluctuation du flux neutronique menace les banques de données du centre expérimental." },
  { id: "DST-02", label: "Percée algorithmique sur l'ISRU", bookId: "LIV-01", sectorModifier: "RD +25 pts", flavor: "Les subroutines d'automatisation ont isolé un modèle de fracturation optimisé." },
  { id: "DST-03", label: "Effondrement d'un filon basaltique", bookId: "LIV-02", sectorModifier: "ISRU -20 t", flavor: "Un mouvement de plaques comprime les galeries sud et suspend l'extraction de métaux rares." },
  { id: "DST-04", label: "Poche de volatils sous haute pression", bookId: "LIV-02", sectorModifier: "ISRU +50 t", flavor: "Les trépans ont percé une caverne magmatique saturée en argon et dioxyde de carbone." },
  { id: "DST-05", label: "Mouvement de contestation des conscrits", bookId: "LIV-03", sectorModifier: "Sécurité -10%", flavor: "Les miliciens réclament un renouvellement d'équipement et un réajustement des soldes." },
  { id: "DST-06", label: "Infiltration d'un espion corporatiste", bookId: "LIV-03", sectorModifier: "Milice +10", flavor: "La garnison intercepte des paquets de données chiffrés dirigés vers une frégate en orbite." },
  { id: "DST-07", label: "Ultimatum douanier du Consortium", bookId: "LIV-04", sectorModifier: "Légitimité -5", flavor: "Les délégués de la Terre exigent la ratification immédiate du nouveau traité d'exploitation." },
  { id: "DST-08", label: "Pacte de non-ingérence régionale", bookId: "LIV-04", sectorModifier: "Pôles P4 +8", flavor: "Les factions locales signent un armistice temporaire sous l'égide de la dynastie." },
  { id: "DST-09", label: "Fenêtre de tir orbitale d'urgence", bookId: "LIV-05", sectorModifier: "Immigration +40", flavor: "Un cargo lourd en perdition demande l'autorisation d'atterrissage forcé sur le spatioport." },
  { id: "DST-10", label: "Retard critique du convoi de fret", bookId: "LIV-05", sectorModifier: "Fret T3 reporté", flavor: "Une éruption coronale dévie la trajectoire des conteneurs de pièces usinées." },
  { id: "DST-11", label: "Volatilité des cours du marché noir", bookId: "LIV-06", sectorModifier: "Marché +15%", flavor: "Le cartel marchand fait monter les enchères sur les rations synthétiques de contrebande." },
  { id: "DST-12", label: "Détournement d'avoirs au terminal commercial", bookId: "LIV-06", sectorModifier: "Corruption +1", flavor: "Des courtiers indépendants tentent de court-circuiter le registre fiscal colonial." },
  { id: "DST-13", label: "Surcharge du dôme résidentiel principal", bookId: "LIV-07", sectorModifier: "Bonheur -6", flavor: "La densité démographique excède le seuil de confort des coursives pressurisées." },
  { id: "DST-14", label: "Inauguration d'un nouveau parc biosphérique", bookId: "LIV-07", sectorModifier: "Bonheur +8", flavor: "Les colons célèbrent l'extension de la verrière végétale avec vue sur le désert." },
  { id: "DST-15", label: "Mutation foudroyante des cultures d'algues", bookId: "LIV-08", sectorModifier: "Bio +20%", flavor: "Les bioréacteurs développent une souche enrichie en acides aminés à haut rendement." },
  { id: "DST-16", label: "Rejet immunitaire massif de cohortes T1", bookId: "LIV-08", sectorModifier: "Santé -5%", flavor: "Les nouveaux filtres pulmonaires provoquent des réactions inflammatoires sévères." },
  { id: "DST-17", label: "Tempête atmosphérique globale", bookId: "LIV-09", sectorModifier: "Pression +0.005", flavor: "Les pompes de géo-ingénierie injectent un volume record de gaz réchauffant." },
  { id: "DST-18", label: "Éclaircie du manteau nuageux", bookId: "LIV-09", sectorModifier: "Oxygène +0.1%", flavor: "La photosynthèse s'accélère sous l'effet des miroirs orbitaux déployés au nadir." },
  { id: "DST-19", label: "Révélation d'un complot au conseil exécutif", bookId: "LIV-10", sectorModifier: "Prestige +10", flavor: "Le Leader déjoue une tentative de chantage politique orchestrée par un adjoint félon." },
  { id: "DST-20", label: "Commémoration du serment de fondation", bookId: "LIV-10", sectorModifier: "Légitimité +12", flavor: "L'assemblée coloniale renouvelle solennellement sa confiance envers la dynastie dirigeante." }
];

export function drawDestinyCards(dice: DeterministicDice, count = 3): DestinyCard[] {
  const deck = dice.shuffle(DESTINY_DECK);
  return deck.slice(0, count);
}
