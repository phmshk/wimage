import type { WasmModule } from "@/shared/lib/wasm/filters";
import createWasmModule from "@/shared/lib/wasm/filters";
import { GAUSSIAN_BLUR_KERNEL_BYTES, PX_SIZE } from "./model/constants";
import type { FilterType } from "@/shared/lib/worker";
import type { FilterOptions } from "@/shared/lib/image-processing";
import { buildGaussianKernel } from "./model/helpers";

export class WasmEngine {
  private module: WasmModule | null = null;
  private isReady: boolean = false;

  // pointers for wasm
  private inputPtr: number = 0;
  private outputPtr: number = 0;
  private tmpPtr: number = 0;
  private kernelPtr: number = 0;

  // allocated memory in bytes
  private currAllocatedBytes: number = 0;

  public async init(): Promise<void> {
    if (this.isReady || this.module) return;

    try {
      this.module = await createWasmModule({
        locateFile: (path: string) => `${import.meta.env.BASE_URL}wasm/${path}`,
      });
      this.isReady = true;
    } catch (error) {
      console.error("Error while initializing WASM", error);
      this.isReady = false;
      throw new Error("WasmModule failded to load");
    }
  }

  // memory allocation
  private allocateMemory(byteSize: number): void {
    if (!this.module) throw new Error("MOdule not initialized");

    if (this.currAllocatedBytes < byteSize) {
      this.freeBuffers();

      this.inputPtr = this.module._malloc(byteSize);
      this.outputPtr = this.module._malloc(byteSize);
      this.tmpPtr = this.module._malloc(byteSize);
      this.kernelPtr = this.module._malloc(GAUSSIAN_BLUR_KERNEL_BYTES);

      this.currAllocatedBytes = byteSize;
    }
  }

  private freeBuffers(): void {
    if (!this.module) return;
    if (this.inputPtr) this.module._free(this.inputPtr);
    if (this.outputPtr) this.module._free(this.outputPtr);
    if (this.tmpPtr) this.module._free(this.tmpPtr);
    if (this.kernelPtr) this.module._free(this.kernelPtr);

    this.inputPtr = 0;
    this.outputPtr = 0;
    this.tmpPtr = 0;
    this.kernelPtr = 0;
    this.currAllocatedBytes = 0;
  }

  public prepareChunkBuffers(paddedWidth: number, paddedHeight: number) {
    if (!this.isReady || !this.module)
      throw new Error("WasmEngine is not initialized.");

    const byteSize = paddedWidth * paddedHeight * PX_SIZE;
    this.allocateMemory(byteSize);

    return {
      inputView: this.module.HEAPU8.subarray(
        this.inputPtr,
        this.inputPtr + byteSize
      ),
      inputPtr: this.inputPtr,
      outputPtr: this.outputPtr,
    };
  }

  public prepareGaussianKernel(radius: number): void {
    if (!this.isReady || !this.module) return;
    if (radius <= 0) return;

    const kernel = buildGaussianKernel(radius);
    this.module.HEAPF32.set(kernel, this.kernelPtr / 4);
  }

  public process(
    filterName: FilterType,
    width: number,
    height: number,
    options?: FilterOptions
  ): number {
    if (!this.isReady || !this.module)
      throw new Error("WasmEngine is not initialized. Call init().");

    const radius = options?.radius || 0;
    let resultPtr = this.outputPtr;

    switch (filterName) {
      case "grayscale": {
        this.module._apply_grayscale(this.inputPtr, width, height);
        resultPtr = this.inputPtr;
        break;
      }
      case "inversion": {
        this.module._apply_inversion(this.inputPtr, width, height);
        resultPtr = this.inputPtr;
        break;
      }
      case "sepia": {
        this.module._apply_sepia(this.inputPtr, width, height);
        resultPtr = this.inputPtr;
        break;
      }
      case "gaussian-blur": {
        if (radius > 0) {
          this.module._apply_gaussian_blur(
            this.inputPtr,
            this.kernelPtr,
            this.tmpPtr,
            this.outputPtr,
            width,
            height,
            radius
          );
        } else {
          resultPtr = this.inputPtr;
        }
        break;
      }
      case "sharpen": {
        this.module._apply_sharpen(
          this.inputPtr,
          this.outputPtr,
          width,
          height
        );
        break;
      }
      case "sobel": {
        this.module._apply_sobel(this.inputPtr, this.outputPtr, width, height);
        break;
      }
      case "bilateral": {
        this.module._apply_bilateral(
          this.inputPtr,
          this.outputPtr,
          width,
          height,
          radius
        );
        break;
      }
      case "kuwahara": {
        this.module._apply_kuwahara(
          this.inputPtr,
          this.outputPtr,
          width,
          height,
          radius
        );
        break;
      }
      case "median": {
        this.module._apply_median(
          this.inputPtr,
          this.outputPtr,
          this.tmpPtr,
          width,
          height,
          radius
        );
        break;
      }
      default: {
        throw new Error(`Unknown filter selected: ${filterName}`);
      }
    }

    return resultPtr;
  }

  public getResultView(
    resultPtr: number,
    paddedWidth: number,
    paddedHeight: number
  ): Uint8Array {
    const byteSize = paddedWidth * paddedHeight * PX_SIZE;
    return this.module!.HEAPU8.subarray(resultPtr, resultPtr + byteSize);
  }
}

export const wasmEngine = new WasmEngine();
