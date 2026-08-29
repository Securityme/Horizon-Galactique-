# 📜 Sémantique de Domaine : integrations
**Strate AETHER** : `-2` — *Local-First & CRDT I/O*
**Chemin relatif** : `src/services/integrations`

## 🎯 Responsabilité
Persistance IndexedDB, deltas et outbox pattern.

## 📦 Exports Publics (10)
- `CloudSqlStatus`
- `checkCloudSqlConnection`
- `toggleCloudSqlManualConnect`
- `CommunityMessage`
- `subscribeToCommunityChat`
- `sendCommunityMessage`
- `sendGoogleChatMessage`
- `IntegratedServiceState`
- `ServiceListener`
- `integratedServicesManager`

## 🔗 Dépendances Externes & Modules Importés
- `../../lib/firebase`
- `../firebase`
- `./cloudSqlService`
- `firebase/auth`
- `firebase/firestore`

## 📁 Fichiers Source Détectés
- **`cloudSqlService.ts`** (3 exports)
  - Exports : `CloudSqlStatus`, `checkCloudSqlConnection`, `toggleCloudSqlManualConnect`
- **`chatService.ts`** (4 exports)
  - Exports : `CommunityMessage`, `subscribeToCommunityChat`, `sendCommunityMessage`, `sendGoogleChatMessage`
- **`serviceRegistry.ts`** (3 exports)
  - Exports : `IntegratedServiceState`, `ServiceListener`, `integratedServicesManager`

---
*Généré automatiquement par AST Hypervisor via `scripts/sync-manifests.ts`*
