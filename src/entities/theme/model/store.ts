import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeType = "dark" | "light" | "system";

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme: ThemeType) => set({ theme }),
    }),
    {
      name: "ui-theme",
    }
  )
);

export const useTheme = () => useThemeStore((state) => state.theme);
export const useSetTheme = () => useThemeStore((state) => state.setTheme);
