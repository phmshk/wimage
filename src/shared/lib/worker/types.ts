import type { FilterOptions } from "../image-processing";

// eslint-disable-next-line
const WorkerActions = [
  "init",
  "apply_filter",
  "set_image",
  "init_canvas",
  "cancel_filter",
] as const;
export type WorkerActionType = (typeof WorkerActions)[number];

// eslint-disable-next-line
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
}

// from main thread to worker
export interface WorkerRequest {
  id?: string;
  type: WorkerActionType;
  canvas?: OffscreenCanvas;
  payload?: FilterPayload;
  imageData?: {
    bitmap: ImageBitmap;
    width: number;
    height: number;
  };
  cancelBuffer?: SharedArrayBuffer | undefined;
  engine: "js" | "wasm";
}

export interface ChunkData {
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
  error?: string;
  chunk?: ChunkData;
  type?: "processing" | "done" | "image_ready" | "error"; // status of dividing image into chunks and apllying filter to each chunk
  metrics?: {
    computeTime: number; // time an algorithm used for run
    totalPixels?: number;
  };
}
