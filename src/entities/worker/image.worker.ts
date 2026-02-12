import type { WorkerRequest, WorkerResponse } from "@/shared/lib/worker/types";

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, type, buffer, payload } = e.data;
  const start = performance.now();

  try {
    let resultBuffer = buffer;

    switch (type) {
      case "init": {
        break;
      }
      case "apply_filter": {
        if (!resultBuffer || !payload)
          throw new Error("No buffer or payload provided");
        break;
      }
      case "ping": {
        console.log("pong");
        break;
      }
      default: {
        throw new Error(`Unknown action type: ${type}`);
      }
    }

    const end = performance.now();

    const response: WorkerResponse = {
      id,
      success: true,
      buffer: resultBuffer,
      metrics: { computeTime: end - start },
    };

    const transfer: Transferable[] = resultBuffer ? [resultBuffer.buffer] : [];
    self.postMessage(response, { transfer });
  } catch (e) {
    const response: WorkerResponse = {
      id,
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };

    self.postMessage(response);
  }
};
