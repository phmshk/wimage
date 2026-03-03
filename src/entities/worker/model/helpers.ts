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

      const paddedImageData = getPaddedImageDataClamped({
        sourceCtx,
        width,
        height,
        x,
        y,
        currentChunkW,
        currentChunkH,
        padding,
      });

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

function getPaddedImageDataClamped(args: {
  sourceCtx: OffscreenCanvasRenderingContext2D;
  width: number;
  height: number;
  x: number;
  y: number;
  currentChunkW: number;
  currentChunkH: number;
  padding: number;
}): ImageData {
  const { sourceCtx, width, height, x, y, currentChunkW, currentChunkH, padding } =
    args;

  const paddedWidth = currentChunkW + padding * 2;
  const paddedHeight = currentChunkH + padding * 2;
  const out = new ImageData(paddedWidth, paddedHeight);

  const srcX0 = x - padding;
  const srcY0 = y - padding;
  const srcX1 = x + currentChunkW + padding;
  const srcY1 = y + currentChunkH + padding;

  const cx0 = clampInt(srcX0, 0, width);
  const cy0 = clampInt(srcY0, 0, height);
  const cx1 = clampInt(srcX1, 0, width);
  const cy1 = clampInt(srcY1, 0, height);

  const cw = cx1 - cx0;
  const ch = cy1 - cy0;
  if (cw <= 0 || ch <= 0) return out;

  const clamped = sourceCtx.getImageData(cx0, cy0, cw, ch);
  const offsetX = cx0 - srcX0;
  const offsetY = cy0 - srcY0;

  for (let row = 0; row < ch; row++) {
    const srcRowStart = row * cw * 4;
    const dstRowStart = ((offsetY + row) * paddedWidth + offsetX) * 4;
    out.data.set(
      clamped.data.subarray(srcRowStart, srcRowStart + cw * 4),
      dstRowStart
    );
  }

  const minX = offsetX;
  const maxX = offsetX + cw - 1;
  const minY = offsetY;
  const maxY = offsetY + ch - 1;

  for (let yy = 0; yy < paddedHeight; yy++) {
    const ySrc = clampInt(yy, minY, maxY);
    for (let xx = 0; xx < paddedWidth; xx++) {
      const xSrc = clampInt(xx, minX, maxX);
      const srcIdx = (ySrc * paddedWidth + xSrc) * 4;
      const dstIdx = (yy * paddedWidth + xx) * 4;
      out.data[dstIdx] = out.data[srcIdx];
      out.data[dstIdx + 1] = out.data[srcIdx + 1];
      out.data[dstIdx + 2] = out.data[srcIdx + 2];
      out.data[dstIdx + 3] = out.data[srcIdx + 3];
    }
  }

  return out;
}

function clampInt(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value;
}
