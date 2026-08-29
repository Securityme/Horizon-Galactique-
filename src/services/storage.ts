import { openDB } from "idb";
import { State4XPayload, State4XPayloadSchema } from "../lib/contracts";

const DB_NAME = "StellarGenesisDB";
const STORE_SAVES = "saves";

export async function initDB() {
  if (typeof window === "undefined") return null;
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_SAVES)) {
        const store = db.createObjectStore(STORE_SAVES, { keyPath: "saveId" });
        store.createIndex("updatedAt", "updatedAt");
      }
    },
  });
}

export async function getLatestSave(): Promise<State4XPayload | null> {
  try {
    const db = await initDB();
    if (db) {
      const tx = db.transaction(STORE_SAVES, "readonly");
      const index = tx.objectStore(STORE_SAVES).index("updatedAt");
      const cursor = await index.openCursor(null, "prev");

      if (cursor && cursor.value) {
        const parsed = State4XPayloadSchema.safeParse(cursor.value);
        if (parsed.success) return parsed.data;
      }
    }
  } catch (err) {
    console.warn("IndexedDB read error, checking localStorage fallback:", err);
  }

  // Fallback to localStorage active game
  return loadActiveGameLocally();
}

const ACTIVE_SAVE_KEY = "sg_active_save_v1";
const SAVES_LIST_KEY = "sg_saved_slots_v1";
const SETTINGS_KEY = "sg_settings_v1";

export interface LocalSaveSlotMeta {
  saveId: string;
  seed: number;
  leaderName: string;
  dynastyName: string;
  planetId: string;
  era: string;
  turnIndex: number;
  popTotal: number;
  updatedAt: string;
}

export function saveActiveGameLocally(state: State4XPayload): void {
  if (typeof window === "undefined") return;
  try {
    const updatedAt = new Date().toISOString();
    const payloadWithMeta = { ...state, updatedAt };
    const raw = JSON.stringify(payloadWithMeta);

    localStorage.setItem(ACTIVE_SAVE_KEY, raw);

    // Save to IndexedDB asynchronously
    initDB().then((db) => {
      if (db) {
        db.put(STORE_SAVES, payloadWithMeta).catch((e) => console.warn("IDB put error:", e));
      }
    }).catch(() => {});

    // Also update slots list
    const meta: LocalSaveSlotMeta = {
      saveId: state.saveId,
      seed: state.globalSeed,
      leaderName: state.leader.displayName,
      dynastyName: state.leader.dynastyName,
      planetId: state.territory.planetId,
      era: state.currentEra,
      turnIndex: state.turnIndex,
      popTotal: state.demographics.popTotal,
      updatedAt
    };

    const slots = getLocalSavedSlots();
    const existingIndex = slots.findIndex((s) => s.saveId === state.saveId);
    if (existingIndex >= 0) {
      slots[existingIndex] = meta;
    } else {
      slots.unshift(meta);
    }
    localStorage.setItem(SAVES_LIST_KEY, JSON.stringify(slots.slice(0, 10)));
    localStorage.setItem(`sg_save_${state.saveId}`, raw);
  } catch (err) {
    console.error("Local save error:", err);
  }
}

export function loadActiveGameLocally(): State4XPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const valid = State4XPayloadSchema.safeParse(parsed);
    return valid.success ? valid.data : (parsed as State4XPayload);
  } catch (err) {
    console.error("Load local game error:", err);
    return null;
  }
}

export function loadGameBySaveId(saveId: string): State4XPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`sg_save_${saveId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    localStorage.setItem(ACTIVE_SAVE_KEY, raw);
    const valid = State4XPayloadSchema.safeParse(parsed);
    return valid.success ? valid.data : (parsed as State4XPayload);
  } catch (err) {
    console.error("Load save by ID error:", err);
    return null;
  }
}

export function getLocalSavedSlots(): LocalSaveSlotMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVES_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export interface AppSettings {
  theme: "dark-obsidian" | "light-glass" | "cyberpunk-neon" | "retro-amber";
  locale: "fr" | "en";
  audioVolume: number;
  ambientSound: boolean;
  soundEffects: boolean;
  radioStreamEnabled: boolean;
  fastSimSpeed: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark-obsidian",
  locale: "fr",
  audioVolume: 0.5,
  ambientSound: true,
  soundEffects: true,
  radioStreamEnabled: false,
  fastSimSpeed: 1
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Save settings error:", err);
  }
}

