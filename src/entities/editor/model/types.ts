export type ComputeEngine = "js" | "wasm";

export interface ExecutionResults {
  js: number | null;
  wasm: number | null;
}

export interface EditorSettingsState {
  engine: ComputeEngine;
  results: ExecutionResults;
  setEngine: (engine: ComputeEngine) => void;
  setResult: (engine: ComputeEngine, time: number) => void;
  clearResults: () => void;
}
