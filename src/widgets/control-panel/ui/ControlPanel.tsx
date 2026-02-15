import {
  useMetrics,
  useImageActions,
  useImageStatus,
  useCurrData,
} from "@/entities/image";
import { cn, formatTime } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
import { useState } from "react";
import { FilterControl } from "./FilterControl";

export const ControlPanel = () => {
  const { applyFilter, reset } = useImageActions();
  const lastMetrics = useMetrics();
  const status = useImageStatus();
  const hasImage = !!useCurrData();

  const isBusy = status === "processing";
  const isDisabled = isBusy || !hasImage;

  // state for filter parameters
  const [blurRadius, setBlurRadius] = useState([5]);
  const [medianRadius, setMedianRadius] = useState([3]);
  const [kuwaharaRadius, setKuwaharaRadius] = useState([3]);
  const [bilateralRadius, setBilateralRadius] = useState([10]);

  return (
    <div className="relative flex flex-col gap-6 pb-10">
      {!hasImage && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 backdrop-blur-[2px]">
          <span className="rounded-full bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-md">
            Upload image to enable filters
          </span>
        </div>
      )}

      <div
        className={cn(
          "flex flex-col gap-6 transition-all duration-300",
          !hasImage && "opacity-40 grayscale pointer-events-none"
        )}
      >
        {/* Light Filters */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Basic Adjustments
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <Button
              disabled={isDisabled}
              variant="outline"
              onClick={() => applyFilter("grayscale")}
              size="sm"
              className="text-xs"
            >
              Gray
            </Button>
            <Button
              disabled={isDisabled}
              variant="outline"
              onClick={() => applyFilter("inversion")}
              size="sm"
              className="text-xs"
            >
              Invert
            </Button>
            <Button
              disabled={isDisabled}
              variant="outline"
              onClick={() => applyFilter("sepia")}
              size="sm"
              className="text-xs"
            >
              Sepia
            </Button>
          </div>
        </div>

        {/* Convolution Filters */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Convolution
          </h4>

          {/* Gaussian Blur */}
          <FilterControl
            label="Gaussian Blur"
            value={blurRadius}
            onValueChange={setBlurRadius}
            min={1}
            max={50}
            step={1}
            onApply={() =>
              applyFilter("gaussian-blur", { radius: blurRadius[0] })
            }
            isDisabled={isDisabled}
          />

          {/* Sharpen */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Sharpen</span>
            <Button
              disabled={isDisabled}
              variant="secondary"
              size="sm"
              className="h-8 px-3"
              onClick={() => applyFilter("sharpen")}
            >
              <Play className="mr-1.5 h-3 w-3" /> Apply
            </Button>
          </div>

          {/* Sobel */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Sobel Detection</span>
            <Button
              disabled={isDisabled}
              variant="secondary"
              size="sm"
              className="h-8 px-3"
              onClick={() => applyFilter("sobel")}
            >
              <Play className="mr-1.5 h-3 w-3" /> Apply
            </Button>
          </div>
        </div>

        {/* Heavy Filters */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Non-Linear / Heavy
          </h4>

          <FilterControl
            label="Median"
            value={medianRadius}
            onValueChange={setMedianRadius}
            min={1}
            max={10}
            step={1}
            onApply={() => applyFilter("median", { radius: medianRadius[0] })}
            isDisabled={isDisabled}
          />

          <FilterControl
            label="Kuwahara (Oil Painting)"
            value={kuwaharaRadius}
            onValueChange={setKuwaharaRadius}
            min={2}
            max={12}
            step={1}
            onApply={() =>
              applyFilter("kuwahara", { radius: kuwaharaRadius[0] })
            }
            isDisabled={isDisabled}
          />

          <FilterControl
            label="Bilateral"
            value={bilateralRadius}
            onValueChange={setBilateralRadius}
            min={1}
            max={30}
            step={1}
            onApply={() =>
              applyFilter("bilateral", { radius: bilateralRadius[0] })
            }
            isDisabled={isDisabled}
          />
        </div>

        <div className="h-px bg-border my-2" />

        <Button
          variant="destructive"
          className="w-full"
          onClick={reset}
          disabled={isDisabled}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Original
        </Button>

        {/* metrics */}
        {lastMetrics && (
          <div className="rounded-md bg-muted p-3 text-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-muted-foreground">
                Last Operation Time:
              </span>
              <span className="font-mono text-sm font-bold text-primary">
                {formatTime(lastMetrics.computeTime)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
