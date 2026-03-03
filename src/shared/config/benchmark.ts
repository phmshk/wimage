import type { BenchmarkConfig } from "@/shared/lib/worker";

export const BENCHMARK_ITERATIONS = {
  min: 1,
  max: 20,
  step: 1,
  default: 5,
} as const;

export const BENCHMARK_DEFAULT_CONFIG: BenchmarkConfig = {
  filters: ["grayscale", "gaussian-blur", "median"],
  engines: ["js", "wasm"],
  iterations: BENCHMARK_ITERATIONS.default,
};

