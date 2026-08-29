# PLAN DE CONSOLIDATION — STELLAR GENESIS

Généré le 2026-08-28T11:15:01.042Z · commit `—`

## Synthèse

| Indicateur | Valeur |
| --- | ---: |
| Fichiers suivis | 141 |
| Fichiers de code | 54 |
| Déplacements automatiques | 2 |
| Déplacements bloqués (destination occupée) | 0 |
| Doublons exacts à supprimer | 0 |
| Collisions de nom à arbitrer | 1 |
| Fichiers hors route sous app/ | 0 |
| Orphelins (jamais importés) | 9 |
| Imports non résolus | 0 |

## 1. Déplacements (automatiques)

```bash
mkdir -p "src/hooks" && git mv "hooks/use-mobile.ts" "src/hooks/use-mobile.ts"
mkdir -p "src/lib" && git mv "lib/utils.ts" "src/lib/utils.ts"
```

## 2. Doublons exacts (contenu identique — suppression sûre)

_Aucun._

## 3. Collisions de nom, contenus différents — ARBITRAGE REQUIS

- `firebase.ts` :
  - `src/lib/firebase.ts` (2168 B)
  - `src/services/firebase.ts` (2991 B)




> Ne jamais fusionner ces fichiers sans les avoir lus. Deux versions divergentes
> d'un même module = deux états du jeu incompatibles. Fusionne à la main, garde
> un seul chemin, puis relance `audit`.

## 4. Code applicatif mal placé sous `app/` — ARBITRAGE REQUIS

_Aucun._

## 5. Orphelins (aucun chemin depuis une route ou un point d'entrée)

```bash
git rm "hooks/use-mobile.ts"
git rm "lib/utils.ts"
git rm "next-env.d.ts"
git rm "src/engine/core.ts"
git rm "src/services/indexeddb.ts"
git rm "src/simulation/worker4x.ts"
git rm "src/simulation/workerWrapper.ts"
git rm "src/types/generated.ts"
git rm "src/workers/simulation.worker.ts"
```

> Vérifier au cas par cas : un module chargé dynamiquement par chaîne
> construite à l'exécution apparaît ici à tort.

## 6. Imports non résolus (liens cassés)

_Aucun._

## 7. Cible d'arborescence

```
src/
├── app/ routes uniquement (page, layout, route, actions)
├── engine/ noyau déterministe : tick, RNG seedé, résolution de tour
├── features/ un dossier par domaine de jeu (model/engine/store/ui)
├── components/ UI pure, sans logique de jeu
├── hooks/
├── lib/ transverse (client @google/genai côté serveur, schémas zod)
├── types/
└── content/ données statiques : bâtiments, événements, traits
```

**Invariants** : `src/app/` ne contient aucune logique de jeu · `features/`
n'importe jamais `app/` · un store Zustand par domaine · tout import interne
passe par l'alias `@/`.
