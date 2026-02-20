import {
  applyBilateral,
  applyGaussianBlur,
  applyGrayscale,
  applyInversion,
  applyKuwahara,
  applyMedian,
  applySepia,
  applySharpen,
  applySobel,
  type FilterProcessFn,
} from "@/shared/lib/image-processing";
import type {
  WorkerRequest,
  WorkerResponse,
  FilterType,
} from "@/shared/lib/worker";
import { extractAndCropChunk, getChunkWithPadding } from "./model/helpers";
import {
  PX_SIZE,
  CHUNK_HEIGHT,
  CHUNK_WIDTH,
  CHUNK_PADDING,
} from "./model/constants";
import { wasmEngine } from "./WasmEngine";

const jsFilters: Record<FilterType, FilterProcessFn> = {
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

wasmEngine.init().catch((err) => console.error("Wasm init failed:", err));

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, type, buffer, payload } = e.data;

  try {
    if (type === "init") return;

    if (type === "ping") {
      self.postMessage({ id, success: true } as WorkerResponse);
      return;
    }

    if (type === "apply_filter") {
      if (!buffer || !payload) {
        throw new Error("No buffer or payload provided");
      }

      const start = performance.now();
      const { filterName, width, height, options, engine } = payload;

      if (engine === "wasm") {
        await wasmEngine.init();
      }

      const finalBuffer = new Uint8ClampedArray(width * height * PX_SIZE);
      const padding = options?.radius
        ? Math.ceil(options.radius)
        : CHUNK_PADDING;
      const totalChunks =
        Math.ceil(width / CHUNK_WIDTH) * Math.ceil(height / CHUNK_HEIGHT);
      let processedChunks = 0;

      const maxPaddedWidth = CHUNK_WIDTH + padding * 2;
      const maxPaddedHeight = CHUNK_HEIGHT + padding * 2;
      const maxByteSize = maxPaddedWidth * maxPaddedHeight * PX_SIZE;

      let wasmViews: {
        inputView: Uint8Array;
        inputPtr: number;
        outputPtr: number;
      } | null = null;
      let jsPaddedBuffer: Uint8ClampedArray | null = null;
      let activeFilterFn: FilterProcessFn | null = null;

      if (engine === "wasm") {
        wasmViews = wasmEngine.prepareChunkBuffers(
          maxPaddedWidth,
          maxPaddedHeight
        );
        if (filterName === "gaussian-blur" && options?.radius) {
          wasmEngine.prepareGaussianKernel(options.radius);
        }
      } else {
        activeFilterFn = jsFilters[filterName];
        if (!activeFilterFn)
          throw new Error(`Unknown JS filter: ${filterName}`);
        jsPaddedBuffer = new Uint8ClampedArray(maxByteSize);
      }

      for (let y = 0; y < height; y += CHUNK_HEIGHT) {
        for (let x = 0; x < width; x += CHUNK_WIDTH) {
          const currChunkWidth = Math.min(CHUNK_WIDTH, width - x);
          const currChunkHeight = Math.min(CHUNK_HEIGHT, height - y);

          const currPaddedWidth = currChunkWidth + padding * 2;
          const currPaddedHeight = currChunkHeight + padding * 2;
          const targetBuffer =
            engine === "wasm" ? wasmViews!.inputView : jsPaddedBuffer!;

          getChunkWithPadding(
            x,
            y,
            width,
            height,
            buffer,
            currChunkWidth,
            currChunkHeight,
            padding,
            targetBuffer
          );

          let processedPaddedBuffer: Uint8Array | Uint8ClampedArray;

          if (engine === "wasm") {
            const resultPtr = wasmEngine.process(
              filterName,
              currPaddedWidth,
              currPaddedHeight,
              options
            );
            processedPaddedBuffer = wasmEngine.getResultView(
              resultPtr,
              currPaddedWidth,
              currPaddedHeight
            );
          } else {
            processedPaddedBuffer = activeFilterFn!(
              targetBuffer as Uint8ClampedArray,
              currPaddedWidth,
              currPaddedHeight,
              options
            );
          }

          const resultChunk = extractAndCropChunk(
            processedPaddedBuffer,
            currChunkWidth,
            currChunkHeight,
            padding
          );

          for (let cy = 0; cy < currChunkHeight; cy++) {
            const destStart = ((y + cy) * width + x) * PX_SIZE;
            const srcStart = cy * currChunkWidth * PX_SIZE;
            const rowBytes = currChunkWidth * PX_SIZE;

            finalBuffer.set(
              resultChunk.subarray(srcStart, srcStart + rowBytes),
              destStart
            );
          }

          const transfer: Transferable[] = resultChunk
            ? [resultChunk.buffer]
            : [];

          processedChunks++;

          const response: WorkerResponse = {
            id,
            success: true,
            type: "processing",
            chunk: {
              data: resultChunk,
              width: currChunkWidth,
              height: currChunkHeight,
              x,
              y,
              progress: { processed: processedChunks, total: totalChunks },
            },
          };
          self.postMessage(response, { transfer });
        }
      }

      const end = performance.now();

      const response: WorkerResponse = {
        id,
        type: "done",
        success: true,
        buffer: finalBuffer,
        metrics: { computeTime: end - start },
      };

      const transfer: Transferable[] = finalBuffer ? [finalBuffer.buffer] : [];

      self.postMessage(response, { transfer });
    }
  } catch (e) {
    self.postMessage({
      id,
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    } as WorkerResponse);
  }
};
