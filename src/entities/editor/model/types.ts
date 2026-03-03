import type { ComputeEngine } from "@/shared/lib/worker";

export type { ComputeEngine };

export interface EditorSettingsState {
  engine: ComputeEngine;
  setEngine: (engine: ComputeEngine) => void;
}
