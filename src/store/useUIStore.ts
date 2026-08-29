import { create } from "zustand";

export type GameTheme = "dark" | "light" | "amber";

interface UIStore {
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  theme: GameTheme;
  setTheme: (theme: GameTheme) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSettingsOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  theme: "dark", // Default to Dark mode (Deep Space)
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      localStorage.setItem("sg_theme", theme);
    }
  },
}));
