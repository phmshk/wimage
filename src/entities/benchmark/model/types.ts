import type {
  BenchmarkConfig,
  BenchmarkProgress,
  BenchmarkResult,
} from "@/shared/lib/worker";

export type BenchmarkStatus = "idle" | "running" | "completed" | "error";

export interface BenchmarkState {
  status: BenchmarkStatus;
  config: BenchmarkConfig;
  results: BenchmarkResult[];
  progress: BenchmarkProgress;
  error: string | null;

  setConfig: (config: Partial<BenchmarkConfig>) => void;
  setStatus: (status: BenchmarkStatus) => void;
  setProgress: (progress: BenchmarkProgress) => void;
  setResults: (results: BenchmarkResult[]) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
