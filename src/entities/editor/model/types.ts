export type ComputeEngine = "js" | "wasm";

export interface EditorSettingsState {
  engine: ComputeEngine;
  setEngine: (engine: ComputeEngine) => void;
}
