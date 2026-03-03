import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import type { ImageBitmapData, ImageState } from "./types";
import { workerHost } from "@/entities/worker/WorkerHost";
import { notify } from "@/shared/lib/notifications";
import type { FilterOptions } from "@/shared/lib/image-processing";
import type { FilterType, ComputeEngine } from "@/shared/lib/worker";

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
          size: data.size,
        },
        bitmap: data.bitmap,
        error: null,
        progress: 0,
        lastMetrics: null,
        isModified: false,
      });
      workerHost.setImage(data.workerBitmap, data.width, data.height);
    },

    applyFilter: async (
      filterName: FilterType,
      engine: ComputeEngine,
      options?: FilterOptions
    ) => {
      const { info, status } = get();

      if (!info) {
        set({ error: "No image loaded", status: "error" });
        return;
      }
      if (status === "processing") {
        return;
      }

      set({
        status: "processing",
        error: null,
        progress: 0,
        lastMetrics: null,
      });

      try {
        const metrics = await workerHost.processImage(
          { filterName, options, width: info.width, height: info.height },
          engine,
          (progress) => {
            const percent = Math.round(
              (progress.processed / progress.total) * 100
            );
            set({ progress: percent });
          }
        );

        set({
          status: "idle",
          isModified: true,
          lastMetrics: metrics,
          progress: 100,
        });
      } catch (error) {
        const errorMessage = (error as Error).message;

        if (errorMessage === "Cancelled") {
          set({ status: "idle", progress: 0 });
          return;
        }

        set({
          status: "error",
          error: errorMessage || "Failed to apply filter",
          progress: 0,
        });
        notify.error(
          "Filter failed.",
          errorMessage || "Unknown error in worker",
          8000
        );
      }
    },

    reset: async () => {
      set({
        status: "idle",
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
        "Operation was aborted by user. Image reset to its original state.",
        8000
      );

      // guarantee that worker will be able to throw an error and pause the loop
      // before getting new image
      setTimeout(() => {
        get().reset();
      }, 50);
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
      resetToOriginal: state.reset,
      cancelProcessing: state.cancelProcessing,
    }))
  );
