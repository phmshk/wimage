import type { ImageBitmapData, ImageState } from "./types";
import { create } from "zustand";
import type { FilterPayload, FilterType } from "@/shared/lib/worker";
import { workerHost } from "@/entities/worker/WorkerHost";
import type { FilterOptions } from "@/shared/lib/image-processing";
import { useShallow } from "zustand/react/shallow";
import { subscribeWithSelector } from "zustand/middleware";
import type { ChunkData } from "@/shared/lib/worker/types";
import { notify } from "@/shared/lib/notifications";
import { formatTime } from "@/shared/lib/utils";

export const useImageStore = create<ImageState>()(
  subscribeWithSelector((set, get) => ({
    status: "no_img",
    info: null,
    bitmap: undefined,
    lastMetrics: null,
    error: null,
    progress: 0,
    isModified: false,

    setImage: (data: ImageBitmapData) => {
      set({
        status: "idle",
        info: {
          width: data.width,
          height: data.height,
          filename: data.filename,
        },
        bitmap: data.bitmap,
        error: null,
        progress: 0,
        lastMetrics: null,
        isModified: false,
      });
      workerHost.setImage(data.workerBitmap, data.width, data.height);
    },

    applyFilter: async (filterName: FilterType, options?: FilterOptions) => {
      const { info, status } = get();

      if (status === "processing" || !info) return;

      set({
        status: "processing",
        error: null,
        progress: 0,
      });

      try {
        const payload: FilterPayload = {
          filterName,
          width: info.width,
          height: info.height,
          options,
        };

        const response = await workerHost.processImage(
          payload,
          (chunk: ChunkData) => {
            const currentProgress = get().progress;
            const percentage = Math.round(
              (chunk.progress.processed / chunk.progress.total) * 100
            );
            if (percentage !== currentProgress) {
              set({ progress: percentage });
            }
          }
        );

        if (response.success && response.type === "done" && response.metrics) {
          set({
            status: "idle",
            lastMetrics: response.metrics,
            isModified: true,
          });
          notify.success(
            "Filter Applied",
            `Last Operation Time: ${formatTime(response.metrics?.computeTime)}`
          );
        } else {
          throw new Error(response.error);
        }
      } catch (e) {
        const errorMessage = (e as Error).message;
        set({
          status: "error",
          error: errorMessage,
          progress: 0,
        });
        if (errorMessage === "Cancelled") return;
        notify.error("Filter failed.", errorMessage, 8000);
      }
    },

    reset: async () => {
      set({
        error: null,
        progress: 0,
        lastMetrics: null,
        isModified: false,
      });
      const { bitmap, info } = get();
      if (bitmap && info) {
        const newWorkerBitmap = await createImageBitmap(bitmap);
        workerHost.setImage(newWorkerBitmap, info.width, info.height);
      }
    },

    cancelProcessing: () => {
      const { status } = get();
      if (status !== "processing") return;

      workerHost.abortCurrTask();

      set({
        status: "idle",
        progress: 0,
      });

      notify.warning(
        "Canceled",
        "Operation was aborted by user. Filter was only partially applied! Reset image to its original state.",
        8000
      );
    },
  }))
);

export const useImageInfo = () => useImageStore((state) => state.info);
export const useImageBitmap = () => useImageStore((state) => state.bitmap);
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
