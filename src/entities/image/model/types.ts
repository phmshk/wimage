import type { FilterOptions } from "@/shared/lib/image-processing";
import type { FilterType } from "@/shared/lib/worker";

export interface ImageState {
  status: "idle" | "loading" | "processing" | "error" | "no_img";
  info: { width: number; height: number } | null;

  originalData: Uint8ClampedArray | null;
  currData: Uint8ClampedArray | null;

  lastChunk: {
    data: Uint8ClampedArray;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  progress: number;

  lastMetrics: { computeTime: number } | null;
  error: string | null;

  setImage: (data: Uint8ClampedArray, width: number, height: number) => void;
  applyFilter: (
    filterName: FilterType,
    options?: FilterOptions
  ) => Promise<void>;
  reset: () => void;
}
