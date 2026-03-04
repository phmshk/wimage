import { useBenchmarkResults, useBenchmarkStatus } from "@/entities/benchmark";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Loader2, Inbox } from "lucide-react";

const chartConfig = {
  jsCompute: {
    label: "JS Compute",
    color: "var(--chart-1)",
  },
  jsOverhead: {
    label: "JS Overhead",
    color: "var(--chart-1-a)",
  },
  wasmCompute: {
    label: "WASM Compute",
    color: "var(--chart-2)",
  },
  wasmOverhead: {
    label: "WASM Overhead",
    color: "var(--chart-2-a)",
  },
} satisfies ChartConfig;

export const ResultsChart = () => {
  const results = useBenchmarkResults();
  const status = useBenchmarkStatus();

  const chartData = results.map((res) => {
    const jsTotal = res.js?.avgTotalTime ?? 0;
    const jsCompute = res.js?.avgComputeTime ?? 0;
    const wasmTotal = res.wasm?.avgTotalTime ?? 0;
    const wasmCompute = res.wasm?.avgComputeTime ?? 0;

    return {
      filterName: res.filterName,
      jsCompute,
      jsOverhead: Math.max(0, jsTotal - jsCompute),
      wasmCompute,
      wasmOverhead: Math.max(0, wasmTotal - wasmCompute),
    };
  });

  const chartHeight = Math.max(300, results.length * 80);

  if (status === "idle" && results.length === 0) {
    return (
      <div className="flex min-h-96 w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-muted-foreground animate-in fade-in">
        <Inbox className="h-10 w-10 opacity-50" />
        <p>Run benchmark to see results here.</p>
      </div>
    );
  }

  if (status === "running") {
    return (
      <div className="flex min-h-96 w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-muted-foreground animate-in fade-in">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="font-medium text-foreground">Running benchmarks...</p>
          <p className="text-sm">
            This might take a while depending on the image size.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader>
        <CardTitle>Performance Breakdown</CardTitle>
        <CardDescription>
          Compute time with total time in ms. Lower is better
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="w-full"
          style={{ height: chartHeight }}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            barGap={8}
          >
            <CartesianGrid horizontal={true} vertical={false} opacity={0.4} />

            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}ms`}
            />

            <YAxis
              dataKey="filterName"
              type="category"
              tickLine={false}
              axisLine={false}
              width={100}
              className="text-xs font-medium capitalize"
            />

            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />

            {/* JS Stack */}
            <Bar
              dataKey="jsCompute"
              stackId="js"
              fill="var(--color-jsCompute)"
              radius={[0, 0, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="jsOverhead"
              stackId="js"
              fill="var(--color-jsOverhead)"
              radius={[0, 4, 4, 0]}
              barSize={20}
            />

            {/* WASM Stack */}
            <Bar
              dataKey="wasmCompute"
              stackId="wasm"
              fill="var(--color-wasmCompute)"
              radius={[0, 0, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="wasmOverhead"
              stackId="wasm"
              fill="var(--color-wasmOverhead)"
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
