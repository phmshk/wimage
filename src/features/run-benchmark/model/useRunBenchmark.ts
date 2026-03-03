import { useBenchmarkActions, useBenchmarkConfig } from "@/entities/benchmark";
import { useImageInfo } from "@/entities/image";
import { workerHost } from "@/entities/worker/WorkerHost";
import { notify } from "@/shared/lib/notifications";

export const useRunBenchmark = () => {
  const { startBenchmark, setStatus, setProgress, setError, setResults } =
    useBenchmarkActions();
  const config = useBenchmarkConfig();

  const imageInfo = useImageInfo();
  const hasImage = !!imageInfo;

  const runBenchmark = async () => {
    if (!imageInfo) {
      notify.error(
        "No image",
        "Please upload an image in the editor before running the benchmark."
      );
      return;
    }

    if (config.filters.length === 0 || config.engines.length === 0) {
      notify.warning(
        "Empty configuration",
        "Select at least one filter and one engine."
      );
      return;
    }

    startBenchmark();

    try {
      const results = await workerHost.runBenchmark(
        config,
        imageInfo.width,
        imageInfo.height,
        (progress) => {
          setStatus("running");
          setProgress(progress);
        }
      );

      setResults(results);
      setStatus("completed");
      notify.success(
        "Success",
        "Benchmark completed. Results have been updated."
      );
    } catch (error) {
      const errorMessage = (error as Error).message;

      if (errorMessage === "Cancelled") {
        setStatus("idle");
        setProgress({ current: 0, total: 0 });
        return;
      }

      setStatus("error");
      setError(errorMessage);
      notify.error("Benchmark error", errorMessage);
    }
  };

  const cancelBenchmark = () => {
    workerHost.abortCurrTask();
  };

  return { runBenchmark, cancelBenchmark, hasImage };
};
