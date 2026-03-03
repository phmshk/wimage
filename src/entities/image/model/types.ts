import type { FilterOptions } from "@/shared/lib/image-processing";
import type { Metrics, FilterType, ComputeEngine } from "@/shared/lib/worker";

export interface ImageBitmapData {
  bitmap: ImageBitmap;
  workerBitmap: ImageBitmap;
  width: number;
  height: number;
  filename: string;
  size: number;
}

export interface ImageState {
  status: "idle" | "loading" | "processing" | "error" | "no_img";
  info: {
    width: number;
    height: number;
    filename: string;
    size: number;
  } | null;
  bitmap?: ImageBitmap;
  isModified: boolean;

  progress: number;

  lastMetrics: Metrics | null;
  error: string | null;

  setImage: (data: ImageBitmapData) => void;
  applyFilter: (
    filterName: FilterType,
    engine: ComputeEngine,
    options?: FilterOptions
  ) => Promise<void>;
  reset: () => void;
  cancelProcessing: () => void;
}
