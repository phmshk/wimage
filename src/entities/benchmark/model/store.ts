import { BENCHMARK_DEFAULT_CONFIG } from "@/shared/config";
import { create } from "zustand";
import type { BenchmarkState } from "./types";
import { useShallow } from "zustand/react/shallow";

const initialState = {
  status: "idle" as const,
  config: BENCHMARK_DEFAULT_CONFIG,
  results: [],
  progress: { current: 0, total: 0 },
  error: null,
};

export const useBenchmarkStore = create<BenchmarkState>()((set) => ({
  ...initialState,

  setConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),

  setStatus: (status) => set({ status }),

  setProgress: (progress) => set({ progress }),

  setResults: (results) => set({ results }),

  setError: (error) => set({ error, status: "error" }),

  startBenchmark: () =>
    set({
      status: "running",
      results: [],
      progress: { current: 0, total: 1 },
      error: null,
    }),

  reset: () =>
    set({
      status: "idle",
      results: [],
      progress: { current: 0, total: 0 },
      error: null,
    }),
}));

export const useBenchmarkStatus = () =>
  useBenchmarkStore((state) => state.status);
export const useBenchmarkConfig = () =>
  useBenchmarkStore((state) => state.config);
export const useBenchmarkResults = () =>
  useBenchmarkStore((state) => state.results);
export const useBenchmarkProgress = () =>
  useBenchmarkStore((state) => state.progress);
export const useBenchmarkError = () =>
  useBenchmarkStore((state) => state.error);

export const useBenchmarkActions = () =>
  useBenchmarkStore(
    useShallow((state) => ({
      setConfig: state.setConfig,
      setStatus: state.setStatus,
      setProgress: state.setProgress,
      setResults: state.setResults,
      setError: state.setError,
      startBenchmark: state.startBenchmark,
      reset: state.reset,
    }))
  );
