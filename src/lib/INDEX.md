# 📜 Sémantique de Domaine : lib
**Strate AETHER** : `-4` — *Contracts & Schema Validation*
**Chemin relatif** : `src/lib`

## 🎯 Responsabilité
Schémas Zod, contrats de données et utilitaires partagés.

## 📦 Exports Publics (56)
- `EraIdentifierSchema`
- `TiersDemographicsSchema`
- `PersonTraitsSchema`
- `LeaderStateSchema`
- `EconomyStateSchema`
- `AgePyramidSchema`
- `DemographicsStateSchema`
- `TerritoryCellSchema`
- `TerritoryStateSchema`
- `UtilityNetworkStateSchema`
- `BookLogEntrySchema`
- `State4XPayloadSchema`
- `PatchOperationSchema`
- `WorkerInboundSchema`
- `WorkerOutboundSchema`
- `EraIdentifier`
- `TiersDemographics`
- `PersonTraits`
- `LeaderState`
- `EconomyState`
- `DemographicsState`
- `TerritoryCell`
- `TerritoryState`
- `UtilityNetworkState`
- `BookLogEntry`
- `State4XPayload`
- `PatchOperation`
- `WorkerInbound`
- `WorkerOutbound`
- `AdvisorState`
- `FactionState`
- `PoleState`
- `ResearchState`
- `AgePyramid`
- `NarrativeOptionSchema`
- `ReboundSchema`
- `TurnNarrativeSchema`
- `TurnNarrative`
- `TurnRequestSchema`
- `CycleReportSchema`
- `CycleReport`
- `ChatMessageSchema`
- `AdvisorChatRequestSchema`
- `ContextualEventSchema`
- `ContextualEvent`
- `ContextualEventRequestSchema`
- `db`
- `auth`
- `googleAuthProvider`
- `testConnection`
- `OperationType`
- `FirestoreErrorInfo`
- `handleFirestoreError`
- `cn`
- `formatNumber`
- `formatDecimals`

## 🔗 Dépendances Externes & Modules Importés
- `../../firebase-applet-config.json`
- `clsx`
- `firebase/app`
- `firebase/auth`
- `firebase/firestore`
- `tailwind-merge`
- `zod`

## 📁 Fichiers Source Détectés
- **`contracts.ts`** (46 exports)
  - Exports : `EraIdentifierSchema`, `TiersDemographicsSchema`, `PersonTraitsSchema`, `LeaderStateSchema`, `EconomyStateSchema`, `AgePyramidSchema`, `DemographicsStateSchema`, `TerritoryCellSchema`, `TerritoryStateSchema`, `UtilityNetworkStateSchema`, `BookLogEntrySchema`, `State4XPayloadSchema`, `PatchOperationSchema`, `WorkerInboundSchema`, `WorkerOutboundSchema`, `EraIdentifier`, `TiersDemographics`, `PersonTraits`, `LeaderState`, `EconomyState`, `DemographicsState`, `TerritoryCell`, `TerritoryState`, `UtilityNetworkState`, `BookLogEntry`, `State4XPayload`, `PatchOperation`, `WorkerInbound`, `WorkerOutbound`, `AdvisorState`, `FactionState`, `PoleState`, `ResearchState`, `AgePyramid`, `NarrativeOptionSchema`, `ReboundSchema`, `TurnNarrativeSchema`, `TurnNarrative`, `TurnRequestSchema`, `CycleReportSchema`, `CycleReport`, `ChatMessageSchema`, `AdvisorChatRequestSchema`, `ContextualEventSchema`, `ContextualEvent`, `ContextualEventRequestSchema`
- **`firebase.ts`** (7 exports)
  - Exports : `db`, `auth`, `googleAuthProvider`, `testConnection`, `OperationType`, `FirestoreErrorInfo`, `handleFirestoreError`
- **`utils.ts`** (1 exports)
  - Exports : `cn`
- **`formatters.ts`** (2 exports)
  - Exports : `formatNumber`, `formatDecimals`

---
*Généré automatiquement par AST Hypervisor via `scripts/sync-manifests.ts`*
