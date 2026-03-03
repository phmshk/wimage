import { BenchmarkPage } from "@/pages/benchmark";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/benchmark")({
  component: BenchmarkPage,
});
