import type { FilterOptions } from "@/shared/lib/image-processing";
import type { FilterType, ComputeEngine } from "@/shared/lib/worker";
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

class BufferPool {
  private buffer: Uint8ClampedArray | null = null;
  private uint32View: Uint32Array | null = null;
  private size: number = 0;

  getBuffer(width: number, height: number): Uint8ClampedArray {
    const neededSize = width * height * 4;
    if (!this.buffer || this.size < neededSize) {
      this.buffer = new Uint8ClampedArray(neededSize);
      this.uint32View = new Uint32Array(this.buffer.buffer);
      this.size = neededSize;
    }
    return this.buffer;
  }

  getUint32View(width: number, height: number): Uint32Array {
    this.getBuffer(width, height);
    return this.uint32View!;
  }
}

const pool = new BufferPool();

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

      let resultData: Uint8ClampedArray;

      if (engine === "js") {
        const pooledBuffer = pool.getBuffer(paddedWidth, paddedHeight);
        const pooledUint32 = pool.getUint32View(paddedWidth, paddedHeight);

        fillPaddedBufferClamped({
          sourceCtx,
          width,
          height,
          x,
          y,
          currentChunkW,
          currentChunkH,
          padding,
          outUint32: pooledUint32,
        });

        const filterFn = jsFilters[filterName];
        if (!filterFn)
          throw new Error(`Filter "${filterName}" is not implemented in JS.`);

        const t0 = performance.now();
        const resultPixels = filterFn(
          pooledBuffer,
          paddedWidth,
          paddedHeight,
          options
        );
        totalCoreTime += performance.now() - t0;
        resultData = resultPixels || pooledBuffer;
      } else {
        // WASM Engine - Zero-Copy approach
        const wasmUint32 = wasmHost.getPixelsUint32View(
          paddedWidth,
          paddedHeight,
        );

        fillPaddedBufferClamped({

          sourceCtx,
          width,
          height,
          x,
          y,
          currentChunkW,
          currentChunkH,
          padding,
          outUint32: wasmUint32,
        });

        const result = wasmHost.applyFilter(
          filterName,
          paddedWidth,
          paddedHeight,
          padding
        );
        totalCoreTime += result.pureComputeTime;
        resultData = result.data;
      }

      if (onChunkDone) {
        const imageData = new ImageData(
          resultData as ImageDataArray,
          paddedWidth,
          paddedHeight
        );
        onChunkDone(imageData, x, y, currentChunkW, currentChunkH, padding);
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

function fillPaddedBufferClamped(args: {
  sourceCtx: OffscreenCanvasRenderingContext2D;
  width: number;
  height: number;
  x: number;
  y: number;
  currentChunkW: number;
  currentChunkH: number;
  padding: number;
  outUint32: Uint32Array;
}): void {
  const {
    sourceCtx,
    width,
    height,
    x,
    y,
    currentChunkW,
    currentChunkH,
    padding,
    outUint32,
  } = args;

  const paddedWidth = currentChunkW + padding * 2;
  const paddedHeight = currentChunkH + padding * 2;

  const srcX0 = x - padding;
  const srcY0 = y - padding;

  const cx0 = Math.max(srcX0, 0);
  const cy0 = Math.max(srcY0, 0);
  const cx1 = Math.min(x + currentChunkW + padding, width);
  const cy1 = Math.min(y + currentChunkH + padding, height);

  const cw = cx1 - cx0;
  const ch = cy1 - cy0;

  if (cw <= 0 || ch <= 0) return;

  const clampedData = sourceCtx.getImageData(cx0, cy0, cw, ch).data;
  const clampedUint32 = new Uint32Array(clampedData.buffer);

  const offsetX = cx0 - srcX0;
  const offsetY = cy0 - srcY0;

  // 1. Copy main image data using Uint32 (much faster)
  for (let row = 0; row < ch; row++) {
    const srcStart = row * cw;
    const dstStart = (offsetY + row) * paddedWidth + offsetX;
    outUint32.set(clampedUint32.subarray(srcStart, srcStart + cw), dstStart);
  }

  // 2. Fill edges (clamping)
  const minX = offsetX;
  const maxX = offsetX + cw - 1;
  const minY = offsetY;
  const maxY = offsetY + ch - 1;

  // Fill top and bottom horizontal bars
  for (let yy = 0; yy < paddedHeight; yy++) {
    if (yy >= minY && yy <= maxY) continue; // Skip main data rows
    const ySrc = yy < minY ? minY : maxY;
    const srcRowStart = ySrc * paddedWidth;
    const dstRowStart = yy * paddedWidth;
    outUint32.set(
      outUint32.subarray(srcRowStart, srcRowStart + paddedWidth),
      dstRowStart
    );
  }

  // Fill left and right vertical bars
  for (let yy = 0; yy < paddedHeight; yy++) {
    const rowStart = yy * paddedWidth;
    const leftVal = outUint32[rowStart + minX];
    const rightVal = outUint32[rowStart + maxX];

    for (let xx = 0; xx < minX; xx++) {
      outUint32[rowStart + xx] = leftVal;
    }
    for (let xx = maxX + 1; xx < paddedWidth; xx++) {
      outUint32[rowStart + xx] = rightVal;
    }
  }
}
