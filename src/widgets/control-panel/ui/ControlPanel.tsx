import { useMetrics, useImageActions, useImageStatus } from "@/entities/image";
import { Button } from "@/shared/ui/components/ui/button";

export const ControlPanel = () => {
  const { applyFilter, reset } = useImageActions();
  const lastMetrics = useMetrics();
  const status = useImageStatus();
  const isBuisy = status === "processing";

  return (
    <div className="flex flex-col gap-4 p-4 border-l bg-background min-w-62">
      <div className="space-y-2">
        <h3 className="font-semibold mb-2">Light Filters</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            disabled={isBuisy}
            onClick={() => applyFilter("grayscale")}
            size="sm"
          >
            Gray
          </Button>
          <Button
            disabled={isBuisy}
            onClick={() => applyFilter("inversion")}
            size="sm"
          >
            Invert
          </Button>
          <Button
            disabled={isBuisy}
            onClick={() => applyFilter("sepia")}
            size="sm"
          >
            Sepia
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold mb-2">Medium (Convolution)</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            disabled={isBuisy}
            onClick={() => applyFilter("gaussian-blur", { radius: 5 })}
            size="sm"
          >
            Blur (5px)
          </Button>
          <Button
            disabled={isBuisy}
            onClick={() => applyFilter("sharpen")}
            size="sm"
          >
            Sharpen
          </Button>
          <Button
            disabled={isBuisy}
            onClick={() => applyFilter("sobel")}
            size="sm"
          >
            Sobel
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold mb-2">Heavy (Non-Linear)</h3>
        <div className="grid grid-cols-1 gap-2">
          <Button
            disabled={isBuisy}
            onClick={() => applyFilter("median", { radius: 3 })}
            size="sm"
          >
            Median (R=2)
          </Button>
          <Button
            disabled={isBuisy}
            onClick={() => applyFilter("kuwahara", { radius: 3 })}
            size="sm"
          >
            Kuwahara (Oil)
          </Button>
          <Button
            disabled={isBuisy}
            onClick={() => applyFilter("bilateral", { radius: 10 })}
            size="sm"
          >
            Bilateral
          </Button>
        </div>
      </div>

      <hr className="my-2" />

      <Button variant="destructive" onClick={reset} disabled={isBuisy}>
        Reset
      </Button>

      {lastMetrics && (
        <div className="mt-4 p-3 bg-slate-100 rounded text-sm">
          <p className="font-medium text-slate-700">Metrics:</p>
          <p>
            Time:{" "}
            <span className="font-bold text-blue-600">
              {lastMetrics.computeTime.toFixed(2)} ms
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
