import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/components/ui/table";
import { SpeedupBadge } from "./SpeedupBadge";
import type { BenchmarkResult } from "@/shared/lib/worker";

interface ResultsTableProps {
  results: BenchmarkResult[];
}

export const ResultsTable = ({ results }: ResultsTableProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="min-w-32">Filter</TableHead>
              <TableHead className="text-right">Engine</TableHead>
              <TableHead className="text-right">Compute</TableHead>
              <TableHead className="text-right">Overhead</TableHead>
              <TableHead className="text-right font-bold">Total</TableHead>
              <TableHead className="text-right">Speedup</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((res) => {
              const js = res.js || {
                avgComputeTime: 0,
                avgTotalTime: 0,
              };
              const wasm = res.wasm || {
                avgComputeTime: 0,
                avgTotalTime: 0,
              };

              return (
                <React.Fragment key={res.filterId}>
                  {/* JS Row */}
                  <TableRow className="group border-b-0 hover:bg-transparent">
                    <TableCell
                      rowSpan={2}
                      className="align-top font-bold capitalize"
                    >
                      {res.filterName}
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs text-chart-1 font-medium">
                      JS
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs tabular-nums">
                      {js.avgComputeTime} ms
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs tabular-nums text-muted-foreground">
                      {(js.avgTotalTime - js.avgComputeTime).toFixed(1)} ms
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs font-bold tabular-nums">
                      {js.avgTotalTime} ms
                    </TableCell>
                    <TableCell rowSpan={2} className="text-right">
                      <SpeedupBadge
                        jsTime={js.avgComputeTime}
                        wasmTime={wasm.avgComputeTime}
                      />
                    </TableCell>
                  </TableRow>
                  {/* WASM Row */}
                  <TableRow className="border-t-0 hover:bg-transparent">
                    <TableCell className="py-2 text-right text-xs text-chart-2 font-medium">
                      WASM
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs tabular-nums">
                      {wasm.avgComputeTime} ms
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs tabular-nums text-muted-foreground">
                      {(wasm.avgTotalTime - wasm.avgComputeTime).toFixed(1)} ms
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs font-bold tabular-nums">
                      {wasm.avgTotalTime} ms
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
