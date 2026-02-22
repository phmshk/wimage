export interface WasmModule {
  _malloc(size: number): number;
  _free(ptr: number): void;

  HEAPU8: Uint8Array;
  HEAPF32: Float32Array;

  // Light Filters
  _apply_grayscale(pixelsPtr: number, width: number, height: number): void;
  _apply_inversion(pixelsPtr: number, width: number, height: number): void;
  _apply_sepia(pixelsPtr: number, width: number, height: number): void;

  // Medium Filters
  _apply_sharpen(
    pixelsPtr: number,
    outputPtr: number,
    width: number,
    height: number
  ): void;
  _apply_sobel(
    pixelsPtr: number,
    outputPtr: number,
    width: number,
    height: number
  ): void;
  _apply_gaussian_blur(
    pixelsPtr: number,
    kernelPtr: number,
    tempPtr: number,
    outputPtr: number,
    width: number,
    height: number,
    radius: number
  ): void;

  // Heavy Filters
  _apply_bilateral(
    pixelsPtr: number,
    outputPtr: number,
    width: number,
    height: number,
    radius: number
  ): void;
  _apply_kuwahara(
    pixelsPtr: number,
    outputPtr: number,
    width: number,
    height: number,
    radius: number
  ): void;
  _apply_median(
    pixelsPtr: number,
    outputPtr: number,
    tempPtr: number,
    width: number,
    height: number,
    radius: number
  ): void;
}

export interface WasmConfig {
  locateFile?: (path: string, scriptDirectory: string) => string;
  mainScriptUrlOrBlob?: string;
}

export default function createWasmModule(
  config?: WasmConfig
): Promise<WasmModule>;
