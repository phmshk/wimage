import type { FilterOptions } from "@/shared/lib/image-processing";
import type { FilterType, ComputeEngine } from "@/shared/lib/worker/types";
import { wasmHost } from "../WasmHost";
import {
  CHUNK_PADDING,
  MAX_FILTER_RADIUS,
  CHUNK_HEIGHT,
  CHUNK_WIDTH,
  jsFilters,
  FRAME_BUDGET_MS,
} from "./constants";

export interface ProcessChunksArgs {
  sourceCtx: OffscreenCanvasRenderingContext2D;
  width: number;
  height: number;
  filterName: FilterType;
  engine: ComputeEngine;
  options?: FilterOptions;
  cancelFlag?: Uint8Array | null;
  checkIsCancelled?: () => boolean;

  // pinting to canvas
  onChunkDone?: (
    paddedImageData: ImageData,
    x: number,
    y: number,
    currentChunkW: number,
    currentChunkH: number,
    padding: number
  ) => void;

  // progress bar callback
  onProgressReport?: (processed: number, total: number) => void | Promise<void>;
}

export async function processImageChunks(args: ProcessChunksArgs) {
  const {
    sourceCtx,
    width,
    height,
    filterName,
    engine,
    options,
    cancelFlag,
    checkIsCancelled,
    onChunkDone,
    onProgressReport,
  } = args;

  let padding = options?.radius ?? CHUNK_PADDING;
  if (engine === "wasm" && padding > MAX_FILTER_RADIUS) {
    console.warn(
      `[Worker] Radius ${padding} exceeds MAX_FILTER_RADIUS. Clamping to ${MAX_FILTER_RADIUS}.`
    );
    padding = MAX_FILTER_RADIUS;
  }

  const totalPixels = width * height;
  let processedPixels = 0;
  let totalCoreTime = 0;

  const startTime = performance.now();
  let lastYieldTime = performance.now();

  for (let y = 0; y < height; y += CHUNK_HEIGHT) {
    for (let x = 0; x < width; x += CHUNK_WIDTH) {
      if (
        (cancelFlag && cancelFlag[0] === 1) ||
        (checkIsCancelled && checkIsCancelled())
      ) {
        throw new Error("Cancelled");
      }

      const currentChunkW = Math.min(CHUNK_WIDTH, width - x);
      const currentChunkH = Math.min(CHUNK_HEIGHT, height - y);

      const paddedWidth = currentChunkW + padding * 2;
      const paddedHeight = currentChunkH + padding * 2;

      const paddedImageData = sourceCtx.getImageData(
        x - padding,
        y - padding,
        paddedWidth,
        paddedHeight
      );

      if (engine === "js") {
        const filterFn = jsFilters[filterName];
        if (!filterFn)
          throw new Error(`Filter "${filterName}" is not implemented in JS.`);

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
        const resultPixels = wasmHost.applyFilter(
          filterName,
          paddedImageData.data,
          paddedWidth,
          paddedHeight,
          padding
        );
        totalCoreTime += resultPixels.pureComputeTime;
        paddedImageData.data.set(resultPixels.data);
      }

      if (onChunkDone) {
        onChunkDone(
          paddedImageData,
          x,
          y,
          currentChunkW,
          currentChunkH,
          padding
        );
      }

      processedPixels += currentChunkW * currentChunkH;

      const now = performance.now();
      if (
        now - lastYieldTime > FRAME_BUDGET_MS ||
        processedPixels === totalPixels
      ) {
        if (onProgressReport) {
          await onProgressReport(processedPixels, totalPixels);
        }
        if (typeof SharedArrayBuffer === "undefined") {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
        lastYieldTime = performance.now();
      }
    }
  }

  return {
    computeTime: totalCoreTime,
    totalTime: performance.now() - startTime,
  };
}

/* ==== Filters from previous version of application. Just dont want to delete them, because spent a lot of time makeng them :) ====
 * Extracts a specific chunk from an image data array
 * including an additional padding around the edges
 * @param startX - X coordinate of the top-left corner of the main chunk
 * @param startY - Y coordinate of the top-left corner of the main chunk
 * @param originalWidth -  width of the source image in pixels
 * @param originalHeight - height of the source image in pixels
 * @param originalData - raw RGBA image data (Uint8ClampedArray)
 * @param chunkWidth - width of the chunk (default: 256)
 * @param chunkHeight - height of the chunk (default: 256)
 * @param padding - number of extra pixels to include on each side (default: 2) !!!!!! if filter has radius in options it MUST be used as padding
 * * @returns new Uint8ClampedArray containing the padded chunk
export const getChunkWithPadding = (
  startX: number,
  startY: number,
  originalWidth: number,
  originalHeight: number,
  originalData: Uint8ClampedArray,
  chunkWidth: number,
  chunkHeight: number,
  padding: number
): Uint8ClampedArray => {
  // calculate dimensions of the new chunk including the padding
  const paddedWidth = chunkWidth + padding * 2;
  const paddedHeight = chunkHeight + padding * 2;
  // allocate memory for the new chunk
  const chunkData = new Uint8ClampedArray(paddedWidth * paddedHeight * PX_SIZE);

  // iterate through every row of the padded chunk
  for (let y = 0; y < paddedHeight; y++) {
    // map current row in the chunk to the row in the original image
    const originalY = startY - padding + y;

    // if calculated Y is outside the original image => skip this row
    if (originalY < 0 || originalY >= originalHeight) continue;

    // calculate where to start reading X in the original image
    let currentStartX = startX - padding;
    let currentReadWidth = paddedWidth;

    // destOffset is the shift inside the new chunk
    // usually 0 unless we are at the left edge of the image
    let destOffset = 0;
    // left edge check
    // if currentStartX is negative => we are off the left edge

    if (currentStartX < 0) {
      destOffset = Math.abs(currentStartX);
      currentReadWidth -= destOffset;
      currentStartX = 0;
    }

    // right edge check
    // calculate how many pixels exist from current X to the right edge of the image
    const remainingWidth = originalWidth - currentStartX;
    const actualWidthToRead = Math.min(currentReadWidth, remainingWidth);

    // if there is no width left to read skip
    if (actualWidthToRead <= 0) continue;

    const srcStartIndex = (originalY * originalWidth + currentStartX) * PX_SIZE;
    const destStartIndex = (y * paddedWidth + destOffset) * PX_SIZE;
    const rowBytes = actualWidthToRead * PX_SIZE;

    chunkData.set(
      originalData.subarray(srcStartIndex, srcStartIndex + rowBytes),
      destStartIndex
    );
  }

  return chunkData;
};

 * Processes a padded image chunk using a filter function and crops
 * the result back to the original chunk dimensions.
 * @param paddedChunk - input data array including padding
 * @param filterFn - callback function that applies the image filter
 * @param options - options nedded for callback function
 * @param chunkWidth - width of the final chunk without padding
 * @param chunkHeight - height of the final chunk without padding
 * @param padding - size of the margin to be removed from all sides
 * @returns new Uint8ClampedArray of the exact chunk dimensions
export const applyFilterAndCrop = (
  paddedChunk: Uint8ClampedArray,
  filterFn: FilterProcessFn,
  chunkWidth: number,
  chunkHeight: number,
  padding: number,
  options?: FilterOptions
): Uint8ClampedArray => {
  const paddedWidth = chunkWidth + padding * 2;
  const paddedHeight = chunkHeight + padding * 2;
  const filteredPadded = filterFn(
    paddedChunk,
    paddedWidth,
    paddedHeight,
    options
  );

  const cleanResult = new Uint8ClampedArray(chunkWidth * chunkHeight * PX_SIZE);

  for (let y = 0; y < chunkHeight; y++) {
    const srcIndex = ((y + padding) * paddedWidth + padding) * PX_SIZE;
    const destIndex = y * chunkWidth * PX_SIZE;
    const rowBytes = chunkWidth * PX_SIZE;

    cleanResult.set(
      filteredPadded.subarray(srcIndex, srcIndex + rowBytes),
      destIndex
    );
  }

  return cleanResult;
};

*/
