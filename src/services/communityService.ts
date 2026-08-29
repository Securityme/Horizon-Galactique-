import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface CommunityPulse {
  totalCitizensSaved: number;
  totalErasAdvanced: number;
  activeColonists: number;
  updatedAt: string;
}

const PULSE_DOC_ID = "pulse";

/**
 * Updates the global community pulse metrics.
 * Using atomic increments to ensure consistency across multiple concurrent players.
 */
export async function reportColonyStats(citizens: number, erasReached: number): Promise<void> {
  const pulseRef = doc(db, "global", PULSE_DOC_ID);
  
  try {
    const snap = await getDoc(pulseRef);
    if (!snap.exists()) {
      await setDoc(pulseRef, {
        totalCitizensSaved: citizens,
        totalErasAdvanced: erasReached,
        activeColonists: citizens,
        updatedAt: new Date().toISOString()
      });
    } else {
      await updateDoc(pulseRef, {
        totalCitizensSaved: increment(citizens),
        totalErasAdvanced: increment(erasReached),
        activeColonists: increment(citizens / 10), // Heuristic update
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.warn("[CommunityService] Failed to update pulse:", error);
  }
}

/**
 * Retrieves the current state of the global community pulse.
 */
export async function getCommunityPulse(): Promise<CommunityPulse | null> {
  const pulseRef = doc(db, "global", PULSE_DOC_ID);
  try {
    const snap = await getDoc(pulseRef);
    if (snap.exists()) {
      return snap.data() as CommunityPulse;
    }
  } catch (error) {
    console.error("[CommunityService] Failed to fetch pulse:", error);
  }
  return null;
}
