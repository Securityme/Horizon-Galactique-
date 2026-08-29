import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { State4XPayload } from "../types/state";

export interface ChronicleEntry {
  turn: number;
  event: string;
  popTotal: number;
  era: string;
  timestamp: string;
}

/**
 * Saves a historical chronicle entry for a specific turn in the cloud.
 */
export async function archiveChronicleTurn(userId: string, state: State4XPayload, eventSummary: string): Promise<void> {
  if (!userId || !state.saveId) return;
  
  const turnId = state.turnIndex.toString();
  const historyRef = doc(db, "users", userId, "saves", state.saveId, "history", turnId);

  const entry: ChronicleEntry = {
    turn: state.turnIndex,
    event: eventSummary,
    popTotal: state.demographics.popTotal,
    era: state.currentEra,
    timestamp: new Date().toISOString()
  };

  try {
    await setDoc(historyRef, entry);
  } catch (error) {
    console.warn(`[ChronicleService] Failed to archive turn ${turnId}:`, error);
  }
}
