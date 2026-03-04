import { BenchmarkConfig } from "@/widgets/benchmark-config";
import { ResultsChart, ResultsTable } from "@/widgets/benchmark-results";
import {
  useBenchmarkProgress,
  useBenchmarkStatus,
  useBenchmarkResults,
} from "@/entities/benchmark";
import { useRunBenchmark } from "@/features/run-benchmark";
import { Button } from "@/shared/ui/components/ui/button";
import { Progress } from "@/shared/ui/components/ui/progress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/ui/components/ui/card";
import { AlertCircle, BarChart3, Table as TableIcon } from "lucide-react";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/shared/ui/components/ui/alert";
import { ImgInfo } from "@/widgets/img-info";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/components/ui/tabs";

export const BenchmarkPage = () => {
  const { runBenchmark, cancelBenchmark, hasImage } = useRunBenchmark();
  const progress = useBenchmarkProgress();
  const benchmarkStatus = useBenchmarkStatus();
  const results = useBenchmarkResults();
  const isRunning = benchmarkStatus === "running";
  const hasResults = results.length > 0;

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
          {hasResults && !isRunning ? (
            <Tabs defaultValue="chart" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold tracking-tight text-foreground">
                  Benchmark Results
                </h4>
                <TabsList variant="line">
                  <TabsTrigger value="chart" className="cursor-pointer">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Chart
                  </TabsTrigger>
                  <TabsTrigger value="table" className="cursor-pointer">
                    <TableIcon className="h-3.5 w-3.5" />
                    Table
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="chart" className="mt-0">
                <ResultsChart />
              </TabsContent>
              <TabsContent value="table" className="mt-0">
                <ResultsTable results={results} />
              </TabsContent>
            </Tabs>
          ) : (
            <ResultsChart />
          )}
        </div>
      </div>
    </div>
  );
};
