import { cn } from "@/shared/lib/utils";

interface SpeedupBadgeProps {
  jsTime?: number;
  wasmTime?: number;
}
export const SpeedupBadge = (props: SpeedupBadgeProps) => {
  const { jsTime, wasmTime } = props;

  if (jsTime === undefined || wasmTime === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (jsTime === wasmTime) {
    return (
      <span className="text-xs font-medium text-muted-foreground">
        Tie (Equal)
      </span>
    );
  }

  const isWasmFaster = wasmTime < jsTime;
  const safeWasm = Math.max(wasmTime, 0.1);
  const safeJs = Math.max(jsTime, 0.1);

  const ratioValue = isWasmFaster ? jsTime / safeWasm : wasmTime / safeJs;
  const ratio = ratioValue.toFixed(1);

  if (ratio === "1.0") {
    return (
      <span className="text-xs font-medium text-muted-foreground">
        About equal
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-s font-bold uppercase tracking-wider",
          isWasmFaster
            ? "bg-chart-2/15 text-chart-2"
            : "bg-chart-1/15 text-chart-1"
        )}
      >
        {isWasmFaster ? "WASM" : "JS"} {ratio}x faster
      </span>
    </div>
  );
};
