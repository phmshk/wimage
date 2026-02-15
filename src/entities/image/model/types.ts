import type { FilterOptions } from "@/shared/lib/image-processing";
import type { FilterType } from "@/shared/lib/worker";
import type { ChunkData } from "@/shared/lib/worker/types";

export interface ImageState {
  status: "idle" | "loading" | "processing" | "error" | "no_img";
  info: { width: number; height: number; filename: string } | null;
  isModified: boolean;

  originalData: Uint8ClampedArray | null;
  currData: Uint8ClampedArray | null;

  lastChunk: ChunkData | null;
  progress: number;

  lastMetrics: { computeTime: number } | null;
  error: string | null;

  setImage: (
    data: Uint8ClampedArray,
    width: number,
    height: number,
    filename: string
  ) => void;
  applyFilter: (
    filterName: FilterType,
    options?: FilterOptions
  ) => Promise<void>;
  reset: () => void;
  cancelProcessing: () => void;
}
