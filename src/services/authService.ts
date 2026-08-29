import {
  signInWithPopup,
  signInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
  Auth,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  Firestore,
} from "firebase/firestore";
import { auth, db, googleAuthProvider, handleFirestoreError, OperationType } from "../lib/firebase";

export function getFirebaseAuth(): Auth {
  return auth;
}

export function getFirebaseDb(): Firestore {
  return db;
}

let authPromiseLock: Promise<User | null> | null = null;

export async function signInWithGoogle(): Promise<User | null> {
  if (authPromiseLock) {
    console.warn("Firebase sign-in popup already active, returning current promise.");
    return authPromiseLock;
  }

  authPromiseLock = (async () => {
    try {
      googleAuthProvider.setCustomParameters({ prompt: "select_account" });
      const res = await signInWithPopup(auth, googleAuthProvider);
      if (res.user) {
        try {
          await setDoc(
            doc(db, "users", res.user.uid),
            {
              uid: res.user.uid,
              email: res.user.email || "",
              displayName: res.user.displayName || "Gouverneur Stellaire",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn("Firestore profile sync warning:", err);
        }
      }
      return res.user;
    } catch (err: any) {
      const isExpectedAuthCancel =
        err?.code === "auth/cancelled-popup-request" ||
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/internal-error" ||
        err?.message?.includes("cancelled-popup-request") ||
        err?.message?.includes("Pending promise") ||
        err?.message?.includes("INTERNAL ASSERTION FAILED");

      if (isExpectedAuthCancel) {
        console.warn("Google sign-in popup cancelled or closed:", err.code || err.message);
      } else {
        console.error("Firebase Sign-In Error:", err);
      }
      return null;
    } finally {
      authPromiseLock = null;
    }
  })();

  return authPromiseLock;
}

export async function signInGuest(): Promise<User | null> {
  if (authPromiseLock) {
    return authPromiseLock;
  }

  authPromiseLock = (async () => {
    try {
      const res = await signInAnonymously(auth);
      return res.user;
    } catch (err: any) {
      console.warn("Anonymous sign-in error:", err);
      return null;
    } finally {
      authPromiseLock = null;
    }
  })();

  return authPromiseLock;
}

export async function logOut(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.error("Firebase Sign-Out Error:", err);
  }
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  try {
    return onAuthStateChanged(auth, callback);
  } catch (err) {
    console.warn("Could not subscribe to Firebase Auth:", err);
    return () => {};
  }
}

export interface CloudSaveSlot {
  id: string;
  saveId: string;
  ownerId: string;
  contractVersion: string;
  gameVersion: string;
  seed: number;
  checkpointTurn: number;
  checkpoint: any;
  createdAt: string;
  updatedAt: string;
}

export async function saveToCloud(userId: string, slotIndex: number, state: any): Promise<boolean> {
  const saveId = `slot_${slotIndex}`;
  const saveRef = doc(db, "users", userId, "saves", saveId);
  const now = new Date().toISOString();
  const payload: CloudSaveSlot = {
    id: saveId,
    saveId,
    ownerId: userId,
    contractVersion: state.contractVersion || "1.0.0",
    gameVersion: "1.0.0",
    seed: state.globalSeed,
    checkpointTurn: state.turnIndex,
    checkpoint: state,
    createdAt: now,
    updatedAt: now,
  };
  try {
    await setDoc(saveRef, payload, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}/saves/${saveId}`);
    return false;
  }
}

export async function fetchCloudSaves(userId: string): Promise<CloudSaveSlot[]> {
  const savesCol = collection(db, "users", userId, "saves");
  try {
    const snap = await getDocs(savesCol);
    const results: CloudSaveSlot[] = [];
    snap.forEach((d) => results.push(d.data() as CloudSaveSlot));
    return results.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${userId}/saves`);
    return [];
  }
}
