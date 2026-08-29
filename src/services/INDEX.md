# 📜 Sémantique de Domaine : services
**Strate AETHER** : `-2` — *Local-First & CRDT I/O*
**Chemin relatif** : `src/services`

## 🎯 Responsabilité
Persistance IndexedDB, deltas et outbox pattern.

## 📦 Exports Publics (36)
- `syncUserProfile`
- `saveGameToCloud`
- `listCloudSaves`
- `loadGameFromCloud`
- `deleteCloudSave`
- `audioService`
- `FipRadioService`
- `fipRadio`
- `saveGame`
- `loadGame`
- `listSaves`
- `deleteSave`
- `saveSettings`
- `loadSettings`
- `saveCatalog`
- `loadCatalog`
- `initDB`
- `getLatestSave`
- `LocalSaveSlotMeta`
- `saveActiveGameLocally`
- `loadActiveGameLocally`
- `loadGameBySaveId`
- `getLocalSavedSlots`
- `AppSettings`
- `DEFAULT_SETTINGS`
- `FipStation`
- `FIP_STATIONS`
- `getFirebaseAuth`
- `getFirebaseDb`
- `signInWithGoogle`
- `signInGuest`
- `logOut`
- `subscribeToAuth`
- `CloudSaveSlot`
- `saveToCloud`
- `fetchCloudSaves`

## 🔗 Dépendances Externes & Modules Importés
- `../lib/contracts`
- `../lib/firebase`
- `../types/state`
- `./storage`
- `firebase/auth`
- `firebase/firestore`
- `idb`

## 📁 Fichiers Source Détectés
- **`firebaseSaveService.ts`** (5 exports)
  - Exports : `syncUserProfile`, `saveGameToCloud`, `listCloudSaves`, `loadGameFromCloud`, `deleteCloudSave`
- **`audio.ts`** (3 exports)
  - Exports : `audioService`, `FipRadioService`, `fipRadio`
- **`indexeddb.ts`** (8 exports)
  - Exports : `saveGame`, `loadGame`, `listSaves`, `deleteSave`, `saveSettings`, `loadSettings`, `saveCatalog`, `loadCatalog`
- **`storage.ts`** (11 exports)
  - Exports : `initDB`, `getLatestSave`, `LocalSaveSlotMeta`, `saveActiveGameLocally`, `loadActiveGameLocally`, `loadGameBySaveId`, `getLocalSavedSlots`, `AppSettings`, `DEFAULT_SETTINGS`, `loadSettings`, `saveSettings`
- **`fipRadio.ts`** (3 exports)
  - Exports : `FipStation`, `FIP_STATIONS`, `fipRadio`
- **`firebase.ts`** (9 exports)
  - Exports : `getFirebaseAuth`, `getFirebaseDb`, `signInWithGoogle`, `signInGuest`, `logOut`, `subscribeToAuth`, `CloudSaveSlot`, `saveToCloud`, `fetchCloudSaves`

---
*Généré automatiquement par AST Hypervisor via `scripts/sync-manifests.ts`*
