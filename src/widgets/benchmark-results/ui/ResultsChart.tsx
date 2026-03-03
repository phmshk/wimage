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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Loader2, Inbox } from "lucide-react";
import { SpeedupBadge } from "./SpeedupBadge";

const chartConfig = {
  jsTimeMs: {
    label: "JavaScript",
    color: "var(--chart-1)",
  },
  wasmTimeMs: {
    label: "WebAssembly (C)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const ResultsChart = () => {
  const results = useBenchmarkResults();
  const status = useBenchmarkStatus();

  const chartHeight = Math.max(300, results.length * 60);

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
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>
            Average execution time in milliseconds (Lower is better)
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
              data={results}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid horizontal={true} vertical={false} opacity={0.4} />

              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
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
                content={<ChartTooltipContent indicator="line" />}
              />
              <ChartLegend content={<ChartLegendContent />} />

              <Bar
                dataKey="jsTimeMs"
                fill="var(--color-jsTimeMs)"
                radius={[0, 4, 4, 0]}
                barSize={16}
              />
              <Bar
                dataKey="wasmTimeMs"
                fill="var(--color-wasmTimeMs)"
                radius={[0, 4, 4, 0]}
                barSize={16}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold tracking-tight text-foreground">
          Detailed Metrics
        </h4>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Filter</TableHead>
                <TableHead className="text-right">JS</TableHead>
                <TableHead className="text-right">WASM</TableHead>
                <TableHead className="text-right">Speedup</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((res) => (
                <TableRow key={res.filterId}>
                  <TableCell className="font-medium capitalize">
                    {res.filterName}
                  </TableCell>
                  <TableCell className="text-right">
                    {res.jsTimeMs !== undefined ? `${res.jsTimeMs} ms` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {res.wasmTimeMs !== undefined
                      ? `${res.wasmTimeMs} ms`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <SpeedupBadge
                      jsTime={res.jsTimeMs}
                      wasmTime={res.wasmTimeMs}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
