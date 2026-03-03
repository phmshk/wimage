import createWasmModule, { type WasmModule } from "@/shared/lib/wasm/filters";
import type { FilterType } from "@/shared/lib/worker";

export class WasmHost {
  private wasmModule: WasmModule | null = null;

  private pixelsPtr: number = 0;
  private outputPtr: number = 0;
  private tempPtr: number = 0;
  private kernelPtr: number = 0;

  private maxByteSize: number = 0;

  public async init(
    maxChunkWidth: number,
    maxChunkHeight: number,
    maxPadding: number,
  ): Promise<void> {
    if (this.wasmModule) return;

    this.wasmModule = await createWasmModule({
      locateFile: (path: string) => `${import.meta.env.BASE_URL}wasm/${path}`,
    });

    const maxWidth = maxChunkWidth + maxPadding * 2;
    const maxHeight = maxChunkHeight + maxPadding * 2;
    this.maxByteSize = maxWidth * maxHeight * 4;

    this.pixelsPtr = this.wasmModule._malloc(this.maxByteSize);
    this.outputPtr = this.wasmModule._malloc(this.maxByteSize);
    this.tempPtr = this.wasmModule._malloc(this.maxByteSize);
    this.kernelPtr = this.wasmModule._malloc(1024 * 4);
  }

  public getPixelsView(width: number, height: number): Uint8ClampedArray {
    if (!this.wasmModule) throw new Error("Not initialized");
    return new Uint8ClampedArray(
      this.wasmModule.HEAPU8.buffer,
      this.pixelsPtr,
      width * height * 4,
    );
  }

  public getPixelsUint32View(width: number, height: number): Uint32Array {
    if (!this.wasmModule) throw new Error("Not initialized");
    return new Uint32Array(
      this.wasmModule.HEAPU8.buffer,
      this.pixelsPtr,
      width * height,
    );
  }

  public applyFilter(
    filterName: FilterType,
    width: number, // Data is already in WASM memory
    height: number,
    radiusOrPadding: number,
  ): { data: Uint8ClampedArray; pureComputeTime: number } {
    if (!this.wasmModule) {
      throw new Error(
        "WASM environment is not initialized. Call init() first.",
      );
    }

    const currentByteSize = width * height * 4;

    const pixelsView = new Uint8ClampedArray(
      this.wasmModule.HEAPU8.buffer,
      this.pixelsPtr,
      currentByteSize,
    );
    const outputView = new Uint8ClampedArray(
      this.wasmModule.HEAPU8.buffer,
      this.outputPtr,
      currentByteSize,
    );

    let resultView = pixelsView;

    const t0 = performance.now();
    switch (filterName) {
      case "grayscale":
        this.wasmModule._apply_grayscale(this.pixelsPtr, width, height);
        break;
      case "inversion":
        this.wasmModule._apply_inversion(this.pixelsPtr, width, height);
        break;
      case "sepia":
        this.wasmModule._apply_sepia(this.pixelsPtr, width, height);
        break;

      case "sharpen":
        this.wasmModule._apply_sharpen(
          this.pixelsPtr,
          this.outputPtr,
          width,
          height,
        );
        resultView = outputView;
        break;
      case "sobel":
        this.wasmModule._apply_sobel(
          this.pixelsPtr,
          this.outputPtr,
          width,
          height,
        );
        resultView = outputView;
        break;
      case "gaussian-blur":
        this.wasmModule._apply_gaussian_blur(
          this.pixelsPtr,
          this.kernelPtr,
          this.tempPtr,
          this.outputPtr,
          width,
          height,
          radiusOrPadding,
        );
        resultView = outputView;
        break;

      case "bilateral":
        this.wasmModule._apply_bilateral(
          this.pixelsPtr,
          this.outputPtr,
          width,
          height,
          radiusOrPadding,
        );
        resultView = outputView;
        break;
      case "kuwahara":
        this.wasmModule._apply_kuwahara(
          this.pixelsPtr,
          this.outputPtr,
          width,
          height,
          radiusOrPadding,
        );
        resultView = outputView;
        break;
      case "median":
        this.wasmModule._apply_median(
          this.pixelsPtr,
          this.outputPtr,
          this.tempPtr,
          width,
          height,
          radiusOrPadding,
        );
        resultView = outputView;
        break;

      default:
        throw new Error(
          `WASM implementation for filter "${filterName}" is missing.`,
        );
    }
    const t1 = performance.now();
    const pureComputeTime = t1 - t0;

    return { data: resultView, pureComputeTime };
  }
}

export const wasmHost = new WasmHost();
