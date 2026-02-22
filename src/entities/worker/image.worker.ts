import type {
  FilterPayload,
  WorkerRequest,
  WorkerResponse,
} from "@/shared/lib/worker";

import {
  CHUNK_HEIGHT,
  CHUNK_PADDING,
  CHUNK_WIDTH,
  FRAME_BUDGET_MS,
  jsFilters,
  MAX_FILTER_RADIUS,
} from "./model/constants";
import { wasmHost } from "./WasmHost";

let offscreenCtx: OffscreenCanvasRenderingContext2D | null = null;

let stagingCanvas: OffscreenCanvas | null = null;
let stagingCtx: OffscreenCanvasRenderingContext2D | null = null;
let pendingImageData: {
  bitmap: ImageBitmap;
  width: number;
  height: number;
} | null = null;
let isCancelled = false;

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { type, id, payload, canvas, imageData, cancelBuffer, engine } = e.data;

  try {
    if (type === "cancel_filter") {
      isCancelled = true;
      return;
    }

    if (type === "init_canvas" && canvas) {
      offscreenCtx = canvas.getContext("2d", { willReadFrequently: true });
      await wasmHost.init(canvas.width, canvas.height, MAX_FILTER_RADIUS);
      if (pendingImageData) {
        applyImageToCanvas(pendingImageData);
        pendingImageData = null;
      }
      return;
    }

    if (type === "set_image" && imageData) {
      if (!offscreenCtx) {
        pendingImageData = imageData;
        return;
      }
      applyImageToCanvas(imageData);

      return;
    }

    if (type === "apply_filter" && id && payload) {
      isCancelled = false;
      await runFilterBenchmark(id, payload, engine, cancelBuffer);
      return;
    }
  } catch (error) {
    const errResponse: WorkerResponse = {
      id: id || "unknown",
      type: "error",
      success: false,
      error: (error as Error).message || "Unknown worker error",
    };
    self.postMessage(errResponse);
  }
};

async function runFilterBenchmark(
  id: string,
  payload: FilterPayload,
  engine: "js" | "wasm",
  cancelBuffer?: SharedArrayBuffer
) {
  if (!offscreenCtx) throw new Error("Canvas not ready");

  const { width, height, filterName, options } = payload;

  let padding = options?.radius ?? CHUNK_PADDING;
  if (engine === "wasm" && padding > MAX_FILTER_RADIUS) {
    console.warn(
      `[Worker] Radius ${padding} exceeds MAX_FILTER_RADIUS. Clamping to ${MAX_FILTER_RADIUS}.`
    );
    padding = MAX_FILTER_RADIUS;
  }

  if (
    !stagingCanvas ||
    stagingCanvas.width !== width ||
    stagingCanvas.height !== height
  ) {
    stagingCanvas = new OffscreenCanvas(width, height);
    stagingCtx = stagingCanvas.getContext("2d", { willReadFrequently: true });
  }
  stagingCtx!.drawImage(offscreenCtx.canvas, 0, 0);

  let processedPixels = 0;
  const totalPixels = width * height;

  const startTime = performance.now();
  let lastYieldTime = performance.now();

  const cancelFlag = cancelBuffer ? new Uint8Array(cancelBuffer) : null;
  let totalCoreTime = 0;

  for (let y = 0; y < height; y += CHUNK_HEIGHT) {
    for (let x = 0; x < width; x += CHUNK_WIDTH) {
      if ((cancelFlag && cancelFlag[0] === 1) || isCancelled) {
        return;
      }

      const currentChunkW = Math.min(CHUNK_WIDTH, width - x); //
      const currentChunkH = Math.min(CHUNK_HEIGHT, height - y); //

      // native padding calculation
      const paddedWidth = currentChunkW + padding * 2;
      const paddedHeight = currentChunkH + padding * 2;

      const paddedImageData = stagingCtx!.getImageData(
        x - padding,
        y - padding,
        paddedWidth,
        paddedHeight
      );

      if (engine === "js") {
        const filterFn = jsFilters[filterName];
        if (!filterFn) {
          throw new Error(
            `Filter "${filterName}" is not implemented in JS engine.`
          );
        }
        const t0 = performance.now();

        const resultPixels = filterFn(
          paddedImageData.data,
          paddedWidth,
          paddedHeight,
          options
        );
        totalCoreTime += performance.now() - t0;

        if (resultPixels && resultPixels !== paddedImageData.data) {
          paddedImageData.data.set(resultPixels);
        }
      } else if (engine === "wasm") {
        const t0 = performance.now();

        const resultPixels = wasmHost.applyFilter(
          filterName,
          paddedImageData.data,
          paddedWidth,
          paddedHeight,
          padding
        );
        totalCoreTime += performance.now() - t0;

        paddedImageData.data.set(resultPixels);
      }

      // native crop
      offscreenCtx.putImageData(
        paddedImageData,
        x - padding,
        y - padding,
        padding,
        padding,
        currentChunkW,
        currentChunkH
      );

      processedPixels += currentChunkW * currentChunkH;

      const now = performance.now();
      if (now - lastYieldTime > FRAME_BUDGET_MS) {
        self.postMessage({
          id,
          type: "processing",
          success: true,
          chunk: {
            x,
            y,
            width: currentChunkW,
            height: currentChunkH,
            progress: { processed: processedPixels, total: totalPixels },
          },
        });

        if (typeof SharedArrayBuffer === "undefined") {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
        lastYieldTime = performance.now();
      }
    }
  }

  const endTime = performance.now();
  console.log(
    `🚀 [${engine.toUpperCase()}] "${filterName}" Core Time: ${totalCoreTime.toFixed(2)}ms ` +
      `(Total with overhead: ${(endTime - startTime).toFixed(2)}ms)`
  );

  self.postMessage({
    id,
    type: "done",
    success: true,
    metrics: {
      computeTime: endTime - startTime,
    },
  });
}

function applyImageToCanvas(imageData: {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}) {
  const { bitmap, width, height } = imageData;

  offscreenCtx!.canvas.width = width;
  offscreenCtx!.canvas.height = height;

  offscreenCtx!.drawImage(bitmap, 0, 0);

  bitmap.close();
}
