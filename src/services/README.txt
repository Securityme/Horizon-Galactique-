DOMAINE: services
STRATE: -2 (Local-First & CRDT I/O)
DESC: Persistance IndexedDB, deltas et outbox pattern.
EXPORTS: syncUserProfile, saveGameToCloud, listCloudSaves, loadGameFromCloud, deleteCloudSave, audioService, FipRadioService, fipRadio, saveGame, loadGame, listSaves, deleteSave, saveSettings, loadSettings, saveCatalog, loadCatalog, initDB, getLatestSave, LocalSaveSlotMeta, saveActiveGameLocally, loadActiveGameLocally, loadGameBySaveId, getLocalSavedSlots, AppSettings, DEFAULT_SETTINGS, FipStation, FIP_STATIONS, getFirebaseAuth, getFirebaseDb, signInWithGoogle, signInGuest, logOut, subscribeToAuth, CloudSaveSlot, saveToCloud, fetchCloudSaves
DEPS: ../lib/contracts, ../lib/firebase, ../types/state, ./storage, firebase/auth, firebase/firestore, idb
