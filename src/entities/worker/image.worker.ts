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
} from "@/shared/lib/image-processing";
import type { WorkerRequest, WorkerResponse } from "@/shared/lib/worker";
import { applyFilterAndCrop, getChunkWithPadding } from "./model/helpers";
import {
  PX_SIZE,
  CHUNK_HEIGHT,
  CHUNK_WIDTH,
  CHUNK_PADDING,
} from "./model/constants";

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, type, buffer, payload } = e.data;
  const start = performance.now();

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

      const { filterName, width, height, options } = payload;

      const finalBuffer = new Uint8ClampedArray(width * height * PX_SIZE);
      const padding = options?.radius
        ? Math.ceil(options.radius)
        : CHUNK_PADDING;
      const totalChunks =
        Math.ceil(width / CHUNK_WIDTH) * Math.ceil(height / CHUNK_HEIGHT);
      let processedChunks = 0;

      for (let y = 0; y < height; y += CHUNK_HEIGHT) {
        for (let x = 0; x < width; x += CHUNK_WIDTH) {
          const currChunkWidth = Math.min(CHUNK_WIDTH, width - x);
          const currChunkHeight = Math.min(CHUNK_HEIGHT, height - y);

          const paddedChunk = getChunkWithPadding(
            x,
            y,
            width,
            height,
            buffer,
            currChunkWidth,
            currChunkHeight,
            padding
          );

          let resultChunk: Uint8ClampedArray;

          switch (filterName) {
            case "grayscale":
              resultChunk = applyFilterAndCrop(
                paddedChunk,
                applyGrayscale,
                currChunkWidth,
                currChunkHeight,
                padding,
                options
              );
              break;
            case "inversion":
              resultChunk = applyFilterAndCrop(
                paddedChunk,
                applyInversion,
                currChunkWidth,
                currChunkHeight,
                padding,
                options
              );
              break;
            case "sepia":
              resultChunk = applyFilterAndCrop(
                paddedChunk,
                applySepia,
                currChunkWidth,
                currChunkHeight,
                padding,
                options
              );
              break;
            case "gaussian-blur":
              resultChunk = applyFilterAndCrop(
                paddedChunk,
                applyGaussianBlur,
                currChunkWidth,
                currChunkHeight,
                padding,
                options
              );
              break;
            case "sobel":
              resultChunk = applyFilterAndCrop(
                paddedChunk,
                applySobel,
                currChunkWidth,
                currChunkHeight,
                padding,
                options
              );
              break;
            case "sharpen":
              resultChunk = applyFilterAndCrop(
                paddedChunk,
                applySharpen,

                currChunkWidth,
                currChunkHeight,
                padding,
                options
              );
              break;
            case "median":
              resultChunk = applyFilterAndCrop(
                paddedChunk,
                applyMedian,
                currChunkWidth,
                currChunkHeight,
                padding,
                options
              );
              break;
            case "kuwahara":
              resultChunk = applyFilterAndCrop(
                paddedChunk,
                applyKuwahara,
                currChunkWidth,
                currChunkHeight,
                padding,
                options
              );
              break;
            case "bilateral":
              resultChunk = applyFilterAndCrop(
                paddedChunk,
                applyBilateral,
                currChunkWidth,
                currChunkHeight,
                padding,
                options
              );
              break;
            default:
              throw new Error(`Unknown filter: ${filterName}`);
          }

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
          if (processedChunks % 5 === 0 || processedChunks === totalChunks) {
            self.postMessage(response, { transfer });
          }
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
