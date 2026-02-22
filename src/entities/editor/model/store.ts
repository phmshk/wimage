import { create } from "zustand";
import type { EditorSettingsState } from "./types";
import { useShallow } from "zustand/react/shallow";

export const useEditorStore = create<EditorSettingsState>()((set) => ({
  engine: "js",
  setEngine: (engine) => set({ engine }),
}));

export const useEngine = () => useEditorStore((state) => state.engine);
export const useEditorActions = () =>
  useEditorStore(
    useShallow((state) => ({
      setEngine: state.setEngine,
    }))
  );
