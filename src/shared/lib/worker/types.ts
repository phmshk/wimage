// eslint-disable-next-line
const WorkerActions = ["init", "apply_filter", "ping"] as const;
export type WorkerActionType = (typeof WorkerActions)[number];

export interface FilterPayload {
  filterName: string;
  options?: Record<string, number>;
  width: number;
  height: number;
}

// from main thread to worker
export interface WorkerRequest {
  id: string;
  type: WorkerActionType;
  payload?: FilterPayload;
  buffer?: Uint8ClampedArray;
}

// from worker to main thread
export interface WorkerResponse {
  id: string;
  success: boolean;
  buffer?: Uint8ClampedArray;
  error?: string;
  metrics?: {
    computeTime: number; // time an algorithm used for run
  };
}
