import {
  type FilterProcessFn,
  applyGrayscale,
  applyInversion,
  applySepia,
  applyGaussianBlur,
  applySobel,
  applySharpen,
  applyMedian,
  applyKuwahara,
  applyBilateral,
} from "@/shared/lib/image-processing";
import type { FilterType } from "@/shared/lib/worker";

export const CHUNK_WIDTH = 256;
export const CHUNK_HEIGHT = 256;
export const PX_SIZE = 4;
export const CHUNK_PADDING = 2;
export const FRAME_BUDGET_MS = 200; // delay to update canvas and send progress

export const jsFilters: Record<FilterType, FilterProcessFn> = {
  grayscale: applyGrayscale,
  inversion: applyInversion,
  sepia: applySepia,
  "gaussian-blur": applyGaussianBlur,
  sobel: applySobel,
  sharpen: applySharpen,
  median: applyMedian,
  kuwahara: applyKuwahara,
  bilateral: applyBilateral,
};
