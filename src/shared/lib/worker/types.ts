import type { FilterOptions } from "../image-processing";

export type Metrics = {
  computeTime: number;
  totalTime: number;
};

export interface EngineMetrics {
  avgComputeTime: number;
  avgTotalTime: number;
}
export type ComputeEngine = "js" | "wasm";

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

export interface ProcessingProgress {
  processed: number;
  total: number;
}

// from main thread to worker
export type WorkerRequest =
  | { type: "init_canvas"; canvas: OffscreenCanvas }
  | {
      type: "set_image";
      imageData: { bitmap: ImageBitmap; width: number; height: number };
    }
  | {
      type: "apply_filter";
      id: string;
      payload: FilterPayload;
      engine: ComputeEngine;
      cancelBuffer?: SharedArrayBuffer;
    }
  | { type: "cancel_filter"; id: string }
  | {
      type: "run_benchmark";
      id: string;
      config: BenchmarkConfig;
      width: number;
      height: number;
      cancelBuffer?: SharedArrayBuffer;
    };

export type WorkerActionType = WorkerRequest["type"];

// from worker to main thread
export type WorkerResponse =
  | {
      type: "processing";
      id: string;
      success: true;
      progress: ProcessingProgress;
    }
  | { type: "done"; id: string; success: true; metrics: Metrics }
  | {
      type: "benchmark_running";
      id: string;
      success: true;
      progress: BenchmarkProgress;
    }
  | {
      type: "benchmark_done";
      id: string;
      success: true;
      results: BenchmarkResult[];
    }
  | { type: "error"; id: string; success: false; error: string };
export type WorkerResponseType = WorkerResponse["type"];

export type BenchmarkMetrics = { computeTime: number };
export type BenchmarkProgress = { current: number; total: number };

export interface BenchmarkConfig {
  iterations: number;
  filters: FilterType[];
  engines: ComputeEngine[];
}

export interface BenchmarkResult {
  filterId: string;
  filterName: string;
  js?: EngineMetrics;
  wasm?: EngineMetrics;
  iterations: number;
}
