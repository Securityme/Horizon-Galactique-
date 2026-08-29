import { doc, setDoc, getDoc, getDocs, collection, deleteDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { State4XPayload } from "../types/state";
import { LocalSaveSlotMeta } from "./storage";

export async function syncUserProfile(user: User): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  try {
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || user.email?.split("@")[0] || "Commandant",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

export async function saveGameToCloud(userId: string, state: State4XPayload): Promise<void> {
  if (!userId || !state.saveId) return;
  const saveRef = doc(db, "users", userId, "saves", state.saveId);

  try {
    // Conflict Detection
    const remoteDoc = await getDoc(saveRef);
    let remoteExists = false;
    let remoteCreatedAt = new Date().toISOString();

    if (remoteDoc.exists()) {
      remoteExists = true;
      const remoteData = remoteDoc.data();
      remoteCreatedAt = remoteData.createdAt;
      const remoteUpdatedAt = new Date(remoteData.updatedAt || 0).getTime();
      const localUpdatedAt = new Date(state.lastSyncedAt || 0).getTime();

      // If remote is significantly newer, we skip to avoid overwriting newer cloud data.
      if (remoteUpdatedAt > localUpdatedAt + 1000) {
        console.warn("Cloud save is newer than local state. Skipping overwrite.");
        return;
      }
    }

    const now = new Date().toISOString();
    const payload = {
      saveId: state.saveId,
      ownerId: userId,
      contractVersion: state.contractVersion || "4X-V1",
      gameVersion: "1.0.0",
      seed: state.globalSeed || 1337,
      checkpointTurn: state.turnIndex,
      checkpoint: { ...state, lastSyncedAt: now },
      createdAt: remoteCreatedAt,
      updatedAt: now,
    };

    await setDoc(saveRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/saves/${state.saveId}`);
  }
}

export async function listCloudSaves(userId: string): Promise<LocalSaveSlotMeta[]> {
  if (!userId) return [];
  const savesCol = collection(db, "users", userId, "saves");
  try {
    const snapshot = await getDocs(savesCol);
    const list: LocalSaveSlotMeta[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const state = data.checkpoint as State4XPayload;
      if (state) {
        list.push({
          saveId: data.saveId || docSnap.id,
          seed: data.seed || state.globalSeed || 1337,
          leaderName: state.leader?.displayName || "Leader",
          dynastyName: state.leader?.dynastyName || "Dynasty",
          planetId: state.territory?.planetId || "Erebus-IV",
          era: state.currentEra || "ERA_1",
          turnIndex: state.turnIndex || 1,
          popTotal: state.demographics?.popTotal || 100,
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      }
    });
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/saves`);
  }
}

export async function loadGameFromCloud(userId: string, saveId: string): Promise<State4XPayload | null> {
  if (!userId || !saveId) return null;
  const saveRef = doc(db, "users", userId, "saves", saveId);
  try {
    const docSnap = await getDoc(saveRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const state = data.checkpoint as State4XPayload;
      if (state) {
        state.lastSyncedAt = data.updatedAt;
      }
      return state;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}/saves/${saveId}`);
  }
}

export async function deleteCloudSave(userId: string, saveId: string): Promise<void> {
  if (!userId || !saveId) return;
  const saveRef = doc(db, "users", userId, "saves", saveId);
  try {
    await deleteDoc(saveRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/saves/${saveId}`);
  }
}
