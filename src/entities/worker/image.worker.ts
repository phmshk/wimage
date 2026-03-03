import type { WorkerRequest, BenchmarkResult } from "@/shared/lib/worker";
import { FILTERS_META, getDefaultFilterOptions } from "@/shared/config";
import {
  CHUNK_HEIGHT,
  CHUNK_WIDTH,
  MAX_FILTER_RADIUS,
} from "./model/constants";
import { processImageChunks } from "./model/helpers";
import { wasmHost } from "./WasmHost";

let offscreenCtx: OffscreenCanvasRenderingContext2D | null = null;
let stagingCtx: OffscreenCanvasRenderingContext2D | null = null;
let stagingCanvas: OffscreenCanvas | null = null;

let currentWidth = 0;
let currentHeight = 0;
let isCancelled = false;

let pendingImageData: {
  bitmap: ImageBitmap;
  width: number;
  height: number;
} | null = null;

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const request = e.data;

  try {
    switch (request.type) {
      case "cancel_filter": {
        isCancelled = true;
        break;
      }
      case "init_canvas": {
        offscreenCtx = request.canvas.getContext("2d", {
          willReadFrequently: true,
        });
        await wasmHost.init(CHUNK_WIDTH, CHUNK_HEIGHT, MAX_FILTER_RADIUS);

        if (pendingImageData) {
          applyImageToCanvas(pendingImageData);
          pendingImageData = null;
        }
        break;
      }

      case "set_image": {
        if (!offscreenCtx) {
          if (pendingImageData) {
            pendingImageData.bitmap.close();
          }
          pendingImageData = request.imageData;
          break;
        }

        applyImageToCanvas(request.imageData);
        break;
      }
      case "apply_filter": {
        if (pendingImageData || !offscreenCtx || !stagingCtx) {
          throw new Error(
            "The image or canvas is not ready yet. Please wait."
          );
        }
        isCancelled = false;

        const metrics = await processImageChunks({
          sourceCtx: stagingCtx,
          width: currentWidth,
          height: currentHeight,
          filterName: request.payload.filterName,
          engine: request.engine,
          options: request.payload.options,
          cancelFlag: request.cancelBuffer
            ? new Uint8Array(request.cancelBuffer)
            : null,
          checkIsCancelled: () => isCancelled,

          onChunkDone: (
            paddedImageData,
            x,
            y,
            currentChunkW,
            currentChunkH,
            padding
          ) => {
            offscreenCtx!.putImageData(
              paddedImageData,
              x - padding,
              y - padding,
              padding,
              padding,
              currentChunkW,
              currentChunkH
            );
          },

          onProgressReport: (processed, total) => {
            self.postMessage({
              id: request.id,
              type: "processing",
              success: true,
              progress: { processed, total },
            });
          },
        });

        stagingCtx.drawImage(offscreenCtx.canvas, 0, 0);

        self.postMessage({
          type: "done",
          id: request.id,
          success: true,
          metrics,
        });
        break;
      }
      case "run_benchmark": {
        if (!stagingCtx) throw new Error("Canvas not ready");
        isCancelled = false;

        const resultsMap = new Map<string, BenchmarkResult>();

        const totalTasks =
          request.config.engines.length *
          request.config.filters.length *
          request.config.iterations;
        let currentTaskCount = 0;

        for (const filter of request.config.filters) {
          resultsMap.set(filter, {
            filterId: filter,
            filterName: FILTERS_META[filter].label,
            iterations: request.config.iterations,
          });
        }

        for (const engine of request.config.engines) {
          for (const filter of request.config.filters) {
            let totalComputeTime = 0;

            for (let i = 1; i <= request.config.iterations; i++) {
              const metrics = await processImageChunks({
                sourceCtx: stagingCtx,
                width: currentWidth,
                height: currentHeight,
                filterName: filter,
                engine,
                options: getDefaultFilterOptions(filter),
                cancelFlag: request.cancelBuffer
                  ? new Uint8Array(request.cancelBuffer)
                  : null,
                checkIsCancelled: () => isCancelled,
              });

              totalComputeTime += metrics.computeTime;
              currentTaskCount++;

              self.postMessage({
                id: request.id,
                type: "benchmark_running",
                success: true,
                progress: { current: currentTaskCount, total: totalTasks },
              });
            }

            const avgTimeMs = Number(
              (totalComputeTime / request.config.iterations).toFixed(1)
            );

            const filterResult = resultsMap.get(filter)!;
            if (engine === "js") {
              filterResult.jsTimeMs = avgTimeMs;
            } else if (engine === "wasm") {
              filterResult.wasmTimeMs = avgTimeMs;
            }
          }
        }

        const results = Array.from(resultsMap.values());

        self.postMessage({
          type: "benchmark_done",
          id: request.id,
          success: true,
          results,
        });
        break;
      }
      // case "run_benchmark": {
      //   if (!stagingCtx) throw new Error("Canvas not ready");
      //   isCancelled = false;
      //
      //   const results: BenchmarkResult[] = [];
      //   const totalTasks =
      //     request.config.engines.length *
      //     request.config.filters.length *
      //     request.config.iterations;
      //   let currentTaskCount = 0;
      //
      //   for (const engine of request.config.engines) {
      //     for (const filter of request.config.filters) {
      //       // benchmarking
      //       for (let i = 1; i <= request.config.iterations; i++) {
      //         const metrics = await processImageChunks({
      //           sourceCtx: stagingCtx,
      //           width: currentWidth,
      //           height: currentHeight,
      //           filterName: filter,
      //           engine,
      //           cancelFlag: request.cancelBuffer
      //             ? new Uint8Array(request.cancelBuffer)
      //             : null,
      //           checkIsCancelled: () => isCancelled,
      //         });
      //
      //         results.push({
      //           filterName: filter,
      //         });
      //
      //         currentTaskCount++;
      //         self.postMessage({
      //           id: request.id,
      //           type: "benchmark_progress",
      //           success: true,
      //           progress: { current: currentTaskCount, total: totalTasks },
      //         });
      //       }
      //     }
      //   }
      //
      //   self.postMessage({
      //     type: "benchmark_done",
      //     id: request.id,
      //     success: true,
      //     results,
      //   });
      //   break;
      // }
    }
  } catch (error) {
    if ((error as Error).message === "Cancelled") return;

    self.postMessage({
      id: "id" in request ? request.id : "system",
      type: "error",
      success: false,
      error: (error as Error).message || "Unknown worker error",
    });
  }
};

function applyImageToCanvas(imageData: {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}) {
  const { bitmap, width, height } = imageData;

  currentWidth = width;
  currentHeight = height;

  if (
    !stagingCanvas ||
    stagingCanvas.width !== width ||
    stagingCanvas.height !== height
  ) {
    stagingCanvas = new OffscreenCanvas(width, height);
    stagingCtx = stagingCanvas.getContext("2d", {
      willReadFrequently: true,
    });
  }

  stagingCtx!.drawImage(bitmap, 0, 0);

  offscreenCtx!.canvas.width = width;
  offscreenCtx!.canvas.height = height;

  offscreenCtx!.drawImage(stagingCanvas, 0, 0);

  bitmap.close();
}
