import { BenchmarkConfig } from "@/widgets/benchmark-config";
import { ResultsChart } from "@/widgets/benchmark-results";
import { useBenchmarkProgress, useBenchmarkStatus } from "@/entities/benchmark";
import { useRunBenchmark } from "@/features/run-benchmark";
import { Button } from "@/shared/ui/components/ui/button";
import { Progress } from "@/shared/ui/components/ui/progress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/ui/components/ui/card";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/shared/ui/components/ui/alert";
import { ImgInfo } from "@/widgets/img-info";

export const BenchmarkPage = () => {
  const { runBenchmark, cancelBenchmark, hasImage } = useRunBenchmark();
  const progress = useBenchmarkProgress();
  const benchmarkStatus = useBenchmarkStatus();
  const isRunning = benchmarkStatus === "running";

  const progressPercent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="container mx-auto flex max-w-6xl flex-col gap-8 py-8 animate-in fade-in duration-500 px-4 md:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Performance Benchmark
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          A comparison of image-processing performance between native JavaScript
          and WebAssembly (compiled from C). Tests are executed on the currently
          loaded image, with results representing the median execution time of
          all runs for each filter.
        </p>
      </div>

      {!hasImage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Image required</AlertTitle>
          <AlertDescription>
            Go to the home page and upload an image before running the
            benchmark.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12 min-w-0">
        <div className="flex flex-col gap-6 md:col-span-4 md:sticky md:top-8">
          <BenchmarkConfig />

          <Card>
            <CardHeader>
              <CardTitle>Execution</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {isRunning ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={cancelBenchmark}
                >
                  Stop Benchmark
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={runBenchmark}
                  disabled={!hasImage || isRunning}
                >
                  Run Benchmark
                </Button>
              )}

              {isRunning && (
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Overall Progress</span>
                    <span className="font-mono">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-center text-xs text-muted-foreground">
                    Running iteration {progress.current} of {progress.total}...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          {hasImage && <ImgInfo />}
        </div>

        <div className="md:col-span-8">
          <ResultsChart />
        </div>
      </div>
    </div>
  );
};
