# 📜 Sémantique de Domaine : narrative
**Strate AETHER** : `-1` — *Statecharts & Narrative FSM*
**Chemin relatif** : `src/narrative`

## 🎯 Responsabilité
Moteur narratif, journal des événements et PRNG déterministe.

## 📦 Exports Publics (5)
- `DESTINY_DECK`
- `drawDestinyCards`
- `DeterministicDice`
- `generateFallbackTurnNarrative`
- `generateFallbackCycleReport`

## 🔗 Dépendances Externes & Modules Importés
- `../lib/contracts`
- `../types/payloads`
- `./mulberry32`

## 📁 Fichiers Source Détectés
- **`destinyDraft.ts`** (2 exports)
  - Exports : `DESTINY_DECK`, `drawDestinyCards`
- **`mulberry32.ts`** (1 exports)
  - Exports : `DeterministicDice`
- **`fallbackWriter.ts`** (2 exports)
  - Exports : `generateFallbackTurnNarrative`, `generateFallbackCycleReport`

---
*Généré automatiquement par AST Hypervisor via `scripts/sync-manifests.ts`*
