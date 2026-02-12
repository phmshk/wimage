import type { ImageState } from "./types";
import { create } from "zustand";
import type { FilterPayload, FilterType } from "@/shared/lib/worker";
import { workerHost } from "@/entities/worker/WorkerHost";
import type { FilterOptions } from "@/shared/lib/image-processing";
import { useShallow } from "zustand/react/shallow";

export const useImageStore = create<ImageState>()((set, get) => ({
  status: "idle",
  info: null,
  originalData: null,
  currData: null,
  lastMetrics: null,
  error: null,

  setImage: (data: Uint8ClampedArray, width: number, height: number) =>
    set({
      status: "idle",
      info: { width, height },
      originalData: data,
      currData: new Uint8ClampedArray(data),
      error: null,
    }),

  applyFilter: async (filterName: FilterType, options?: FilterOptions) => {
    const { currData, info, status } = get();

    if (status === "processing") return;
    if (!currData || !info) return;

    set({ status: "processing", error: null });

    try {
      const payload: FilterPayload = {
        filterName,
        width: info.width,
        height: info.height,
        options,
      };

      const imageData = new Uint8ClampedArray(currData);
      const response = await workerHost.processImage(imageData, payload);

      if (response.success && response.buffer) {
        set({
          status: "idle",
          currData: response.buffer,
          lastMetrics: response.metrics,
        });
      } else {
        throw new Error(response.error);
      }
    } catch (e) {
      set({ status: "error", error: (e as Error).message });
    }
  },

  reset: () => {
    const { originalData } = get();
    if (originalData) {
      set({ currData: new Uint8ClampedArray(originalData), error: null });
    }
  },
}));

export const useOriginalData = () =>
  useImageStore((state) => state.originalData);
export const useCurrData = () => useImageStore((state) => state.currData);
export const useImageInfo = () => useImageStore((state) => state.info);
export const useImageStatus = () => useImageStore((state) => state.status);
export const useImageError = () => useImageStore((state) => state.error);
export const useMetrics = () => useImageStore((state) => state.lastMetrics);

export const useImageActions = () =>
  useImageStore(
    useShallow((state) => ({
      setImage: state.setImage,
      applyFilter: state.applyFilter,
      reset: state.reset,
    }))
  );
