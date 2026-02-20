import type { FilterOptions } from "../image-processing";

// eslint-disable-next-line
const WorkerActions = ["init", "apply_filter", "ping"] as const;
export type WorkerActionType = (typeof WorkerActions)[number];

const FilterNames = [
  "grayscale",
  "inversion",
  "sepia",
  "gaussian-blur",
  "sobel",
  "sharpen",
  "median",
  "kuwahara",
  "bilateral",
] as const;
export type FilterType = (typeof FilterNames)[number];

export interface FilterPayload {
  filterName: FilterType;
  options?: FilterOptions;
  width: number;
  height: number;
  engine?: "js" | "wasm";
}

// from main thread to worker
export interface WorkerRequest {
  id: string;
  type: WorkerActionType;
  payload?: FilterPayload;
  buffer?: Uint8ClampedArray;
}

export interface ChunkData {
  data: Uint8ClampedArray;
  x: number;
  y: number;
  width: number;
  height: number;
  progress: { processed: number; total: number };
}

// from worker to main thread
export interface WorkerResponse {
  id: string;
  success: boolean;
  buffer?: Uint8ClampedArray;
  error?: string;
  chunk?: ChunkData;
  type?: "processing" | "done"; // status of dividing image into chunks and apllying filter to each chunk
  metrics?: {
    computeTime: number; // time an algorithm used for run
  };
}
