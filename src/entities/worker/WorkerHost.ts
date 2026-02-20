import type {
  WorkerResponse,
  FilterPayload,
  WorkerRequest,
  ChunkData,
} from "@/shared/lib/worker";

export class WorkerHost {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    {
      onProgress?: (chunk: ChunkData) => void;
      resolve: (res: WorkerResponse) => void;
      reject: (reason: unknown) => void;
    }
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

  private handleMessage(event: MessageEvent<WorkerResponse>) {
    const { id, success, type, error, chunk } = event.data;

    const request = this.pendingRequests.get(id);

    if (!request) return;

    if (!success) {
      request.reject(new Error(error || "Unknown worker error"));
      this.pendingRequests.delete(id);
      this.currentRequestId = null;
      return;
    }

    if (type === "processing") {
      if (request.onProgress && chunk) {
        request.onProgress(chunk);
      }
      return;
    }

    if (type === "done") {
      request.resolve(event.data);
      this.pendingRequests.delete(id);
      this.currentRequestId = null;
    }
  }

  private handleError(e: ErrorEvent) {
    console.error("Worker global error:", e);
    this.terminate();
    this.currentRequestId = null;
  }

  public processImage(
    imageData: Uint8ClampedArray,
    payload: FilterPayload,
    onProgress?: (chunk: ChunkData) => void
  ): Promise<WorkerResponse> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();

      if (this.currentRequestId) {
        this.terminate();
      }

      this.currentRequestId = id;
      this.pendingRequests.set(id, { resolve, reject, onProgress });

      const request: WorkerRequest = {
        id,
        type: "apply_filter",
        buffer: imageData,
        payload,
      };

      try {
        this.getWorker().postMessage(request, [imageData.buffer]);
      } catch (e) {
        this.pendingRequests.delete(id);
        reject(e);
        this.currentRequestId = null;
      }
    });
  }

  public terminate() {
    if (!this.worker) return;

    this.worker.terminate();
    this.worker = null;

    for (const [_, req] of this.pendingRequests) {
      req.reject(new Error("Worker terminated"));
    }

    this.pendingRequests.clear();
  }
}

export const workerHost = new WorkerHost();
