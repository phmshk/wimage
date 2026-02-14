import type { ImageState } from "./types";
import { create } from "zustand";
import type { FilterPayload, FilterType } from "@/shared/lib/worker";
import { workerHost } from "@/entities/worker/WorkerHost";
import type { FilterOptions } from "@/shared/lib/image-processing";
import { useShallow } from "zustand/react/shallow";
import { subscribeWithSelector } from "zustand/middleware";
import type { ChunkData } from "@/shared/lib/worker/types";

export const useImageStore = create<ImageState>()(
  subscribeWithSelector((set, get) => ({
    status: "no_img",
    info: null,
    originalData: null,
    currData: null,
    lastMetrics: null,
    error: null,
    lastChunk: null,
    progress: 0,

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

      set({ status: "processing", error: null, progress: 0 });

      try {
        const payload: FilterPayload = {
          filterName,
          width: info.width,
          height: info.height,
          options,
        };

        const imageData = new Uint8ClampedArray(currData);
        const response = await workerHost.processImage(
          imageData,
          payload,
          (chunk: ChunkData) => {
            const percentage = Math.round(
              (chunk.progress.processed / chunk.progress.total) * 100
            );
            set({ lastChunk: chunk, progress: percentage });
          }
        );

        if (response.success && response.buffer && response.type === "done") {
          set({
            status: "idle",
            currData: response.buffer,
            lastMetrics: response.metrics,
            lastChunk: null,
          });
        } else {
          throw new Error(response.error);
        }
      } catch (e) {
        set({
          status: "error",
          error: (e as Error).message,
          progress: 0,
          lastChunk: null,
        });
      }
    },

    reset: () => {
      const { originalData } = get();
      if (originalData) {
        set({
          currData: new Uint8ClampedArray(originalData),
          error: null,
          lastChunk: null,
        });
      }
    },
  }))
);

export const useOriginalData = () =>
  useImageStore((state) => state.originalData);
export const useCurrData = () => useImageStore((state) => state.currData);
export const useImageInfo = () => useImageStore((state) => state.info);
export const useImageStatus = () => useImageStore((state) => state.status);
export const useImageError = () => useImageStore((state) => state.error);
export const useMetrics = () => useImageStore((state) => state.lastMetrics);
export const useProcessingProgress = () =>
  useImageStore((state) => state.progress);

export const useImageActions = () =>
  useImageStore(
    useShallow((state) => ({
      setImage: state.setImage,
      applyFilter: state.applyFilter,
      reset: state.reset,
    }))
  );
