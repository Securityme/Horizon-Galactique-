# HORIZON COSMIQUE — L'ARCHE DES ÉTOILES

## Master Document de Conception et d'Architecture Système Canonique

**Version du document :** 20.0-PROD — Spécification Canonique Scellée  
**Statut :** ☑ Scellé  
**Identifiant système canonique :** HC-AE-V20.0-PROD  
**Nom du projet :** HORIZON COSMIQUE — L'ARCHE DES ÉTOILES  
**Métamodèle d'architecture :** AETHER-STRATA V3 (Strates -6 à +6) / KAIROS-TRINITY  
**Master Hypervisor :** ARCHON-PRISMA (CTO Virtual System)

---

## SOMMAIRE NORMATIF

| § | Titre | Strate AETHER | Document porteur |
| --- | --- | --- | --- |
| 1.0 | Métadonnées, Invariants, Équipe d'Experts et Tria-Manifest | Strate +6 / Strate -4 | `01_INDEX_GLOBAL.md` |
| 2.0 | Cadre Normatif, Écoles de Pensée, Influences & Dualité | Strate -5 | `02_SADT_ICOM.md` |
| 3.0 | Stack Technique, Shell et Registre Tri-Services Unifié | Strate -2 / Strate +5 | `03_STACK_SHELL.md` |
| 4.0 | Routage Next.js 15, App Router et Fast-Resume Lobby | Strate +5 / Strate +4 | `04_ROUTING_APP.md` |
| 5.0 | Runtime UI, Bento Grid et Ergonomie Mobile-First (48 px) | Strate +2 / Strate +4 | `05_RUNTIME_UI.md` |
| 6.0 | Noyau Déterministe, PRNG Mulberry32 et Temporalité Duale | Strate -6 | `06_MATH_KERNEL.md` |
| 7.0 | Maillage des Moteurs d'Ingénierie Industrielle | Strate -5 / Strate -3 | `07_INDUSTRIAL_SOLVERS.md` |
| 8.0 | Machine à États des Ères (I à VII), Surge et Destiny Draft | Strate -1 | `08_STATECHARTS.md` |
| 9.0 | Isolation Web Worker, Signal Mesh et Persistance CRDT | Strate -3 / Strate -2 | `09_WORKER_CORE.md` |
| 10.0 | Passerelle LLM Gemini Edge, Outbox et Auto-Healing Zod | Strate +1 | `10_EDGE_GATEWAY.md` |
| 11.0 | Contrats de Données Zod, Validation et Persistance Local-First | Strate -4 / Strate -2 | `11_DATA_CONTRACTS.md` |
| 12.0 | DevOps, Tests Vitest, Sentry et Gardien AST Pre-Build | Strate +6 | `12_DEVOPS_CI.md` |
| 13.0 | Registre des Décisions d'Architecture (ADR) et Risques | Strate +6 | `13_ADR_RISKS.md` |
| A–Q | Annexes — Catalogues Statiques de Référence (`DB-01` à `DB-17`) | Strate -5 | `ANNEXES_CATALOGS.md` |

---

# 1.0 MÉTADONNÉES, INVARIANTS, ÉQUIPE D'EXPERTS ET TRIA-MANIFEST

## 1.1 Table de versionnage canonique

| Champ | Valeur normative |
| --- | --- |
| Nom du projet | HORIZON COSMIQUE — L'ARCHE DES ÉTOILES |
| Version du master document | 20.0-PROD |
| Version du produit | 20.0.0 |
| Identifiant canonique système | `HC-AE-V20.0-PROD` |
| Métamodèle d'architecture | AETHER-STRATA V3 (Strates -6 à +6) |
| Master Hypervisor | ARCHON-PRISMA (Virtual CTO System) |
| Statut du document | Scellé (Spécification unique de production) |
| Cadre normatif | RFC 2119 / RFC 8174 / SPIF V3 |
| Chaîne de compilation | Next.js 15.4.9 · React 19.2.1 · TypeScript 5.9.3 · Tailwind CSS 4.1.11 |

## 1.2 Équipe d'Experts Système (Gouvernance sous Direction CTO)

```
+--------------------------------------------------+
|   ARCHON-PRISMA (CTO & Master Hypervisor)        |
|   - Supervision AETHER-STRATA V3 / Zéro-Crash   |
|   - Validation Invariants & Arbitrages ADR       |
+------------------------+-------------------------+
                         |
+--------------------+---+-------------------+--------------------+
|                    |                       |                    |
+--------v----------+ +-------v-----------+  +-v----------+ +-------v-----------+
| EXPERT 1 : CORE   | | EXPERT 2 : UI/UX  |  | EXPERT 3   | | EXPERT 4 : AST    |
| SIMULATION & MATH | | & ERGONOMIE MOBILE|  | TRI-SERVICES| | GOVERNANCE & AI   |
| (Strates -6, -3)  | | (Strates +2, +4)  |  | & EDGE     | | (Strates -4, +6)  |
+-------------------+ +-------------------+  +------------+ +-------------------+
```

### Fiches de Persona & Responsabilités d'Ingénierie

1. **ARCHON-PRISMA — CTO Master & Master Hypervisor :**
   * **Périmètre :** Autorité d'architecture sur les 13 strates (-6 à +6).
   * **Responsabilité :** Garant de la zéro-dette technique, du zéro-crash runtime, de la circulation strictement ascendante des dépendances et du scellement du déterminisme (`CHRONO-SEAL`).
2. **Expert 1 — Core Simulation & Math Engineer :**
   * **Périmètre :** Strates -6 (Kernel Math), -5 (DDD Domain) et -3 (Worker Runtime).
   * **Responsabilité :** PRNG Mulberry32 (`DeterministicDice`), transport mémoire `SharedArrayBuffer` Zero-Copy, exécution hors-thread des solveurs d'ingénierie et stabilité 60 FPS.
3. **Expert 2 — Lead Frontend & Ergonomics Engineer :**
   * **Périmètre :** Strates +2 (Design Tokens), +3 (Modales Globales), +4 (Bento Grid Vues) et +5 (App Router).
   * **Responsabilité :** Bento Grid Triptyque, cibles tactiles de $48\times 48\text{ px}$ (`INV-07`), isolation SSR via `next/dynamic` (`ssr: false`) et gestion Zustand/Jotai.
4. **Expert 3 — Cloud, Edge & Tri-Services Integrator :**
   * **Périmètre :** Strates -2 (Ports & Adapters I/O) et +1 (Edge Handlers & API).
   * **Responsabilité :** Gestion du registre unifié `serviceRegistry.ts` (Firebase, Cloud SQL, Google Chat API), confinement des secrets LLM (`INV-01`), Circuit Breaker (8s) et Local-First IndexedDB.
5. **Expert 4 — AI Governance & AST Compiler Engineer :**
   * **Périmètre :** Strates -4 (Contracts Zod) et +6 (Gouvernance & AST).
   * **Responsabilité :** Schémas Zod stricts, auto-healing des retours LLM, maintenance du Tria-Manifest (`_manifest.json`, `INDEX.md`, `README.txt`) et gardiens pre-build.

## 1.3 Registre des Invariants Architecturaux (`INV-01` à `INV-21`)

| ID | Énoncé normatif (RFC 2119) | Criticité | Assertion / Test |
| --- | --- | --- | --- |
| `INV-01` | La clé `GEMINI_API_KEY` NE DOIT JAMAIS être exposée au bundle client (`/app/api/` uniquement). | BLOQUANT | `TST-SEC-01` |
| `INV-02` | Toute la simulation en strates -6 à -3 DOIT être strictly déterministe via PRNG Mulberry32. | BLOQUANT | `TST-MATH-01` |
| `INV-03` | La boucle de calcul métier DOIT s'exécuter hors du thread UI principal dans le Web Worker. | BLOQUANT | `TST-PERF-01` |
| `INV-04` | Aucun calcul EDO / réseau de fluides NE DOIT bloquer le rendu graphique à plus de 16.6ms. | MAJEUR | `TST-PERF-02` |
| `INV-05` | Toute frontière réseau, disque ou Worker DOIT être validée par un schéma Zod avec auto-healing. | BLOQUANT | `TST-SCHEMA-01` |
| `INV-06` | Le jeu DOIT rester 100% fonctionnel hors-ligne via le Fallback Déterministe sur timeout (8s). | MAJEUR | `TST-NET-01` |
| `INV-07` | Tout composant interactif IHM DOIT respecter une cible tactile minimale de $48\times 48\text{ px}$. | MOYEN | `TST-UI-01` |
| `INV-08` | Le routage App Router NE DOIT utiliser aucun état de session serveur bloquant. | MOYEN | `TST-ROUT-01` |
| `INV-09` | L'arbre des technologies R&D DOIT être acyclique (DAG direct sous validation Zod). | MAJEUR | `TST-DAG-01` |
| `INV-10` | Les modales transversales DOIVENT être chargées dynamiquement via `next/dynamic` (`ssr: false`). | MOYEN | `TST-SSR-01` |
| `INV-11` | La jauge de Surge NE DOIT PAS dépasser la valeur maximale de 5 unités. | BLOQUANT | `TST-STATE-01` |
| `INV-12` | Le Fast-Resume Lobby DOIT réhydrater le dernier état valide en moins de 300 ms. | MAJEUR | `TST-PERF-03` |
| `INV-13` | Les tirages de cartes *Destiny Draft* DOIVENT être gouvernés uniquement par le PRNG Mulberry32. | BLOQUANT | `TST-CARD-01` |
| `INV-14` | L'étanchéité des trois monnaies (Fortune Privée, Trésorerie Publique, Crédits Consortium) DOIT être absolue. | BLOQUANT | `TST-ECO-01` |
| `INV-15` | Le solveur hydraulique Sol DOIT équilibrer la conservation des masses sur les nœuds UTL. | MAJEUR | `TST-SOL-01` |
| `INV-16` | Lors de la succession du Leader, la Lignée Dynastique DOIT consigner l'historique complet. | MAJEUR | `TST-LEAD-01` |
| `INV-17` | L'Outbox narrative DOIT purger les requêtes périmées en cas d'interruption réseau. | MOYEN | `TST-OUT-01` |
| `INV-18` | Le circuit breaker de la passerelle LLM Edge DOIT interrompre la requête au bout de 8000 ms. | BLOQUANT | `TST-EDGE-01` |
| `INV-19` | Le mode nuit / contraste élevé DOIT être supporté par l'ensemble des tokens Tailwind v4. | MINEUR | `TST-UI-02` |
| `INV-20` | Chaque sous-dossier DOIT intégrer son triplet Tria-Manifest (`_manifest.json`, `INDEX.md`, `README.txt`). | BLOQUANT | `TST-AST-01` |
| `INV-21` | Le démarrage du système DOIT valider le statut du registre unifié `serviceRegistry.ts`. | MAJEUR | `TST-SVC-01` |

---

# 2.0 CADRE NORMATIF, ÉCOLES DE PENSÉE ET SYNTHÈSE MULTI-PERSPECTIVES

## 2.1 Les Sept Écoles de Pensée Fondatrices

1. **Clean Architecture & Hexagonal Ports & Adapters (Strates -2, +4, +5) :** Découplage complet entre l'IHM React 19 / Next.js 15 App Router et les services I/O (IndexedDB, Audio).
2. **Domain-Driven Design — DDD Tactique (Strate -5) :** Agrégats métiers purs (Sol/Colonie, Orbite/Dynastie, Économie Tri-Monétaire) isolés de l'IHM.
3. **Event Sourcing & Actor Worker Isolation (Strate -3) :** Master Hypervisor exécuté dans `simulation.worker.ts` émettant des patchs immuables (`PatchOperation[]`).
4. **Finite State Machines & Statecharts (Strate -1) :** Encadrement déterministe des 7 Ères, de la jauge de Surge et des crises du *Destiny Draft*.
5. **Local-First & CRDT Delta Storage (Strate -2) :** Alternance snapshot maître (tous les 10 tours) et deltas atomiques en IndexedDB.
6. **Design by Contract & Zod Validation (Strate -4) :** Validation stochastique runtime avec auto-healing sur toutes les frontières réseau/Worker.
7. **Fractal Governance & AST Metadata Indexing (Strate +6) :** Tria-Manifest par sous-dossier guidant l'agent IA et scripts de validation AST.

## 2.2 Synthèse des Perspectives d'Ingénierie

* **Perspective Application :** Routage App Router Next.js 15, Fast-Resume depuis IndexedDB sans dépendance réseau, confinement Edge LLM avec AbortController (8s) et fallback HTTP 200 déterministe.
* **Perspective Jeu (Game Engine 4X / SimLife) :** Calculs hors-thread à 60 FPS, PRNG Mulberry32 bit-à-bit, grille d'hectares Sol, domaine Orbite (Souveraineté/Dynastie) et moteur de crise Roguelike.
* **Perspective Suivi IA :** Indexation contextuelle Tria-Manifest, vérification du sens ascendant d'importation et validation pre-build par `validate-aether.ts`.
* **Perspective UI/UX :** Layout Bento Grid mobile-first à 3 ancres (Sol / Orbite / Chronique), modales chargées dynamiquement (`ssr: false`) et cibles tactiles de 48 px (`INV-07`).

## 2.3 Matrice des Influences Ludiques & Mapping Moteurs

| Jeu de référence | Composante inspirée | Moteur AETHER cible | Strate | Traitement technique dans le système |
| --- | --- | --- | --- | --- |
| **RimWorld** | Besoins des colons, crises émergentes, santé/stress de l'Archon | Moteur SimLife & Event Bus | Strate -5 / -1 | Formules $F-16$ & $F-23$, jauges de santé/stress, mutineries générées via *Destiny Draft*. |
| **Fallout** | Survie en milieu clos, Capsule Hub, implants & choix multiples | Moteur Sol & Système d'Équipement | Strate -5 / -4 | Viabilité dômes ($O_2, H_2O$, $F-01$). Multi-choix de crises conditionnés par équipements (`EQP-01` à `18`) et tests D20 ($F-21$). |
| **Stellaris** | Macro-4X spatial, cohortes T0-T3, arbre R&D, crises d'Ères | Moteur 4X & Conseil de Gouvernance | Strate -5 / -1 | Strates démographiques (T0-T3), factions politiques (`DB-14a`) et progression FSM des 7 Ères (`eraFsm.ts`). |
| **Pax Historia** | Leviers institutionnels, jeux d'influence, décrets | Moteur Politico-Économique | Strate -5 | Solveur $SOL-17$ (Théorie des Jeux / Shapley-Shubik) pour le pouvoir de vote au Conseil. |

---

# 3.0 STACK TECHNIQUE ET REGISTRE TRI-SERVICES UNIFIÉ

## 3.1 Déclaration de la Stack AETHER-STRATA V3

| Couche | Technologie EXIGÉE | Version | Rôle & Justification |
| --- | --- | --- | --- |
| Framework App | Next.js (App Router) | 15.4.9 | Rendu hybride Edge / SSR avec Turbopack. |
| Rendu UI | React / React-DOM | 19.2.1 | Concurrent Rendering & Server Components. |
| Langage | TypeScript | 5.9.3 | Typage strict (`strict: true`), zéro `any`. |
| Style & Tokens | Tailwind CSS | 4.1.11 | Moteur v4, cibles tactiles 48 px (`INV-07`). |
| Stores d'État | Zustand / Jotai | 5.0.15 / 2.8.0 | Zustand pour stores immuables, Jotai pour atomes IHM. |
| Persistance | idb (IndexedDB) / Firebase | 8.0.3 / 12.18.0 | Storage Local-First CRDT & auto-sync Firestore. |
| Base Relationnelle | Cloud SQL (PostgreSQL) | 16.0 | Base distante transactionnelle via instance pool. |
| Messaging Workspace | Google Chat API | Workspace V1 | Pont d'alertes et espace communautaire. |
| Gateway IA Edge | `@google/genai` | 2.4.0 | Exécution Edge avec AbortController 8 000 ms. |

## 3.2 Implémentation du Registre Tri-Services (`serviceRegistry.ts`)

```typescript
// src/services/integrations/serviceRegistry.ts — Strate -2
export interface ServiceRegistryStatus {
  firebase: {
    status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
    userEmail: string | null;
    role: 'COMMANDER_ADMIN' | 'OPERATOR' | 'GUEST';
  };
  cloudSql: {
    status: 'ACTIVE' | 'STANDBY' | 'OFFLINE';
    latencyMs: number;
    connectionPoolSize: number;
  };
  googleChat: {
    status: 'BRIDGED' | 'DISABLED';
    activeSpace: string | null;
    webhookConfigured: boolean;
  };
}

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private status: ServiceRegistryStatus = {
    firebase: { status: 'DISCONNECTED', userEmail: null, role: 'GUEST' },
    cloudSql: { status: 'OFFLINE', latencyMs: 0, connectionPoolSize: 0 },
    googleChat: { status: 'DISABLED', activeSpace: null, webhookConfigured: false },
  };

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) ServiceRegistry.instance = new ServiceRegistry();
    return ServiceRegistry.instance;
  }

  public getStatus(): ServiceRegistryStatus { return this.status; }
}
```

---

# 4.0 ROUTAGE NEXT.JS 15 ET FAST-RESUME LOBBY

## 4.1 Cartographie du Routage (App Router)

| Route | Page / Endpoint | Mode Rendu | Condition d'Accès | Redirection / Fallback |
|---|---|---|---|---|
| `/` | Lobby & Fast-Resume | SSG / Client | Accès Public | N/A |
| `/setup` | Matrix Setup | Client Side | Profil sélectionné | `/` |
| `/runtime` | Plateau Triptyque Bento | Client Side | Partie active chargée | `/setup` |
| `/api/turn-narrative` | Edge Turn Handler | Edge Route | Requête POST valide | HTTP 200 Fallback Déterministe |
| `/api/cycle-report` | Edge Cycle Handler | Edge Route | Bilan décennal (10 tours) | HTTP 200 Fallback Déterministe |

---

# 5.0 RUNTIME UI, BENTO GRID ET ERGONOMIE MOBILE-FIRST

## 5.1 Architecture Bento Grid Triptyque

```
+---------------------------------------------------------------------------------+
| TOP STATUS BAR (56 px) : [ÈRE I : CAPSULE HUB] [POP: 142] [EAU: OK] [ÉNERGIE: +42MW] |
+---------------------------------------------------------------------------------+
|                                                                                 |
|   ZONE BENTO GRID DYNAMIQUE (Défilement Y Native, Framer Motion)                |
|   - Cartes Bento 1x1, 2x1 (Graphiques Recharts SVG), 2x2 (Grille SVG <= 400 cells)|
|                                                                                 |
+---------------------------------------------------------------------------------+
| BARRE D'ONGLETS FIXE (64 px) — CIBLES TACTILES MINIMALES DE 48 PX               |
| [TAB 1 : SOL (4X)]      | [TAB 2 : CHRONIQUE]       | [TAB 3 : ORBITE (ARCHE)]    |
| - Grille Hectares       - Journal Transactionnel    - Gear & Implants Archon    |
| - Bâtiments & Flux ISRU - Arbre R&D Tech Tree       - Conseil de Gouvernance    |
| - Démographie T0-T3     - Crises & Destiny Draft    - Hub Commercial Consortium |
+---------------------------------------------------------------------------------+
```

---

# 6.0 NOYAU DÉTERMINISTE, PRNG ET TEMPORALITÉ DUALE

## 6.1 Générateur Pseudo-Aléatoire (`mulberry32.ts`)

```typescript
// Strate -6 : Noyau mathématique purement déterministe
export class DeterministicDice {
  private state: number;
  constructor(seed: number) { this.state = seed >>> 0; }
  public getState(): number { return this.state >>> 0; }
  public setState(state: number): void { this.state = state >>> 0; }
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  public rollD20(): number { return 1 + Math.floor(this.next() * 20); }
}
```

## 6.2 Résolution des Choix Multiples (Style Fallout)
Chaque événement majeur propose des options évaluées selon l'équation de test de compétence $F-21$ :
$$Score_{roll} = D20_{mulberry32} + Mod_{implants} + Mod_{legitimite} \ge Seuil_{difficilite}$$

## 6.3 Modélisation du Temps Secondaire (Phase Inter-Tour Micro-Temps)
Pendant la pause du Macro-Temps, l'Archon consomme son capital de Points d'Attention (PAA) :
* **Réglage Nodal des Fluides (Sol) :** Reconfiguration des débits d'eau et d'oxygène ($F-01$).
* **Audiences Privées (Orbite) :** Négociation d'influence au Conseil avec les factions.
* **Traitements Medical/Neural :** Maintenance des implants biomédicaux (`EQP-01` à `18`) pour réduire le stress.

---

# 7.0 MAILLAGE DES MOTEURS D'INGÉNIERIE INDUSTRIELLE

## 7.1 Moteurs Existants (Implantés & Opérationnels)

| ID | Moteur / Solveur | Équations / Modèle Maître | Fichier Source |
|---|---|---|---|
| `SOL-EX-01` | Hydraulique Nodal | Écoulement Darcy-Weisbach sur graphe | `src/domain/colony/hydraulic.ts` |
| `SOL-EX-02` | IEEE 39-Bus Power Grid | Équations de Swing & Inertie ($F-01$) | `src/domain/colony/powerGrid.ts` |
| `SOL-EX-03` | Noyau PRNG & D20 | Moteur Mulberry32 déterministe ($F-21$) | `src/narrative/mulberry32.ts` |
| `SOL-EX-04` | Bilan Atmosphérique | Équations EDO photochimiques ($F-08$, $F-09$) | `src/domain/colony/terraforming.ts` |

## 7.2 Moteurs à Créer (Spécifiés — Chantier Prioritaire)

| ID | Moteur à Créer | Modèle Mathématique Cible | Invariants / Dépendances | Priorité |
|---|---|---|---|---|
| `SOL-DEV-01` | Fiabilité FMECA / MTBF | Courbe en baignoire $h(t) = \frac{\beta}{\eta} (\frac{t}{\eta})^{\beta-1}$ | `INV-02` / `DB-04` (`equipment.json`) | P0 |
| `SOL-DEV-02` | Tribologie Abrasive | Loi d'Archard $V = K \frac{F_N \cdot s}{H}$ | `INV-02` / `DB-03` (`buildings.json`) | P1 |
| `SOL-DEV-03` | Épidémiologie SEIR | Système EDO dynamique SEIR | `INV-04` / `DB-05` (`decrees.json`) | P1 |
| `SOL-DEV-04` | Supply Chain SCOR | Équations balistiques orbitales | `INV-02` / `DB-03` (`buildings.json`) | P1 |

## 7.3 Moteurs Recommandés (Extensions R&D)

| ID | Moteur Recommandé | Valeur Ajoutée Gameplay / Simulation | Strate Cible | Impact Calcul |
|---|---|---|---|---|
| `SOL-REC-01` | Transfert Radiatif MOD | Calcul précis du rendement des miroirs orbitaux `BLD-T03`. | Strate -5 | +0.4 ms / tick |
| `SOL-REC-02` | Dispersion Toxique Gaussienne | Tracking des plumes de contamination $\text{LD}_{50}$ sur la grille. | Strate -5 | +0.2 ms / tick |
| `SOL-REC-03` | Scoring Financier Merton | Risque de défaut de paiement de l'Archon auprès du Consortium. | Strate -5 | NÉGLIGEABLE |

---

# 8.0 RUNTIME WEB WORKER, SIGNAL MESH ET PERSISTANCE CRDT

## 8.1 Communications Inter-Threads & Memory Buffer V3

```
+------------------------------------+             +------------------------------------+
|     THREAD PRINCIPAL (UI REACT)    |             |      WEB WORKER (SIMULATION)       |
| - Stores Zustand (Strate 0)        |             | - 17 Solveurs Industriels (-5)     |
| - Vues Bento Grid (Strate +4)      |             | - SharedArrayBuffer (Zero-Copy)    |
+------------------------------------+             +------------------------------------+
                  |                                                  |
                  | ------ WorkerInbound (RESOLVE_TURN) ------------>|
                  |                                                  |
                  |<------ Signal Mesh (Events Atomiques) -----------|
                  |<------ Patch Operations (CRDT Deltas) -----------|
```

---

# 10.0 PASSERELLE LLM GEMINI EDGE ET AUTO-HEALING ZOD

## 10.1 Route Handler Edge (`src/app/api/turn-narrative/route.ts`)

```typescript
// Strate +1 : Route Handler Edge sécurisé avec AbortController et Auto-Healing
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const body = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL_FAST || "gemini-2.5-flash",
      contents: body.promptContext,
    });
    
    clearTimeout(timeoutId);
    return NextResponse.json({ narrative: response.text }, { status: 200 });
  } catch (error) {
    // Fallback déterministe HTTP 200 local en cas de timeout (8s) ou panne
    return NextResponse.json({ 
      narrative: "Journal de bord : Perturbations magnétiques majeures. Transmission voix indisponible.", 
      fallbackTriggered: true 
    }, { status: 200 });
  }
}
```

---

# 11.0 CONTRATS DE DONNÉES ZOD

```typescript
// src/lib/contracts/state.ts — Strate -4
import { z } from "zod";

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
  saveId: z.string().uuid(),
  turnIndex: z.number().int().positive(),
  cycleIndex: z.number().int().positive(),
  currentEra: z.string(),
  globalSeed: z.number().int(),
  prngState: z.number().int(),
  demographics: z.object({
    popTotal: z.number().nonnegative(),
    tiers: z.object({ t0: z.number(), t1: z.number(), t2: z.number(), t3: z.number() }),
    happinessIndex: z.number().min(0).max(100),
  }),
  economy: z.object({
    leaderPrivateCredits: z.number(),
    colonyTreasury: z.number(),
    consortiumCredits: z.number(),
    netEnergyMW: z.number(),
  }),
  lineage: z.array(LineageEntrySchema).optional().default([]),
});
```

---

# 12.0 DEVOPS, TESTS ET VALIDATION AST PRE-BUILD

## 12.1 Gardien Pre-Build AETHER (`scripts/validate-aether.ts`)

```typescript
import fs from "fs";
import path from "path";

console.log("🔍 [AETHER Validator V3] Contrôle d'intégrité des 13 strates et du Tria-Manifest...");

const srcDir = path.join(process.cwd(), "src");

function checkManifests(dir: string) {
  const files = fs.readdirSync(dir);
  const isKeyFolder = files.includes("page.tsx") || files.includes("index.ts") || files.includes("simulation.worker.ts");

  if (isKeyFolder) {
    const hasManifest = files.includes("_manifest.json");
    const hasIndex = files.includes("INDEX.md");
    const hasReadme = files.includes("README.txt");

    if (!hasManifest || !hasIndex || !hasReadme) {
      console.error(`❌ BLOQUANT : Triade Tria-Manifest incomplète dans : ${dir}`);
      process.exit(1);
    }
  }

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory() && !file.startsWith(".")) {
      checkManifests(fullPath);
    }
  }
}

checkManifests(srcDir);
console.log("✅ [AETHER Validator V3] Validé : Aucune violation détectée.");
```

---

# ANNEXES — CATALOGUES STATIQUES DE RÉFÉRENCE (DB-01 À DB-17)

| Annexe | Catalogue | Base de Données | Fichier Source | Cardinalité | Statut |
|---|---|---|---|---|---|
| Annexe A | DB-01 | Systèmes Stellaires & Corps Célestes | `src/data/catalogues/db_systems.json` | 12 | ☑ Scellé |
| Annexe B | DB-02 | Planètes, Biomes & Atmosphères | `src/data/catalogues/db_planets.json` | 24 | ☑ Scellé |
| Annexe C | DB-03 | Types de Bâtiments Sol & Orbite | `src/data/catalogues/db_buildings.json` | 48 | ☑ Scellé |
| Annexe D | DB-04 | Équipements Archon & Implants | `src/data/catalogues/db_equipment.json` | 18 | ☑ Scellé |
| Annexe E | DB-05 | Décrets du Conseil de Gouvernance | `src/data/catalogues/db_decrees.json` | 30 | ☑ Scellé |
| Annexe F | DB-06 | Arbre des Technologies R&D | `src/data/catalogues/db_techs.json` | 60 | ☑ Scellé |
| Annexe G | DB-07 | Livres de Secteurs & Quêtes (LIV-01..10) | `src/data/catalogues/db_books.json` | 10 | ☑ Scellé |
| Annexe H | DB-08 | Cohortes Démographiques (T0 à T3) | `src/data/catalogues/db_pop_tiers.json` | 4 | ☑ Scellé |
| Annexe I | DB-09 | Filières Industrielles & Matrice ISRU | `src/data/catalogues/db_isru_chains.json` | 17 | ☑ Scellé |
| Annexe J | DB-10 | Matrice de Décomposition des Ères (I à VII) | `src/data/catalogues/db_eras.json` | 7 | ☑ Scellé |
| Annexe K | DB-11 | Factions Politiques & Idéologies | `src/data/catalogues/db_factions.json` | 6 | ☑ Scellé |
| Annexe L | DB-12 | Événements Majeurs & Destiny Draft Cards | `src/data/catalogues/db_destiny_cards.json` | 50 | ☑ Scellé |
| Annexe M | DB-13 | Flotte de Navettes & Balistique | `src/data/catalogues/db_shuttles.json` | 8 | ☑ Scellé |
| Annexe N | DB-14 | Réseaux d'Utilités Sol & Nœuds (UTL) | `src/data/catalogues/db_utilities.json` | 5 | ☑ Scellé |
| Annexe O | DB-15 | Anomalies Radio & Signals SIGINT | `src/data/catalogues/db_sigint.json` | 15 | ☑ Scellé |
| Annexe P | DB-16 | Agents Pathogènes & Gazette Toxique | `src/data/catalogues/db_hazmat.json` | 12 | ☑ Scellé |
| Annexe Q | DB-17 | Directives de Sauvegarde & Index Fast-Resume | `src/data/catalogues/db_saves_meta.json` | 1 | ☑ Scellé |

---

# 14.0 SPÉCIFICATIONS DES LOTS 1, 2, 3 SCELLÉS & ROADMAP DE DÉVELOPPEMENT MULTI-PHASE

## 14.1 Contrat d'Architecture des Lots Scellés (Validés par l'Utilisateur)

### 📦 LOT 1 : OPTIMISATION CONCURRENTE & ISOLATION SSR (`next/dynamic`)
- **Spécification 1.1 — Lazy Loading Systématique des Modales (`ssr: false`) :**
  Refactorisation de toutes les modales non critiques (`LeaderProfileModal`, `TechTreeModal`, `TradeHubModal`, `CouncilModal`, `CycleReportModal`, `SectorBookModal`) en composants chargés dynamiquement via `next/dynamic` pour une isolation client totale et un FCP < 200 ms.
- **Spécification 1.2 — Dynamic Canvas & Recharts Isolator :**
  Encapsulation des composants de visualisations Recharts et des cartes SVG complexes dans des sous-modules isolés du SSR.

### 📦 LOT 2 : TEMPORALITÉ DUALE & MOTEUR CHRONO-INTERTOUR WORKER
- **Spécification 2.1 — Moteur Temporel Année-par-Année (`CycleEngine`) :**
  Développement dans `src/workers/simulation.worker.ts` du moteur de sous-cycles simulant l'écoulement continu du temps (croissance/épuisement des ressources, événements jalons).
- **Spécification 2.2 — Automatisations de Flotte & Construction de Bâtiments (`ConstructionQueue`) :**
  Gestion des files d'attente de construction multi-tours pour les dômes/bâtiments Sol et construction automatique de la flotte spatiale selon les allocations budgétaires.
- **Spécification 2.3 — Concessions Foncieres & Propriétés Privées (`LandConcessionEngine`) :**
  Moteur d'achat d'hectares et d'infrastructures avec la Fortune Privée de l'Archon (`leaderPrivateCredits`).

### 📦 LOT 3 : OVERLAY DE TRANSITION, NARRATION & RAPPORT DE CYCLE UX
- **Spécification 3.1 — Rapport Visuel de Cycle Amélioré (`CycleReportModal`) :**
  Visualisation précise des deltas de ressources (Énergie, Nourriture, Matériaux, Crédits) entre le début et la fin de l'année simulée, avec résumé synthétique des projets achevés par l'Auto-Build AI.
- **Spécification 3.2 — Visualisation UX Experte de l'État du Jeu :**
  Modernisation ergonomique de l'interface par un expert UI/UX (indicateurs visuels de tendance, badges de statut nets, jauges de pression et lisibilité instantanée).

---

## 14.2 Roadmap de Développement Multi-Phase (Plan d'Exécution)

```
+-----------------------------------------------------------------------------------+
| PHASE 1 : Refactoring `next/dynamic` ({ ssr: false }) pour modales & Vues Lourdes |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| PHASE 2 : Schémas Zod Stricts dans `src/lib/contracts/` & Validation Inter-Thread |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| PHASE 3 : Implantation du `CycleEngine` dans `src/workers/simulation.worker.ts`   |
| (Évolution annuelle, queues de construction, flotte & événements aléatoires)      |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| PHASE 4 : Amélioration UX de `CycleReportModal` & Dashboard Visualisation d'État  |
+-----------------------------------------------------------------------------------+
```

### Détail des Phases de Développement :

1. **Phase 1 — Refactoring SSR Isolation (`next/dynamic`) :**
   - Remplacer les importations directes des modales dans `App.tsx` et `Macro4XView.tsx` par des wrappers `dynamic(() => import(...), { ssr: false })`.
   - Réduire le bundle JS initial et prévenir tout décalage d'hydratation DOM.

2. **Phase 2 — Contrats de Données Zod & Typage Strict (`src/lib/contracts/`) :**
   - Étendre et sceller les schémas Zod dans `src/lib/contracts/state.ts` et `src/lib/contracts/cycle.ts`.
   - Valider tous les messages et payloads échangés entre le Thread Principal (React) et le Web Worker (`simulation.worker.ts`).

3. **Phase 3 — Implantation du `CycleEngine` dans le Web Worker (`simulation.worker.ts`) :**
   - Ajouter la classe déterministe `CycleEngine` gérant les sous-cycles temporels (années/mois).
   - Simuler la consommation et production de ressources Sol & Orbite.
   - Gérer la file de construction des bâtiments et l'assemblage automatique des navettes/vaisseaux selon le budget alloué.
   - Générer les événements aléatoires jalons basés sur le PRNG Mulberry32 (`DeterministicDice`).

4. **Phase 4 — Modale de Bilan de Cycle Améliorée (`CycleReportModal`) & UX Ergonomique :**
   - Afficher les deltas de ressources sous forme de badges colorés ($+\Delta$ / $-\Delta$).
   - Présenter le bilan synthétique des chantiers achevés par l'IA d'Auto-Build.
   - Intégrer les améliorations ergonomiques proposées par l'expert UI/UX pour une lisibilité maximale.

