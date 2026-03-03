import {
  useBenchmarkConfig,
  useBenchmarkActions,
  useBenchmarkStatus,
} from "@/entities/benchmark";
import {
  BENCHMARK_ITERATIONS,
  ENGINES_META,
  ENGINES_ORDER,
  FILTERS_META,
  FILTERS_ORDER,
} from "@/shared/config";
import type { ComputeEngine, FilterType } from "@/shared/lib/worker";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/ui/components/ui/card";
import { Checkbox } from "@/shared/ui/components/ui/checkbox";
import { Label } from "@/shared/ui/components/ui/label";
import { Slider } from "@/shared/ui/components/ui/slider";

export const BenchmarkConfig = () => {
  const config = useBenchmarkConfig();
  const status = useBenchmarkStatus();
  const { setConfig } = useBenchmarkActions();

  const isRunning = status === "running";

  const toggleFilter = (filterId: FilterType) => {
    const newFilters = config.filters.includes(filterId)
      ? config.filters.filter((f) => f !== filterId)
      : [...config.filters, filterId];
    setConfig({ filters: newFilters });
  };

  const toggleEngine = (engineId: ComputeEngine) => {
    const newEngines = config.engines.includes(engineId)
      ? config.engines.filter((e) => e !== engineId)
      : [...config.engines, engineId];
    setConfig({ engines: newEngines });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Label className="text-sm text-muted-foreground">
            Engines to Compare
          </Label>
          <div className="flex flex-wrap gap-4">
            {ENGINES_ORDER.map((engineId) => (
              <div key={engineId} className="flex items-center gap-2">
                <Checkbox
                  id={`engine-${engineId}`}
                  checked={config.engines.includes(engineId)}
                  onCheckedChange={() => toggleEngine(engineId)}
                  disabled={isRunning}
                />
                <Label htmlFor={`engine-${engineId}`}>
                  {ENGINES_META[engineId].label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-sm text-muted-foreground">
            Filters to Benchmark
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FILTERS_ORDER.map((filterId) => (
              <div key={filterId} className="flex items-center gap-2">
                <Checkbox
                  id={`filter-${filterId}`}
                  checked={config.filters.includes(filterId)}
                  onCheckedChange={() => toggleFilter(filterId)}
                  disabled={isRunning}
                />
                <Label
                  htmlFor={`filter-${filterId}`}
                  className="font-normal text-sm"
                >
                  {FILTERS_META[filterId].label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Iterations per Filter
            </Label>
            <span className="text-sm font-medium">{config.iterations}</span>
          </div>
          <Slider
            disabled={isRunning}
            value={[config.iterations]}
            min={BENCHMARK_ITERATIONS.min}
            max={BENCHMARK_ITERATIONS.max}
            step={BENCHMARK_ITERATIONS.step}
            onValueChange={(vals) => setConfig({ iterations: vals[0] })}
          />
          <p className="text-xs text-muted-foreground">
            More iterations provide more stable average results but take longer
            to compute.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
