import type { FilterOptions } from "@/shared/lib/image-processing";
import type { ComputeEngine, FilterType } from "@/shared/lib/worker";

export type FilterMeta = {
  label: string;
  description: string;
  defaultOptions?: FilterOptions;
  ui?: {
    radius?: { min: number; max: number; step: number };
  };
};

export const FILTERS_ORDER: FilterType[] = [
  "grayscale",
  "inversion",
  "sepia",
  "gaussian-blur",
  "sobel",
  "sharpen",
  "median",
  "kuwahara",
  "bilateral",
];

const RADIUS_UI_DEFAULTS = { min: 1, max: 10, step: 1 } as const;

export const FILTERS_META: Record<FilterType, FilterMeta> = {
  grayscale: {
    label: "Grayscale",
    description: "Removes color, turning the photo into black and white.",
  },
  inversion: {
    label: "Inversion",
    description: "Swaps all colors like an old film negative.",
  },
  sepia: {
    label: "Sepia",
    description: "Adds a vintage brownish tone, like an old photograph.",
  },
  "gaussian-blur": {
    label: "Gaussian Blur",
    description: "Makes the image look foggy or out of focus.",
    defaultOptions: { radius: 3 },
    ui: { radius: RADIUS_UI_DEFAULTS },
  },
  sharpen: {
    label: "Sharpen",
    description: "Makes details pop and edges look clearer.",
  },
  sobel: {
    label: "Sobel Operator",
    description: "Turns the image into a sketch by outlining all edges.",
  },
  median: {
    label: "Median",
    description:
      "Removes small specks and dots (noise) while keeping shapes clear.",
    defaultOptions: { radius: 2 },
    ui: { radius: RADIUS_UI_DEFAULTS },
  },
  kuwahara: {
    label: "Kuwahara",
    description: "Makes the photo look like an artistic oil painting.",
    defaultOptions: { radius: 6 },
    ui: { radius: RADIUS_UI_DEFAULTS },
  },
  bilateral: {
    label: "Bilateral",
    description: "Smooths surfaces (like skin) but keeps edges sharp.",
    defaultOptions: { radius: 2 },
    ui: { radius: RADIUS_UI_DEFAULTS },
  },
};

export const ENGINES_ORDER: ComputeEngine[] = ["js", "wasm"];

export const ENGINES_META: Record<ComputeEngine, { label: string }> = {
  js: { label: "JavaScript" },
  wasm: { label: "WebAssembly (C)" },
};

export function getDefaultFilterOptions(
  filter: FilterType
): FilterOptions | undefined {
  return FILTERS_META[filter].defaultOptions;
}
