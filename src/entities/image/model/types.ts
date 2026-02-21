import type { FilterOptions } from "@/shared/lib/image-processing";
import type { FilterType } from "@/shared/lib/worker";

export interface ImageBitmapData {
  bitmap: ImageBitmap;
  workerBitmap: ImageBitmap;
  width: number;
  height: number;
  filename: string;
}

export interface ImageState {
  status: "idle" | "loading" | "processing" | "error" | "no_img";
  info: { width: number; height: number; filename: string } | null;
  bitmap?: ImageBitmap;
  isModified: boolean;

  progress: number;

  lastMetrics: { computeTime: number } | null;
  error: string | null;

  setImage: (data: ImageBitmapData) => void;
  applyFilter: (
    filterName: FilterType,
    options?: FilterOptions
  ) => Promise<void>;
  reset: () => void;
  cancelProcessing: () => void;
}
