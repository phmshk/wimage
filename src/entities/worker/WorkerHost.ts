import type {
  WorkerResponse,
  FilterPayload,
  WorkerRequest,
  BenchmarkConfig,
  BenchmarkProgress,
  BenchmarkResult,
  ComputeEngine,
  Metrics,
  ProcessingProgress,
} from "@/shared/lib/worker/types";

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  onProgress?: (data: unknown) => void;
  cancelFlag?: Uint8Array;
}

export class WorkerHost {
  private worker: Worker | null = null;
  private pendingRequests: Map<string, PendingRequest> = new Map<
    string,
    PendingRequest
  >();
  private currentRequestId: string | null = null;

  private getWorker(): Worker {
    if (this.worker) return this.worker;

    if (typeof window === "undefined") {
      throw new Error("Worker cannot be initialized on the server (SSR)");
    }

    if (!window.Worker) {
      throw new Error("Web Workers are not supported in this browser");
    }

    this.worker = new Worker(new URL("./image.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = this.handleMessage.bind(this);
    this.worker.onerror = this.handleError.bind(this);

    return this.worker;
  }

  private sendRequest<TResponse, TProgress = never>(
    requestBuilder: (
      id: string,
      cancelBuffer?: SharedArrayBuffer
    ) => WorkerRequest,
    onProgress?: (progress: TProgress) => void
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();

      if (this.currentRequestId) {
        this.abortCurrTask();
      }

      this.currentRequestId = id;

      const supportsSAB = typeof SharedArrayBuffer !== "undefined";
      let cancelBuffer: SharedArrayBuffer | undefined;
      let cancelFlag: Uint8Array | undefined;

      if (supportsSAB) {
        cancelBuffer = new SharedArrayBuffer(1);
        cancelFlag = new Uint8Array(cancelBuffer);
        cancelFlag[0] = 0; // 0 - works, 1 - cancel
      }

      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        onProgress: onProgress as ((data: unknown) => void) | undefined,
        cancelFlag,
      });

      const request = requestBuilder(id, cancelBuffer);

      try {
        this.getWorker().postMessage(request);
      } catch (e) {
        this.pendingRequests.delete(id);
        reject(e instanceof Error ? e : new Error("Failed to post message"));
        this.currentRequestId = null;
      }
    });
  }

  public initOffscreen(canvas: OffscreenCanvas): void {
    this.getWorker().postMessage({ type: "init_canvas", canvas }, [canvas]);
  }

  public setImage(bitmap: ImageBitmap, width: number, height: number): void {
    const worker = this.getWorker();
    worker.postMessage(
      { type: "set_image", imageData: { bitmap, width, height } },
      [bitmap]
    );
  }

  public processImage(
    payload: FilterPayload,
    engine: ComputeEngine,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<Metrics> {
    return this.sendRequest<Metrics, ProcessingProgress>(
      (id, cancelBuffer) => ({
        type: "apply_filter",
        id,
        payload,
        engine,
        cancelBuffer,
      }),
      onProgress
    );
  }

  public runBenchmark(
    config: BenchmarkConfig,
    width: number,
    height: number,
    onProgress?: (progress: BenchmarkProgress) => void
  ): Promise<BenchmarkResult[]> {
    return this.sendRequest<BenchmarkResult[], BenchmarkProgress>(
      (id, cancelBuffer) => ({
        type: "run_benchmark",
        id,
        config,
        width,
        height,
        cancelBuffer,
      }),
      onProgress
    );
  }

  public abortCurrTask() {
    this.cancelProcessing();
  }

  private cancelProcessing() {
    if (this.currentRequestId) {
      const req = this.pendingRequests.get(this.currentRequestId);

      if (req) {
        if (req.cancelFlag) {
          req.cancelFlag[0] = 1;
        }
        req.reject(new Error("Cancelled"));
      }
      // fallback
      this.getWorker().postMessage({
        type: "cancel_filter",
        id: this.currentRequestId,
      });
      this.pendingRequests.delete(this.currentRequestId);
      this.currentRequestId = null;
    }
  }

  private handleMessage(event: MessageEvent<WorkerResponse>): void {
    const response = event.data;

    if (!("id" in response) || !response.id) return;

    const request = this.pendingRequests.get(response.id);
    if (!request) return;

    switch (response.type) {
      case "error":
        request.reject(new Error(response.error));
        this.pendingRequests.delete(response.id);
        this.currentRequestId = null;
        break;

      case "processing":
        if (request.onProgress) request.onProgress(response.progress);
        break;

      case "benchmark_running":
        if (request.onProgress) request.onProgress(response.progress);
        break;

      case "done":
        request.resolve(response.metrics);
        this.pendingRequests.delete(response.id);
        this.currentRequestId = null;
        break;

      case "benchmark_done":
        request.resolve(response.results);
        this.pendingRequests.delete(response.id);
        this.currentRequestId = null;
        break;
    }
  }

  private handleError(e: ErrorEvent) {
    console.error("Worker global error:", e);
    this.abortCurrTask();
    this.currentRequestId = null;
  }
}

export const workerHost = new WorkerHost();
