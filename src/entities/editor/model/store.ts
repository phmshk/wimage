import { create } from "zustand";
import type { EditorSettingsState } from "./types";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

export const useEditorStore = create<EditorSettingsState>()(
  persist(
    (set) => ({
      engine: "js",
      setEngine: (engine) => set({ engine }),
    }),
    { name: "editor-settings" }
  )
);

export const useEngine = () => useEditorStore((state) => state.engine);
export const useEditorActions = () =>
  useEditorStore(
    useShallow((state) => ({
      setEngine: state.setEngine,
    }))
  );
