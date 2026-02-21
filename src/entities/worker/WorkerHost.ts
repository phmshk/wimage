import type {
  WorkerResponse,
  FilterPayload,
  WorkerRequest,
} from "@/shared/lib/worker";
import type { ChunkData } from "@/shared/lib/worker/types";

export class WorkerHost {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    {
      resolve: (res: WorkerResponse) => void;
      reject: (reason: unknown) => void;
      onProgress?: (chunk: ChunkData) => void;
      cancelFlag?: Uint8Array;
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
    onProgress?: (chunk: ChunkData) => void
  ): Promise<WorkerResponse> {
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

      this.pendingRequests.set(id, { resolve, reject, onProgress, cancelFlag });

      const request: WorkerRequest = {
        id,
        type: "apply_filter",
        payload,
        cancelBuffer,
      };

      try {
        this.getWorker().postMessage(request);
      } catch (e) {
        this.pendingRequests.delete(id);
        reject(e);
        this.currentRequestId = null;
      }
    });
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
      req?.reject(new Error("Cancelled"));
      this.pendingRequests.delete(this.currentRequestId);
      this.currentRequestId = null;
    }
  }

  private handleMessage(event: MessageEvent<WorkerResponse>) {
    const { id, success, type, error, chunk } = event.data;

    if (error) {
      console.error(error);
    }

    if (!id) return;

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
    this.abortCurrTask();
    this.currentRequestId = null;
  }
}

export const workerHost = new WorkerHost();
