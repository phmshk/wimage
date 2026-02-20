import type { ImageState } from "./types";
import { create } from "zustand";
import type { FilterPayload, FilterType } from "@/shared/lib/worker";
import { workerHost } from "@/entities/worker/WorkerHost";
import type { FilterOptions } from "@/shared/lib/image-processing";
import { useShallow } from "zustand/react/shallow";
import { subscribeWithSelector } from "zustand/middleware";
import type { ChunkData } from "@/shared/lib/worker/types";
import { notify } from "@/shared/lib/notifications";
import { formatTime } from "@/shared/lib/utils";
import { useEditorStore } from "@/entities/editor";

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
    isModified: false,

    setImage: (
      data: Uint8ClampedArray,
      width: number,
      height: number,
      filename: string
    ) => {
      const { clearResults } = useEditorStore.getState();

      clearResults();
      set({
        status: "idle",
        info: { width, height, filename },
        originalData: data,
        currData: new Uint8ClampedArray(data),
        error: null,
        lastChunk: null,
        progress: 0,
        lastMetrics: null,
      });
    },

    applyFilter: async (filterName: FilterType, options?: FilterOptions) => {
      const { currData, info, status } = get();
      const { engine, setResult } = useEditorStore.getState();

      if (status === "processing") return;
      if (!currData || !info) return;

      set({
        status: "processing",
        error: null,
        progress: 0,
        lastChunk: null,
        isModified: true,
      });

      try {
        const payload: FilterPayload = {
          filterName,
          width: info.width,
          height: info.height,
          options,
          engine,
        };

        const imageData = new Uint8ClampedArray(currData);
        const response = await workerHost.processImage(
          imageData,
          payload,
          (chunk: ChunkData) => {
            const currentProgress = get().progress;
            const percentage = Math.round(
              (chunk.progress.processed / chunk.progress.total) * 100
            );
            if (percentage !== currentProgress) {
              set({ lastChunk: chunk, progress: percentage });
            } else {
              set({ lastChunk: chunk });
            }
          }
        );

        if (
          response.success &&
          response.buffer &&
          response.type === "done" &&
          response.metrics
        ) {
          set({
            status: "idle",
            currData: response.buffer,
            lastMetrics: response.metrics,
            lastChunk: null,
          });
          notify.success(
            "Filter Applied",
            `Last Operation Time: ${formatTime(response.metrics?.computeTime)}`
          );
          setResult(engine, response.metrics.computeTime);
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
          progress: 0,
          lastMetrics: null,
          isModified: false,
        });
      }
    },

    cancelProcessing: () => {
      const { status } = get();
      if (status !== "processing") return;

      workerHost.terminate();

      set({
        status: "idle",
        progress: 0,
        lastChunk: null,
      });

      notify.warning(
        "Canceled",
        "Operation was aborted by user. Filter was only partially applied! Reset image to its original state.",
        8000
      );
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
export const useIsModified = () => useImageStore((state) => state.isModified);

export const useImageActions = () =>
  useImageStore(
    useShallow((state) => ({
      setImage: state.setImage,
      applyFilter: state.applyFilter,
      reset: state.reset,
      cancelProcessing: state.cancelProcessing,
    }))
  );
