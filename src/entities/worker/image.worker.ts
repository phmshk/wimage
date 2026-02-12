import {
  applyBilateral,
  applyGaussianBlur,
  applyGrayscale,
  applyInversion,
  applyKuwahara,
  applyMedian,
  applySepia,
  applySharpen,
  applySobel,
} from "@/shared/lib/image-processing";
import type { WorkerRequest, WorkerResponse } from "@/shared/lib/worker";

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
        if (!resultBuffer || !payload) {
          throw new Error("No buffer or payload provided");
        }

        const { filterName, width, height, options } = payload;

        switch (filterName) {
          case "grayscale": {
            applyGrayscale(resultBuffer, width, height);
            break;
          }
          case "inversion": {
            applyInversion(resultBuffer, width, height);
            break;
          }
          case "sepia": {
            applySepia(resultBuffer, width, height);
            break;
          }
          case "gaussian-blur": {
            resultBuffer = applyGaussianBlur(
              resultBuffer,
              width,
              height,
              options
            );
            break;
          }
          case "sobel": {
            resultBuffer = applySobel(resultBuffer, width, height);
            break;
          }
          case "sharpen": {
            resultBuffer = applySharpen(resultBuffer, width, height);
            break;
          }
          case "median": {
            resultBuffer = applyMedian(resultBuffer, width, height, options);
            break;
          }
          case "kuwahara": {
            resultBuffer = applyKuwahara(resultBuffer, width, height, options);
            break;
          }
          case "bilateral": {
            resultBuffer = applyBilateral(resultBuffer, width, height, options);
            break;
          }
          default:
            throw new Error(`Unknown filter: ${filterName}`);
        }
        break;
      }
      case "ping": {
        self.postMessage({ id, success: true } as WorkerResponse);
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
