import { create } from "zustand";
import type { EditorSettingsState } from "./types";
import { useShallow } from "zustand/react/shallow";

export const useEditorStore = create<EditorSettingsState>()((set) => ({
  engine: "js",
  results: {
    js: null,
    wasm: null,
  },
  setEngine: (engine) => set({ engine }),
  setResult: (engine, time) =>
    set((state) => ({
      results: {
        ...state.results,
        [engine]: time,
      },
    })),

  clearResults: () =>
    set({
      results: { js: null, wasm: null },
    }),
}));

export const useEngine = () => useEditorStore((state) => state.engine);
export const useExecutionResults = () =>
  useEditorStore((state) => state.results);
export const useEditorActions = () =>
  useEditorStore(
    useShallow((state) => ({
      setEngine: state.setEngine,
      setResult: state.setResult,
      clearResults: state.clearResults,
    }))
  );
